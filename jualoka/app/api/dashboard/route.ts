import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// GET /api/dashboard — real stats for the admin dashboard
export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const storeId = store.id
        const now = new Date()
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 7)

        // Run all aggregations in parallel
        const [
            totalOrders,
            newOrders,
            productCount,
            recentOrdersRaw,
            completedOrderItems,
            salesHistoryRaw,
            topProductsRaw
        ]: any[] = await Promise.all([
            prisma.order.count({ where: { storeId } }),
            prisma.order.count({ where: { storeId, status: "baru" } }),
            prisma.product.count({ where: { storeId } }),
            prisma.order.findMany({
                where: { storeId },
                orderBy: { createdAt: "desc" },
                take: 4,
                include: {
                    orderItems: { include: { product: { select: { name: true } } } }
                }
            }),
            prisma.orderItem.findMany({
                where: { order: { storeId, status: "selesai" } },
            }),
            // Sales history for last 7 days
            prisma.order.findMany({
                where: {
                    storeId,
                    createdAt: { gte: sevenDaysAgo },
                    status: "selesai"
                },
                select: {
                    createdAt: true,
                    orderItems: { select: { price: true, quantity: true } }
                }
            }),
            // Top products by sold count
            prisma.orderItem.groupBy({
                by: ["productId"],
                where: { order: { storeId, status: "selesai" } },
                _sum: { quantity: true },
                _count: { id: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5
            })
        ])

        const topProductIds = (topProductsRaw as any[]).map(p => p.productId)
        
        // Fetch product names for top products
        const topProductDetails = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true }
        })

        const topProducts = (topProductsRaw as any[]).map(tp => {
            const detail = topProductDetails.find(d => d.id === tp.productId)
            const qty = tp._sum.quantity || 0
            
            let status = "Tidak Layak"
            if (qty >= 30) status = "Laris"
            else if (qty >= 10) status = "Stabil"
            else if (qty >= 1) status = "Kurang Laku"

            return {
                name: detail?.name || "Produk dihapus",
                sold: qty,
                revenue: 0,
                status
            }
        })

        // Process sales history into daily buckets
        const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
        const salesHistory = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            const dayLabel = days[d.getDay()]

            const dayOrders = (salesHistoryRaw as any[]).filter(o =>
                new Date(o.createdAt).toDateString() === d.toDateString()
            )

            const revenue = dayOrders.reduce((sum, order) =>
                sum + order.orderItems.reduce((s: number, item: any) => s + (item.price * item.quantity), 0), 0
            )

            return { day: dayLabel, revenue, orders: dayOrders.length }
        })

        // Calculate total revenue from completed orders
        const totalRevenue = (completedOrderItems as any[]).reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        )

        // Summarize recent orders for the UI
        const recentOrders = (recentOrdersRaw as any[]).map(order => ({
            id: order.id,
            customerName: order.customerName,
            customerWhatsapp: order.customerWhatsapp,
            status: order.status,
            createdAt: order.createdAt,
            total: order.orderItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
            itemCount: order.orderItems.length,
        }))

        return NextResponse.json({
            totalOrders,
            newOrders,
            productCount,
            totalRevenue,
            recentOrders,
            salesHistory,
            topProducts,
        }, { status: 200 })
    } catch (error: any) {
        console.error("Dashboard Error:", error)
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
