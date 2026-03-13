import {
    Search,
    Store,
    ShoppingBag,
    Package,
    TrendingUp,
} from "lucide-react"

export function StoreHero({
    query,
    onQueryChange,
}: {
    query: string
    onQueryChange: (q: string) => void
}) {
    return (
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
                    Jelajahi ratusan toko UMKM lokal. Dari kuliner hingga kerajinan semuanya ada di sini.
                </p>

                {/* Search bar */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Cari nama toko, pemilik, atau kota..."
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        className="w-full bg-white h-14 pl-12 pr-5 rounded-2xl text-base shadow-2xl shadow-black/20 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60 font-medium"
                    />
                    {query && (
                        <button
                            onClick={() => onQueryChange("")}
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
                        <strong className="text-white">100+</strong> toko aktif
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
    )
}
