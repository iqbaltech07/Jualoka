import Link from "next/link"
import { Zap, ArrowRight, MessageCircle } from "lucide-react"

export default function CtaSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-5">
                <div className="relative bg-gradient-to-br from-primary to-[#176130] rounded-3xl overflow-hidden px-8 py-16 sm:px-16 text-center shadow-2xl shadow-primary/20">
                    {/* Decorative orbs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* Star decoration */}
                    <div className="absolute top-8 left-8 opacity-30" aria-hidden>
                        {["✦", "✦", "✦"].map((s, i) => (
                            <span key={i} className="text-white text-sm mx-1">{s}</span>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
                            <Zap className="h-3 w-3" />
                            Mulai Sekarang, Gratis
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                            Siap Tingkatkan
                            <br />
                            Penjualan UMKM Anda?
                        </h2>

                        <p className="text-white/75 text-base mb-10 max-w-lg mx-auto">
                            Bergabunglah sekarang dan mulai perjalanan berjualan online Anda dengan Jualoka.
                            Gratis, tanpa kartu kredit.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/admin"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-2xl hover:bg-white/90 transition-all shadow-lg active:scale-95 text-base"
                            >
                                Buat Toko Gratis
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/toko/toko-berkah"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/15 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/25 transition-all border border-white/20 text-base"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Lihat Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
