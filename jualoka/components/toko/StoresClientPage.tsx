"use client"

import { useState, useMemo } from "react"
import { ArrowRight } from "lucide-react"
import { type StoreCategory } from "@/lib/categories"
import { type StoreCardData, StoreCard } from "@/components/toko/StoreCard"
import { StoreHero } from "@/components/toko/StoreHero"
import { CategoryFilter } from "@/components/toko/CategoryFilter"
import { StoreCtaBanner } from "@/components/toko/StoreCtaBanner"

export function StoresClientPage({ stores }: { stores: StoreCardData[] }) {
    const [query, setQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<StoreCategory | "Semua">("Semua")

    const filtered = useMemo(() => {
        return stores.filter((store) => {
            const matchesCategory = activeCategory === "Semua" || store.category === activeCategory
            const q = query.toLowerCase()
            const matchesQuery =
                !q ||
                store.name.toLowerCase().includes(q) ||
                store.category.toLowerCase().includes(q)
            return matchesCategory && matchesQuery
        })
    }, [query, activeCategory, stores])

    return (
        <div className="min-h-screen bg-[#f8fafb]">
            {/* Hero / Search Header */}
            <StoreHero query={query} onQueryChange={setQuery} />

            {/* Category Filter */}
            <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

            <div className="max-w-6xl mx-auto px-5 py-10 space-y-12">
                {/* All / Filtered Stores */}
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
                    ) : stores.length === 0 ? (
                        /* No stores in DB yet */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 text-4xl">
                                🏪
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Belum ada toko</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                                Jadilah yang pertama membuka toko di Jualoka!
                            </p>
                        </div>
                    ) : (
                        /* Empty search result */
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

                {/* CTA — Open your own store */}
                <StoreCtaBanner />
            </div>
        </div>
    )
}
