import { LayoutDashboard } from "lucide-react"
import { STEPS } from "./data"

export default function HowItWorksSection() {
    return (
        <section id="cara-kerja" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-5">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-secondary/20 text-amber-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                        <LayoutDashboard className="h-3 w-3" />
                        Cara Kerja
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Mulai Berjualan dalam 4 Langkah</h2>
                    <p className="text-muted-foreground text-base max-w-xl mx-auto">
                        Tidak perlu teknis. Ikuti langkah-langkah sederhana ini dan toko Anda siap melayani pelanggan.
                    </p>
                </div>

                {/* Steps grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Connector line (desktop only) */}
                    <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden lg:block" />

                    {STEPS.map((step, i) => (
                        <div key={step.num} className="relative flex flex-col items-center text-center">
                            <div
                                className={`relative z-10 h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-black mb-5 shadow-lg ${i % 2 === 0
                                        ? "bg-primary text-white shadow-primary/30"
                                        : "bg-secondary text-foreground shadow-secondary/30"
                                    }`}
                            >
                                {step.num}
                            </div>
                            <h3 className="font-bold text-base mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
