import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// PATCH /api/orders/[id] — update order status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await verifyAuth(req)
        const { id: orderId } = await params
        const body = await req.json()
        const { status } = body

        const validStatuses = ["baru", "diproses", "dikirim", "selesai", "dibatalkan"]
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 })
        }

        // Verify store ownership
        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } })
        if (!existingOrder || existingOrder.storeId !== store.id) {
            return NextResponse.json({ message: "Order not found or unauthorized" }, { status: 404 })
        }

        const { updatedOrder, rewardVoucher } = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { orderItems: true }
            })

            if (!order) throw new Error("Order not found")

            // Update the order status
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status },
                include: { orderItems: { include: { product: true } } }
            })

            let genVoucher = null

            // If status is becoming 'selesai', check for rewards
            if (status === "selesai" && order.status !== "selesai") {
                const storeSettings = await tx.store.findUnique({
                    where: { id: store.id },
                    select: {
                        gamificationEnabled: true,
                        _count: {
                            select: {
                                vouchers: {
                                    where: {
                                        isActive: true,
                                        stock: { gt: 0 },
                                        OR: [
                                            { expiresAt: null },
                                            { expiresAt: { gt: new Date() } }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                })

                if (storeSettings && storeSettings._count.vouchers > 0) {
                    const pastOrders = await tx.order.findMany({
                        where: {
                            storeId: store.id,
                            customerWhatsapp: order.customerWhatsapp,
                            status: "selesai",
                            id: { not: orderId }
                        },
                        include: { orderItems: true }
                    })

                    const historicalTotal = pastOrders.reduce((acc, o) => {
                        const subtotal = o.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                        return acc + Math.max(0, subtotal - (o.discountAmount || 0))
                    }, 0)

                    const currentOrderTotalRaw = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                    const currentOrderTotal = Math.max(0, currentOrderTotalRaw - (order.discountAmount || 0))
                    const combinedTotal = historicalTotal + currentOrderTotal

                    if (storeSettings?.gamificationEnabled) {
                        // GAMIFICATION MODE
                        if (currentOrderTotal >= 10000) { // Anti-spam
                            const { getTierFromTotal, pickWeightedVoucher } = await import("@/lib/reward-logic")
                            const oldT = getTierFromTotal(historicalTotal)
                            const newT = getTierFromTotal(combinedTotal)

                            // If they entered a NEW tier (or higher tier)
                            if (newT && (!oldT || newT !== oldT)) {
                                // Check if they already earned ANY reward
                                const alreadyEarned = await tx.rewardClaim.findFirst({
                                    where: { storeId: store.id, customerWhatsapp: order.customerWhatsapp }
                                })

                                if (!alreadyEarned) {
                                    const candidates = await tx.voucher.findMany({
                                        where: {
                                            storeId: store.id,
                                            tier: newT,
                                            isActive: true,
                                            stock: { gt: 0 }
                                        }
                                    })

                                    if (candidates.length > 0) {
                                        const winner = pickWeightedVoucher(candidates)
                                        if (winner) {
                                            // Update stock
                                            await tx.voucher.update({
                                                where: { id: winner.id },
                                                data: { stock: { decrement: 1 } }
                                            })
                                            // Create EARNED claim
                                            await tx.rewardClaim.create({
                                                data: {
                                                    storeId: store.id,
                                                    customerWhatsapp: order.customerWhatsapp,
                                                    voucherId: winner.id,
                                                    isUsed: false // ONLY EARNED
                                                }
                                            })
                                            genVoucher = winner
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        // REGULAR MODE: Original threshold logic
                        const eligibleTemplates = await tx.voucher.findMany({
                            where: {
                                storeId: store.id,
                                minTransaction: {
                                    gt: historicalTotal,
                                    lte: combinedTotal
                                },
                                isActive: true,
                                stock: { gt: 0 },
                                tier: null
                            }
                        })

                        if (eligibleTemplates.length > 0) {
                            const randomIndex = Math.floor(Math.random() * eligibleTemplates.length)
                            const winner = eligibleTemplates[randomIndex]

                            await tx.voucher.update({
                                where: { id: winner.id },
                                data: { stock: { decrement: 1 } }
                            })

                            await tx.rewardClaim.create({
                                data: {
                                    storeId: store.id,
                                    customerWhatsapp: order.customerWhatsapp,
                                    voucherId: winner.id,
                                    isUsed: false
                                }
                            })
                            genVoucher = winner
                        }
                    }
                }
            }

            return { updatedOrder: updated, rewardVoucher: genVoucher }
        })

        return NextResponse.json({
            message: "Order status updated",
            order: updatedOrder,
            newVoucher: rewardVoucher
        }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
