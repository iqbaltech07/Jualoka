import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
    title: "Jelajahi Toko UMKM — Jualoka",
    description: "Temukan ratusan toko UMKM lokal Indonesia. Cari toko berdasarkan nama, kategori, atau lokasi.",
}

export default function StoresLayout({ children }: { children: ReactNode }) {
    return <>{children}</>
}
