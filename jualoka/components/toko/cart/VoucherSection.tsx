"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Ticket, Check, X, Loader2, AlertCircle } from "lucide-react"
import { Voucher } from "@/lib/voucherStore"

interface VoucherSectionProps {
    voucherCode: string
    setVoucherCode: (code: string) => void
    appliedVoucher: Voucher | null
    voucherError: string
    voucherApplying: boolean
    handleApplyVoucher: () => Promise<void>
    handleRemoveVoucher: () => void
    isWhatsappValid: boolean
    hasVouchers: boolean
}

export function VoucherSection({
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    voucherError,
    voucherApplying,
    handleApplyVoucher,
    handleRemoveVoucher,
    isWhatsappValid,
    hasVouchers
}: VoucherSectionProps) {
    if (!hasVouchers) return null
    return (
        <div className="space-y-1.5 pt-4 border-t border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5" />
                Kode Voucher
            </h3>
            {appliedVoucher ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-700">{appliedVoucher.code}</p>
                        <p className="text-xs text-emerald-600">Diskon Rp {appliedVoucher.discount.toLocaleString("id-ID")} berhasil diterapkan</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-emerald-100 transition-colors"
                        title="Hapus Voucher"
                    >
                        <X className="h-3.5 w-3.5 text-emerald-700" />
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Masukkan kode voucher"
                            className={`h-10 rounded-xl text-sm uppercase tracking-wider font-medium flex-1 ${voucherError ? "border-destructive focus:ring-destructive/20" : ""}`}
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleApplyVoucher()
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyVoucher}
                            disabled={!voucherCode.trim() || voucherApplying || !isWhatsappValid}
                            className="h-10 rounded-xl px-4 text-sm font-semibold shrink-0"
                        >
                            {voucherApplying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Gunakan"
                            )}
                        </Button>
                    </div>
                    {voucherError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {voucherError}
                        </p>
                    )}
                </>
            )}
        </div>
    )
}
