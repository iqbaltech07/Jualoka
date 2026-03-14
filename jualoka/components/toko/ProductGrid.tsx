"use client"

import { useState, useEffect, useRef } from "react"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addToCart, updateCartQuantity, removeFromCart, CartItem, getCart } from "@/lib/cartApi"

type Product = {
    id: string
    name: string
    price: number
    image: string
    description: string
    stock: number
    tag?: string | null
}

export function ProductGrid({
    products,
    isOpen,
    storeId
}: {
    products: Product[]
    isOpen: boolean
    storeId?: string
}) {
    const [cart, setCart] = useState<CartItem[]>([])

    useEffect(() => {
        if (!storeId) return
        
        async function load() {
             const data = await getCart(storeId as string)
             setCart(data)
        }
        
        load()

        const handleCartUpdate = () => load()
        window.addEventListener("cartUpdated", handleCartUpdate)
        return () => window.removeEventListener("cartUpdated", handleCartUpdate)
    }, [storeId])

    function getQty(id: string) {
        return cart.find((it) => it.id === id)?.quantity ?? 0
    }

    async function addItem(product: Product) {
        const qty = getQty(product.id)
        if (qty >= product.stock) return

        if (qty === 0) {
            const newItem: CartItem = { id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock, image: product.image }
            await addToCart(storeId as string, newItem)
        } else {
            const newQty = qty + 1
            await updateCartQuantity(storeId as string, product.id, newQty)
        }
        // State updates are handled by the cartUpdated event listener
    }

    async function decrease(product: Product) {
        const qty = getQty(product.id)
        if (qty <= 1) {
            await removeFromCart(storeId as string, product.id)
        } else {
            await updateCartQuantity(storeId as string, product.id, qty - 1)
        }
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => {
                const qty = getQty(product.id)
                const isOutOfStock = product.stock === 0
                const isMaxQty = qty >= product.stock

                return (
                    <div
                        key={product.id}
                        className={`group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-border/50 ${(!isOpen || isOutOfStock) ? "opacity-60 pointer-events-none select-none" : ""}`}
                    >
                        <div className="relative overflow-hidden aspect-square">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            {!isOpen && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <span className="text-xs font-bold text-red-500 bg-white px-3 py-1 rounded-full shadow border border-red-200">Tutup</span>
                                </div>
                            )}
                            {isOpen && isOutOfStock && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow border border-gray-200">Habis</span>
                                </div>
                            )}
                        </div>

                        <div className="p-3 sm:p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{product.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{product.description}</p>
                            {/* Stock indicator */}
                            {product.stock <= 5 && product.stock > 0 && (
                                <p className="text-[10px] text-amber-600 font-medium mb-2">⚠ Sisa {product.stock} item</p>
                            )}
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-primary font-bold text-sm sm:text-base">
                                    Rp {product.price.toLocaleString("id-ID")}
                                </span>
                                {qty === 0 ? (
                                    <Button
                                        size="sm"
                                        className="rounded-xl h-8 gap-1.5 shadow-sm text-xs"
                                        disabled={!isOpen || isOutOfStock}
                                        onClick={() => addItem(product)}
                                    >
                                        <ShoppingCart className="h-3 w-3" />
                                        <span className="hidden sm:inline">Pesan</span>
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => decrease(product)}
                                            className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-5 text-center text-sm font-bold">{qty}</span>
                                        <button
                                            onClick={() => addItem(product)}
                                            disabled={isMaxQty}  // Disable at max stock
                                            className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}