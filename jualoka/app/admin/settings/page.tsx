"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Store,
    Phone,
    Link2,
    Image,
    Star,
    Eye,
    RotateCcw,
    Save,
    ImageIcon,
    Type,
    Palette,
    Layout,
    Info,
    CheckCircle2,
} from "lucide-react"
import {
    BannerConfig,
    BannerTheme,
    BannerLayout,
    THEME_GRADIENTS,
    THEME_COLORS,
    THEME_LABELS,
    getBannerConfig,
    saveBannerConfig,
    resetBannerConfig,
} from "@/lib/bannerStore"

// ---------------------------------------------------------------------------
// Banner helpers
// ---------------------------------------------------------------------------

function getBannerGradient(config: BannerConfig): string {
    if (config.theme === "custom") return config.customGradient
    return THEME_GRADIENTS[config.theme]
}

function BannerPreview({ config }: { config: BannerConfig }) {
    const gradientClass = getBannerGradient(config)
    const titleLines = config.title.split("\n")
    return (
        <div
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradientClass} p-6 sm:p-8 text-white shadow-lg min-h-[140px] flex items-center ${config.layout === "center" ? "justify-center text-center" : "justify-start text-left"}`}
        >
            {config.imageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${config.imageUrl}')`,
                        opacity: config.imageOpacity / 100,
                    }}
                />
            )}
            <div className={`relative z-10 ${config.layout === "center" ? "max-w-lg" : "max-w-xl"}`}>
                {config.badge && (
                    <div className="inline-flex items-center gap-2 bg-[#fac023] text-[#1a1a1a] text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <Star className="h-3 w-3 fill-current" />
                        {config.badge}
                    </div>
                )}
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight mb-2">
                    {titleLines.map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < titleLines.length - 1 && <br />}
                        </span>
                    ))}
                </h2>
                {config.description && (
                    <p className="text-white/80 text-sm">{config.description}</p>
                )}
            </div>
        </div>
    )
}

const THEMES: BannerTheme[] = ["green", "blue", "purple", "orange", "red", "custom"]

function ThemePicker({ value, onChange }: { value: BannerTheme; onChange: (t: BannerTheme) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
                <button
                    key={theme}
                    type="button"
                    title={THEME_LABELS[theme]}
                    onClick={() => onChange(theme)}
                    className={`relative h-9 w-9 rounded-xl transition-all duration-200 ring-offset-2 ${value === theme ? "ring-2 ring-primary scale-110" : "hover:scale-105"}`}
                    style={{
                        background:
                            theme === "custom"
                                ? "linear-gradient(135deg, #888, #bbb)"
                                : `linear-gradient(135deg, ${THEME_COLORS[theme]}, ${THEME_COLORS[theme]}99)`,
                    }}
                >
                    {theme === "custom" && (
                        <span className="text-[8px] text-white font-bold leading-none">✎</span>
                    )}
                    {value === theme && (
                        <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                    )}
                </button>
            ))}
        </div>
    )
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-foreground text-background text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {message}
        </div>
    )
}

const INPUT = "w-full rounded-xl border border-border bg-[#f8fafb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"

// ---------------------------------------------------------------------------
// Banner Tab
// ---------------------------------------------------------------------------

function BannerTab() {
    const [config, setConfig] = useState<BannerConfig>(() => getBannerConfig())
    const [showPreview, setShowPreview] = useState(true)
    const [toast, setToast] = useState(false)
    const [, startTransition] = useTransition()

    function patch<K extends keyof BannerConfig>(key: K, value: BannerConfig[K]) {
        setConfig((prev) => ({ ...prev, [key]: value }))
    }

    function handleSave() {
        saveBannerConfig(config)
        setToast(true)
        setTimeout(() => setToast(false), 2800)
    }

    function handleReset() {
        startTransition(() => {
            resetBannerConfig()
            setConfig(getBannerConfig())
        })
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Action bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-muted-foreground text-sm">Atur tampilan banner di halaman toko Anda.</p>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreview((p) => !p)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-3 py-2 transition-all hover:shadow-sm"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        {showPreview ? "Sembunyikan" : "Tampilkan"} Preview
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-3 py-2 transition-all hover:shadow-sm"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Simpan
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
                        <BannerPreview config={config} />
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center min-h-[100px] text-muted-foreground text-sm">
                            Banner dinonaktifkan.
                        </div>
                    )}
                </div>
            )}

            {/* Editor */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Content */}
                <Card className="border-0 shadow-sm bg-white">
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Type className="h-4 w-4 text-primary" /> Konten Banner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/80">Teks Badge (opsional)</label>
                            <input type="text" className={INPUT} placeholder="Produk UMKM Pilihan" value={config.badge} onChange={(e) => patch("badge", e.target.value)} maxLength={40} />
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
                        <CardHeader className="px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Palette className="h-4 w-4 text-primary" /> Tema Warna
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 flex flex-col gap-3">
                            <ThemePicker value={config.theme} onChange={(t) => patch("theme", t)} />
                            {config.theme === "custom" && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-foreground/80">Kelas Gradient (Tailwind)</label>
                                    <input type="text" className={INPUT} placeholder="from-[#1a7035] to-[#2ea855]" value={config.customGradient} onChange={(e) => patch("customGradient", e.target.value)} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Layout className="h-4 w-4 text-primary" /> Tata Letak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="flex gap-2">
                                {(["left", "center"] as BannerLayout[]).map((l) => (
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

            {/* Image */}
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-5 pt-5 pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Gambar Latar (Opsional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/80">URL Gambar</label>
                            <div className="flex gap-2">
                                <input type="url" className={INPUT} placeholder="https://images.unsplash.com/..." value={config.imageUrl} onChange={(e) => patch("imageUrl", e.target.value)} />
                                {config.imageUrl && (
                                    <button type="button" onClick={() => patch("imageUrl", "")} className="shrink-0 rounded-xl border border-border bg-white px-3 text-xs text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors">
                                        Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground/80">Transparansi: {config.imageOpacity}%</label>
                            <input type="range" min={0} max={60} step={5} value={config.imageOpacity} onChange={(e) => patch("imageOpacity", Number(e.target.value))} className="w-full accent-primary h-2 mt-1" />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Transparan</span><span>Kuat</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-blue-700">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">
                    <strong>Catatan:</strong> Fungsi simpan masih <em>dummy (in-memory)</em> — pada versi produksi akan tersambung ke database.
                </p>
            </div>

            <Toast visible={toast} message="Banner berhasil disimpan! ✨" />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Store Info Tab
// ---------------------------------------------------------------------------

function StoreInfoTab() {
    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-6 pt-6 pb-5 border-b border-border/50">
                    <CardTitle className="text-base">Informasi Umum</CardTitle>
                    <CardDescription>Informasi ini akan tampil di halaman toko publik Anda.</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6">
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="storeName" className="flex items-center gap-2">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                Nama Toko
                            </Label>
                            <Input id="storeName" placeholder="Toko Berkah" defaultValue="Toko Berkah UMKM" className="h-11 rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug" className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                                URL Toko
                            </Label>
                            <div className="flex items-center rounded-xl border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                <span className="text-muted-foreground text-sm bg-muted px-3 h-11 flex items-center border-r border-input whitespace-nowrap shrink-0">
                                    jualoka.com/toko/
                                </span>
                                <input id="slug" className="flex-1 h-11 px-3 text-sm outline-none bg-background" placeholder="toko-berkah" defaultValue="toko-berkah" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Nomor WhatsApp
                            </Label>
                            <div className="flex items-center rounded-xl border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                <span className="text-muted-foreground text-sm bg-muted px-3 h-11 flex items-center border-r border-input">+62</span>
                                <input id="whatsapp" type="tel" className="flex-1 h-11 px-3 text-sm outline-none bg-background" placeholder="81234567890" defaultValue="81234567890" />
                            </div>
                            <p className="text-xs text-muted-foreground">Digunakan untuk menerima pesanan langsung.</p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="rounded-xl px-6">Simpan Perubahan</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-red-200 bg-red-50/30">
                <CardHeader className="px-6 pt-5 pb-4">
                    <CardTitle className="text-sm font-semibold text-red-700">Zona Berbahaya</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium">Hapus Toko</p>
                        <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <Button variant="destructive" size="sm" className="rounded-xl shrink-0">Hapus Toko</Button>
                </CardContent>
            </Card>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Tab = "info" | "banner"

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "info", label: "Informasi Toko", icon: Store },
    { id: "banner", label: "Kustomisasi Banner", icon: Image },
]

export default function StoreSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("info")

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pengaturan Toko</h1>
                <p className="text-muted-foreground text-sm mt-1">Kelola informasi, tampilan, dan profil toko Anda.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/60 rounded-2xl p-1 w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "info" ? <StoreInfoTab /> : <BannerTab />}
        </div>
    )
}
