import Link from "next/link"
import { ArrowUpRight, Zap, Package, ShoppingBag, Star, Eye, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MiniBarChart } from "@/components/admin/MiniBarChart"

const quickActions = [
    { label: "Tambah Produk", icon: Package, href: "/admin/products", color: "bg-primary text-white" },
    { label: "Lihat Pesanan", icon: ShoppingBag, href: "/admin/orders", color: "bg-blue-500 text-white" },
    { label: "Analisis Bisnis", icon: TrendingUp, href: "/admin/analysis", color: "bg-purple-500 text-white" },
    { label: "Kustomisasi Banner", icon: Star, href: "/admin/settings", color: "bg-amber-500 text-white" },
    { label: "Lihat Toko", icon: Eye, href: "/admin/settings", color: "bg-emerald-500 text-white" },
]

export function SalesChart({ data }: {
    data?: {
        salesHistory: { day: string; revenue: number; orders: number }[]
        totalRevenue: number
    }
}) {
    const history = data?.salesHistory || []
    const total = data?.totalRevenue || 0
    
    return (
        <div className="grid lg:grid-cols-3 gap-5">
            <Card className="border-0 shadow-sm bg-white lg:col-span-2">
                <CardHeader className="px-6 pt-5 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-semibold">Penjualan 7 Hari Terakhir</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Total pendapatan per hari</p>
                    </div>
                    <div className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        Rp {(total / 1000000).toFixed(2)} jt
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                    <MiniBarChart data={history} />
                    <div className="flex justify-between mt-3 text-[10px] text-muted-foreground">
                        <span>Rp 0</span>
                        <span>Total 7 hari: <strong className="text-foreground">Rp {total.toLocaleString("id-ID")}</strong></span>
                        <span>{/* dynamic max could go here */}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mt-4">
                        {history.map((d, i) => (
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
    )
}
