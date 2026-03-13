import {
    Wallet,
    ShoppingBag,
    Package,
    Clock,
    BarChart3,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type KpiItem = {
    title: string
    value: string
    change: string
    positive: boolean
    icon: React.ComponentType<{ className?: string }>
    color: string
    accent: string
}

export function KpiGrid({ data }: {
    data?: {
        totalOrders: number
        newOrders: number
        productCount: number
        totalRevenue: number
    }
}) {
    const kpis: KpiItem[] = [
        {
            title: "Pendapatan dari Pesanan Selesai",
            value: data ? `Rp ${data.totalRevenue.toLocaleString("id-ID")}` : "—",
            change: "dari semua pesanan selesai",
            positive: true,
            icon: Wallet,
            color: "bg-emerald-100 text-emerald-600",
            accent: "border-l-4 border-emerald-400",
        },
        {
            title: "Total Pesanan",
            value: data ? String(data.totalOrders) : "—",
            change: "sepanjang waktu",
            positive: true,
            icon: ShoppingBag,
            color: "bg-primary/10 text-primary",
            accent: "border-l-4 border-primary",
        },
        {
            title: "Produk Aktif",
            value: data ? String(data.productCount) : "—",
            change: "di katalog toko",
            positive: true,
            icon: Package,
            color: "bg-blue-100 text-blue-600",
            accent: "border-l-4 border-blue-400",
        },
        {
            title: "Pesanan Baru",
            value: data ? String(data.newOrders) : "—",
            change: "perlu ditindaklanjuti",
            positive: data ? data.newOrders === 0 : true,
            icon: Clock,
            color: "bg-rose-100 text-rose-600",
            accent: "border-l-4 border-rose-400",
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, i) => (
                <Card key={i} className={`border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden ${kpi.accent}`}>
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-xl ${kpi.color}`}>
                                <kpi.icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.title}</p>
                            <p className="text-2xl font-bold mt-1 leading-tight">{kpi.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
