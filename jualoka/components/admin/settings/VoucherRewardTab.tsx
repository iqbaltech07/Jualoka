"use client"

import { useState, useEffect } from "react"
import { Gift, Sparkles, ShieldCheck, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
        case "S": return "bg-purple-600"
        case "A": return "bg-amber-500"
        case "B": return "bg-slate-400"
        case "C": return "bg-orange-700"
        default: return "bg-primary"
    }
}

export function VoucherRewardTab() {
    const [gamificationEnabled, setGamificationEnabled] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/stores")
                if (res.ok) {
                    const data = await res.json()
                    setGamificationEnabled(data.store.gamificationEnabled || false)
                }
            } catch (error) {
                console.error("Failed to fetch settings", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [])

    async function handleToggle(checked: boolean) {
        setIsSaving(true)
        try {
            const res = await fetch("/api/stores", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gamificationEnabled: checked })
            })

            if (res.ok) {
                setGamificationEnabled(checked)
                toast.success(`Mode gamifikasi ${checked ? "diaktifkan" : "dimatikan"}`)
            } else {
                toast.error("Gagal memperbarui pengaturan gamifikasi")
            }
        } catch (error) {
            console.error("Toggle error", error)
            toast.error("Terjadi kesalahan koneksi")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-48 bg-muted rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-linear-to-r from-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Gift className="h-4 w-4 text-primary" />
                                Sistem Voucher Reward (Gamification)
                            </CardTitle>
                            <CardDescription>
                                Berikan kejutan voucher kepada pelanggan setia Anda berdasarkan tingkatan (Tier) belanja.
                            </CardDescription>
                        </div>
                        <Switch
                            checked={gamificationEnabled}
                            onCheckedChange={handleToggle}
                            disabled={isSaving}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Status Card */}
                        <div className={`p-4 rounded-2xl border transition-colors ${gamificationEnabled ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-xl ${gamificationEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Mode Gamifikasi</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {gamificationEnabled 
                                            ? "Sistem akan secara otomatis memilih voucher dari Tier yang sesuai menggunakan sistem probabilitas (Weight)." 
                                            : "Voucher akan diberikan secara manual atau berdasarkan threshold shopping standar tanpa unsur probabilitas."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rules Card */}
                        <div className="p-4 rounded-2xl border border-border/50 bg-muted/10">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Aturan Keamanan</p>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 mt-1">
                                        <li>Anti-Spam: Minimal belanja Rp10.000</li>
                                        <li>Hanya 1x reward per pelanggan</li>
                                        <li>Hanya transaksi "Selesai" yang dihitung</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" />
                            Tingkatan (Tier) Reward
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { t: "S", v: "5jt+" },
                                { t: "A", v: "2jt+" },
                                { t: "B", v: "500rb+" },
                                { t: "C", v: "100rb+" },
                            ].map((tier) => (
                                <div key={tier.t} className="bg-muted/40 p-3 rounded-xl border border-border/40 text-center relative overflow-hidden">
                                    <div className={`absolute top-0 inset-x-0 h-1 ${getTierColor(tier.t)} opacity-80`} />
                                    <div className={`text-[10px] font-black mb-1 uppercase tracking-tighter ${tier.t === 'B' ? 'text-slate-500' : getTierColor(tier.t).replace('bg-', 'text-')}`}>Tier {tier.t}</div>
                                    <div className="text-sm font-black">{tier.v}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-4 italic">
                            * Pastikan Anda telah membuat voucher dengan Tier yang sesuai di menu Vouchers agar sistem dapat memberikan reward.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
