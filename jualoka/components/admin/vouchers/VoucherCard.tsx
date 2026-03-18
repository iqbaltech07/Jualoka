"use client"

import { Voucher } from "@/lib/voucherStore"
import { Pencil, Trash2, CalendarX2, CalendarCheck2 } from "lucide-react"

export function VoucherCard({
    voucher,
    onEdit,
    onDelete,
}: {
    voucher: Voucher
    onEdit: (v: Voucher) => void
    onDelete: (id: string) => void
}) {
    const now = new Date()
    const expiry = voucher.expiresAt ? new Date(voucher.expiresAt) : null
    const isExpired = expiry ? expiry < now : false
    const isActive = voucher.stock > 0 && voucher.discount > 0 && !isExpired

    const formatExpiry = (date: Date) =>
        date.toLocaleDateString("id-ID", { 
            day: "numeric", 
            month: "short", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })

    return (
        <div className={`group relative bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${isActive ? "border-primary/20" : "border-border/50 opacity-70"}`}>
            {/* Decorative top strip */}
            <div className={`h-1.5 w-full ${isActive ? "bg-linear-to-r from-primary to-emerald-400" : "bg-muted"}`} />

            <div className="p-5 space-y-4">
                {/* Code */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <code className="text-xl font-bold tracking-[0.2em] text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                            {voucher.code}
                        </code>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? "bg-emerald-50 text-emerald-600" : isExpired ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : isExpired ? "bg-amber-500" : "bg-muted-foreground"}`} />
                        {isActive ? "Aktif" : isExpired ? "Kadaluarsa" : "Habis"}
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/40 rounded-xl px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 mb-0.5">Diskon</p>
                        <p className="text-sm font-bold text-foreground">Rp {voucher.discount.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 mb-0.5">Threshold Belanja</p>
                        <p className="text-sm font-bold text-foreground">Rp {voucher.minTransaction.toLocaleString("id-ID")}</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 mb-0.5">Stok</p>
                        <p className="text-sm font-bold text-foreground">{voucher.stock}×</p>
                    </div>
                </div>

                {/* Expiry */}
                {expiry ? (
                    <div className={`flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 ${isExpired ? "bg-amber-50 text-amber-600" : "bg-muted/40 text-muted-foreground"}`}>
                        {isExpired ? <CalendarX2 className="h-3.5 w-3.5 shrink-0" /> : <CalendarCheck2 className="h-3.5 w-3.5 shrink-0" />}
                        <span>{isExpired ? "Kadaluarsa" : "Berlaku s/d"}: <strong>{formatExpiry(expiry)}</strong></span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-2 bg-muted/40 text-muted-foreground">
                        <CalendarCheck2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Tidak ada batas waktu</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                    <button
                        onClick={() => onEdit(voucher)}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-[0.98]"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(voucher.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"
                        title="Hapus Voucher"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
