import { Sparkles } from "lucide-react"
import { StoreToggleCard } from "@/components/admin/StoreToggleCard"
import { KpiGrid } from "@/components/admin/dashboard/KpiGrid"
import { SalesChart } from "@/components/admin/dashboard/SalesChart"
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders"
import { ProductAnalysis } from "@/components/admin/dashboard/ProductAnalysis"
import { StoreHealth } from "@/components/admin/dashboard/StoreHealth"

import { cookies } from "next/headers"

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
    return `http://localhost:${process.env.PORT || 3000}`
}

export default async function AdminDashboard() {
    let dashboardData: any = null
    let storeRecord: any = null
    try {
        const jar = await cookies()
        const token = jar.get("better-auth.session_token")?.value
        if (token) {
            const res = await fetch(`${getBaseUrl()}/api/dashboard`, {
                headers: { Cookie: `better-auth.session_token=${token}` },
                cache: "no-store",
            })
            if (res.ok) {
                dashboardData = await res.json()
            }

            const storeRes = await fetch(`${getBaseUrl()}/api/stores`, {
                headers: { Cookie: `better-auth.session_token=${token}` },
                cache: "no-store",
            })
            if (storeRes.ok) {
                const s = await storeRes.json()
                storeRecord = s.store
            }
        }
    } catch (e) {
        console.error("Dashboard fetch error:", e)
    }

    // Dynamic Health Check
    const healthItems = [
        { label: "Nama & Alamat URL Toko", ok: !!(storeRecord?.name && storeRecord?.slug) },
        { label: "Nomor WhatsApp", ok: !!storeRecord?.whatsappNumber },
        { label: "Kategori Toko", ok: !!storeRecord?.category },
        { label: "Minimal satu produk aktif", ok: (dashboardData?.productCount || 0) > 0 },
        { label: "Kustomisasi Banner", ok: !!(storeRecord?.bannerTitle || storeRecord?.bannerImageUrl) },
    ]

    const healthScore = Math.round(
        (healthItems.filter(h => h.ok).length / healthItems.length) * 100
    )

    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    })

    return (
        <div className="flex flex-col gap-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Selamat Datang 👋</h1>
                    <p className="text-muted-foreground text-sm mt-1">{today} · Berikut ringkasan toko Anda.</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs bg-primary/10 text-primary font-semibold rounded-full px-3 py-1.5">
                    <Sparkles className="h-3 w-3" />
                    Data diperbarui otomatis
                </div>
            </div>

            {/* Store Toggle — reads isOpen from database */}
            <StoreToggleCard initialOpen={storeRecord?.isOpen ?? true} />

            {/* KPI Grid — real data */}
            <KpiGrid data={dashboardData} />

            {/* Chart */}
            <SalesChart data={dashboardData} />

            {/* Recent Orders + Top Products + Store Health */}
            <div className="grid lg:grid-cols-3 gap-5">
                <RecentOrders orders={dashboardData?.recentOrders} />
                <ProductAnalysis data={dashboardData} />
                <StoreHealth items={healthItems} score={healthScore} />
            </div>
        </div>
    )
}
