"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import {
    ShoppingBag,
    Search,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    SlidersHorizontal,
    Loader2,
} from "lucide-react"
import {
    ALL_STATUSES,
    STATUS_CONFIG,
    formatRp,
    type OrderStatus,
} from "@/components/admin/orders/ordersData"
import { OrderCard } from "@/components/admin/orders/OrderCard"
import { SummaryCard } from "@/components/admin/orders/SummaryCard"

// ---------------------------------------------------------------------------
// Types that match our API response
// ---------------------------------------------------------------------------
export type OrderItem = {
    id: string
    name: string
    qty: number
    price: number
}

export type Order = {
    id: string
    orderNumber: string
    customer: string
    phone: string
    items: OrderItem[]
    total: number
    status: OrderStatus
    date: string
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "semua">("semua")

    const fetchOrders = async () => {
        setIsLoading(true)
        try {
            // Bypass browser cache completely
            const res = await fetch(`/api/orders?_t=${Date.now()}`, { 
                credentials: "include",
                cache: "no-store",
                headers: {
                    "Pragma": "no-cache",
                    "Cache-Control": "no-cache"
                }
            })
            if (!res.ok) return

            const data = await res.json()

            // Map API shape to Order shape that OrderCard expects
            const mapped: Order[] = (data.orders || []).map((o: any) => ({
                id: o.id,
                orderNumber: `ORD-${String(o.orderNumber).padStart(3, "0")}`,
                customer: o.customerName,
                phone: o.customerWhatsapp,
                status: o.status as OrderStatus,
                date: o.createdAt,
                total: o.orderItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
                items: o.orderItems.map((i: any) => ({
                    id: i.id,
                    name: i.product?.name ?? "Produk",
                    qty: i.quantity,
                    price: i.price,
                })),
            }))

            setOrders(mapped)
        } catch (err) {
            console.error("Failed to load orders", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // ── Respon ke Event Global dari Layout ───────────────────────────────────
    useEffect(() => {
        const handleRefresh = ((e: CustomEvent) => {
            // Jika ada payload data baru dari SSE, langsung tambahkan ke state
            if (e.detail) {
                const raw = e.detail
                const newOrder: Order = {
                    id: raw.id,
                    orderNumber: `ORD-${String(raw.orderNumber || 0).padStart(3, "0")}`,
                    customer: raw.customerName,
                    phone: raw.customerWhatsapp,
                    status: raw.status as OrderStatus,
                    date: raw.createdAt,
                    total: raw.orderItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
                    items: raw.orderItems.map((i: any) => ({
                        id: i.id,
                        name: i.product?.name ?? "Produk",
                        qty: i.quantity,
                        price: i.price,
                    })),
                }
                setOrders(prev => {
                    // Cegah duplikasi jika order sudah ada
                    if (prev.some(o => o.id === newOrder.id)) return prev
                    return [newOrder, ...prev]
                })
            } else {
                // Fallback jika tidak ada payload
                fetchOrders()
            }
        }) as EventListener

        window.addEventListener("refreshOrders", handleRefresh)
        return () => window.removeEventListener("refreshOrders", handleRefresh)
    }, [])

    const stats = useMemo(() => {
        const total = orders.length
        const baru = orders.filter(o => o.status === "baru").length
        const selesai = orders.filter(o => o.status === "selesai").length
        const revenue = orders
            .filter(o => o.status === "selesai")
            .reduce((s, o) => s + o.total, 0)
        return { total, baru, selesai, revenue }
    }, [orders])

    const filtered = useMemo(() => {
        return orders.filter(o => {
            const matchStatus = filterStatus === "semua" || o.status === filterStatus
            const q = query.toLowerCase()
            const matchQuery =
                !q ||
                o.customer.toLowerCase().includes(q) ||
                o.orderNumber.toLowerCase().includes(q) ||
                o.phone.includes(q)
            return matchStatus && matchQuery
        })
    }, [orders, query, filterStatus])

    async function handleStatusChange(id: string, status: OrderStatus) {
        // Optimistic UI update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))

        // Persist to DB
        try {
            await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status }),
            })
        } catch (err) {
            console.error("Failed to update order status", err)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pesanan</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Kelola semua pesanan yang masuk via WhatsApp.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-600 font-semibold rounded-full px-3 py-1.5">
                    <Clock className="h-3 w-3" />
                    {stats.baru} pesanan baru menunggu
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Pesanan" value={stats.total} sub="sepanjang waktu" icon={ShoppingBag} color="bg-primary/10 text-primary" />
                <SummaryCard label="Pesanan Baru" value={stats.baru} sub="perlu ditindak" icon={Clock} color="bg-blue-100 text-blue-600" />
                <SummaryCard label="Selesai" value={stats.selesai} sub="berhasil dikirim" icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
                <SummaryCard label="Total Pendapatan" value={formatRp(stats.revenue)} sub="dari pesanan selesai" icon={ArrowUpRight} color="bg-amber-100 text-amber-600" />
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama, nomor HP, atau ID pesanan..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                    {ALL_STATUSES.map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setFilterStatus(s)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            {s === "semua" ? "Semua" : STATUS_CONFIG[s].label}
                            {s !== "semua" && (
                                <span className={`ml-1 ${filterStatus === s ? "opacity-80" : "opacity-50"}`}>
                                    ({orders.filter(o => o.status === s).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memuat pesanan...
                </div>
            ) : filtered.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                        Menampilkan <strong>{filtered.length}</strong> pesanan
                    </p>
                    {filtered.map(order => (
                        <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl">
                        📭
                    </div>
                    <h3 className="text-base font-semibold mb-1">Tidak ada pesanan</h3>
                    <p className="text-muted-foreground text-sm">
                        {query ? `Tidak ada pesanan yang cocok dengan "${query}".` : "Belum ada pesanan masuk."}
                    </p>
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setFilterStatus("semua") }}
                            className="mt-4 text-primary text-sm font-semibold hover:underline"
                        >
                            Hapus filter
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
