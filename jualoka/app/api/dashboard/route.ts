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
            salesHistoryRaw
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
            })
        ])

        // Fetch all product sales stats for percentile calculation
        const allProductStats = await prisma.orderItem.groupBy({
            by: ["productId"],
            where: { order: { storeId, status: "selesai" } },
            _sum: { quantity: true },
        })

        const allProducts = await prisma.product.findMany({
            where: { storeId },
            select: { id: true, name: true, price: true, cost: true }
        })

        const salesMap = new Map((allProductStats as any[]).map(s => [s.productId, s._sum.quantity || 0]))
        
        const productsWithStatus = allProducts
            .map(p => ({
                ...p,
                sold: salesMap.get(p.id) || 0
            }))
            .sort((a, b) => b.sold - a.sold)

        const topProducts = productsWithStatus.map((p, index) => {
            const totalProducts = productsWithStatus.length
            const percentile = totalProducts > 0 ? index / totalProducts : 1
            const qty = p.sold

            let status = "Tidak Layak"
            let suggestion = "Tidak ada penjualan. Perlu evaluasi apakah produk masih relevan."
            
            const cost = p.cost || 0
            const profitPerItem = p.price - cost
            const totalProfit = profitPerItem * qty

            if (p.price < cost || totalProfit < 0) {
                status = "Rugi"
                suggestion = "Harga jual di bawah modal atau margin negatif. Evaluasi ulang harga atau biaya."
            } else if (percentile < 0.2) {
                status = "Laris"
                suggestion = "Performa sangat baik. Pertimbangkan untuk meningkatkan margin atau bundel."
            } else if (percentile < 0.6) {
                status = "Stabil"
                suggestion = "Pemintaan pasar stabil. Jaga ketersediaan stok."
            } else if (percentile < 0.9) {
                status = "Kurang Laku"
                suggestion = "Penjualan rendah. Buat promo khusus atau perbaiki deskripsi produk."
            } else {
                status = "Tidak Layak"
                suggestion = "Tidak ada penjualan. Perlu evaluasi apakah produk masih relevan."
            }

            return {
                name: p.name,
                sold: qty,
                revenue: 0,
                status,
                suggestion
            }
        }).slice(0, 5) // Return only top 5 for dashboard overview

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
