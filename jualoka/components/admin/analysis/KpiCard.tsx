"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    label: string
    value: string
    sub: string
    trend: "up" | "down" | "neutral"
    icon: LucideIcon
    gradient: string
    textColor: string
}

export function KpiCard({ label, value, sub, trend, icon: Icon, gradient, textColor }: KpiCardProps) {
    return (
        <Card className="border border-zinc-100 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-linear-to-br", gradient, "shadow-md")}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                {trend !== "neutral" && (
                    <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", trend === "up" ? "bg-emerald-50" : "bg-rose-50")}>
                        {trend === "up"
                            ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                            : <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                        }
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wide">{label}</p>
                <p className="text-xl font-black text-zinc-900 mt-0.5 leading-tight">{value}</p>
                <p className={cn("text-[11px] font-semibold mt-1", textColor)}>{sub}</p>
            </div>
        </Card>
    )
}
