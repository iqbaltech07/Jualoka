"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Package,
    TrendingUp,
    AlertTriangle,
    Search,
    ShoppingBag,
    BarChart2,
    Box,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Product = {
    id: string
    name: string
    price: number
    cost: number | null
    stock: number
    description: string
    image: string | null
    totalSold30Days: number
}

const statusConfig = {
    "Laris":       { label: "Laris",       bg: "bg-emerald-500", text: "text-emerald-700", pill: "bg-emerald-50 ring-emerald-200 text-emerald-700" },
    "Stabil":      { label: "Stabil",      bg: "bg-blue-500",    text: "text-blue-700",    pill: "bg-blue-50 ring-blue-200 text-blue-700" },
    "Kurang Laku": { label: "Kurang Laku", bg: "bg-amber-500",   text: "text-amber-700",   pill: "bg-amber-50 ring-amber-200 text-amber-700" },
    "Tidak Layak": { label: "Tidak Layak", bg: "bg-rose-500",    text: "text-rose-700",    pill: "bg-rose-50 ring-rose-200 text-rose-700" },
}

function getStatus(totalSold: number): keyof typeof statusConfig {
    if (totalSold >= 30) return "Laris"
    if (totalSold >= 10) return "Stabil"
    if (totalSold >= 1)  return "Kurang Laku"
    return "Tidak Layak"
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-zinc-100 animate-pulse">
            <div className="bg-zinc-100 h-32" />
            <div className="p-3 space-y-2">
                <div className="h-3.5 bg-zinc-100 rounded w-3/4" />
                <div className="h-3 bg-zinc-100 rounded w-1/2" />
                <div className="flex gap-1.5 pt-1">
                    <div className="h-7 bg-zinc-100 rounded-lg flex-1" />
                    <div className="h-7 w-7 bg-zinc-100 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: (id: string, name: string) => void }) {
    const status = getStatus(product.totalSold30Days || 0)
    const s = statusConfig[status]
    const margin = product.cost && product.cost > 0
        ? Math.round(((product.price - product.cost) / product.price) * 100)
        : null

    return (
        <div className="group bg-white rounded-xl overflow-hidden border border-zinc-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col">
            {/* Image */}
            <div className="relative h-28 bg-gradient-to-br from-zinc-50 to-zinc-100 overflow-hidden shrink-0">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/30 flex items-center justify-center text-primary font-bold text-lg">
                            {product.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col gap-2 flex-1">
                {/* Badges row */}
                <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${s.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.bg} shrink-0`} />
                        {s.label}
                    </span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        product.stock === 0
                            ? "bg-rose-100 text-rose-600"
                            : product.stock <= 10
                            ? "bg-amber-100 text-amber-700"
                            : "bg-zinc-100 text-zinc-600"
                    }`}>
                        Stok: {product.stock}
                    </span>
                </div>

                <p className="text-xs font-semibold text-zinc-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                </p>

                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">
                        Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    {margin !== null && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                            <TrendingUp className="h-3 w-3" />{margin}%
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 pt-1 mt-auto">
                    <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-[11px] rounded-lg gap-1 border-zinc-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-150 px-2"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-lg border-zinc-200 text-rose-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all duration-150 p-0 shrink-0"
                        onClick={() => onDelete(product.id, product.name)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")

    async function fetchProducts() {
        try {
            const res = await fetch("/api/products", { credentials: "include" })
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products || [])
            }
        } catch {
            toast.error("Gagal memuat produk.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchProducts() }, [])

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Hapus produk "${name}"?`)) return
        try {
            const res = await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" })
            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== id))
                toast.success(`"${name}" dihapus.`)
            } else {
                const data = await res.json()
                toast.error(data.message || "Gagal menghapus produk.")
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi.")
        }
    }

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const totalStock  = products.reduce((s, p) => s + p.stock, 0)
    const lowStock    = products.filter((p) => p.stock > 0 && p.stock <= 10).length
    const outOfStock  = products.filter((p) => p.stock === 0).length

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900">Produk</h1>
                    <p className="text-muted-foreground text-xs mt-0.5">Kelola produk dan stok toko Anda.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="flex items-center gap-1.5 rounded-xl shadow-md shadow-primary/20 h-9 px-4 text-sm">
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Produk
                    </Button>
                </Link>
            </div>

            {/* Stats bar */}
            {!isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                        { icon: ShoppingBag, val: products.length, label: "Total Produk", color: "text-primary", bg: "bg-primary/10" },
                        { icon: Box,         val: totalStock,        label: "Total Stok",   color: "text-blue-600", bg: "bg-blue-50" },
                        { icon: AlertTriangle,val: lowStock,         label: "Stok Menipis", color: "text-amber-600",bg: "bg-amber-50" },
                        { icon: BarChart2,   val: outOfStock,        label: "Stok Habis",   color: "text-rose-500", bg: "bg-rose-50" },
                    ].map(({ icon: Icon, val, label, color, bg }) => (
                        <div key={label} className="bg-white rounded-xl border border-zinc-100 shadow-sm px-3.5 py-3 flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                                <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <div>
                                <p className={`text-lg font-bold leading-none ${val > 0 && label !== "Total Produk" && label !== "Total Stok" ? "text-zinc-900" : "text-zinc-900"}`}>{val}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search + count */}
            {!isLoading && products.length > 0 && (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <Input
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8 text-sm rounded-xl border-zinc-200 bg-white w-48"
                        />
                    </div>
                    <span className="text-xs text-zinc-400">{filtered.length} produk</span>
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                        <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-zinc-700">
                            {search ? "Produk tidak ditemukan" : "Belum ada produk"}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {search ? `Tidak ada hasil untuk "${search}"` : "Tambahkan produk pertama Anda"}
                        </p>
                    </div>
                    {!search && (
                        <Link href="/admin/products/new">
                            <Button className="mt-1 rounded-xl gap-1.5 h-9 text-sm">
                                <Plus className="h-3.5 w-3.5" /> Tambah Produk
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    )
}
