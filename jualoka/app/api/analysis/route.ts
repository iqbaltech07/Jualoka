import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { getProductStatus, getProductSuggestion, NEEDS_ATTENTION_STATUSES } from "@/lib/productStatus"

export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)
        const store = await prisma.store.findUnique({ where: { userId } })

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 })
        }

        const storeId = store.id
        const url = new URL(req.url)
        const periodParam = url.searchParams.get("period") || "30d" // 7d, 30d, 90d

        const days = periodParam === "7d" ? 7 : periodParam === "90d" ? 90 : 30

        const now = new Date()
        const startDate = new Date(now)
        startDate.setDate(now.getDate() - (days - 1))
        startDate.setHours(0, 0, 0, 0)

        const prevStartDate = new Date(startDate)
        prevStartDate.setDate(startDate.getDate() - days)

        // 1. Business Overview: Current Period Orders & Revenue
        const currentOrders = await prisma.order.findMany({
            where: {
                storeId,
                status: "selesai",
                createdAt: { gte: startDate }
            },
            select: {
                id: true,
                createdAt: true,
                discountAmount: true,
                customerName: true,
                customerWhatsapp: true,
                orderItems: true
            }
        })

        const previousOrders = await prisma.order.findMany({
            where: {
                storeId,
                status: "selesai",
                createdAt: { gte: prevStartDate, lt: startDate }
            },
            select: {
                id: true,
                createdAt: true,
                discountAmount: true,
                customerName: true,
                customerWhatsapp: true,
                orderItems: true
            }
        })

        const calculateRevenue = (orders: any[]) =>
            orders.reduce((sum, order) => {
                const subtotal = order.orderItems.reduce((s: number, item: any) => s + (item.price * item.quantity), 0)
                return sum + Math.max(0, subtotal - (order.discountAmount || 0))
            }, 0)
        const calculateVolume = (orders: any[]) =>
            orders.reduce((sum, order) => sum + order.orderItems.reduce((s: number, item: any) => s + item.quantity, 0), 0)

        const currentRevenue = calculateRevenue(currentOrders)
        const previousRevenue = calculateRevenue(previousOrders)

        let revenueGrowth = 0
        if (previousRevenue === 0 && currentRevenue > 0) revenueGrowth = 100
        else if (previousRevenue > 0) revenueGrowth = Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)

        const currentVolume = calculateVolume(currentOrders)
        const totalOrders = currentOrders.length
        const averageOrderValue = totalOrders > 0 ? Math.round(currentRevenue / totalOrders) : 0

        // for calculate a basic health score (0-100)
        // growth, order volume, and AOV 
        let healthScore = 50
        if (revenueGrowth > 0) healthScore += Math.min(revenueGrowth, 20)
        else healthScore += Math.max(revenueGrowth, -20)
        if (totalOrders > (days / 2)) healthScore += 10
        if (totalOrders > days) healthScore += 20
        healthScore = Math.max(0, Math.min(100, healthScore))

        let healthStatus = "Cukup"
        if (healthScore >= 80) healthStatus = "Sehat"
        else if (healthScore <= 40) healthStatus = "Buruk"

        // product analysis (top & worst)
        const productStats = await prisma.orderItem.groupBy({
            by: ["productId"],
            where: {
                order: { storeId, status: "selesai", createdAt: { gte: startDate } }
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } }
        })


        // Fetch all products to know which ones sold 0, and include price and cost
        const allProducts = await prisma.product.findMany({
            where: { storeId },
            select: { id: true, name: true, price: true, cost: true, createdAt: true }
        })

        const productSalesMap = new Map((productStats as any[]).map(ps => [ps.productId, ps._sum.quantity || 0]))

        const sortedProducts = allProducts
            .map(p => ({ ...p, sold: productSalesMap.get(p.id) || 0 }))
            .sort((a, b) => b.sold - a.sold)

        const productsWithStatus = sortedProducts.map((p) => {
            const sold = p.sold
            const productData = { price: p.price, cost: p.cost, sold, createdAt: p.createdAt }
            const status = getProductStatus(productData, sortedProducts)
            const suggestion = getProductSuggestion(productData, status)

            return { name: p.name, sold, status, suggestion }
        })

        // Top performers: highest sold, only include those with at least 1 sale
        const topProducts = [...productsWithStatus]
            .sort((a, b) => b.sold - a.sold)
            .filter(p => p.sold > 0)
            .slice(0, 5)

        const worstProducts = productsWithStatus
            .filter(p => NEEDS_ATTENTION_STATUSES.includes(p.status as (typeof NEEDS_ATTENTION_STATUSES)[number]))
            .sort((a, b) => a.sold - b.sold)

        const customerOrders = new Map<string, number>()
        currentOrders.forEach(order => {
            const key =
                order.customerWhatsapp?.trim() ||
                order.customerName?.toLowerCase().trim() ||
                "Anonymous"
            if (key !== "Anonymous") {
                customerOrders.set(key, (customerOrders.get(key) || 0) + 1)
            }
        })

        const totalCustomers = customerOrders.size || totalOrders
        let repeatCustomers = 0
        customerOrders.forEach(count => {
            if (count > 1) repeatCustomers++
        })
        const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

        const salesTrend = []
        if (days === 7 || days === 30) {
            for (let i = 0; i < days; i++) {
                const d = new Date(startDate)
                d.setDate(startDate.getDate() + i)
                d.setHours(0, 0, 0, 0)
                const nextD = new Date(d)
                nextD.setDate(d.getDate() + 1)

                const dayOrders = currentOrders.filter(o => {
                    const od = new Date(o.createdAt)
                    return od >= d && od < nextD
                })

                salesTrend.push({
                    date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
                    revenue: calculateRevenue(dayOrders),
                    orders: dayOrders.length
                })
            }
        } else {
            // 90d: Group by 6-day intervals
            const interval = 6
            for (let i = 0; i < 15; i++) {
                const d = new Date(startDate)
                d.setDate(startDate.getDate() + (i * interval))
                d.setHours(0, 0, 0, 0)
                
                const nextD = new Date(d)
                nextD.setDate(d.getDate() + interval)

                const bucketOrders = currentOrders.filter(o => {
                    const od = new Date(o.createdAt)
                    return od >= d && od < nextD
                })

                salesTrend.push({
                    date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
                    revenue: calculateRevenue(bucketOrders),
                    orders: bucketOrders.length
                })
            }
        }

        const dashboardData = {
            overview: {
                revenue: currentRevenue,
                revenueGrowth,
                orders: totalOrders,
                healthScore,
                healthStatus
            },
            performance: {
                volume: currentVolume,
                aov: averageOrderValue
            },
            customers: {
                total: totalCustomers,
                repeat: repeatCustomers,
                repeatRate
            },
            productAnalysis: {
                top: topProducts,
                worst: worstProducts
            },
            trend: salesTrend
        }

        return NextResponse.json(dashboardData, { status: 200 })
    } catch (error: any) {
        console.error("Analysis Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
