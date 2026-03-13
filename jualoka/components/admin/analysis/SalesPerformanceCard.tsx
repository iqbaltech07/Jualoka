"use client"

import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"

interface SalesPerformanceCardProps {
    volume: number
    topProducts: any[]
}

export function SalesPerformanceCard({ volume, topProducts }: SalesPerformanceCardProps) {
    return (
        <Card className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden flex-1">
            <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3.5 border-b border-emerald-100">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-bold text-emerald-900">Sales Performance</CardTitle>
            </div>
            <CardContent className="p-5 space-y-3">
                <div>
                    <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wide">Volume Terjual</p>
                    <p className="text-2xl font-black text-zinc-900 mt-0.5">
                        {volume}
                        <span className="text-sm font-semibold text-zinc-400 ml-1">pcs</span>
                    </p>
                </div>
                <div className="border-t border-zinc-100 pt-3">
                    <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wide mb-2.5">Top 3 Produk</p>
                    <div className="space-y-2">
                        {topProducts.slice(0, 3).map((p: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="h-5 w-5 rounded-md bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 shrink-0">{i + 1}</span>
                                <span className="flex-1 font-semibold text-zinc-700 truncate text-xs">{p.name}</span>
                                <span className="text-xs text-zinc-400 shrink-0">{p.sold}×</span>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <p className="text-xs text-zinc-400 italic">Belum ada penjualan.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
