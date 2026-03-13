import Link from "next/link"
import { ArrowUpRight, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusPill } from "./StatusPill"

type RecentOrder = {
    id: string
    customerName: string
    customerWhatsapp: string
    status: string
    total: number
    itemCount: number
    createdAt: string
}

export function RecentOrders({ orders }: { orders?: RecentOrder[] }) {
    return (
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
                    {(!orders || orders.length === 0) ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Belum ada pesanan.</p>
                    ) : orders.map((order) => (
                        <div key={order.id} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium truncate">{order.customerName}</p>
                                    <StatusPill status={order.status} />
                                </div>
                                <p className="text-xs text-muted-foreground">{order.itemCount} item</p>
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
    )
}
