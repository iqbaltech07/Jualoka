"use client"

import { useState } from "react"
import { Voucher } from "@/lib/voucherStore"
import { Copy, Check, CreditCard, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"

export function VoucherModal({
    voucher,
    onPay,
    onClose,
}: {
    voucher: Voucher
    onPay: () => void
    onClose: () => void
}) {
    const [copied, setCopied] = useState(false)
    const [paying, setPaying] = useState(false)

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(voucher.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // fallback
            const ta = document.createElement("textarea")
            ta.value = voucher.code
            document.body.appendChild(ta)
            ta.select()
            document.execCommand("copy")
            document.body.removeChild(ta)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    async function handlePay() {
        setPaying(true)
        await onPay()
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Confetti strip */}
                <div className="h-2 w-full bg-gradient-to-r from-yellow-400 via-primary to-emerald-400" />

                <div className="px-6 py-6 text-center space-y-5">
                    {/* Icon */}
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-50 to-primary/10 flex items-center justify-center mx-auto shadow-inner">
                        <PartyPopper className="h-8 w-8 text-primary" />
                    </div>

                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-bold text-foreground">🎉 Selamat!</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kamu dapat voucher diskon <span className="font-bold text-primary">Rp {voucher.discount.toLocaleString("id-ID")}</span>
                        </p>
                    </div>

                    {/* Code */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl px-5 py-4 border border-primary/10">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 mb-2">Kode Voucher</p>
                        <code className="text-3xl font-extrabold tracking-[0.3em] text-primary">
                            {voucher.code}
                        </code>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCopy}
                            className="flex-1 rounded-xl h-11 gap-2 text-sm font-semibold"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    Tersalin!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Salin Kode
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={handlePay}
                            disabled={paying}
                            className="flex-1 rounded-xl h-11 gap-2 text-sm font-semibold bg-[#25D366] hover:bg-[#20b858] text-white"
                        >
                            <CreditCard className="h-4 w-4" />
                            {paying ? "Memproses..." : "Bayar"}
                        </Button>
                    </div>

                    <p className="text-[11px] text-muted-foreground">
                        Simpan kode voucher. Kamu akan diarahkan ke WhatsApp.
                    </p>
                </div>
            </div>
        </div>
    )
}
