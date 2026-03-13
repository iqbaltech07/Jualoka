"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueTrendCardProps {
    trendData: any[]
    periodLabel: string
    revenueGrowth: number
}

export function RevenueTrendCard({ trendData, periodLabel, revenueGrowth }: RevenueTrendCardProps) {
    return (
        <Card className="lg:col-span-2 border border-zinc-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white px-6 pt-5 pb-4 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold text-zinc-800">Tren Pendapatan</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{periodLabel} terakhir</CardDescription>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {revenueGrowth >= 0 ? "▲" : "▼"} {Math.abs(revenueGrowth)}%
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-5 bg-white">
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#218b42" stopOpacity={0.25}/>
                                    <stop offset="100%" stopColor="#218b42" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "8px 14px" }}
                                formatter={(v: any) => [`Rp ${Number(v).toLocaleString("id-ID")}`, "Pendapatan"]}
                                labelStyle={{ fontWeight: 700, color: "#18181b", paddingBottom: 4 }}
                                itemStyle={{ color: "#218b42", fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#218b42" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#218b42", strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
