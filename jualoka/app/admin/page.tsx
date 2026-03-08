import Link from "next/link"
import {
    Package,
    ShoppingBag,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Sparkles,
    Wallet,
    Clock,
    CheckCircle2,
    AlertCircle,
    MessageCircle,
    Star,
    Zap,
    Eye,
    BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoreOpenFromCookie } from "@/lib/storeActions"
import { StoreToggleCard } from "@/components/admin/StoreToggleCard"
import { MiniBarChart } from "@/components/admin/MiniBarChart"
import { salesData } from "@/lib/salesData"



// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const TODAY = "Minggu, 8 Mar 2026"

const kpis = [
    {
        title: "Pendapatan Bulan Ini",
        value: "Rp 3.240.000",
        change: "+18% dari bulan lalu",
        positive: true,
        icon: Wallet,
        color: "bg-emerald-100 text-emerald-600",
        accent: "border-l-4 border-emerald-400",
    },
    {
        title: "Total Pesanan",
        value: "48",
        change: "+12% dari bulan lalu",
        positive: true,
        icon: ShoppingBag,
        color: "bg-primary/10 text-primary",
        accent: "border-l-4 border-primary",
    },
    {
        title: "Produk Aktif",
        value: "12",
        change: "+2 produk baru",
        positive: true,
        icon: Package,
        color: "bg-blue-100 text-blue-600",
        accent: "border-l-4 border-blue-400",
    },
    {
        title: "Pengunjung Toko",
        value: "284",
        change: "+34 hari ini",
        positive: true,
        icon: Eye,
        color: "bg-purple-100 text-purple-600",
        accent: "border-l-4 border-purple-400",
    },
    {
        title: "Rata-rata Nilai Pesanan",
        value: "Rp 67.500",
        change: "-5% dari bulan lalu",
        positive: false,
        icon: BarChart3,
        color: "bg-amber-100 text-amber-600",
        accent: "border-l-4 border-amber-400",
    },
    {
        title: "Pesanan Baru Hari Ini",
        value: "3",
        change: "Perlu ditindaklanjuti",
        positive: true,
        icon: Clock,
        color: "bg-rose-100 text-rose-600",
        accent: "border-l-4 border-rose-400",
    },
]

type ProductStatus = "laris" | "stabil" | "perhatian"

const topProducts: {
    name: string
    sold: number
    revenue: number
    trend: "up" | "down"
    status: ProductStatus
    insight: string
}[] = [
        {
            name: "Keripik Singkong Pedas Gila",
            sold: 38,
            revenue: 570000,
            trend: "up",
            status: "laris",
            insight: "Paling sering dipesan ulang. Harga terjangkau & nama produk menarik perhatian pembeli baru.",
        },
        {
            name: "Kopi Gula Aren Literan",
            sold: 22,
            revenue: 1430000,
            trend: "up",
            status: "laris",
            insight: "Nilai per pesanan tertinggi. Pembeli cenderung beli 2–3 botol sekaligus untuk stok mingguan.",
        },
        {
            name: "Seblak Instan Komplit",
            sold: 19,
            revenue: 228000,
            trend: "up",
            status: "stabil",
            insight: "Penjualan konsisten setiap minggu. Tambahkan varian rasa untuk dorong volume lebih tinggi.",
        },
        {
            name: "Cireng Isi Ayam Suwir",
            sold: 12,
            revenue: 216000,
            trend: "down",
            status: "perhatian",
            insight: "Penjualan turun 30% bulan ini. Foto produk kurang menarik & deskripsi belum menjelaskan isi/ukuran.",
        },
    ]

const recentOrders = [
    { name: "Nurul Hidayah", phone: "+62 815-1234-5678", total: 143000, items: 3, status: "baru", time: "5 menit lalu" },
    { name: "Budi Santoso", phone: "+62 812-3456-7890", total: 42000, items: 2, status: "baru", time: "27 menit lalu" },
    { name: "Siti Rahayu", phone: "+62 821-9876-5432", total: 231000, items: 5, status: "diproses", time: "1 jam lalu" },
    { name: "Ahmad Fauzi", phone: "+62 831-2345-6789", total: 15000, items: 1, status: "dikirim", time: "Kemarin" },
]

const storeHealth = [
    { label: "Foto produk sudah diunggah", ok: true },
    { label: "Nomor WhatsApp sudah diisi", ok: true },
    { label: "Deskripsi toko sudah lengkap", ok: true },
    { label: "Banner toko sudah dikustomisasi", ok: false },
    { label: "Minimal 5 produk aktif", ok: true },
    { label: "Alamat toko sudah diisi", ok: false },
]

const quickActions = [
    { label: "Tambah Produk", icon: Package, href: "/admin/products", color: "bg-primary text-white" },
    { label: "Lihat Pesanan", icon: ShoppingBag, href: "/admin/orders", color: "bg-blue-500 text-white" },
    { label: "Kustomisasi Banner", icon: Star, href: "/admin/settings", color: "bg-amber-500 text-white" },
    { label: "Buka Toko", icon: Eye, href: "/toko/kopi-nusantara", color: "bg-emerald-500 text-white" },
]

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    baru: { label: "Baru", cls: "bg-blue-50 text-blue-600" },
    diproses: { label: "Diproses", cls: "bg-amber-50 text-amber-600" },
    dikirim: { label: "Dikirim", cls: "bg-purple-50 text-purple-600" },
    selesai: { label: "Selesai", cls: "bg-emerald-50 text-emerald-600" },
}

function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CFG[status] ?? { label: status, cls: "bg-muted text-muted-foreground" }
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function AdminDashboard() {
    const isOpen = await getStoreOpenFromCookie()

    const healthScore = Math.round(
        (storeHealth.filter((h) => h.ok).length / storeHealth.length) * 100
    )

    return (
        <div className="flex flex-col gap-7">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Selamat Datang 👋</h1>
                    <p className="text-muted-foreground text-sm mt-1">{TODAY} · Berikut ringkasan toko Anda hari ini.</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs bg-primary/10 text-primary font-semibold rounded-full px-3 py-1.5">
                    <Sparkles className="h-3 w-3" />
                    Data diperbarui otomatis
                </div>
            </div>

            {/* ── STORE TOGGLE ─────────────────────────────────────────────── */}
            <StoreToggleCard initialOpen={isOpen} />

            {/* KPI Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi, i) => (
                    <Card key={i} className={`border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden ${kpi.accent}`}>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-xl ${kpi.color}`}>
                                    <kpi.icon className="h-4 w-4" />
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${kpi.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                    {kpi.positive ? "▲" : "▼"} {kpi.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.title}</p>
                                <p className="text-2xl font-bold mt-1 leading-tight">{kpi.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart + Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-5">
                <Card className="border-0 shadow-sm bg-white lg:col-span-2">
                    <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Penjualan 7 Hari Terakhir</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Total pendapatan per hari</p>
                        </div>
                        <div className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            Rp 3.24 jt
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <MiniBarChart />
                        <div className="flex justify-between mt-3 text-[10px] text-muted-foreground">
                            <span>Rp 0</span>
                            <span>Total minggu ini: <strong className="text-foreground">Rp 3.240.000</strong></span>
                            <span>Rp 720rb</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mt-4">
                            {salesData.map((d, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground">{d.orders}</p>
                                    <p className="text-[9px] text-muted-foreground/60">pesanan</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white">
                    <CardHeader className="px-5 pt-5 pb-4">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Aksi Cepat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex flex-col gap-2.5">
                        {quickActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors group"
                            >
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                                    <action.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium flex-1">{action.label}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders + Top Products + Store Health */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* Recent Orders */}
                <Card className="border-0 shadow-sm bg-white lg:col-span-1">
                    <CardHeader className="px-5 pt-5 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Pesanan Terbaru</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Via WhatsApp</p>
                        </div>
                        <Link href="/admin/orders" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                            Lihat semua <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex flex-col gap-3">
                            {recentOrders.map((order, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {order.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-medium truncate">{order.name}</p>
                                            <StatusPill status={order.status} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">{order.time} · {order.items} item</p>
                                    </div>
                                    <p className="text-sm font-bold text-primary shrink-0">
                                        Rp {(order.total / 1000).toFixed(0)}rb
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50">
                            <a
                                href="https://wa.me"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1a9e4e] text-xs font-semibold transition-colors"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Buka WhatsApp Business
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Analisis Produk */}
                <Card className="border-0 shadow-sm bg-white lg:col-span-1">
                    <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold">Analisis Produk</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Performa & insight bulan ini</p>
                        </div>
                        <Link href="/admin/products" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                            Kelola <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex flex-col gap-2.5">
                            {topProducts.map((p, i) => {
                                const statusCfg = {
                                    laris: { label: "🔥 Laris", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                                    stabil: { label: "📊 Stabil", cls: "bg-blue-50 text-blue-700 border-blue-200" },
                                    perhatian: { label: "⚠️ Perlu Perhatian", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                                }[p.status]
                                return (
                                    <div key={i} className={`rounded-xl border p-3 ${p.status === "perhatian" ? "border-amber-200 bg-amber-50/40" : "border-border/50 bg-white"}`}>
                                        <div className="flex items-start gap-2.5">
                                            <div className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-100 text-slate-500" : "bg-muted text-muted-foreground"}`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className="text-xs font-semibold leading-tight">{p.name}</p>
                                                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${statusCfg.cls}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] text-muted-foreground">{p.sold} terjual</span>
                                                    <span className="text-[11px] text-muted-foreground">·</span>
                                                    <span className="text-[11px] font-semibold text-foreground">Rp {(p.revenue / 1000).toFixed(0)}rb</span>
                                                    <span className="ml-auto">
                                                        {p.trend === "up"
                                                            ? <TrendingUp className="h-3 w-3 text-emerald-500" />
                                                            : <TrendingDown className="h-3 w-3 text-red-400" />
                                                        }
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{p.insight}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Store Health */}
                <Card className="border-0 shadow-sm bg-white lg:col-span-1">
                    <CardHeader className="px-5 pt-5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">Kesehatan Toko</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Kelengkapan profil toko</p>
                            </div>
                            <div className="relative h-12 w-12">
                                <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                                    <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-muted" />
                                    <circle
                                        cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                                        strokeDasharray={`${(healthScore / 100) * 94.2} 94.2`}
                                        strokeLinecap="round"
                                        className="stroke-emerald-500 transition-all duration-700"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-emerald-600">
                                    {healthScore}%
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className="flex flex-col gap-2.5">
                            {storeHealth.map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    {item.ok
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        : <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                    }
                                    <span className={`text-xs ${item.ok ? "text-foreground" : "text-muted-foreground"}`}>
                                        {item.label}
                                    </span>
                                    {!item.ok && (
                                        <span className="ml-auto text-[10px] font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                                            Lengkapi
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {healthScore < 100 && (
                            <Link
                                href="/admin/settings"
                                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors"
                            >
                                Lengkapi Profil Toko <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
