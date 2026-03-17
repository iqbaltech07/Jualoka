"use client"

import { ArrowLeft } from "lucide-react"

export function BackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Toko
        </button>
    )
}