import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

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
        startDate.setDate(now.getDate() - days)

        const prevStartDate = new Date(startDate)
        prevStartDate.setDate(startDate.getDate() - days)

        // 1. Business Overview: Current Period Orders & Revenue
        const currentOrders = await prisma.order.findMany({
            where: {
                storeId,
                status: "selesai",
                createdAt: { gte: startDate }
            },
            include: { orderItems: true }
        })

        const previousOrders = await prisma.order.findMany({
            where: {
                storeId,
                status: "selesai",
                createdAt: { gte: prevStartDate, lt: startDate }
            },
            include: { orderItems: true }
        })

        const calculateRevenue = (orders: any[]) =>
            orders.reduce((sum, order) => sum + order.orderItems.reduce((s: number, item: any) => s + (item.price * item.quantity), 0), 0)
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

        // Fetch previous product stats for trend calculation
        const previousProductStats = await prisma.orderItem.groupBy({
            by: ["productId"],
            where: {
                order: { storeId, status: "selesai", createdAt: { gte: prevStartDate, lt: startDate } }
            },
            _sum: { quantity: true }
        })
        const prevProductSalesMap = new Map((previousProductStats as any[]).map(ps => [ps.productId, ps._sum.quantity || 0]))

        // Calculate consistency (number of distinct days sold)
        const productDaysSold = new Map<string, Set<string>>()
        currentOrders.forEach(order => {
            const dateStr = new Date(order.createdAt).toDateString()
            order.orderItems.forEach(item => {
                const pId = item.productId
                if (!productDaysSold.has(pId)) productDaysSold.set(pId, new Set())
                productDaysSold.get(pId)!.add(dateStr)
            })
        })

        // Fetch all products to know which ones sold 0, and include price and cost
        const allProducts = await prisma.product.findMany({
            where: { storeId },
            select: { id: true, name: true, price: true, cost: true }
        })

        const productSalesMap = new Map((productStats as any[]).map(ps => [ps.productId, ps._sum.quantity || 0]))

        const sortedProducts = allProducts
            .map(p => ({ ...p, sold: productSalesMap.get(p.id) || 0 }))
            .sort((a, b) => b.sold - a.sold)

        const productsWithStatus = sortedProducts.map((p, index) => {
            const sold = p.sold
            const totalProducts = sortedProducts.length

            // 1. Rumus menentukan ranking penjualan produk (Percentile)
            const percentile = totalProducts > 0 ? (index + 1) / totalProducts : 1

            let ranking = "Tidak Layak"
            if (percentile <= 0.2) {
                ranking = "Laris"
            } else if (percentile <= 0.6) {
                ranking = "Stabil"
            } else if (percentile <= 0.9) {
                ranking = "Kurang Laku"
            } else {
                ranking = "Tidak Layak"
            }

            // 2. Rumus menentukan status performa produk
            const cost = p.cost || 0
            const profitPerItem = p.price - cost
            const totalProfit = profitPerItem * sold

            const prevSold = prevProductSalesMap.get(p.id) || 0
            const trendDecreasing = prevSold > 0 && sold < prevSold

            const daysSold = productDaysSold.get(p.id)?.size || 0
            const consistent = daysSold > Math.max(1, days * 0.1) // minimal dijual di lebih dari 10% hari dalam periode

            let status = "Tidak Layak"
            let suggestion = "Tidak ada penjualan. Perlu evaluasi apakah produk masih relevan."

            if (totalProfit < 0) {
                status = "Rugi"
                suggestion = "Total profit negatif. Evaluasi ulang harga jual atau biaya modal."
            } else if (ranking === "Laris" && totalProfit > 0) {
                status = "Laris"
                suggestion = "Performa sangat baik. Pertimbangkan untuk meningkatkan margin atau bundel."
            } else if ((ranking === "Stabil" || ranking === "Laris") && consistent) {
                status = "Stabil"
                suggestion = "Permintaan pasar stabil. Jaga ketersediaan stok."
            } else if (ranking === "Kurang Laku" || trendDecreasing) {
                status = "Kurang Laku"
                suggestion = "Penjualan rendah atau trend menurun. Buat promo khusus atau perbaiki deskripsi produk."
            } else {
                status = "Tidak Layak"
                suggestion = "Penjualan sangat rendah dan tidak konsisten. Perlu evaluasi relevansi produk."
            }

            return { name: p.name, sold, ranking, status, suggestion }
        })

        const topProducts = [...productsWithStatus].sort((a, b) => b.sold - a.sold).slice(0, 5)
        const worstProducts = [...productsWithStatus].sort((a, b) => a.sold - b.sold).slice(0, 5)

        const customerOrders = new Map<string, number>()
        currentOrders.forEach(order => {
            const key = order.customerWhatsapp || order.customerName || "Anonymous"
            if (key !== "Anonymous") {
                customerOrders.set(key, (customerOrders.get(key) || 0) + 1)
            }
        })

        const totalCustomers = customerOrders.size || totalOrders // Fallback to total orders if no names
        let repeatCustomers = 0
        customerOrders.forEach(count => {
            if (count > 1) repeatCustomers++
        })
        const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

        const salesTrend = []
        if (days === 7 || days === 30) {
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(now)
                d.setDate(d.getDate() - i)
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
            const interval = 6
            for (let i = 14; i >= 0; i--) {
                const d = new Date(now)
                d.setDate(d.getDate() - (i * interval))

                salesTrend.push({
                    date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
                    revenue: Math.round(currentRevenue / 15), // Placeholder simplification for 90d to prevent loop complex
                    orders: Math.round(totalOrders / 15)
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
