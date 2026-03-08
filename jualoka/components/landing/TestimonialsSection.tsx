import { Star } from "lucide-react"
import { TESTIMONIALS } from "./data"

export default function TestimonialsSection() {
    return (
        <section id="testimoni" className="py-24 bg-[#f8fafb]">
            <div className="max-w-6xl mx-auto px-5">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                        <Star className="h-3 w-3" />
                        Testimoni
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Dipercaya UMKM Se-Indonesia</h2>
                    <p className="text-muted-foreground text-base max-w-xl mx-auto">
                        Bergabunglah bersama ribuan pemilik UMKM yang telah meningkatkan penjualan mereka.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t) => (
                        <div
                            key={t.name}
                            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
                        >
                            {/* Star rating */}
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: t.stars }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-sm text-foreground/80 leading-relaxed mb-6 italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
