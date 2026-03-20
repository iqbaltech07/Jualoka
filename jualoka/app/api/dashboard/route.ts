import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { getProductStatus, PRODUCT_SUGGESTIONS } from "@/lib/productStatus"

// GET /api/dashboard — real stats for the admin dashboard
export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const storeId = store.id
        const now = new Date()
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(now.getDate() - 6)
        sevenDaysAgo.setHours(0, 0, 0, 0)

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
                select: {
                    id: true,
                    customerName: true,
                    customerWhatsapp: true,
                    status: true,
                    createdAt: true,
                    discountAmount: true,
                    orderItems: {
                        select: {
                            id: true,
                            price: true,
                            quantity: true,
                            product: { select: { name: true } }
                        }
                    }
                }
            }),
            prisma.order.findMany({
                where: { storeId, status: "selesai" },
                select: { discountAmount: true, orderItems: { select: { price: true, quantity: true } } }
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
                    discountAmount: true,
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
            select: { id: true, name: true, price: true, cost: true, createdAt: true }
        })

        const salesMap = new Map((allProductStats as any[]).map(s => [s.productId, s._sum.quantity || 0]))

        const productsWithStatus = allProducts
            .map(p => ({
                ...p,
                sold: salesMap.get(p.id) || 0
            }))
            .sort((a, b) => b.sold - a.sold)

        const topProducts = productsWithStatus.map((p, index) => {
            const qty = p.sold
            const status = getProductStatus(
                { price: p.price, cost: p.cost, sold: qty, createdAt: p.createdAt },
                productsWithStatus,
            )
            const suggestion = PRODUCT_SUGGESTIONS[status] ?? "Tidak ada penjualan. Perlu evaluasi apakah produk masih relevan."

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

            const revenue = dayOrders.reduce((sum: number, order: any) => {
                const subtotal = order.orderItems.reduce((s: number, item: any) => s + (item.price * item.quantity), 0)
                return sum + Math.max(0, subtotal - (order.discountAmount || 0))
            }, 0)

            return { day: dayLabel, revenue, orders: dayOrders.length }
        })

        // Calculate total revenue from completed orders (Net Revenue)
        const totalRevenue = (completedOrderItems as any[]).reduce(
            (sum, order) => {
                const subtotal = order.orderItems.reduce((s: number, item: any) => s + (item.price * item.quantity), 0)
                return sum + Math.max(0, subtotal - (order.discountAmount || 0))
            },
            0
        )

        // Summarize recent orders for the UI
        const recentOrders = (recentOrdersRaw as any[]).map(order => ({
            id: order.id,
            customerName: order.customerName,
            customerWhatsapp: order.customerWhatsapp,
            status: order.status,
            createdAt: order.createdAt,
            total: Math.max(0, order.orderItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0) - (order.discountAmount || 0)),
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
