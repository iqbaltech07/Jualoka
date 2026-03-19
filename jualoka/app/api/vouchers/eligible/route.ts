import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTierFromTotal, pickWeightedVoucher, ANTI_SPAM_MIN_TOTAL } from "@/lib/reward-logic"

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const storeId = url.searchParams.get("storeId")
        const wa = url.searchParams.get("wa")
        const name = url.searchParams.get("name")
        const totalRaw = url.searchParams.get("total")

        if (!storeId || !totalRaw) {
            return NextResponse.json({ message: "Store ID and total transaction are required" }, { status: 400 })
        }

        const currentOrderTotal = parseInt(totalRaw) || 0

        // Fetch store settings for gamification toggle
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { gamificationEnabled: true }
        })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        // 1. Calculate Historical Total from "selesai" orders only
        let historicalTotal = 0
        if (wa) {
            const pastOrders = await prisma.order.findMany({
                where: {
                    storeId,
                    customerWhatsapp: wa,
                    status: "selesai"
                },
                include: {
                    orderItems: true
                }
            })

            historicalTotal = pastOrders.reduce((acc, order) => {
                return acc + order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }, 0)
        }

        // 2. Fetch all claimed reward IDs for this user
        const claimedRewardIds = wa ? (await prisma.rewardClaim.findMany({
            where: { storeId, customerWhatsapp: wa },
            select: { voucherId: true }
        })).map(c => c.voucherId) : []

        // 3. Determine Eligibility
        let eligibleVoucher = null

        if (store.gamificationEnabled) {
            // GAMIFICATION MODE: Tier-based + Weighted Random
            
            // Anti-spam check
            if (currentOrderTotal < ANTI_SPAM_MIN_TOTAL) {
                return NextResponse.json({ voucher: null, reason: "anti-spam" }, { status: 200 })
            }

            const tier = getTierFromTotal(historicalTotal)
            if (tier) {
                const candidateVouchers = await prisma.voucher.findMany({
                    where: {
                        storeId,
                        isActive: true,
                        stock: { gt: 0 },
                        id: { notIn: claimedRewardIds },
                        AND: [
                            {
                                OR: [
                                    { tier: tier }, // Match by tier (backward compatibility)
                                    { threshold: { lte: historicalTotal, gt: 0 } } // Match by custom threshold
                                ]
                            },
                            {
                                OR: [
                                    { expiresAt: null },
                                    { expiresAt: { gt: new Date() } }
                                ]
                            }
                        ]
                    }
                })

                if (candidateVouchers.length > 0) {
                    eligibleVoucher = pickWeightedVoucher(candidateVouchers)
                }
            }
        } else {
            // REGULAR MODE: Historical Threshold matching
            const allActiveVouchers = await prisma.voucher.findMany({
                where: {
                    storeId,
                    isActive: true,
                    stock: { gt: 0 },
                    threshold: { lte: historicalTotal },
                    id: { notIn: claimedRewardIds },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                }
            })

            const possibleVouchers = allActiveVouchers.filter(v => currentOrderTotal >= v.minTransaction)
            possibleVouchers.sort((a, b) => b.discount - a.discount)
            eligibleVoucher = possibleVouchers.length > 0 ? possibleVouchers[0] : null
        }

        return NextResponse.json({ voucher: eligibleVoucher }, { status: 200 })
    } catch (error) {
        console.error("Eligible Voucher Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
