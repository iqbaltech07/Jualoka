export type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
}

export async function getCart(storeId: string): Promise<CartItem[]> {
    try {
        const res = await fetch(`/api/cart?storeId=${storeId}`)
        if (!res.ok) return []
        const data = await res.json()
        return data.items || []
    } catch (e) {
        console.error("getCart Error", e)
        return []
    }
}

export async function addToCart(storeId: string, productId: string, quantity: number = 1): Promise<void> {
    try {
        await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ storeId, productId, quantity })
        })
    } catch (e) {
        console.error("addToCart Error", e)
    }
}

export async function updateCartQuantity(productId: string, quantity: number): Promise<void> {
    try {
        await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity })
        })
    } catch (e) {
        console.error("updateCartQuantity Error", e)
    }
}

export async function removeFromCart(productId: string): Promise<void> {
    try {
        await fetch(`/api/cart?productId=${productId}`, {
            method: "DELETE"
        })
    } catch (e) {
        console.error("removeFromCart Error", e)
    }
}

export async function clearCart(): Promise<void> {
    try {
        await fetch("/api/cart?clearAll=true", {
            method: "DELETE"
        })
    } catch (e) {
        console.error("clearCart Error", e)
    }
}
