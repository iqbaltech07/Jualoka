"use client"

import { useState, useTransition } from "react"
import { Star, Eye, RotateCcw, Save, ImageIcon, Type, Palette, Layout, Info, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
// Helpers
// ---------------------------------------------------------------------------

function getBannerGradient(config: BannerConfig): string {
    if (config.theme === "custom") return config.customGradient
    return THEME_GRADIENTS[config.theme]
}

// ---------------------------------------------------------------------------
// Banner Live Preview
// ---------------------------------------------------------------------------

function BannerPreview({ config }: { config: BannerConfig }) {
    const gradientClass = getBannerGradient(config)
    const titleLines = config.title.split("\n")

    return (
        <div
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradientClass} p-6 sm:p-10 text-white shadow-lg min-h-[160px] flex items-center ${config.layout === "center" ? "justify-center text-center" : "justify-start text-left"}`}
        >
            {/* Background image overlay */}
            {config.imageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${config.imageUrl}')`,
                        opacity: config.imageOpacity / 100,
                    }}
                />
            )}

            {/* Content */}
            <div className={`relative z-10 ${config.layout === "center" ? "max-w-lg" : "max-w-xl"}`}>
                {config.badge && (
                    <div className="inline-flex items-center gap-2 bg-[#fac023] text-[#1a1a1a] text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <Star className="h-3 w-3 fill-current" />
                        {config.badge}
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-2">
                    {titleLines.map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < titleLines.length - 1 && <br />}
                        </span>
                    ))}
                </h1>
                {config.description && (
                    <p className="text-white/80 text-sm">{config.description}</p>
                )}
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Theme Picker
// ---------------------------------------------------------------------------

const THEMES: BannerTheme[] = ["green", "blue", "purple", "orange", "red", "custom"]

function ThemePicker({
    value,
    onChange,
}: {
    value: BannerTheme
    onChange: (t: BannerTheme) => void
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
                <button
                    key={theme}
                    type="button"
                    title={THEME_LABELS[theme]}
                    onClick={() => onChange(theme)}
                    className={`relative h-9 w-9 rounded-xl transition-all duration-200 ring-offset-2 ${value === theme ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                        }`}
                    style={{
                        background:
                            theme === "custom"
                                ? "linear-gradient(135deg, #888, #bbb)"
                                : `linear-gradient(135deg, ${THEME_COLORS[theme]}, ${THEME_COLORS[theme]}99)`,
                    }}
                >
                    {theme === "custom" && (
                        <span className="text-[8px] text-white font-bold leading-none">
                            ✎
                        </span>
                    )}
                    {value === theme && (
                        <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                    )}
                </button>
            ))}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    children: React.ReactNode
}) {
    return (
        <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 flex flex-col gap-4">{children}</CardContent>
        </Card>
    )
}

// ---------------------------------------------------------------------------
// Field helper
// ---------------------------------------------------------------------------

function Field({
    label,
    hint,
    children,
}: {
    label: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
    )
}

const INPUT = "w-full rounded-xl border border-border bg-[#f8fafb] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminBannerPage() {
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
        <div className="flex flex-col gap-6">
            {/* ------------------------------------------------------------------ */}
            {/* Header                                                              */}
            {/* ------------------------------------------------------------------ */}
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
                        onClick={handleReset}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-4 py-2 transition-all hover:shadow-sm"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
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

            {/* ------------------------------------------------------------------ */}
            {/* Status toggle                                                       */}
            {/* ------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------ */}
            {/* Live Preview                                                         */}
            {/* ------------------------------------------------------------------ */}
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

            {/* ------------------------------------------------------------------ */}
            {/* Editor grid                                                         */}
            {/* ------------------------------------------------------------------ */}
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
                            placeholder="Produk Segar & Lezat&#10;Langsung dari Dapur Kami"
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
                                {(["left", "center"] as BannerLayout[]).map((l) => (
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
                    halaman toko Anda. Fungsi simpan sementara masih bersifat{" "}
                    <em>dummy (in-memory)</em> — pada versi produksi akan tersambung ke database.
                </div>
            </div>

            <Toast visible={toast} message="Banner berhasil disimpan! ✨" />
        </div>
    )
}
