"use client"

import { useState, useEffect } from "react"
import { getCart, saveCart, CartItem } from "@/components/localStorage/CartStorage"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CartPage() {
    const [mounted, setMounted] = useState(false)
    const [items, setItems] = useState<CartItem[]>([])
    const [form, setForm] = useState({ name: "", whatsapp: "" })

    useEffect(() => {
        setItems(getCart())
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        saveCart(items)
    }, [items, mounted])

    const update = (id: string, delta: number) =>
        setItems((prev) =>
            prev
                .map((it) => it.id === id ? { ...it, quantity: it.quantity + delta } : it)
                .filter((it) => it.quantity > 0)
        )

    const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))

    const total = items.reduce((acc, it) => acc + it.price * it.quantity, 0)

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault()
        if (!items.length) return
        let msg = `Halo! Saya *${form.name}* ingin memesan:\n\n`
        items.forEach((it) => {
            msg += `• ${it.name} ×${it.quantity} = Rp ${(it.price * it.quantity).toLocaleString("id-ID")}\n`
        })
        msg += `\n*Total: Rp ${total.toLocaleString("id-ID")}*\n\nMohon info selanjutnya. Terima kasih 🙏`
        window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, "_blank")
    }

    if (!mounted) return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="./">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Keranjang Belanja</h1>
                    <p className="text-muted-foreground text-sm">Memuat...</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="./">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Keranjang Belanja</h1>
                    <p className="text-muted-foreground text-sm">{items.length} produk dipilih</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Keranjang Kosong</h3>
                    <p className="text-muted-foreground text-sm mb-6">Belum ada produk yang dipilih.</p>
                    <Link href="./">
                        <Button className="rounded-xl">Mulai Belanja</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Items */}
                    <div className="lg:col-span-3 space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center">
                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                                    {item.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{item.name}</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">Rp {item.price.toLocaleString("id-ID")} / pcs</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => update(item.id, -1)} className="h-7 w-7 rounded-lg border border-border bg-background flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                    <button onClick={() => update(item.id, 1)} className="h-7 w-7 rounded-lg border border-border bg-background flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="font-bold text-sm text-primary min-w-[90px] text-right">
                                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                                    </span>
                                    <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden sticky top-24">
                            <div className="px-6 py-5 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                                <h2 className="text-base font-semibold">Ringkasan Pesanan</h2>
                            </div>
                            <div className="px-6 py-5 space-y-3">
                                {items.map((it) => (
                                    <div key={it.id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground truncate pr-2">{it.name} ×{it.quantity}</span>
                                        <span className="font-medium flex-shrink-0">Rp {(it.price * it.quantity).toLocaleString("id-ID")}</span>
                                    </div>
                                ))}
                                <div className="border-t border-border/50 pt-3 mt-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-xl font-bold text-primary">Rp {total.toLocaleString("id-ID")}</span>
                                    </div>
                                </div>
                            </div>
                            <form id="checkout" onSubmit={handleCheckout} className="px-6 pb-6 space-y-4 border-t border-border/50 pt-5">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Pembeli</h3>
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs">Nama Lengkap *</Label>
                                    <Input id="name" placeholder="Budi Santoso" className="h-10 rounded-xl text-sm" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="wa" className="text-xs">Nomor WhatsApp *</Label>
                                    <Input id="wa" type="tel" placeholder="0812xxxx" className="h-10 rounded-xl text-sm" required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                                </div>
                            </form>
                            <div className="px-6 pb-6">
                                <button form="checkout" type="submit" className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold h-12 rounded-xl transition-colors shadow-sm text-sm">
                                    <MessageCircle className="h-5 w-5" />
                                    Pesan via WhatsApp
                                </button>
                                <p className="text-xs text-muted-foreground text-center mt-3">
                                    Anda akan diarahkan ke WhatsApp penjual setelah klik.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}