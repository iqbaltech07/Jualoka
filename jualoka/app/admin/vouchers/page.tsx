"use client"

import { useState, useEffect } from "react"
import { Plus, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VoucherCard } from "@/components/admin/vouchers/VoucherCard"
import { VoucherEditModal } from "@/components/admin/vouchers/VoucherEditModal"
import { Voucher } from "@/lib/voucherStore"

export default function VouchersPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [editing, setEditing] = useState<Voucher | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchVouchers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/vouchers")
            if (res.ok) {
                const data = await res.json()
                setVouchers(data.vouchers)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchVouchers()
        setMounted(true)
    }, [])

    async function handleAdd() {
        const defaultCode = `VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        const oneDayFromNow = new Date()
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
        try {
            const res = await fetch("/api/vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: defaultCode,
                    discount: 5000,
                    minTransaction: 50000,
                    stock: 10,
                    expiresAt: oneDayFromNow.toISOString()
                })
            })
            if (res.ok) {
                fetchVouchers()
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function handleSave(id: string, data: { code: string; discount: number; minTransaction: number; threshold: number; stock: number; isActive: boolean; expiresAt?: string | null }) {
        try {
            const method = id ? "PUT" : "POST"
            const url = id ? `/api/vouchers/${id}` : "/api/vouchers"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                fetchVouchers()
                setEditing(null)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function handleDelete(id: string) {
        const Swal = (await import("sweetalert2")).default
        const result = await Swal.fire({
            title: "Hapus voucher?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
            customClass: {
                popup: "rounded-2xl",
                confirmButton: "rounded-xl font-bold",
                cancelButton: "rounded-xl font-bold"
            }
        })

        if (!result.isConfirmed) return

        try {
            const res = await fetch(`/api/vouchers/${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                Swal.fire({
                    title: "Terhapus!",
                    text: "Voucher telah berhasil dihapus.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: "rounded-2xl"
                    }
                })
                fetchVouchers()
            }
        } catch (error) {
            console.error(error)
            Swal.fire({
                title: "Error!",
                text: "Gagal menghapus voucher.",
                icon: "error",
                customClass: {
                    popup: "rounded-2xl"
                }
            })
        }
    }

    if (!mounted) return null

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola kode voucher diskon untuk pelanggan.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleAdd}
                        className="rounded-xl h-10 gap-2 shadow-sm border-primary/20 text-primary hover:bg-primary/5"
                    >
                        <Ticket className="h-4 w-4" />
                        Auto Generate
                    </Button>
                    <Button
                        onClick={() => setEditing({ id: "", code: "", discount: 0, minTransaction: 0, threshold: 0, stock: 1, isActive: true, expiresAt: null, storeId: "", createdAt: new Date(), updatedAt: new Date(), tier: null, weight: 1 })}
                        className="rounded-xl h-10 gap-2 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Voucher
                    </Button>
                </div>
            </div>

            {/* Voucher Grid */}
            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                            <div className="h-1.5 w-full bg-muted animate-pulse" />
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-9 w-32 bg-muted rounded-xl animate-pulse" />
                                    <div className="h-6 w-14 bg-muted rounded-full animate-pulse" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[...Array(3)].map((_, j) => (
                                        <div key={j} className="bg-muted/60 rounded-xl px-3 py-2.5 space-y-1.5 animate-pulse">
                                            <div className="h-2 w-10 bg-muted rounded mx-auto" />
                                            <div className="h-4 w-16 bg-muted rounded mx-auto" />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-8 w-full bg-muted rounded-xl animate-pulse" />
                                <div className="flex gap-2">
                                    <div className="h-9 flex-1 bg-muted rounded-xl animate-pulse" />
                                    <div className="h-9 w-9 bg-muted rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : vouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Ticket className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Belum Ada Voucher</h3>
                    <p className="text-muted-foreground text-sm mb-6">Buat voucher pertama untuk pelanggan Anda.</p>
                    <Button onClick={handleAdd} className="rounded-xl gap-2">
                        <Plus className="h-4 w-4" />
                        Generate Voucher
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
