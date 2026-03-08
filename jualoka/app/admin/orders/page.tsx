"use client"

import { useState, useMemo } from "react"
import {
    ShoppingBag,
    Search,
    Phone,
    MessageCircle,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronDown,
    Filter,
    ArrowUpRight,
    Package,
    CalendarDays,
    SlidersHorizontal,
    Truck,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type OrderStatus = "baru" | "diproses" | "dikirim" | "selesai" | "dibatalkan"

type OrderItem = {
    name: string
    qty: number
    price: number
}

type Order = {
    id: string
    orderNumber: string
    customer: string
    phone: string
    items: OrderItem[]
    total: number
    status: OrderStatus
    date: string // ISO date
    note?: string
}

const ORDERS: Order[] = [
    {
        id: "1",
        orderNumber: "ORD-001",
        customer: "Budi Santoso",
        phone: "+6281234567890",
        items: [
            { name: "Keripik Singkong Pedas Gila", qty: 2, price: 15000 },
            { name: "Seblak Instan Komplit", qty: 1, price: 12000 },
        ],
        total: 42000,
        status: "baru",
        date: "2026-03-08T07:30:00",
        note: "Tolong dikemas rapi ya kak 🙏",
    },
    {
        id: "2",
        orderNumber: "ORD-002",
        customer: "Siti Rahayu",
        phone: "+6282198765432",
        items: [
            { name: "Kopi Gula Aren Literan", qty: 3, price: 65000 },
            { name: "Cireng Isi Ayam Suwir", qty: 2, price: 18000 },
        ],
        total: 231000,
        status: "diproses",
        date: "2026-03-08T06:15:00",
    },
    {
        id: "3",
        orderNumber: "ORD-003",
        customer: "Ahmad Fauzi",
        phone: "+6283123456789",
        items: [{ name: "Keripik Singkong Pedas Gila", qty: 1, price: 15000 }],
        total: 15000,
        status: "dikirim",
        date: "2026-03-07T15:00:00",
    },
    {
        id: "4",
        orderNumber: "ORD-004",
        customer: "Dewi Lestari",
        phone: "+6285612345678",
        items: [
            { name: "Seblak Instan Komplit", qty: 4, price: 12000 },
            { name: "Cireng Isi Ayam Suwir", qty: 1, price: 18000 },
        ],
        total: 66000,
        status: "selesai",
        date: "2026-03-07T10:20:00",
    },
    {
        id: "5",
        orderNumber: "ORD-005",
        customer: "Rina Permata",
        phone: "+6287812345678",
        items: [{ name: "Kopi Gula Aren Literan", qty: 2, price: 65000 }],
        total: 130000,
        status: "selesai",
        date: "2026-03-06T09:00:00",
    },
    {
        id: "6",
        orderNumber: "ORD-006",
        customer: "Hendra Wijaya",
        phone: "+6281398765432",
        items: [{ name: "Keripik Singkong Pedas Gila", qty: 3, price: 15000 }],
        total: 45000,
        status: "dibatalkan",
        date: "2026-03-06T08:30:00",
        note: "Pembeli tidak bisa COD",
    },
    {
        id: "7",
        orderNumber: "ORD-007",
        customer: "Nurul Hidayah",
        phone: "+6281512345678",
        items: [
            { name: "Seblak Instan Komplit", qty: 2, price: 12000 },
            { name: "Kopi Gula Aren Literan", qty: 1, price: 65000 },
            { name: "Cireng Isi Ayam Suwir", qty: 3, price: 18000 },
        ],
        total: 143000,
        status: "baru",
        date: "2026-03-08T07:55:00",
    },
]

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
    baru: { label: "Baru", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
    diproses: { label: "Diproses", color: "text-amber-600", bg: "bg-amber-50", icon: Package },
    dikirim: { label: "Dikirim", color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
    selesai: { label: "Selesai", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
    dibatalkan: { label: "Dibatalkan", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
}

const ALL_STATUSES: (OrderStatus | "semua")[] = [
    "semua", "baru", "diproses", "dikirim", "selesai", "dibatalkan",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
    }) + " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function formatRp(n: number) {
    return "Rp " + n.toLocaleString("id-ID")
}

function initials(name: string) {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

const AVATAR_COLORS = [
    "from-primary to-[#2ea855]",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
]

function avatarColor(id: string) {
    return AVATAR_COLORS[parseInt(id) % AVATAR_COLORS.length]
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: OrderStatus }) {
    const cfg = STATUS_CONFIG[status]
    const Icon = cfg.icon
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    )
}

// ---------------------------------------------------------------------------
// Status dropdown
// ---------------------------------------------------------------------------

function StatusDropdown({
    current,
    onChange,
}: {
    current: OrderStatus
    onChange: (s: OrderStatus) => void
}) {
    const [open, setOpen] = useState(false)
    const statuses: OrderStatus[] = ["baru", "diproses", "dikirim", "selesai", "dibatalkan"]

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 text-xs font-semibold border border-border rounded-xl px-3 py-1.5 bg-white hover:bg-muted/50 transition-colors"
            >
                Ubah status <ChevronDown className="h-3 w-3" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-9 z-20 bg-white border border-border/60 rounded-2xl shadow-xl py-1.5 min-w-[160px]">
                        {statuses.map((s) => {
                            const cfg = STATUS_CONFIG[s]
                            const Icon = cfg.icon
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => { onChange(s); setOpen(false) }}
                                    className={`w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-muted/50 transition-colors ${current === s ? cfg.color : "text-foreground"}`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {cfg.label}
                                    {current === s && <span className="ml-auto text-[10px]">✓</span>}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Order Card
// ---------------------------------------------------------------------------

function OrderCard({
    order,
    onStatusChange,
}: {
    order: Order
    onStatusChange: (id: string, s: OrderStatus) => void
}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-4 p-5">
                {/* Avatar */}
                <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColor(order.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                    {initials(order.customer)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                            <p className="font-semibold text-sm">{order.customer}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" /> {order.phone}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={order.status} />
                            <StatusDropdown
                                current={order.status}
                                onChange={(s) => onStatusChange(order.id, s)}
                            />
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-lg">
                            {order.orderNumber}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(order.date)}
                        </span>
                        <span className="text-sm font-bold text-primary ml-auto">
                            {formatRp(order.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Items (collapsed / expanded) */}
            <div className="border-t border-border/50">
                <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                    <span>
                        {order.items.length} item ·{" "}
                        {order.items.map((i) => i.name).join(", ").slice(0, 60)}
                        {order.items.map((i) => i.name).join(", ").length > 60 ? "…" : ""}
                    </span>
                    <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                </button>

                {expanded && (
                    <div className="px-5 pb-4 space-y-3">
                        {/* Items list */}
                        <div className="bg-muted/30 rounded-xl divide-y divide-border/50">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                    <div>
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.qty} × {formatRp(item.price)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {formatRp(item.qty * item.price)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between px-4 py-2.5 font-bold">
                                <span className="text-sm">Total</span>
                                <span className="text-sm text-primary">{formatRp(order.total)}</span>
                            </div>
                        </div>

                        {/* Note */}
                        {order.note && (
                            <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                                <span>📝</span>
                                <span>{order.note}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <a
                                href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=Halo ${encodeURIComponent(order.customer)}, pesanan kamu ${order.orderNumber} sudah kami konfirmasi 🙏`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] rounded-xl px-4 py-2 transition-colors"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Hubungi via WhatsApp
                            </a>
                            <button
                                type="button"
                                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-4 py-2 transition-colors hover:bg-muted/30"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Detail
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Summary card
// ---------------------------------------------------------------------------

function SummaryCard({
    label,
    value,
    sub,
    icon: Icon,
    color,
}: {
    label: string
    value: string | number
    sub?: string
    icon: React.ComponentType<{ className?: string }>
    color: string
}) {
    return (
        <div className="bg-white rounded-2xl border-0 shadow-sm p-5 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-4.5 w-4.5 h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold mt-0.5">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(ORDERS)
    const [query, setQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<OrderStatus | "semua">("semua")

    const stats = useMemo(() => {
        const total = orders.length
        const baru = orders.filter((o) => o.status === "baru").length
        const selesai = orders.filter((o) => o.status === "selesai").length
        const revenue = orders
            .filter((o) => o.status === "selesai")
            .reduce((s, o) => s + o.total, 0)
        return { total, baru, selesai, revenue }
    }, [orders])

    const filtered = useMemo(() => {
        return orders.filter((o) => {
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

    function handleStatusChange(id: string, status: OrderStatus) {
        setOrders((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status } : o))
        )
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
                <SummaryCard
                    label="Total Pesanan"
                    value={stats.total}
                    sub="sepanjang waktu"
                    icon={ShoppingBag}
                    color="bg-primary/10 text-primary"
                />
                <SummaryCard
                    label="Pesanan Baru"
                    value={stats.baru}
                    sub="perlu ditindak"
                    icon={Clock}
                    color="bg-blue-100 text-blue-600"
                />
                <SummaryCard
                    label="Selesai"
                    value={stats.selesai}
                    sub="berhasil dikirim"
                    icon={CheckCircle2}
                    color="bg-emerald-100 text-emerald-600"
                />
                <SummaryCard
                    label="Total Pendapatan"
                    value={formatRp(stats.revenue)}
                    sub="dari pesanan selesai"
                    icon={ArrowUpRight}
                    color="bg-amber-100 text-amber-600"
                />
            </div>

            {/* Filter & Search bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama, nomor HP, atau ID pesanan..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Status filter pill */}
                <div className="flex items-center gap-1.5 bg-white border border-border rounded-xl px-2 py-1 overflow-x-auto">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
                    {ALL_STATUSES.map((s) => (
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
                                    ({orders.filter((o) => o.status === s).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders list */}
            {filtered.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                        Menampilkan <strong>{filtered.length}</strong> pesanan
                    </p>
                    {filtered.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={handleStatusChange}
                        />
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
