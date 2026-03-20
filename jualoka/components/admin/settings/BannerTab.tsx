"use client"

import { useState, startTransition, useEffect } from "react"
import { Eye, RotateCcw, Save, Type, Palette, Layout, ImageIcon, Info } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BannerConfig,
    BannerLayout as BannerLayoutType,
} from "@/lib/bannerStore"
import { BannerPreview } from "@/components/admin/shared/BannerPreview"
import { ThemePicker } from "@/components/admin/shared/ThemePicker"

const INPUT = "w-full rounded-xl border border-border bg-[#f8fafb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"

export function BannerTab() {
    const [config, setConfig] = useState<BannerConfig>({
        enabled: true,
        badge: "Toko Online Resmi",
        title: "Temukan Produk Terbaik\nKualitas Terjamin",
        description: "Selamat datang di toko kami! Pesan sekarang dengan mudah dan aman langsung via WhatsApp.",
        theme: "blue",
        customGradient: "from-[#1d4ed8] to-[#3b82f6]",
        imageUrl: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1000&auto=format&fit=crop",
        layout: "left",
        imageOpacity: 10,
    })
    const [showPreview, setShowPreview] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")

    useEffect(() => {
        async function fetchBanner() {
            try {
                const res = await fetch("/api/stores", { credentials: "include" })
                if (res.ok) {
                    const data = await res.json()
                    if (data.store) {
                        const dbConfig = {
                            enabled: data.store.bannerEnabled,
                            badge: data.store.bannerBadge || "",
                            title: data.store.bannerTitle || "",
                            description: data.store.bannerDesc || "",
                            theme: data.store.bannerTheme,
                            customGradient: data.store.bannerGradient || "",
                            imageUrl: data.store.bannerImageUrl || "",
                            layout: data.store.bannerLayout as any,
                            imageOpacity: data.store.bannerOpacity,
                        }
                        setConfig(dbConfig)
                        setPreviewUrl(dbConfig.imageUrl)
                    }
                }
            } catch (error) {
                console.error("Failed to load banner config", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBanner()
    }, [])

    function patch<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) {
        setConfig((prev) => ({ ...prev, [key]: value }))
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Hanya file gambar yang diperbolehkan.")
                return
            }
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            patch("imageUrl", URL.createObjectURL(file)) // Temporary for live preview
        }
    }

    function handleRemoveImage() {
        setImageFile(null)
        setPreviewUrl("")
        patch("imageUrl", "")
    }

    async function handleSave() {
        setIsSaving(true)
        try {
            let finalImageUrl = config.imageUrl

            // If it's a temp blob url, it means a new file was selected
            if (imageFile) {
                const formData = new FormData()
                formData.append("file", imageFile)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                })

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json()
                    finalImageUrl = uploadData.url
                    patch("imageUrl", finalImageUrl) 
                } else {
                    const err = await uploadRes.json()
                    toast.error(err.message || "Gagal mengunggah foto.")
                    setIsSaving(false)
                    return
                }
            }

            const payload = {
                bannerEnabled: config.enabled,
                bannerBadge: config.badge,
                bannerTitle: config.title,
                bannerDesc: config.description,
                bannerTheme: config.theme,
                bannerGradient: config.customGradient,
                bannerImageUrl: finalImageUrl,
                bannerLayout: config.layout,
                bannerOpacity: config.imageOpacity,
            }
            const res = await fetch("/api/stores/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success("Banner berhasil disimpan! ✨")
                // Clear the file since we now have the permanent URL
                setImageFile(null) 
                setPreviewUrl(finalImageUrl)
            } else {
                toast.error("Gagal menyimpan banner")
            }
        } catch (error) {
            console.error("Save banner error", error)
            toast.error("Terjadi kesalahan koneksi.")
        } finally {
            setIsSaving(false)
        }
    }

    function handleReset() {
        startTransition(() => {
            const defaultBanner: BannerConfig = {
                enabled: true,
                badge: "Toko Online Resmi",
                title: "Temukan Produk Terbaik\nKualitas Terjamin",
                description: "Selamat datang di toko kami! Pesan sekarang dengan mudah dan aman langsung via WhatsApp.",
                theme: "blue",
                customGradient: "from-[#1d4ed8] to-[#3b82f6]",
                imageUrl: "",
                layout: "left",
                imageOpacity: 10,
            }
            setConfig(defaultBanner)
            setImageFile(null)
            setPreviewUrl("")
        })
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-muted-foreground text-sm">Atur tampilan banner di halaman toko Anda.</p>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setShowPreview((p) => !p)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-3 py-2 transition-all hover:shadow-sm shrink-0 whitespace-nowrap"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        {showPreview ? "Sembunyikan" : "Tampilkan"} Preview
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-3 py-2 transition-all hover:shadow-sm shrink-0 whitespace-nowrap"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-70 shrink-0 whitespace-nowrap"
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-border/60 shadow-sm px-5 py-4">
                <div>
                    <p className="text-sm font-semibold">Tampilkan Banner</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Aktifkan atau sembunyikan banner di halaman toko.</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={config.enabled}
                    onClick={() => patch("enabled", !config.enabled)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-300 ${config.enabled ? "bg-primary" : "bg-muted"}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 mt-0.5 ${config.enabled ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                </button>
            </div>

            {/* Preview */}
            {showPreview && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Eye className="h-3 w-3" /> Preview Langsung
                    </p>
                    {config.enabled ? (
                        <div className="pointer-events-none">
                            <BannerPreview config={config} />
                        </div>
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center min-h-[100px] text-muted-foreground text-sm">
                            Banner dinonaktifkan.
                        </div>
                    )}
                </div>
            )}

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-4" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
                {/* Content */}
                <Card className="border-0 shadow-sm bg-white">
                    <CardHeader className="px-4 sm:px-5 pt-5 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Type className="h-4 w-4 text-primary" /> Konten Banner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-5 pb-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/80">Teks Badge (opsional)</label>
                            <input type="text" className={INPUT} placeholder="Toko Online Resmi" value={config.badge} onChange={(e) => patch("badge", e.target.value)} maxLength={40} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/80">Judul Utama</label>
                            <textarea className={INPUT + " min-h-[80px] resize-none"} value={config.title} onChange={(e) => patch("title", e.target.value)} maxLength={120} rows={3} />
                            <p className="text-[11px] text-muted-foreground">Gunakan Enter untuk teks multi-baris</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/80">Deskripsi</label>
                            <textarea className={INPUT + " min-h-[60px] resize-none"} value={config.description} onChange={(e) => patch("description", e.target.value)} maxLength={180} rows={2} />
                        </div>
                    </CardContent>
                </Card>

                {/* Design */}
                <div className="flex flex-col gap-4">
                    <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="px-4 sm:px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Palette className="h-4 w-4 text-primary" /> Tema Warna
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-5 pb-5 flex flex-col gap-3">
                            <ThemePicker value={config.theme} onChange={(t) => patch("theme", t)} />
                            {config.theme === "custom" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground/80">Warna Gradasi (Awal & Akhir)</label>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex bg-[#f8fafb] border border-border rounded-xl overflow-hidden h-[42px] focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                                                <input
                                                    type="color"
                                                    className="w-12 h-full cursor-pointer p-0 border-none rounded-none bg-transparent block"
                                                    value={
                                                        config.customGradient.match(/from-\[([^\]]+)\]/)?.[1] || "#1d4ed8"
                                                    }
                                                    onChange={(e) => {
                                                        const startColor = e.target.value;
                                                        const currentEnd = config.customGradient.match(/to-\[([^\]]+)\]/)?.[1] || "#3b82f6";
                                                        patch("customGradient", `from-[${startColor}] to-[${currentEnd}]`);
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 h-full px-3 text-sm outline-none bg-transparent font-mono uppercase"
                                                    value={
                                                        config.customGradient.match(/from-\[([^\]]+)\]/)?.[1] || "#1D4ED8"
                                                    }
                                                    onChange={(e) => {
                                                        const startColor = e.target.value;
                                                        const currentEnd = config.customGradient.match(/to-\[([^\]]+)\]/)?.[1] || "#3b82f6";
                                                        patch("customGradient", `from-[${startColor}] to-[${currentEnd}]`);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex bg-[#f8fafb] border border-border rounded-xl overflow-hidden h-[42px] focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                                                <input
                                                    type="color"
                                                    className="w-12 h-full cursor-pointer p-0 border-none rounded-none bg-transparent block"
                                                    value={
                                                        config.customGradient.match(/to-\[([^\]]+)\]/)?.[1] || "#3b82f6"
                                                    }
                                                    onChange={(e) => {
                                                        const currentStart = config.customGradient.match(/from-\[([^\]]+)\]/)?.[1] || "#1d4ed8";
                                                        const endColor = e.target.value;
                                                        patch("customGradient", `from-[${currentStart}] to-[${endColor}]`);
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    className="flex-1 h-full px-3 text-sm outline-none bg-transparent font-mono uppercase"
                                                    value={
                                                        config.customGradient.match(/to-\[([^\]]+)\]/)?.[1] || "#3B82F6"
                                                    }
                                                    onChange={(e) => {
                                                        const currentStart = config.customGradient.match(/from-\[([^\]]+)\]/)?.[1] || "#1d4ed8";
                                                        const endColor = e.target.value;
                                                        patch("customGradient", `from-[${currentStart}] to-[${endColor}]`);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="px-4 sm:px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Layout className="h-4 w-4 text-primary" /> Tata Letak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-5 pb-5">
                            <div className="flex gap-2">
                                {(["left", "center"] as BannerLayoutType[]).map((l) => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => patch("layout", l)}
                                        className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${config.layout === l ? "border-primary bg-primary/10 text-primary" : "border-border bg-white text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                                    >
                                        {l === "left" ? "⬅ Kiri" : "⬛ Tengah"}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Image Upload */}
            <Card className="border-0 shadow-sm bg-white" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}>
                <CardHeader className="px-4 sm:px-5 pt-5 pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Gambar Latar (Opsional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-5 pb-5">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-foreground/80">Pilih Foto Banner</label>
                            
                            <label className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group relative overflow-hidden h-28 flex flex-col items-center justify-center bg-muted/20">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                />
                                {previewUrl ? (
                                    <>
                                        <ImageIcon className="h-5 w-5 text-primary mb-1" />
                                        <p className="text-xs font-medium text-primary">Ganti Foto Latar</p>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1.5 group-hover:text-primary transition-colors" />
                                        <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Klik untuk upload</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Disarankan 16:9 (Landscape)</p>
                                    </>
                                )}
                            </label>
                            {previewUrl && (
                                <button type="button" onClick={handleRemoveImage} className="text-xs text-red-500 font-medium hover:underline self-start mt-1">
                                    Hapus Gambar Latar
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5 justify-center">
                            <label className="text-xs font-semibold text-foreground/80">Transparansi Efek Latar: {config.imageOpacity}%</label>
                            <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">
                                Atur seberapa transparan overlay gelap pada gambar. Semakin besar, gambar makin terlihat jelas (tapi teks mungkin sulit dibaca).
                            </p>
                            <input 
                                type="range" 
                                min={0} 
                                max={50} 
                                step={5} 
                                value={config.imageOpacity} 
                                onChange={(e) => patch("imageOpacity", Number(e.target.value))} 
                                className="w-full accent-primary h-2 mt-1" 
                                disabled={!previewUrl}
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                                <span>Teks Jelas</span><span>Gambar Jelas</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
