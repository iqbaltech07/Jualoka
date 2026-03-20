"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartHeaderProps {
    itemCount: number
}

export function CartHeader({ itemCount }: CartHeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <Link href="./">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Keranjang Belanja</h1>
                <p className="text-muted-foreground text-sm">{itemCount} produk dipilih</p>
            </div>
        </div>
    )
}
