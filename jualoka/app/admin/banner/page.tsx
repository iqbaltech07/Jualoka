"use client"

import { useState, useEffect } from "react"
import { Eye, Save, Type, Palette, Layout, ImageIcon, Info } from "lucide-react"
import {
    BannerConfig,
    BannerLayout as BannerLayoutType,
} from "@/lib/bannerStore"
import { BannerPreview } from "@/components/admin/shared/BannerPreview"
import { ThemePicker } from "@/components/admin/shared/ThemePicker"
import { Toast } from "@/components/admin/shared/Toast"
import { Section } from "@/components/admin/shared/Section"
import { Field, INPUT } from "@/components/admin/shared/Field"

export default function AdminBannerPage() {
    const [config, setConfig] = useState<BannerConfig>({
        enabled: true, badge: "Produk UMKM Pilihan", title: "Selamat Datang di Toko Kami\nMenjual Produk Berkualitas", description: "Temukan berbagai macam produk unggulan dengan harga terbaik. Selamat berbelanja!", theme: "green", customGradient: "", layout: "left", imageUrl: "", imageOpacity: 25
    })
    const [showPreview, setShowPreview] = useState(true)
    const [toast, setToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("Banner berhasil disimpan! ✨")
    const [isLoading, setIsLoading] = useState(true)

    // Load store banner configuration on mount from DB
    useEffect(() => {
        async function loadConfig() {
            try {
                const res = await fetch("/api/stores", { credentials: "include" })
                if (res.ok) {
                    const data = await res.json()
                    if (data.store) {
                        const s = data.store
                        setConfig({
                            enabled: s.bannerEnabled,
                            badge: s.bannerBadge ?? "",
                            title: s.bannerTitle ?? "",
                            description: s.bannerDesc ?? "",
                            theme: s.bannerTheme,
                            customGradient: s.bannerGradient ?? "",
                            layout: s.bannerLayout as BannerLayoutType,
                            imageUrl: s.bannerImageUrl ?? "",
                            imageOpacity: s.bannerOpacity ?? 10,
                        })
                    }
                }
            } catch (error) {
                console.error("Failed to load banner configuration", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadConfig()
    }, [])

    function patch<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) {
        setConfig((prev) => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        try {
             const res = await fetch("/api/stores/banner", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 credentials: "include",
                 body: JSON.stringify({
                      bannerEnabled: config.enabled,
                      bannerBadge: config.badge,
                      bannerTitle: config.title,
                      bannerDesc: config.description,
                      bannerTheme: config.theme,
                      bannerGradient: config.customGradient,
                      bannerImageUrl: config.imageUrl,
                      bannerLayout: config.layout,
                      bannerOpacity: config.imageOpacity
                 })
             })

             if (res.ok) {
                 setToastMessage("Banner berhasil disimpan! ✨")
             } else {
                 const data = await res.json()
                 setToastMessage(data.message || "Gagal menyimpan banner.")
             }
             setToast(true)
             setTimeout(() => setToast(false), 2800)
        } catch (error) {
             console.error("Save Banner Error:", error)
             setToastMessage("Terjadi kesalahan koneksi.")
             setToast(true)
             setTimeout(() => setToast(false), 2800)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kustomisasi Banner</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Atur tampilan banner di halaman toko Anda.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreview((p) => !p)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-4 py-2 transition-all hover:shadow-sm"
                    >
                        <Eye className="h-4 w-4" />
                        {showPreview ? "Sembunyikan" : "Tampilkan"} Preview
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl px-5 py-2 shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <Save className="h-4 w-4" />
                        Simpan
                    </button>
                </div>
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-border/60 shadow-sm px-5 py-4">
                <div>
                    <p className="text-sm font-semibold">Tampilkan Banner</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Aktifkan atau sembunyikan banner di halaman toko.
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={config.enabled}
                    onClick={() => patch("enabled", !config.enabled)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${config.enabled ? "bg-primary" : "bg-muted"}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 mt-0.5 ${config.enabled ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                </button>
            </div>

            {/* Live Preview */}
            {showPreview && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Eye className="h-3 w-3" />
                        Preview Langsung
                    </p>
                    {config.enabled ? (
                        <BannerPreview config={config} />
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center min-h-[120px] text-muted-foreground text-sm">
                            Banner dinonaktifkan — tidak akan tampil di toko.
                        </div>
                    )}
                </div>
            )}

            {/* Editor grid */}
            <div className="grid lg:grid-cols-2 gap-5">
                {/* Content */}
                <Section icon={Type} title="Konten Banner">
                    <Field
                        label="Teks Badge (opsional)"
                        hint="Tampil sebagai label kecil di atas judul"
                    >
                        <input
                            type="text"
                            className={INPUT}
                            placeholder="Contoh: Produk UMKM Pilihan"
                            value={config.badge}
                            onChange={(e) => patch("badge", e.target.value)}
                            maxLength={40}
                        />
                    </Field>

                    <Field
                        label="Judul Utama"
                        hint="Gunakan Enter (baris baru) untuk membuat teks multi-baris"
                    >
                        <textarea
                            className={INPUT + " min-h-[80px] resize-none"}
                            placeholder={"Produk Segar & Lezat\nLangsung dari Dapur Kami"}
                            value={config.title}
                            onChange={(e) => patch("title", e.target.value)}
                            maxLength={120}
                            rows={3}
                        />
                    </Field>

                    <Field label="Deskripsi" hint="Kalimat pendek di bawah judul (opsional)">
                        <textarea
                            className={INPUT + " min-h-[60px] resize-none"}
                            placeholder="Tulis pesan singkat untuk pengunjung toko Anda..."
                            value={config.description}
                            onChange={(e) => patch("description", e.target.value)}
                            maxLength={180}
                            rows={2}
                        />
                    </Field>
                </Section>

                {/* Design */}
                <div className="flex flex-col gap-5">
                    <Section icon={Palette} title="Tema Warna">
                        <Field label="Pilih Tema">
                            <ThemePicker
                                value={config.theme}
                                onChange={(t) => patch("theme", t)}
                            />
                        </Field>

                        {config.theme === "custom" && (
                            <Field
                                label="Kelas Gradient (Tailwind)"
                                hint='Contoh: from-[#c2185b] to-[#e91e63]'
                            >
                                <input
                                    type="text"
                                    className={INPUT}
                                    placeholder="from-[#1a7035] to-[#2ea855]"
                                    value={config.customGradient}
                                    onChange={(e) =>
                                        patch("customGradient", e.target.value)
                                    }
                                />
                            </Field>
                        )}
                    </Section>

                    <Section icon={Layout} title="Tata Letak">
                        <Field label="Posisi Teks">
                            <div className="flex gap-2">
                                {(["left", "center"] as BannerLayoutType[]).map((l) => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => patch("layout", l)}
                                        className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${config.layout === l
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-white text-muted-foreground hover:text-foreground hover:border-primary/40"
                                            }`}
                                    >
                                        {l === "left" ? "⬅ Kiri" : "⬛ Tengah"}
                                    </button>
                                ))}
                            </div>
                        </Field>
                    </Section>
                </div>
            </div>

            {/* Image settings */}
            <Section icon={ImageIcon} title="Gambar Latar (Opsional)">
                <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                        label="URL Gambar"
                        hint="Tempel URL gambar dari internet. Biarkan kosong jika tidak ingin menggunakan gambar."
                    >
                        <div className="flex gap-2">
                            <input
                                type="url"
                                className={INPUT}
                                placeholder="https://images.unsplash.com/..."
                                value={config.imageUrl}
                                onChange={(e) => patch("imageUrl", e.target.value)}
                            />
                            {config.imageUrl && (
                                <button
                                    type="button"
                                    onClick={() => patch("imageUrl", "")}
                                    className="shrink-0 rounded-xl border border-border bg-white px-3 text-xs text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors"
                                >
                                    Hapus
                                </button>
                            )}
                        </div>
                    </Field>

                    <Field
                        label={`Transparansi Gambar: ${config.imageOpacity}%`}
                        hint="0% = gambar tidak terlihat, 100% = gambar penuh"
                    >
                        <input
                            type="range"
                            min={0}
                            max={60}
                            step={5}
                            value={config.imageOpacity}
                            onChange={(e) =>
                                patch("imageOpacity", Number(e.target.value))
                            }
                            className="w-full accent-primary h-2 mt-1"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Transparan</span>
                            <span>Kuat</span>
                        </div>
                    </Field>
                </div>
            </Section>

            {/* Info card */}
            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-blue-700">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="text-xs leading-relaxed">
                    <strong>Catatan:</strong> Perubahan yang sudah disimpan akan langsung tampil di
                    halaman toko Anda.
                </div>
            </div>

            <Toast visible={toast} message={toastMessage} />
        </div>
    )
}
