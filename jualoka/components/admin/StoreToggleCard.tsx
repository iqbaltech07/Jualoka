"use client"

import { useTransition, useState } from "react"
import { Store, Power, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function StoreToggleCard({ initialOpen }: { initialOpen: boolean }) {
    const [isOpen, setIsOpen] = useState(initialOpen)
    const [isPending, startTransition] = useTransition()

    function handleToggle() {
        startTransition(async () => {
            const nextState = !isOpen
            try {
                const res = await fetch("/api/stores", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ isOpen: nextState }),
                })
                if (!res.ok) throw new Error("Gagal mengubah status toko.")
                setIsOpen(nextState)
                toast.success(nextState ? "Toko berhasil dibuka! 🟢" : "Toko berhasil ditutup! 🔴")
            } catch {
                toast.error("Gagal mengubah status toko.")
            }
        })
    }

    return (
        <div
            className={`rounded-2xl border-2 p-5 flex items-center justify-between gap-4 transition-colors duration-300 ${isOpen
                ? "border-emerald-300 bg-emerald-50/60"
                : "border-red-300 bg-red-50/60"
                }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isOpen ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                        }`}
                >
                    <Store className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm font-bold">
                        Status Toko:{" "}
                        <span className={isOpen ? "text-emerald-600" : "text-red-500"}>
                            {isOpen ? "🟢 Buka" : "🔴 Tutup"}
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {isOpen
                            ? "Pelanggan bisa melihat & memesan produk Anda."
                            : "Toko tersembunyi, pelanggan melihat pesan tutup."}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-60 ${isOpen
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Power className="h-4 w-4" />
                )}
                {isOpen ? "Tutup Toko" : "Buka Toko"}
            </button>
        </div>
    )
}
