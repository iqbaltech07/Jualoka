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
    onSave: (id: string, data: { discount: number; minTransaction: number; stock: number }) => void
    onClose: () => void
}) {
    const [discount, setDiscount] = useState(voucher.discount.toString())
    const [minTransaction, setMinTransaction] = useState(voucher.minTransaction.toString())
    const [stock, setStock] = useState(voucher.stock.toString())

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        onSave(voucher.id, {
            discount: parseInt(discount) || 0,
            minTransaction: parseInt(minTransaction) || 0,
            stock: parseInt(stock) || 0,
        })
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div>
                        <h2 className="text-base font-bold">Edit Voucher</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Kode: <code className="font-bold text-primary tracking-wider">{voucher.code}</code>
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
                        <Label htmlFor="edit-discount" className="text-xs">Nominal Diskon (Rp)</Label>
                        <Input
                            id="edit-discount"
                            type="number"
                            min="0"
                            className="h-10 rounded-xl text-sm"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="10000"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-min" className="text-xs">Minimal Transaksi (Rp)</Label>
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
                            className="flex-1 rounded-xl h-10"
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
