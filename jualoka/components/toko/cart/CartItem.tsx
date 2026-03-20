"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { CartItem as CartItemType } from "@/lib/cartApi"

interface CartItemProps {
    item: CartItemType
    onUpdate: (id: string, delta: number) => Promise<void>
    onRemove: (id: string) => Promise<void>
}

export function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div className="flex items-center gap-4">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover shrink-0 border border-border/50 shadow-inner"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-xl bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-xl shrink-0">
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
                        onClick={() => onUpdate(item.id, -1)}
                        className="h-8 w-8 rounded-lg border border-border bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                        onClick={() => onUpdate(item.id, 1)}
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
                        onClick={() => onRemove(item.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transform active:scale-90 shadow-sm border border-red-100"
                        title="Hapus Produk"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
