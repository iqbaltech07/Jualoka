"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyCart() {
    return (
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
    )
}
