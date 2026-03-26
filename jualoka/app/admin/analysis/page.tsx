"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

// New Components
import { AiInsightCard } from "@/components/admin/analysis/AiInsightCard"
import { BusinessOverview } from "@/components/admin/analysis/BusinessOverview"
import dynamic from "next/dynamic"

const RevenueTrendCard = dynamic(
    () => import("@/components/admin/analysis/RevenueTrendCard").then((mod) => mod.RevenueTrendCard),
    { 
        loading: () => (
            <div className="h-[400px] w-full bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
            </div>
        )
    }
)
import { CustomerInsightCard } from "@/components/admin/analysis/CustomerInsightCard"
import { SalesPerformanceCard } from "@/components/admin/analysis/SalesPerformanceCard"
import { ProductAnalysisDeepDive } from "@/components/admin/analysis/ProductAnalysisDeepDive"

type Period = "7d" | "30d" | "90d"

export default function AnalysisPage() {
    const [period, setPeriod] = useState<Period>("30d")
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [aiInsight, setAiInsight] = useState("")
    const [isAiLoading, setIsAiLoading] = useState(false)

    async function fetchData(p: Period) {
        setIsLoading(true)
        setAiInsight("")
        try {
            const res = await fetch(`/api/analysis?period=${p}`)
            if (res.ok) {
                setData(await res.json())
            } else {
                toast.error("Gagal memuat data analisis.")
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData(period) }, [period])

    async function generateAiInsight() {
        if (!data) return
        setIsAiLoading(true)
        try {
            const res = await fetch("/api/analysis/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data,
                    period: period === "7d" ? "7 Hari" : period === "30d" ? "30 Hari" : "3 Bulan"
                })
            })
            const result = await res.json()
            if (res.ok) {
                setAiInsight(result.insight)
                toast.success("Insight AI berhasil dibuat!")
            } else {
                toast.error(result.message || "Gagal membuat insight AI.")
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi.")
        } finally {
            setIsAiLoading(false)
        }
    }

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">Memuat data analisis...</p>
            </div>
        )
    }

    const periodLabel = period === "7d" ? "7 Hari" : period === "30d" ? "30 Hari" : "3 Bulan"

    return (
        <div className="flex flex-col gap-6 pb-10">

            {/* ── PAGE HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Analisis Bisnis</h1>
                    <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                        Laporan {periodLabel} terakhir
                    </p>
                </div>
                <Select value={period} onValueChange={(v) => v && setPeriod(v as Period)}>
                    <SelectTrigger className="w-[170px] bg-white border-zinc-200 rounded-xl shadow-sm h-10 text-sm font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                        <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                        <SelectItem value="90d">3 Bulan Terakhir</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* ── AI INSIGHT CARD ── */}
            <AiInsightCard
                aiInsight={aiInsight}
                isAiLoading={isAiLoading}
                onGenerate={generateAiInsight}
            />

            {/* ── OVERVIEW CARDS ── */}
            <BusinessOverview data={data} />

            {/* ── MIDDLE ROW: Chart + Sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue Chart */}
                <RevenueTrendCard
                    trendData={data?.trend ?? []}
                    periodLabel={periodLabel}
                    revenueGrowth={data?.overview.revenueGrowth ?? 0}
                />

                {/* Sidebar info cards */}
                <div className="flex flex-col gap-4">
                    <CustomerInsightCard
                        total={data?.customers.total ?? 0}
                        repeat={data?.customers.repeat ?? 0}
                        repeatRate={data?.customers.repeatRate ?? 0}
                    />

                    <SalesPerformanceCard
                        volume={data?.performance.volume ?? 0}
                        topProducts={data?.productAnalysis.top ?? []}
                    />
                </div>
            </div>

            {/* ── PRODUCT TABLE ── */}
            <ProductAnalysisDeepDive
                top={data?.productAnalysis.top ?? []}
                worst={data?.productAnalysis.worst ?? []}
                periodLabel={periodLabel}
            />

        </div>
    )
}

