"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { clearCart, getCart } from "@/lib/cartApi"

export function CheckoutConfirmModal({ slug, storeId }: { slug: string; storeId: string }) {
    const router = useRouter()
    const [hasItems, setHasItems] = useState(false)

    useEffect(() => {
        async function check() {
            const items = await getCart(storeId)
            setHasItems(items.length > 0)
        }
        check()

        window.addEventListener("cartUpdated", check)
        return () => window.removeEventListener("cartUpdated", check)
    }, [storeId])

    async function handleClick() {
        const Swal = (await import("sweetalert2")).default
        const result = await Swal.fire({
            title: "Lanjutkan Transaksi?",
            text: "Kamu masih punya produk di keranjang. Lanjutkan ke checkout atau batalkan pemesanan?",
            icon: "question",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonColor: "#218b42",
            denyButtonColor: "#ef4444",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Lanjut ke Checkout",
            denyButtonText: "Batalkan Pemesanan",
            cancelButtonText: "Tutup",
        })

        if (result.isConfirmed) {
            router.push(`/toko/${slug}/cart`)
        } else if (result.isDenied) {
            await clearCart(storeId)
            setHasItems(false)
            router.push("/toko")
        }
    }

    if (!hasItems) return null

    return (
        <div className="fixed bottom-6 inset-x-4 z-50 max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-border/50 px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold">Ada item di keranjang</p>
                </div>
                <button
                    onClick={handleClick}
                    className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shrink-0"
                >
                    Lanjut Checkout
                </button>
            </div>
        </div>
    )
}