"use client"

import { KpiCard } from "./KpiCard"
import { DollarSign, ShoppingCart, Heart, Star } from "lucide-react"

interface BusinessOverviewProps {
    data: any
}

export function BusinessOverview({ data }: BusinessOverviewProps) {
    if (!data) return null

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
                label="Total Pendapatan"
                value={`Rp ${(data.overview.revenue ?? 0).toLocaleString("id-ID")}`}
                sub={`${data.overview.revenueGrowth > 0 ? "+" : ""}${data.overview.revenueGrowth ?? 0}% vs sebelumnya`}
                trend={data.overview.revenueGrowth >= 0 ? "up" : "down"}
                icon={DollarSign}
                gradient="from-emerald-500 to-teal-500"
                textColor="text-emerald-700"
            />
            <KpiCard
                label="Total Pesanan"
                value={(data.overview.orders ?? 0).toString()}
                sub="Pesanan selesai"
                trend="up"
                icon={ShoppingCart}
                gradient="from-blue-500 to-cyan-500"
                textColor="text-blue-700"
            />
            <KpiCard
                label="Business Health"
                value={`${data.overview.healthScore ?? 0}/100`}
                sub={data.overview.healthStatus ?? "—"}
                trend={data.overview.healthScore >= 80 ? "up" : data.overview.healthScore <= 40 ? "down" : "neutral"}
                icon={Heart}
                gradient={data.overview.healthScore >= 80 ? "from-emerald-500 to-green-400" : data.overview.healthScore <= 40 ? "from-rose-500 to-red-400" : "from-amber-500 to-yellow-400"}
                textColor={data.overview.healthScore >= 80 ? "text-emerald-700" : data.overview.healthScore <= 40 ? "text-rose-700" : "text-amber-700"}
            />
            <KpiCard
                label="Rata-rata Pesanan"
                value={`Rp ${(data.performance.aov ?? 0).toLocaleString("id-ID")}`}
                sub="Average order value"
                trend="neutral"
                icon={Star}
                gradient="from-purple-500 to-violet-500"
                textColor="text-purple-700"
            />
        </div>
    )
}
