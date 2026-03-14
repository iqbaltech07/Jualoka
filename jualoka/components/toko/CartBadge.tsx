"use client"

import { useEffect, useState } from "react"
import { getCart } from "@/lib/cartApi"

export function CartBadge({ storeId }: { storeId?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!storeId) return

        async function fetchCart() {
            const items = await getCart(storeId as string)
            const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
            setCount(totalItems)
        }

        // Initial load
        fetchCart()

        // Listen for updates from other components
        const handleCartUpdate = () => fetchCart()
        window.addEventListener("cartUpdated", handleCartUpdate)
        
        return () => window.removeEventListener("cartUpdated", handleCartUpdate)
    }, [storeId])

    if (count === 0) return null

    return (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4.5 min-w-[18px] px-1.5 flex items-center justify-center rounded-full ring-2 ring-primary">
            {count > 99 ? '99+' : count}
        </span>
    )
}
