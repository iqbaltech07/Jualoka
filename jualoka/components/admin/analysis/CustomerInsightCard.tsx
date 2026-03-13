"use client"

import { Card, CardTitle, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

interface CustomerInsightCardProps {
    total: number
    repeat: number
    repeatRate: number
}

export function CustomerInsightCard({ total, repeat, repeatRate }: CustomerInsightCardProps) {
    return (
        <Card className="border border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 bg-blue-50 px-5 py-3.5 border-b border-blue-100">
                <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-sm font-bold text-blue-900">Customer Insight</CardTitle>
            </div>
            <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wide">Total Pelanggan</p>
                        <p className="text-2xl font-black text-zinc-900 mt-0.5">{total}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wide">Repeat Rate</p>
                        <p className="text-2xl font-black text-blue-600 mt-0.5">{repeatRate}%</p>
                    </div>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${repeatRate}%` }} />
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug text-center">
                    {repeat} dari {total} pelanggan kembali berbelanja
                </p>
            </CardContent>
        </Card>
    )
}
