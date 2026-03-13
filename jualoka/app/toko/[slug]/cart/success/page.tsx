"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, MessageCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import React from "react"

function CheckoutSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const waUrl = searchParams.get("wa")
    const storeName = searchParams.get("store") || "toko"
    const slug = searchParams.get("slug") || ""


    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
                {/* Success Icon */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg">
                        🎉
                    </div>
                </div>

                {/* Message */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pesanan Berhasil!</h1>
                    <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                        Pesanan Anda telah diterima oleh <strong>{storeName}</strong>. Silakan lanjutkan chat ke WhatsApp penjual untuk konfirmasi pengiriman.
                    </p>
                </div>

                {/* Steps */}
                <div className="w-full bg-white rounded-2xl border border-border/60 shadow-sm p-5 text-left space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Langkah Selanjutnya</p>
                    {[
                        { icon: "1️⃣", text: "Klik tombol WhatsApp di bawah" },
                        { icon: "2️⃣", text: "Konfirmasi pesanan Anda dengan penjual" },
                        { icon: "3️⃣", text: "Tunggu informasi dari penjual" },
                    ].map((step) => (
                        <div key={step.icon} className="flex items-center gap-3">
                            <span className="text-lg">{step.icon}</span>
                            <p className="text-sm text-gray-700">{step.text}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col gap-3">
                    {waUrl && (
                        <a
                            href={decodeURIComponent(waUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold h-12 rounded-xl transition-colors shadow-sm text-sm"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Chat Penjual di WhatsApp
                        </a>
                    )}
                    <Link href={`/toko/${slug}`}>
                        <Button variant="outline" className="w-full h-11 rounded-xl gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Belanja Lagi
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <React.Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted-foreground">Memuat...</div>}>
            <CheckoutSuccessContent />
        </React.Suspense>
    )
}
