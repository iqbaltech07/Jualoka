import Link from "next/link"
import {
    Star,
    Shield,
    TrendingUp,
    MessageCircle,
    ArrowRight,
    ChevronRight,
    CheckCircle2,
} from "lucide-react"

const SOCIAL_PROOF = [
    "Gratis tanpa kartu kredit",
    "Siap dalam 5 menit",
    "Tidak perlu skill teknis",
]

const MOCK_STATS = [
    { label: "Total Produk", val: "12", color: "bg-blue-50" },
    { label: "Total Pesanan", val: "48", color: "bg-green-50" },
    { label: "Produk Laris", val: "3", color: "bg-amber-50" },
    { label: "Perlu Perhatian", val: "1", color: "bg-red-50" },
]

const MOCK_SIDEBAR_ITEMS = ["Dashboard", "Produk", "Pesanan", "Pengaturan"]
const CHART_BARS = [60, 80, 45, 90, 70, 85, 55, 95, 65, 75]

export default function HeroSection() {
    return (
        <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/8 blur-3xl pointer-events-none" />
            <div className="absolute top-20 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

            {/* Text content */}
            <div className="relative max-w-6xl mx-auto px-5 text-center z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-secondary/20 text-amber-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6 border border-secondary/30">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Platform #1 untuk UMKM Indonesia
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-balance">
                    Jual Lebih Banyak,
                    <br />
                    <span className="relative inline-block">
                        <span className="relative z-10 text-primary">Produksi Lebih Cerdas</span>
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 9C50 3 100 1 150 3C200 5 250 3 298 9" stroke="#fac023" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    Buat toko online, terima pesanan via WhatsApp, dan ketahui produk mana yang benar-benar laku —
                    semuanya dalam satu platform yang mudah digunakan untuk UMKM.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                    <Link
                        href="/auth/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-95 text-base"
                    >
                        Buat Toko Sekarang
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/toko/toko-berkah"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-foreground font-semibold px-7 py-3.5 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-base shadow-sm"
                    >
                        Lihat Contoh Toko
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </div>

                {/* Social proof */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                    {SOCIAL_PROOF.map((item) => (
                        <div key={item} className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dashboard preview mockup */}
            <div className="relative z-10 max-w-5xl mx-auto px-5 mt-16">
                <div className="relative rounded-3xl overflow-hidden border border-border/60 shadow-2xl shadow-black/10">
                    {/* Browser chrome */}
                    <div className="bg-[#f0f0f0] px-4 py-3 flex items-center gap-2 border-b border-border/40">
                        <div className="h-3 w-3 rounded-full bg-red-400" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                        <div className="h-3 w-3 rounded-full bg-green-400" />
                        <div className="mx-auto flex items-center gap-2 bg-white rounded-lg px-4 py-1 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3 text-primary" />
                            jualoka.com/toko/toko-saya
                        </div>
                    </div>

                    {/* Dashboard body */}
                    <div className="bg-[#f8fafb] p-5 sm:p-8 min-h-[280px] sm:min-h-[360px]">
                        <div className="flex gap-6">
                            {/* Mini sidebar */}
                            <div className="hidden sm:flex flex-col gap-2 w-44 shrink-0">
                                <div className="h-9 w-32 bg-primary/10 rounded-xl mb-4" />
                                {MOCK_SIDEBAR_ITEMS.map((item, i) => (
                                    <div
                                        key={item}
                                        className={`h-9 rounded-xl flex items-center px-3 gap-2 ${i === 0 ? "bg-primary" : "bg-white border border-border/50"}`}
                                    >
                                        <div className={`h-3 w-3 rounded-full ${i === 0 ? "bg-white/40" : "bg-border"}`} />
                                        <div className={`h-2 rounded-full ${i === 0 ? "bg-white/70 w-16" : "bg-border w-12"}`} />
                                    </div>
                                ))}
                            </div>

                            {/* Content area */}
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {MOCK_STATS.map((s) => (
                                        <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-border/30`}>
                                            <div className="h-2 w-16 bg-black/10 rounded-full mb-3" />
                                            <div className="text-2xl font-extrabold text-foreground/80">{s.val}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bar chart */}
                                <div className="bg-white rounded-2xl border border-border/40 p-4 h-32 flex items-end gap-2">
                                    {CHART_BARS.map((h, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 rounded-t-lg bg-primary/20"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating stat cards */}
                <div className="absolute -right-4 top-20 hidden lg:block">
                    <div className="bg-white rounded-2xl shadow-xl border border-border/50 px-4 py-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Penjualan bulan ini</p>
                            <p className="font-bold text-sm">+42% ↑</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -left-4 bottom-20 hidden lg:block">
                    <div className="bg-white rounded-2xl shadow-xl border border-border/50 px-4 py-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Pesanan baru</p>
                            <p className="font-bold text-sm">3 via WhatsApp</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
