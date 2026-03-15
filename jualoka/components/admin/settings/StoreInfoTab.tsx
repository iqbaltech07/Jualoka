"use client"

import { useState, useEffect } from "react"
import { Store, Phone, Link2, CheckCircle2, Pencil, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { STORE_CATEGORIES, type StoreCategory } from "@/lib/categories"
import Swal from "sweetalert2"

import { useRouter } from "next/navigation"

export function StoreInfoTab() {
    const router = useRouter()
    const [copied, setCopied] = useState(false)
    const [isEditing, setIsEditing] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [storeName, setStoreName] = useState("")
    const [slug, setSlug] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [category, setCategory] = useState<StoreCategory | "">("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchStore() {
            try {
                const res = await fetch("/api/stores", { credentials: "include" })
                if (res.ok) {
                    const data = await res.json()
                    if (data.store) {
                        setStoreName(data.store.name)
                        setSlug(data.store.slug)
                        setWhatsapp(data.store.whatsappNumber.replace("+62", "").replace(/^62/, "").replace(/^0/, ""))
                        setCategory(data.store.category || "")
                        setIsEditing(false)
                    }
                }
            } catch (error) {
                console.error("Failed to load store info", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStore()
    }, [])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        try {
            let formattedPhone = whatsapp
            if (formattedPhone.startsWith("0")) formattedPhone = "62" + formattedPhone.substring(1)
            else if (!formattedPhone.startsWith("62")) formattedPhone = "62" + formattedPhone

            const res = await fetch("/api/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: storeName, slug, whatsappNumber: formattedPhone, category })
            })

            if (res.ok) {
                setIsEditing(false)
                toast.success("Informasi toko berhasil disimpan!")
            } else {
                const data = await res.json()
                toast.error(data.message || "Gagal menyimpan pengaturan toko.")
            }
        } catch (error) {
            console.error("Save error", error)
            toast.error("Terjadi kesalahan koneksi.")
        }
    }

    async function handleStoreDelete() {
        const result = await Swal.fire({
            title: "Hapus Toko?",
            text: "Beneran mau menghapus toko ini? Semua produk, pesanan, dan gambar akan ikut terhapus dari sistem dan tidak bisa dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Ya, Hapus Toko!",
            cancelButtonText: "Batal"
        })

        if (!result.isConfirmed) return

        setIsDeleting(true)
        try {
            const res = await fetch("/api/stores", {
                method: "DELETE",
                credentials: "include"
            })
            if (res.ok) {
                toast.success("Toko berhasil dihapus.")
                router.push("/admin/setup")
            } else {
                const data = await res.json()
                toast.error(data.message || "Gagal menghapus toko.")
                setIsDeleting(false)
            }
        } catch (error) {
            console.error("Delete error", error)
            toast.error("Terjadi kesalahan koneksi.")
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-6 pt-6 pb-5 border-b border-border/50">
                    <CardTitle className="text-base">Informasi Umum</CardTitle>
                    <CardDescription>Informasi ini akan tampil di halaman toko publik Anda.</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6 transition-opacity" style={{ opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? "none" : "auto" }}>
                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="space-y-2">
                            <Label htmlFor="storeName" className="flex items-center gap-2">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                Nama Toko
                            </Label>
                            <Input id="storeName" placeholder="Nama toko Anda" value={storeName} onChange={e => setStoreName(e.target.value)} disabled={!isEditing} className="h-11 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug" className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                                URL Toko
                            </Label>
                            <div className={`flex items-center rounded-xl border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${!isEditing ? "opacity-60" : ""}`}>
                                <span className="text-muted-foreground text-sm bg-muted px-3 h-11 flex items-center border-r border-input whitespace-nowrap shrink-0">
                                    jualoka.com/toko/
                                </span>
                                <input
                                    id="slug"
                                    className="flex-1 h-11 px-3 text-sm outline-none bg-background disabled:cursor-not-allowed"
                                    placeholder="nama-toko"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    disabled={!isEditing}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`jualoka.com/toko/${slug}`)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 2000)
                                    }}
                                    className="px-3 h-11 border-l border-input bg-muted hover:bg-muted/80 transition-colors shrink-0"
                                    title="Salin URL"
                                >
                                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Nomor WhatsApp
                            </Label>
                            <div className={`flex items-center rounded-xl border border-input overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${!isEditing ? "opacity-60" : ""}`}>
                                <span className="text-muted-foreground text-sm bg-muted px-3 h-11 flex items-center border-r border-input">+62</span>
                                <input id="whatsapp" type="tel" inputMode="numeric" pattern="[0-9]*" className="flex-1 h-11 px-3 text-sm outline-none bg-background disabled:cursor-not-allowed" placeholder="81234567890" value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, ""))} disabled={!isEditing} />
                            </div>
                            <p className="text-xs text-muted-foreground">Digunakan untuk menerima pesanan langsung.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="flex items-center gap-2">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                Kategori Toko
                            </Label>
                            <select
                                id="category"
                                value={category}
                                onChange={e => setCategory(e.target.value as StoreCategory)}
                                disabled={!isEditing}
                                className="w-full h-11 px-3 text-sm rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {STORE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" onClick={() => setIsEditing(true)} disabled={isEditing} className="rounded-xl px-6 gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground disabled:opacity-40">
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                            <Button type="submit" disabled={!isEditing || !storeName.trim() || !slug.trim() || !whatsapp.trim() || !category} className="rounded-xl px-6 bg-primary hover:bg-primary/90 disabled:opacity-40">
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border border-red-200 bg-red-50/30">
                <CardHeader className="px-6 pt-5 pb-4">
                    <CardTitle className="text-sm font-semibold text-red-700">Zona Berbahaya</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium">Hapus Toko</p>
                        <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl shrink-0"
                        onClick={handleStoreDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Menghapus..." : "Hapus Toko"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}