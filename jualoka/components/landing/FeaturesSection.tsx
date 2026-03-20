"use client"

import { Zap } from "lucide-react"
import { FEATURES } from "./data"
import { MotionWrapper } from "./MotionWrapper"

export default function FeaturesSection() {
    return (
        <section id="fitur" className="py-24 bg-[#f8fafb]">
            <div className="max-w-6xl mx-auto px-5">
                {/* Header */}
                <MotionWrapper>
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                            <Zap className="h-3 w-3" />
                            Fitur Unggulan
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Semua yang Anda Butuhkan</h2>
                        <p className="text-muted-foreground text-base max-w-xl mx-auto">
                            Dirancang khusus agar pemilik UMKM bisa fokus berjualan, bukan mengurus sistem yang rumit.
                        </p>
                    </div>
                </MotionWrapper>

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature, i) => (
                        <MotionWrapper key={feature.title} delay={i * 0.08} className="h-full">
                            <div
                                className={`bg-white rounded-2xl p-6 border ${feature.border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full`}
                            >
                                <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        </MotionWrapper>
                    ))}
                </div>
            </div>
        </section>
    )
}
