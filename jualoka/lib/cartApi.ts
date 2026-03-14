"use client"

export type CartItem = {
    id: string
    name: string
    price: number
    quantity: number
    stock: number
    image?: string
}

// Helper to get the correct storage key per store
const getCartKey = (storeId: string) => `jualoka_cart_${storeId}`

// Helper to dispatch event to other components (like CartBadge)
const notifyCartUpdate = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"))
    }
}

export async function getCart(storeId: string): Promise<CartItem[]> {
    if (typeof window === "undefined") return []
    try {
        const data = localStorage.getItem(getCartKey(storeId))
        return data ? JSON.parse(data) : []
    } catch (e) {
        console.error("getCart Error", e)
        return []
    }
}

export async function addToCart(storeId: string, item: CartItem): Promise<void> {
    if (typeof window === "undefined") return
    try {
        const cart = await getCart(storeId)
        const existing = cart.find(i => i.id === item.id)
        
        let newCart: CartItem[]
        if (existing) {
            newCart = cart.map(i => 
                i.id === item.id 
                    ? { ...i, quantity: Math.min(i.stock, i.quantity + item.quantity) } 
                    : i
            )
        } else {
            // Ensure we don't exceed stock on initial add
            const toAdd = { ...item, quantity: Math.min(item.stock, item.quantity) }
            newCart = [...cart, toAdd]
        }
        
        localStorage.setItem(getCartKey(storeId), JSON.stringify(newCart))
        notifyCartUpdate()
    } catch (e) {
        console.error("addToCart Error", e)
    }
}

export async function updateCartQuantity(storeId: string, productId: string, quantity: number): Promise<void> {
    if (typeof window === "undefined") return
    try {
        const cart = await getCart(storeId)
        if (quantity <= 0) {
            await removeFromCart(storeId, productId)
            return
        }

        const newCart = cart.map(i => 
            i.id === productId 
                ? { ...i, quantity: Math.min(i.stock, quantity) } 
                : i
        )
        localStorage.setItem(getCartKey(storeId), JSON.stringify(newCart))
        notifyCartUpdate()
    } catch (e) {
        console.error("updateCartQuantity Error", e)
    }
}

export async function removeFromCart(storeId: string, productId: string): Promise<void> {
    if (typeof window === "undefined") return
    try {
        const cart = await getCart(storeId)
        const newCart = cart.filter(i => i.id !== productId)
        localStorage.setItem(getCartKey(storeId), JSON.stringify(newCart))
        notifyCartUpdate()
    } catch (e) {
        console.error("removeFromCart Error", e)
    }
}

export async function clearCart(storeId: string): Promise<void> {
    if (typeof window === "undefined") return
    try {
        localStorage.removeItem(getCartKey(storeId))
        notifyCartUpdate()
    } catch (e) {
        console.error("clearCart Error", e)
    }
}
