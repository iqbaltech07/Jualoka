import {
    ShoppingBag,
    Phone,
    MessageCircle,
    CheckCircle2,
    Clock,
    XCircle,
    Package,
    CalendarDays,
    Truck,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OrderStatus = "baru" | "diproses" | "dikirim" | "selesai" | "dibatalkan"

export type OrderItem = {
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
    date: string // ISO date
    note?: string
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

export const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
    baru: { label: "Baru", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
    diproses: { label: "Diproses", color: "text-amber-600", bg: "bg-amber-50", icon: Package },
    dikirim: { label: "Dikirim", color: "text-purple-600", bg: "bg-purple-50", icon: Truck },
    selesai: { label: "Selesai", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
    dibatalkan: { label: "Dibatalkan", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
}

export const ALL_STATUSES: (OrderStatus | "semua")[] = [
    "semua", "baru", "diproses", "dikirim", "selesai", "dibatalkan",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
    }) + " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export function formatRp(n: number) {
    return "Rp " + n.toLocaleString("id-ID")
}

export function initials(name?: string) {
    if (!name || name.trim() === "") return "AN"
    const words = name.trim().split(" ").filter(w => w.length > 0)
    if (words.length === 0) return "AN"
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
}

const AVATAR_COLORS = [
    "from-primary to-[#2ea855]",
    "from-blue-400 to-blue-600",
    "from-purple-400 to-purple-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
]

export function avatarColor(id: string) {
    if (!id) return AVATAR_COLORS[0]
    let hash = 0
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length
    return AVATAR_COLORS[index]
}
