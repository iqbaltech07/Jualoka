import Link from "next/link"
import { CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export function StoreHealth({ items, score }: { 
    items: { label: string; ok: boolean }[]
    score: number 
}) {
    return (
        <Card className="border-0 shadow-sm bg-white lg:col-span-1">
            <CardHeader className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-semibold">Kesehatan Toko</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Kelengkapan profil toko</p>
                    </div>
                    <div className="relative h-12 w-12">
                        <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-muted" />
                            <circle
                                cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                                strokeDasharray={`${(score / 100) * 94.2} 94.2`}
                                strokeLinecap="round"
                                className="stroke-emerald-500 transition-all duration-700"
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-emerald-600">
                            {score}%
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="flex flex-col gap-2.5">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            {item.ok
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                : <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                            }
                            <span className={`text-xs ${item.ok ? "text-foreground" : "text-muted-foreground"}`}>
                                {item.label}
                            </span>
                            {!item.ok && (
                                <span className="ml-auto text-[10px] font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
                                    Lengkapi
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                {score < 100 && (
                    <Link
                        href="/admin/settings"
                        className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold transition-colors"
                    >
                        Lengkapi Profil Toko <ArrowUpRight className="h-3 w-3" />
                    </Link>
                )}
            </CardContent>
        </Card>
    )
}
