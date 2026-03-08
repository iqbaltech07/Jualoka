"use client"

import { salesData } from "@/lib/salesData"

export function MiniBarChart() {
    const max = Math.max(...salesData.map((d) => d.revenue))
    return (
        <div className="flex items-end gap-1.5 h-20">
            {salesData.map((d, i) => {
                const h = Math.round((d.revenue / max) * 100)
                const isToday = i === salesData.length - 1
                return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end" style={{ height: "60px" }}>
                            <div
                                className={`w-full rounded-t-md transition-all duration-500 ${isToday ? "bg-primary" : "bg-primary/25 hover:bg-primary/40"}`}
                                style={{ height: `${h}%` }}
                                title={`Rp ${d.revenue.toLocaleString("id-ID")} · ${d.orders} pesanan`}
                            />
                        </div>
                        <span className={`text-[9px] font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {d.day}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export { salesData }
