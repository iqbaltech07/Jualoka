import Link from "next/link"
import { Package, ChevronRight } from "lucide-react"

export type StoreCardData = {
    id: string
    name: string
    slug: string
    category: string
    productCount: number
    color: string
}

export function StoreCard({ store }: { store: StoreCardData }) {
    const defaultColor = "from-emerald-400 to-green-600"
    const bgClass = store.color || defaultColor

    return (
        <Link
            href={`/toko/${store.slug}`}
            className="group relative bg-white rounded-3xl border border-border/60 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col"
        >
            {/* Extended Color Banner */}
            <div className={`h-28 bg-linear-to-br ${bgClass} relative overflow-hidden`}>
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl transform transition-transform duration-700 group-hover:scale-150 group-hover:translate-x-4" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl transform transition-transform duration-700 group-hover:scale-150 group-hover:-translate-x-4" />
                
                {/* Quick Category Badge Floating */}
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-white/95 backdrop-blur-md shadow-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-foreground/80 transition-transform duration-500 group-hover:-translate-y-0.5">
                        {store.category}
                    </span>
                </div>
            </div>

            {/* Floating Top Elements */}
            <div className="absolute top-16 left-6 z-10 w-full flex items-end justify-between">
                {/* Prominent Avatar */}
                <div className="h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center ring-[6px] ring-white transform transition-transform duration-500 group-hover:-translate-y-1">
                    <div className={`h-full w-full rounded-xl bg-linear-to-br ${bgClass} flex items-center justify-center text-white font-black text-3xl shadow-inner relative overflow-hidden`}>
                        <span className="relative z-10">{store.name.charAt(0).toUpperCase()}</span>
                        <div className="absolute inset-0 bg-black/10" />
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="pt-14 px-6 pb-6 flex flex-col flex-1 relative z-0">
                <h3 className="font-extrabold text-lg text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors mt-2">
                    {store.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1 leading-relaxed">
                    Temukan produk {store.category.toLowerCase()} pilihan berkualitas dengan penawaran harga terbaik.
                </p>

                {/* Footer / Stats */}
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-border/60">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/60 px-3 py-1.5 rounded-xl border border-border/40">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-foreground font-bold">{store.productCount}</span> Produk
                    </div>

                    {/* Animated Visit Button */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary mr-1 group-hover:pr-2 transition-all duration-300">
                        <span>Kunjungi</span>
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
