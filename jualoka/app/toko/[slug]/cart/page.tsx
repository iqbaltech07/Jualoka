"use client"

import { useState, useEffect, use, useRef, useCallback } from "react"
import { getCart, updateCartQuantity, removeFromCart, clearCart, CartItem } from "@/lib/cartApi"
import { Voucher } from "@/lib/voucherStore"
import { VoucherModal } from "@/components/toko/VoucherModal"
import { useRouter } from "next/navigation"
import { CartHeader } from "@/components/toko/cart/CartHeader"
import { EmptyCart } from "@/components/toko/cart/EmptyCart"
import { CartItem as CartItemRow } from "@/components/toko/cart/CartItem"
import { OrderSummary } from "@/components/toko/cart/OrderSummary"

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
    const [hasVouchers, setHasVouchers] = useState(false)
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
                setHasVouchers(store._count.vouchers > 0)
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
        const isValid = /^(08|8)/.test(wa) && wa.length >= 12 && wa.length <= 14

        if (!wa) {
            setWaError("Nomor WhatsApp wajib diisi.")
            return
        } else if (!isValid) {
            setWaError("Nomor WhatsApp tidak valid (08/8..., 12-14 digit).")
            return
        }

        // If user manually applied a voucher, use it directly
        if (appliedVoucher) {
            await executeCheckout(appliedVoucher)
            return
        }

        // Check for eligible voucher (auto-find)
        if (hasVouchers) {
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
        }

        // No voucher — proceed directly
        await executeCheckout(null)
    }

    const isWhatsappValid = /^(08|8)/.test(form.whatsapp) && form.whatsapp.length >= 12 && form.whatsapp.length <= 14;

    if (!mounted) return (
        <div className="flex flex-col gap-8 pb-12">
            <CartHeader itemCount={0} />
            <p className="text-muted-foreground text-sm pl-16">Memuat...</p>
        </div>
    )

    return (
        <div className="flex flex-col gap-8 pb-12">
            <CartHeader itemCount={items.length} />

            {items.length === 0 ? (
                <EmptyCart />
            ) : (
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Items List */}
                    <div className="lg:col-span-3 space-y-3">
                        {items.map((item) => (
                            <CartItemRow
                                key={item.id}
                                item={item}
                                onUpdate={update}
                                onRemove={remove}
                            />
                        ))}
                    </div>

                    {/* Order Summary Side Panel */}
                    <div className="lg:col-span-2">
                        <OrderSummary
                            items={items}
                            total={total}
                            appliedVoucher={appliedVoucher}
                            finalTotal={finalTotal}
                            hasVouchers={hasVouchers}
                            form={form}
                            onFormChange={(field, value) => {
                                setForm({ ...form, [field]: value })
                                if (field === "whatsapp") setWaError("")
                            }}
                            waError={waError}
                            voucherCode={voucherCode}
                            setVoucherCode={setVoucherCode}
                            voucherError={voucherError}
                            voucherApplying={voucherApplying}
                            handleApplyVoucher={handleApplyVoucher}
                            handleRemoveVoucher={handleRemoveVoucher}
                            checkoutError={checkoutError}
                            isLoading={isLoading}
                            handleCheckout={handleCheckout}
                        />
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