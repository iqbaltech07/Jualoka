"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
    Search,
    Store,
    MapPin,
    Package,
    ArrowRight,
    Star,
    ShoppingBag,
    SlidersHorizontal,
    ChevronRight,
    TrendingUp,
} from "lucide-react"

// --------------------------------------------------------------------------
// Data
// --------------------------------------------------------------------------

type Category = "Makanan" | "Minuman" | "Fashion" | "Kerajinan" | "Kecantikan"

type StoreData = {
    id: string
    name: string
    slug: string
    owner: string
    category: Category
    location: string
    productCount: number
    rating: number
    reviewCount: number
    description: string
    badge?: string
    featured?: boolean
    color: string // gradient for avatar
}

const STORES: StoreData[] = [
    {
        id: "1",
        name: "Toko Berkah Snack",
        slug: "toko-berkah",
        owner: "Siti Rahayu",
        category: "Makanan",
        location: "Bandung, Jawa Barat",
        productCount: 12,
        rating: 4.9,
        reviewCount: 238,
        description: "Spesialis keripik singkong, seblak, dan snack pedas khas Jawa Barat berkualitas premium.",
        badge: "Laris Manis",
        featured: true,
        color: "from-orange-400 to-rose-500",
    },
    {
        id: "2",
        name: "Kopi Gula Aren Nusantara",
        slug: "kopi-nusantara",
        owner: "Ahmad Fauzi",
        category: "Minuman",
        location: "Yogyakarta, DIY",
        productCount: 7,
        rating: 4.8,
        reviewCount: 156,
        description: "Kopi susu gula aren premium dalam kemasan botol literan. Segar, lezat, tanpa pengawet.",
        badge: "Favorit",
        featured: true,
        color: "from-amber-400 to-orange-500",
    },
    {
        id: "3",
        name: "Batik Pesisir Cantik",
        slug: "batik-pesisir",
        owner: "Dewi Lestari",
        category: "Fashion",
        location: "Pekalongan, Jawa Tengah",
        productCount: 24,
        rating: 4.7,
        reviewCount: 89,
        description: "Koleksi batik pesisir motif khas Pekalongan dengan pewarnaan alami dan bahan premium.",
        featured: false,
        color: "from-purple-400 to-indigo-500",
    },
    {
        id: "4",
        name: "Rajutan Ibu Cantik",
        slug: "rajutan-ibu",
        owner: "Rina Permata",
        category: "Fashion",
        location: "Surabaya, Jawa Timur",
        productCount: 18,
        rating: 4.6,
        reviewCount: 62,
        description: "Tas, dompet, dan aksesori rajut handmade berkualitas dengan desain modern dan trendy.",
        featured: false,
        color: "from-pink-400 to-rose-500",
    },
    {
        id: "5",
        name: "Kerajinan Bambu Lestari",
        slug: "bambu-lestari",
        owner: "Budi Santoso",
        category: "Kerajinan",
        location: "Tasikmalaya, Jawa Barat",
        productCount: 31,
        rating: 4.8,
        reviewCount: 114,
        description: "Produk kerajinan bambu ramah lingkungan: lampu, perabot, wadah, dan dekorasi rumah estetik.",
        badge: "Eco Friendly",
        featured: true,
        color: "from-emerald-400 to-teal-500",
    },
    {
        id: "6",
        name: "Herbal Sehat Alami",
        slug: "herbal-sehat",
        owner: "Nurul Hidayah",
        category: "Kecantikan",
        location: "Malang, Jawa Timur",
        productCount: 9,
        rating: 4.9,
        reviewCount: 201,
        description: "Produk perawatan kulit dan kecantikan 100% alami berbahan rempah-rempah pilihan nusantara.",
        badge: "All Natural",
        featured: true,
        color: "from-lime-400 to-emerald-500",
    },
    {
        id: "7",
        name: "Rendang Uni Minang",
        slug: "rendang-uni",
        owner: "Fatimah Andriani",
        category: "Makanan",
        location: "Padang, Sumatera Barat",
        productCount: 5,
        rating: 5.0,
        reviewCount: 340,
        description: "Rendang sapi asli Minang, dimasak tradisional selama 6 jam. Tahan 1 bulan di suhu ruang.",
        badge: "Top Rated",
        featured: true,
        color: "from-red-400 to-rose-600",
    },
    {
        id: "8",
        name: "Tempe Chips Crispy",
        slug: "tempe-chips",
        owner: "Hendra Wijaya",
        category: "Makanan",
        location: "Solo, Jawa Tengah",
        productCount: 8,
        rating: 4.5,
        reviewCount: 72,
        description: "Keripik tempe krispy aneka rasa: original, BBQ, keju, dan balado. Isi 250gr per kemasan.",
        featured: false,
        color: "from-yellow-400 to-amber-500",
    },
]

const CATEGORIES: (Category | "Semua")[] = ["Semua", "Makanan", "Minuman", "Fashion", "Kerajinan", "Kecantikan"]

const CATEGORY_ICONS: Record<string, string> = {
    Semua: "🏪",
    Makanan: "🍜",
    Minuman: "☕",
    Fashion: "👗",
    Kerajinan: "🎨",
    Kecantikan: "✨",
}

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------

function StoreCard({ store }: { store: StoreData }) {
    return (
        <Link
            href={`/toko/${store.slug}`}
            className="group bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
        >
            {/* Color banner */}
            <div className={`h-20 bg-gradient-to-r ${store.color} relative`}>
                {store.badge && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-foreground shadow">
                        {store.badge}
                    </div>
                )}
                {/* Avatar */}
                <div className="absolute -bottom-6 left-5 h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center ring-2 ring-white">
                    <span className={`h-12 w-12 rounded-xl bg-gradient-to-br ${store.color} flex items-center justify-center text-white font-black text-xl`}>
                        {store.name.charAt(0)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="pt-10 px-5 pb-5 flex flex-col flex-1">
                {/* Category pill */}
                <span className="self-end text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full -mt-2">
                    {CATEGORY_ICONS[store.category]} {store.category}
                </span>

                <h3 className="font-bold text-base leading-tight mt-1 group-hover:text-primary transition-colors">
                    {store.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">oleh {store.owner}</p>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {store.location}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground/80 mt-3 leading-relaxed line-clamp-2 flex-1">
                    {store.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {store.productCount} produk
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {store.rating} ({store.reviewCount})
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Kunjungi <ChevronRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </Link>
    )
}

// --------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------

export default function StoresPage() {
    const [query, setQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<Category | "Semua">("Semua")

    const filtered = useMemo(() => {
        return STORES.filter((store) => {
            const matchesCategory = activeCategory === "Semua" || store.category === activeCategory
            const q = query.toLowerCase()
            const matchesQuery =
                !q ||
                store.name.toLowerCase().includes(q) ||
                store.owner.toLowerCase().includes(q) ||
                store.location.toLowerCase().includes(q) ||
                store.description.toLowerCase().includes(q)
            return matchesCategory && matchesQuery
        })
    }, [query, activeCategory])

    const featuredStores = STORES.filter((s) => s.featured)

    return (
        <div className="min-h-screen bg-[#f8fafb]">
            {/* ---------------------------------------------------------------- */}
            {/* Hero / Search Header                                              */}
            {/* ---------------------------------------------------------------- */}
            <div className="relative bg-gradient-to-br from-primary to-[#176130] overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-secondary/10 rounded-full pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-5 py-16 sm:py-24 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
                        <Store className="h-3 w-3" />
                        Direktori Toko UMKM
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                        Temukan Toko <span className="text-secondary">UMKM</span><br className="hidden sm:block" /> Terbaik Indonesia
                    </h1>
                    <p className="text-white/70 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
                        Jelajahi ratusan toko UMKM lokal. Dari kuliner hingga kerajinan — semuanya ada di sini.
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Cari nama toko, pemilik, atau kota..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white h-14 pl-12 pr-5 rounded-2xl text-base shadow-2xl shadow-black/20 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 font-medium"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground bg-muted rounded-lg px-2 py-1 transition-colors"
                            >
                                Hapus
                            </button>
                        )}
                    </div>

                    {/* Quick stats */}
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8 text-white/60 text-sm">
                        <span className="flex items-center gap-1.5">
                            <ShoppingBag className="h-4 w-4" />
                            <strong className="text-white">{STORES.length}+</strong> toko aktif
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            <strong className="text-white">150+</strong> produk tersedia
                        </span>
                        <span className="flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" />
                            <strong className="text-white">5 kota</strong> di Indonesia
                        </span>
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* Category Filter                                                   */}
            {/* ---------------------------------------------------------------- */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
                <div className="max-w-6xl mx-auto px-5">
                    <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${activeCategory === cat
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                            >
                                <span>{CATEGORY_ICONS[cat]}</span>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-10 space-y-12">

                {/* -------------------------------------------------------------- */}
                {/* Featured Stores (only when no query/filter active)              */}
                {/* -------------------------------------------------------------- */}
                {!query && activeCategory === "Semua" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold">⭐ Toko Unggulan</h2>
                                <p className="text-muted-foreground text-sm mt-0.5">Toko terpilih berdasarkan rating dan penjualan</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredStores.map((store) => <StoreCard key={store.id} store={store} />)}
                        </div>
                    </div>
                )}

                {/* -------------------------------------------------------------- */}
                {/* All / Filtered Stores                                           */}
                {/* -------------------------------------------------------------- */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">
                                {query
                                    ? `Hasil Pencarian "${query}"`
                                    : activeCategory !== "Semua"
                                        ? `Toko ${activeCategory}`
                                        : "Semua Toko"}
                            </h2>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                {filtered.length} toko ditemukan
                            </p>
                        </div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.map((store) => <StoreCard key={store.id} store={store} />)}
                        </div>
                    ) : (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 text-4xl">
                                🔍
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Toko tidak ditemukan</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                                Tidak ada toko yang cocok dengan pencarian <strong>&ldquo;{query}&rdquo;</strong>.
                                Coba kata kunci lain.
                            </p>
                            <button
                                onClick={() => { setQuery(""); setActiveCategory("Semua") }}
                                className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                            >
                                Tampilkan semua toko <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* -------------------------------------------------------------- */}
                {/* CTA — Open your own store                                       */}
                {/* -------------------------------------------------------------- */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl border border-primary/10 px-8 py-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Store className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">Punya Produk UMKM?</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Buka toko Anda sekarang di Jualoka dan jangkau lebih banyak pelanggan. Gratis dan mudah!
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="shrink-0 flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
                    >
                        Buat Toko Gratis
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
