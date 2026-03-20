import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { notifyNewOrder } from "@/lib/sseRegistry"
import { sendOrderEmail } from "@/lib/mailer"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                orderItems: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ orders }, {
            status: 200,
            headers: {
                "Cache-Control": "private, no-cache, no-store, must-revalidate"
            }
        })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// Public: customers POST a new order (no auth required)
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { storeId, customerName, customerWhatsapp, items, voucherId } = body

        if (!storeId || !customerName || !customerWhatsapp || !items || items.length === 0) {
            return NextResponse.json({ message: "Required fields are missing" }, { status: 400 })
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { id: true, isOpen: true, name: true, user: { select: { email: true } } }
        })
        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 })
        }
        if (!store.isOpen) {
            return NextResponse.json({ message: "Toko sedang tutup, tidak dapat menerima pesanan." }, { status: 403 })
        }

        const productIds = items.map((i: { productId: string; quantity: number }) => i.productId)
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, storeId },
            select: { id: true, price: true, stock: true, name: true }
        })

        if (products.length !== items.length) {
            return NextResponse.json({ message: "Some products are invalid or not from this store" }, { status: 400 })
        }

        // Validate stock for every item
        for (const item of items as { productId: string; quantity: number }[]) {
            const product = products.find(p => p.id === item.productId)!
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    { message: `Stok "${product.name}" tidak mencukupi. Tersisa ${product.stock} item.` },
                    { status: 422 }
                )
            }
        }

        // Validate voucher if provided
        let validVoucher = null;
        if (voucherId) {
            validVoucher = await prisma.voucher.findUnique({ where: { id: voucherId } })
            if (!validVoucher || validVoucher.storeId !== storeId || !validVoucher.isActive || validVoucher.stock <= 0) {
                return NextResponse.json({ message: "Voucher tidak valid atau sudah habis" }, { status: 400 })
            }
            if (validVoucher.expiresAt && validVoucher.expiresAt < new Date()) {
                return NextResponse.json({ message: "Voucher sudah kedaluwarsa" }, { status: 400 })
            }

            // Usage validation: Per user request, minTransaction is only for earning NOT for using.
            // So we skip the cartTotal check here.
        }

        // Calculate totals for tracking
        const orderTotal = items.reduce((acc: number, item: any) => {
            const product = products.find(p => p.id === item.productId)!
            return acc + (product.price * item.quantity)
        }, 0)

        // Apply voucher discount
        const discountAmount = validVoucher ? Math.min(validVoucher.discount, orderTotal) : 0

        const pastOrders = await prisma.order.findMany({
            where: {
                storeId,
                customerWhatsapp,
                customerName
            },
            include: {
                orderItems: true
            }
        })

        const historicalTotal = pastOrders.reduce((acc, order) => {
            return acc + order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }, 0)

        const { newOrder, generatedVoucher } = await prisma.$transaction(async (tx) => {
            const lastOrder = await tx.order.findFirst({
                where: { storeId },
                orderBy: { orderNumber: "desc" },
                select: { orderNumber: true }
            })

            const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1

            const createdOrder = await tx.order.create({
                data: {
                    storeId,
                    customerName,
                    customerWhatsapp,
                    status: "baru",
                    orderNumber: nextOrderNumber,
                    discountAmount,
                    voucherCode: validVoucher ? validVoucher.code : null,
                    orderItems: {
                        create: (items as { productId: string; quantity: number }[]).map((item) => {
                            const product = products.find(p => p.id === item.productId)!
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                price: product.price
                            }
                        })
                    }
                },
                include: {
                    orderItems: { include: { product: true } }
                }
            })

            // Record claim if a voucher was used
            if (validVoucher) {
                await tx.voucher.update({
                    where: { id: validVoucher.id },
                    data: { stock: { decrement: 1 } }
                })

                // Record the claim as USED
                await tx.rewardClaim.upsert({
                    where: {
                        storeId_customerWhatsapp_voucherId: {
                            storeId,
                            customerWhatsapp,
                            voucherId: validVoucher.id
                        }
                    },
                    update: { isUsed: true },
                    create: {
                        storeId,
                        customerWhatsapp,
                        voucherId: validVoucher.id,
                        isUsed: true
                    }
                })
            }

            return { newOrder: createdOrder, generatedVoucher: null }
        })

        await Promise.all([
            ...(items as { productId: string; quantity: number }[]).map((item: any) =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            ),
            Promise.resolve(notifyNewOrder(storeId, newOrder)),
            sendOrderEmail(
                store.user!.email,
                {
                    id: newOrder.id,
                    orderNumber: `ORD-${String(newOrder.orderNumber).padStart(3, "0")}`,
                    customerName: newOrder.customerName,
                    customerWhatsapp: newOrder.customerWhatsapp,
                    createdAt: newOrder.createdAt.toISOString(),
                    orderItems: newOrder.orderItems.map((i: any) => ({
                        name: i.product?.name ?? "Produk",
                        quantity: i.quantity,
                        price: i.price,
                    })),
                },
                store.name
            ),
        ])

        return NextResponse.json({ message: "Order placed successfully", order: newOrder, newVoucher: generatedVoucher }, { status: 201 })
    } catch (error) {
        console.error("Create Order Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

