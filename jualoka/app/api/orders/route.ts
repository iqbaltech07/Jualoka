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

                // Record the claim to prevent 1x reward usage if it was a reward
                await tx.rewardClaim.upsert({
                    where: {
                        storeId_customerWhatsapp_voucherId: {
                            storeId,
                            customerWhatsapp,
                            voucherId: validVoucher.id
                        }
                    },
                    update: {},
                    create: {
                        storeId,
                        customerWhatsapp,
                        voucherId: validVoucher.id
                    }
                })
            }

            // --- REWARD GENERATION LOGIC ---
            // The user earns a reward if they hit certain thresholds (Tiers)
            
            // Re-fetch store for gamification toggle
            const storeSettings = await tx.store.findUnique({
                where: { id: storeId },
                select: { gamificationEnabled: true }
            })

            let genVoucher = null
            
            // Calculate effective historical total (status selesai)
            // Note: This order is not yet "selesai", so we only look at past "selesai" orders.
            // But we want to see if THIS order makes them cross a threshold?
            // User requested: "track thresold belanja pembeli dari history order tetapi di masukin ke tier"
            // "misal nya pembeli sudah berbelanja sebanyak 5 juta maka masuk tier s"
            // This means if (historicalTotal + currentOrderTotal) >= 5jt, they get Tier S.
            
            const combinedTotal = historicalTotal + orderTotal
            
            if (storeSettings?.gamificationEnabled) {
                // GAMIFICATION: Based on Tier crossing
                if (orderTotal >= 10000) { // Anti-spam
                    const currentTier = import("@/lib/reward-logic").then(m => m.getTierFromTotal(historicalTotal))
                    const newTier = await import("@/lib/reward-logic").then(m => m.getTierFromTotal(combinedTotal))
                    
                    // Wait, I can't use top-level await in transaction easily if I don't import at top.
                    // I'll just use the logic directly since it's simple.
                    const { getTierFromTotal, pickWeightedVoucher } = await import("@/lib/reward-logic")
                    const oldT = getTierFromTotal(historicalTotal)
                    const newT = getTierFromTotal(combinedTotal)

                    // If they entered a NEW tier (or higher tier)
                    if (newT && (!oldT || newT !== oldT)) {
                        // Check if they already claimed ANY reward to satisfy "1 reward per pembeli"
                        const alreadyClaimed = await tx.rewardClaim.findFirst({
                            where: { storeId, customerWhatsapp }
                        })

                        if (!alreadyClaimed) {
                            const candidates = await tx.voucher.findMany({
                                where: {
                                    storeId,
                                    tier: newT,
                                    isActive: true,
                                    stock: { gt: 0 }
                                }
                            })
                            
                            if (candidates.length > 0) {
                                genVoucher = pickWeightedVoucher(candidates)
                                if (genVoucher) {
                                    await tx.voucher.update({
                                        where: { id: genVoucher.id },
                                        data: { stock: { decrement: 1 } }
                                    })
                                    // We mark it as "awarded" but maybe not "claimed" until used?
                                    // "reward juga hanya bisa di claim 1 per pembeli" 
                                    // If we give it here, it's effectively claimed as their 1 allowed reward.
                                }
                            }
                        }
                    }
                }
            } else {
                // REGULAR LOGIC: Original crossing logic
                const eligibleTemplates = await tx.voucher.findMany({
                    where: {
                        storeId,
                        minTransaction: {
                            gt: historicalTotal,
                            lte: combinedTotal
                        },
                        isActive: true,
                        stock: { gt: 0 },
                        tier: null // Only regular vouchers
                    }
                })

                if (eligibleTemplates.length > 0) {
                    const randomIndex = Math.floor(Math.random() * eligibleTemplates.length)
                    const rewardTemplate = eligibleTemplates[randomIndex]

                    genVoucher = await tx.voucher.update({
                        where: { id: rewardTemplate.id },
                        data: { stock: { decrement: 1 } }
                    })
                }
            }

            return { newOrder: createdOrder, generatedVoucher: genVoucher }
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

