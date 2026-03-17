"use client"

import { useState, useEffect, use, useRef, useCallback } from "react"
import { getCart, updateCartQuantity, removeFromCart, clearCart, CartItem } from "@/lib/cartApi"
import { Voucher } from "@/lib/voucherStore"
import { VoucherModal } from "@/components/toko/VoucherModal"
import Link from "next/link"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, MessageCircle, AlertCircle, Ticket, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function CartPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params)
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [checkoutError, setCheckoutError] = useState("")
    const [waError, setWaError] = useState("")
    const [items, setItems] = useState<CartItem[]>([])
    const [form, setForm] = useState({ name: "", whatsapp: "" })
    const [storeId, setStoreId] = useState<string | null>(null)
    const [pendingVoucher, setPendingVoucher] = useState<Voucher | null>(null)
    const [showVoucherModal, setShowVoucherModal] = useState(false)
    const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({})

    // Voucher redeem states
    const [voucherCode, setVoucherCode] = useState("")
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null)
    const [voucherError, setVoucherError] = useState("")
    const [voucherApplying, setVoucherApplying] = useState(false)

    useEffect(() => {
        async function loadCart() {
            const storeRes = await fetch(`/api/stores/${slug}`)
            if (storeRes.ok) {
                const { store } = await storeRes.json()
                setStoreId(store.id)
                const cartData = await getCart(store.id)
                setItems(cartData)
            }
            setMounted(true)
        }

        loadCart()

        const handleUpdate = async () => {
            if (storeId) {
                const cartData = await getCart(storeId)
                setItems(cartData)
            }
        }
        window.addEventListener("cartUpdated", handleUpdate)
        return () => window.removeEventListener("cartUpdated", handleUpdate)
    }, [slug, storeId])

    const update = async (id: string, delta: number) => {
        if (!storeId) return
        const item = items.find(it => it.id === id)
        if (!item) return
        const newQty = item.quantity + delta
        if (newQty > item.stock) return
        if (newQty <= 0) {
            await removeFromCart(storeId, id)
        } else {
            await updateCartQuantity(storeId, id, newQty)
        }
    }

    const remove = async (id: string) => {
        if (!storeId) return
        await removeFromCart(storeId, id)
    }

    const total = items.reduce((acc, it) => acc + it.price * it.quantity, 0)
    const discountAmount = appliedVoucher ? appliedVoucher.discount : 0
    const finalTotal = Math.max(0, total - discountAmount)

    // Handle voucher apply
    const handleApplyVoucher = async () => {
        if (!storeId || !voucherCode.trim()) {
            setVoucherError("Masukkan kode voucher")
            return
        }
        setVoucherApplying(true)
        setVoucherError("")

        try {
            const res = await fetch("/api/vouchers/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId,
                    code: voucherCode,
                    totalTransaction: total,
                    customerName: form.name,
                    customerWhatsapp: form.whatsapp
                })
            })
            const data = await res.json()
            if (res.ok) {
                setAppliedVoucher(data.voucher)
                setVoucherError("")
            } else {
                setVoucherError(data.message || "Voucher tidak valid")
                setAppliedVoucher(null)
            }
        } catch (error) {
            setVoucherError("Terjadi kesalahan saat memvalidasi voucher")
            setAppliedVoucher(null)
        } finally {
            setVoucherApplying(false)
        }
    }

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null)
        setVoucherCode("")
        setVoucherError("")
    }

    // Core checkout logic — shared between direct checkout and voucher pay
    const executeCheckout = useCallback(async (appliedVoucher?: Voucher | null) => {
        setIsLoading(true)
        setCheckoutError("")

        try {
            const storeRes = await fetch(`/api/stores/${slug}`)
            if (!storeRes.ok) throw new Error("Gagal memuat informasi toko.")
            const { store } = await storeRes.json()

            const orderPayload = {
                storeId: store.id,
                customerName: form.name,
                customerWhatsapp: form.whatsapp,
                items: items.map(it => ({
                    productId: it.id,
                    quantity: it.quantity
                })),
                voucherId: appliedVoucher ? appliedVoucher.id : undefined
            }

            const orderRes = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderPayload)
            })

            const resData = await orderRes.json()

            if (!orderRes.ok) {
                setCheckoutError(resData.message || "Gagal membuat pesanan.")
                setIsLoading(false)
                return
            }

            const cartTotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0)
            let msg = `Halo! Saya *${form.name}* ingin memesan:\n\n`
            items.forEach((it) => {
                msg += `• ${it.name} ×${it.quantity} = Rp ${(it.price * it.quantity).toLocaleString("id-ID")}\n`
            })

            if (appliedVoucher) {
                const finalTotal = Math.max(0, cartTotal - appliedVoucher.discount)
                msg += `\n🎟️ *Voucher: ${appliedVoucher.code}*\n`
                msg += `Diskon: -Rp ${appliedVoucher.discount.toLocaleString("id-ID")}\n`
                msg += `\n*Total: Rp ${finalTotal.toLocaleString("id-ID")}*\n\nMohon info selanjutnya. Terima kasih 🙏`
            } else {
                msg += `\n*Total: Rp ${cartTotal.toLocaleString("id-ID")}*\n\nMohon info selanjutnya. Terima kasih 🙏`
            }

            await clearCart(store.id)
            setItems([])
            setShowVoucherModal(false)
            setPendingVoucher(null)

            const waUrl = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(msg)}`
            let successUrl = `/toko/${slug}/cart/success?slug=${slug}&store=${encodeURIComponent(store.name)}&wa=${encodeURIComponent(waUrl)}`

            if (resData.newVoucher) {
                successUrl += `&newVoucherCode=${resData.newVoucher.code}&newVoucherDiscount=${resData.newVoucher.discount}`
            }

            router.push(successUrl)

        } catch (error) {
            console.error("Checkout Error:", error)
            setCheckoutError("Terjadi kesalahan koneksi saat checkout.")
        } finally {
            setIsLoading(false)
        }
    }, [slug, form, items, router])

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!items.length || !storeId) return

        // Validasi WhatsApp
        const wa = form.whatsapp
        if (!wa) {
            setWaError("Nomor WhatsApp wajib diisi.")
            return
        } else if (!/^(08|8)/.test(wa)) {
            setWaError("Nomor harus diawali dengan 08 atau 8.")
            return
        } else if (wa.length < 12) {
            setWaError("Nomor WhatsApp minimal 12 digit.")
            return
        } else if (wa.length > 14) {
            setWaError("Nomor WhatsApp maksimal 14 digit.")
            return
        }

        // If user manually applied a voucher, use it directly
        if (appliedVoucher) {
            await executeCheckout(appliedVoucher)
            return
        }

        // Check for eligible voucher (auto-find)
        setIsLoading(true)
        try {
            const searchParams = new URLSearchParams({
                storeId,
                wa: form.whatsapp,
                name: form.name,
                total: total.toString()
            })
            const res = await fetch(`/api/vouchers/eligible?${searchParams.toString()}`)
            if (res.ok) {
                const data = await res.json()
                if (data.voucher) {
                    setPendingVoucher(data.voucher)
                    setShowVoucherModal(true)
                    setIsLoading(false)
                    return
                }
            }
        } catch (error) {
            console.error("Auto voucher error:", error)
        }

        // No voucher — proceed directly
        await executeCheckout(null)
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
                            <div key={item.id} className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border border-border/50 shadow-inner"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                            {item.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm sm:text-base text-card-foreground truncate">{item.name}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/50 text-secondary-foreground text-[10px] font-bold">
                                                Rp {item.price.toLocaleString("id-ID")}
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">per pcs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3.5 border-t border-dashed border-border/60">
                                    <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl">
                                        <button
                                            onClick={() => update(item.id, -1)}
                                            className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => update(item.id, 1)}
                                            disabled={item.quantity >= item.stock}
                                            className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 leading-none mb-1">Total</span>
                                            <span className="font-extrabold text-base text-primary">
                                                Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => remove(item.id)}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transform active:scale-90 shadow-sm border border-red-100"
                                            title="Hapus Produk"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
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
                                {appliedVoucher && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600 flex items-center gap-1.5">
                                            <Ticket className="h-3.5 w-3.5" />
                                            Diskon ({appliedVoucher.code})
                                        </span>
                                        <span className="font-medium text-emerald-600">-Rp {appliedVoucher.discount.toLocaleString("id-ID")}</span>
                                    </div>
                                )}
                                <div className="border-t border-border/50 pt-3 mt-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total</span>
                                        <div className="text-right">
                                            {appliedVoucher && (
                                                <span className="text-xs text-muted-foreground line-through block">Rp {total.toLocaleString("id-ID")}</span>
                                            )}
                                            <span className="text-xl font-bold text-primary">Rp {finalTotal.toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <form id="checkout" onSubmit={handleCheckout} className="px-6 pb-6 space-y-4 border-t border-border/50 pt-5">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Pembeli</h3>
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs">Nama Lengkap *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Budi Santoso"
                                        className="h-10 rounded-xl text-sm"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="wa" className="text-xs">Nomor WhatsApp *</Label>
                                    <Input
                                        id="wa"
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="08123456789"
                                        className={`h-10 rounded-xl text-sm ${waError ? "border-destructive focus:ring-destructive/20" : ""}`}
                                        required
                                        value={form.whatsapp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, "")
                                            setForm({ ...form, whatsapp: val })
                                            setWaError("")
                                        }}
                                    />
                                    {waError && (
                                        <p className="text-xs text-destructive flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {waError}
                                        </p>
                                    )}
                                </div>

                                {/* Voucher Code Input */}
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
                                                    onChange={(e) => {
                                                        setVoucherCode(e.target.value.toUpperCase())
                                                        setVoucherError("")
                                                    }}
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
                                                    disabled={!voucherCode.trim() || voucherApplying}
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
                            </form>
                            <div className="px-6 pb-6">
                                {checkoutError && (
                                    <div className="mb-3 flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
                                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                        <p className="text-sm text-destructive">{checkoutError}</p>
                                    </div>
                                )}
                                <button form="checkout" type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold h-12 rounded-xl transition-colors shadow-sm text-sm disabled:opacity-50">
                                    <MessageCircle className="h-5 w-5" />
                                    {isLoading ? "Memproses..." : "Pesan via WhatsApp"}
                                </button>
                                <p className="text-xs text-muted-foreground text-center mt-3">
                                    Pastikan data yang anda masukkan sudah benar sebelum klik pesan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Voucher Modal */}
            {showVoucherModal && pendingVoucher && (
                <VoucherModal
                    voucher={pendingVoucher}
                    onPay={() => executeCheckout(pendingVoucher)}
                    onClose={() => {
                        setShowVoucherModal(false)
                        setPendingVoucher(null)
                    }}
                />
            )}
        </div>
    )
}