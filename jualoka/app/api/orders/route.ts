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
        const { storeId, customerName, customerWhatsapp, items } = body

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

        const newOrder = await prisma.order.create({
            data: {
                storeId,
                customerName,
                customerWhatsapp,
                status: "baru",
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

        // Decrement stock + fire notifications in parallel for best performance
        await Promise.all([
            // Decrement stock
            ...(items as { productId: string; quantity: number }[]).map((item) =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })
            ),
            // Real-time SSE notification to connected admin dashboard
            Promise.resolve(notifyNewOrder(storeId, newOrder)),
            // Email to seller
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

        return NextResponse.json({ message: "Order placed successfully", order: newOrder }, { status: 201 })
    } catch (error) {
        console.error("Create Order Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

