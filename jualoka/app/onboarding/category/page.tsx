"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check } from "lucide-react"
import { STORE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, type StoreCategory } from "@/lib/categories"

const STEPS = [
    { label: "Pilih Kategori" },
    { label: "Pengaturan Toko" },
]

const CATEGORY_DESCRIPTIONS: Record<StoreCategory, string> = {
    "Makanan & Minuman": "Kuliner, snack, katering, minuman",
    "Fashion & Pakaian": "Baju, celana, tas, sepatu, aksesori",
    "Kecantikan & Kesehatan": "Skincare, kosmetik, suplemen, nutrisi",
    "Kerajinan & Seni": "Karya tangan, hiasan dinding, dekorasi",
    "Elektronik & Gadget": "Aksesoris HP, komputer, alat listrik",
    "Jasa & Layanan": "Servis mesin, les privat, laundry",
    "Lainnya": "Produk atau layanan lainnya",
}

export default function OnboardingCategoryPage() {
    const router = useRouter()
    const [selected, setSelected] = useState<StoreCategory | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function handleContinue() {
        if (!selected) return
        
        setIsLoading(true)
        try {
            const res = await fetch("/api/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: selected })
            })
            
            if (res.ok) {
                router.push("/admin/settings")
            } else {
                console.error("Failed to update category", await res.text())
            }
        } catch (error) {
            console.error("API error", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl">
            {/* Step Indicator */}
            <div className="flex items-center gap-0 mb-8 w-full">
                {STEPS.map((step, i) => {
                    const stepNum = i + 1
                    const isActive = stepNum === 1
                    const isDone = stepNum < 1
                    return (
                        <div key={i} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${isActive ? "bg-primary border-primary text-white shadow-md shadow-primary/30" : isDone ? "bg-primary/20 border-primary/40 text-primary" : "bg-white border-border text-muted-foreground"}`}>
                                    {isDone ? <Check className="h-4 w-4" /> : stepNum}
                                </div>
                                <span className={`text-xs font-medium whitespace-nowrap hidden sm:block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className="flex-1 h-0.5 mx-2 rounded-full bg-border mb-5 sm:mb-6" />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Langkah 1 dari 2</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Apa kategori toko Anda?</h1>
                <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                    Pilih kategori yang paling sesuai dengan produk yang akan Anda jual.
                </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                {STORE_CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat]
                    const isActive = selected === cat
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelected(cat)}
                            aria-pressed={isActive ? "true" : "false"}
                            className={`relative group rounded-2xl border-2 p-4 sm:p-5 text-left flex flex-col gap-3 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive
                                ? "border-primary bg-primary/8 shadow-md shadow-primary/15"
                                : "border-border bg-white hover:border-primary/40 hover:shadow-sm hover:bg-muted/30"
                                }`}
                        >
                            {/* Check badge */}
                            {isActive && (
                                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${CATEGORY_COLORS[cat]} transition-transform duration-200 group-hover:scale-105 ${isActive ? "scale-105" : ""}`}>
                                <Icon className="h-6 w-6 text-white" />
                            </div>

                            {/* Label */}
                            <div>
                                <p className={`text-sm font-bold leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>
                                    {cat}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                    {CATEGORY_DESCRIPTIONS[cat]}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleContinue}
                    disabled={!selected || isLoading}
                    className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2.5 hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:hover:shadow-sm"
                >
                    {isLoading ? (
                        <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            Lanjutkan
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Selected hint */}
            {selected && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                    Dipilih: <span className="font-semibold text-primary">{selected}</span>
                </p>
            )}
            {!selected && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                    Pilih salah satu kategori di atas untuk melanjutkan
                </p>
            )}
        </div>
    )
}
