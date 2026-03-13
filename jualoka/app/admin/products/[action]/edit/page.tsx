"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function EditProductPage({
    params,
}: {
    params: Promise<{ action: string }>
}) {
    const router = useRouter()

    const [productId, setProductId] = useState("")
    const [isFetching, setIsFetching] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [cost, setCost] = useState("")
    const [stock, setStock] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")

    useEffect(() => {
        params.then((p) => setProductId(p.action))
    }, [params])

    useEffect(() => {
        if (!productId) return
        async function fetchProduct() {
            try {
                const res = await fetch("/api/products", { credentials: "include" })
                if (!res.ok) { setNotFound(true); return }
                const data = await res.json()
                const p = (data.products || []).find((x: any) => x.id === productId)
                if (!p) { setNotFound(true); return }
                setName(p.name)
                setPrice(p.price.toString())
                setCost(p.cost != null ? p.cost.toString() : "")
                setStock(p.stock.toString())
                setDescription(p.description || "")
                setImage(p.image || "")
                setImagePreview(p.image || "")
            } catch {
                setNotFound(true)
            } finally {
                setIsFetching(false)
            }
        }
        fetchProduct()
    }, [productId])

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast.error("Hanya file gambar yang diperbolehkan.")
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        try {
            let finalImageUrl = image
            if (imageFile) {
                const formData = new FormData()
                formData.append("file", imageFile)
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                })
                if (uploadRes.ok) {
                    finalImageUrl = (await uploadRes.json()).url
                } else {
                    const err = await uploadRes.json()
                    toast.error(err.message || "Gagal mengunggah foto produk.")
                    setIsLoading(false)
                    return
                }
            }
            const res = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    description,
                    price: Number(price),
                    cost: cost ? Number(cost) : undefined,
                    stock: Number(stock),
                    image: finalImageUrl || undefined,
                }),
            })
            if (res.ok) {
                toast.success("Produk berhasil diperbarui!")
                router.push("/admin/products")
            } else {
                const data = await res.json()
                toast.error(data.message || "Gagal memperbarui produk.")
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="flex flex-col gap-8 max-w-2xl w-full">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="space-y-1.5">
                        <div className="h-7 w-40 bg-zinc-100 rounded-lg animate-pulse" />
                        <div className="h-4 w-52 bg-zinc-100 rounded-lg animate-pulse" />
                    </div>
                </div>
                <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6 space-y-5">
                        <div className="aspect-[4/3] w-full bg-zinc-100 rounded-xl animate-pulse" />
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                                <div className="h-11 bg-zinc-100 rounded-xl animate-pulse" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-2xl w-full">
                <p className="text-xl font-semibold text-zinc-700">Produk tidak ditemukan</p>
                <Link href="/admin/products">
                    <Button variant="outline" className="rounded-xl gap-2">
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Produk
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 max-w-2xl w-full">
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Produk</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Perbarui detail produk Anda.</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-6 pt-6 pb-5 border-b border-border/50">
                    <CardTitle className="text-base">Informasi Produk</CardTitle>
                    <CardDescription>Isi form di bawah untuk mengupdate produk.</CardDescription>
                </CardHeader>
                <CardContent
                    className="px-6 py-6 transition-opacity"
                    style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? "none" : "auto" }}
                >
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label>Foto Produk</Label>
                            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group relative overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                {imagePreview ? (
                                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-medium flex items-center gap-2">
                                                <ImagePlus className="h-4 w-4" /> Ganti Foto
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <ImagePlus className="h-8 w-8 mx-auto mb-2 text-primary" />
                                        <p className="text-sm font-medium text-primary">Klik untuk upload foto</p>
                                        <p className="text-xs text-muted-foreground mt-1">Format JPG, PNG, atau WebP</p>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Produk *</Label>
                            <Input id="name" placeholder="contoh: Keripik Pisang Coklat" className="h-11 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Harga Jual (Rp) *</Label>
                                <Input id="price" type="number" placeholder="15000" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="h-11 rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Biaya Produksi (Rp)</Label>
                                <Input id="cost" type="number" placeholder="8000" min={0} value={cost} onChange={(e) => setCost(e.target.value)} className="h-11 rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Stok *</Label>
                            <Input id="stock" type="number" placeholder="50" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="h-11 rounded-xl" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[110px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                placeholder="Tulis deskripsi singkat tentang produk Anda..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/admin/products">
                                <Button variant="outline" type="button" className="rounded-xl">Batal</Button>
                            </Link>
                            <Button type="submit" disabled={isLoading} className="rounded-xl gap-2 px-6">
                                {isLoading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                                ) : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
