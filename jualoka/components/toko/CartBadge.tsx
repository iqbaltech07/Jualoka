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
        
        fetchCart()

        // Optional: listen for custom events if you want the cart badge to update instantly when items are added
        // Otherwise, it requires a page refresh. For MVP this is acceptable or we could add an interval.
        const interval = setInterval(fetchCart, 5000) // Poll every 5s for MVP simplicity
        return () => clearInterval(interval)
    }, [storeId])

    if (count === 0) return null

    return (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4.5 min-w-[18px] px-1.5 flex items-center justify-center rounded-full ring-2 ring-primary">
            {count > 99 ? '99+' : count}
        </span>
    )
}
