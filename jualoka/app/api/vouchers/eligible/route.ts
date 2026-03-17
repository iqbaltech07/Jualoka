import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

        const total = parseInt(totalRaw, 10)

        // Find all active vouchers for this store
        let vouchers = await prisma.voucher.findMany({
            where: {
                storeId,
                isActive: true,
                stock: { gt: 0 },
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        })

        // Calculate Historical Total for the buyer
        let historicalTotal = 0
        if (wa && name) {
            const pastOrders = await prisma.order.findMany({
                where: {
                    storeId,
                    customerWhatsapp: wa,
                    customerName: name
                },
                include: {
                    orderItems: true
                }
            })

            historicalTotal = pastOrders.reduce((acc, order) => {
                return acc + order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }, 0)
        }

        // Filter logic:
        // A voucher is eligible if the user's historical spending total is at least the minTransaction threshold.
        vouchers = vouchers.filter(v => historicalTotal >= v.minTransaction)


        // Sort by highest discount
        vouchers.sort((a, b) => b.discount - a.discount)

        const bestVoucher = vouchers.length > 0 ? vouchers[0] : null

        return NextResponse.json({ voucher: bestVoucher }, { status: 200 })
    } catch (error) {
        console.error("Eligible Voucher Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
