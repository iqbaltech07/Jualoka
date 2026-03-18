"use client"

import { useState, useEffect } from "react"
import { Voucher } from "@/lib/voucherStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function VoucherEditModal({
    voucher,
    onSave,
    onClose,
}: {
    voucher: Voucher
    onSave: (id: string, data: { code: string; discount: number; minTransaction: number; stock: number; expiresAt?: string | null }) => Promise<void> | void
    onClose: () => void
}) {
    const [isSaving, setIsSaving] = useState(false)
    const [code, setCode] = useState(voucher.code)
    const [discount, setDiscount] = useState(voucher.discount.toString())
    const [minTransaction, setMinTransaction] = useState(voucher.minTransaction.toString())
    const [stock, setStock] = useState(voucher.stock.toString())
    const [expiresAt, setExpiresAt] = useState<string>(
        voucher.expiresAt
            ? new Date(voucher.expiresAt).toISOString().slice(0, 16)
            : ""
    )

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)
        try {
            await onSave(voucher.id, {
                code: code.toUpperCase().trim(),
                discount: parseInt(discount) || 0,
                minTransaction: parseInt(minTransaction) || 0,
                stock: parseInt(stock) || 0,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-linear-to-r from-primary/5 to-primary/10">
                    <div>
                        <h2 className="text-base font-bold">Edit Voucher</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Sesuaikan detail voucher di bawah.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-code" className="text-xs">Kode Voucher</Label>
                        <Input
                            id="edit-code"
                            type="text"
                            className="h-10 rounded-xl text-sm font-bold uppercase tracking-wider"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="DISKON10"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-discount" className="text-xs">Nominal Diskon (Rp)</Label>
                        <Input
                            id="edit-discount"
                            type="number"
                            min="0"
                            className="h-10 rounded-xl text-sm"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="10000"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-min" className="text-xs">Threshold Belanja (Rp)</Label>
                        <Input
                            id="edit-min"
                            type="number"
                            min="0"
                            className="h-10 rounded-xl text-sm"
                            value={minTransaction}
                            onChange={(e) => setMinTransaction(e.target.value)}
                            placeholder="50000"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-stock" className="text-xs">Stok (Jumlah Redeem)</Label>
                        <Input
                            id="edit-stock"
                            type="number"
                            min="0"
                            className="h-10 rounded-xl text-sm"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="10"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-expires" className="text-xs">
                            Tanggal Kadaluarsa <span className="text-muted-foreground font-normal">(opsional)</span>
                        </Label>
                        <Input
                            id="edit-expires"
                            type="datetime-local"
                            className="h-10 rounded-xl text-sm"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        {expiresAt && (
                            <button
                                type="button"
                                onClick={() => setExpiresAt("")}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                                × Hapus tanggal kadaluarsa
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl h-10"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 rounded-xl h-10 font-bold"
                        >
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
