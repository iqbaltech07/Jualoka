"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
    name: string
    sold: number
    status: string
}

interface ProductAnalysisDeepDiveProps {
    top: Product[]
    worst: Product[]
    periodLabel: string
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    "Laris":       { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
    "Stabil":      { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    border: "border-blue-100"   },
    "Kurang Laku": { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-100"  },
    "Tidak Layak": { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500",    border: "border-rose-100"   },
}

function ProductRow({ product, rank, isWorst = false }: { product: Product; rank: number; isWorst?: boolean }) {
    const cfg = STATUS_CONFIG[product.status] ?? { bg: "bg-zinc-50", text: "text-zinc-600", dot: "bg-zinc-400", border: "border-zinc-100" }

    return (
        <div className="bg-white border border-zinc-100 rounded-xl px-3.5 py-2.5 flex items-center gap-3 hover:border-zinc-200 hover:shadow-sm transition-all">
            <span className={cn("h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0",
                isWorst ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-500"
            )}>{rank}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-800 truncate">{product.name}</p>
                <p className="text-[10px] text-zinc-400">{product.sold} terjual</p>
            </div>
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border", cfg.bg, cfg.text, cfg.border)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                {product.status}
            </div>
        </div>
    )
}

export function ProductAnalysisDeepDive({ top, worst, periodLabel }: ProductAnalysisDeepDiveProps) {
    return (
        <Card className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white px-6 pt-5 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-zinc-900">Analisis Performa Produk</CardTitle>
                        <CardDescription className="text-xs">Berdasarkan kuantitas terjual dalam {periodLabel} terakhir</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Best */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-100">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600">Top Performer</h3>
                        </div>
                        <div className="space-y-2">
                            {top.filter((p: any) => p.sold > 0).length === 0 ? (
                                <p className="text-xs text-zinc-400 italic py-4 text-center">Belum ada data penjualan di periode ini.</p>
                            ) : top.filter((p: any) => p.sold > 0).map((p: any, i: number) => (
                                <ProductRow key={i} product={p} rank={i + 1} />
                            ))}
                        </div>
                    </div>
                    {/* Worst */}
                    <div className="p-6 bg-zinc-50/50">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="h-4 w-4 text-rose-500 shrink-0" />
                            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Butuh Perhatian</h3>
                        </div>
                        <div className="space-y-2">
                            {worst.length === 0 ? (
                                <p className="text-xs text-zinc-400 italic py-4 text-center">Tidak ada data produk.</p>
                            ) : worst.map((p: any, i: number) => (
                                <ProductRow key={i} product={p} rank={worst.length - i} isWorst />
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
