"use client"

import { useState, useEffect } from "react"
import { Plus, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoucherCard } from "@/components/admin/vouchers/VoucherCard"
import { VoucherEditModal } from "@/components/admin/vouchers/VoucherEditModal"
import { getVouchers, addVoucher, updateVoucher, deleteVoucher, Voucher } from "@/lib/voucherStore"

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [editing, setEditing] = useState<Voucher | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setVouchers(getVouchers())
        setMounted(true)
    }, [])

    function handleAdd() {
        const newV = addVoucher({ discount: 5000, minTransaction: 50000, stock: 10 })
        setVouchers(getVouchers())
    }

    function handleSave(id: string, data: { discount: number; minTransaction: number; stock: number }) {
        updateVoucher(id, data)
        setVouchers(getVouchers())
        setEditing(null)
    }

    function handleDelete(id: string) {
        if (!confirm("Hapus voucher ini?")) return
        deleteVoucher(id)
        setVouchers(getVouchers())
    }

    if (!mounted) return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
                <p className="text-muted-foreground text-sm mt-1">Memuat...</p>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola kode voucher diskon untuk pelanggan.</p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="rounded-xl h-10 gap-2 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Voucher
                </Button>
            </div>

            {/* Voucher Grid */}
            {vouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Ticket className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Belum Ada Voucher</h3>
                    <p className="text-muted-foreground text-sm mb-6">Buat voucher pertama untuk pelanggan Anda.</p>
                    <Button onClick={handleAdd} className="rounded-xl gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Voucher
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {vouchers.map((v) => (
                        <VoucherCard
                            key={v.id}
                            voucher={v}
                            onEdit={setEditing}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <VoucherEditModal
                    voucher={editing}
                    onSave={handleSave}
                    onClose={() => setEditing(null)}
                />
            )}
        </div>
    )
}
