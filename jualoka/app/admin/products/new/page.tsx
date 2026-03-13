"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NewProductPage() {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [cost, setCost] = useState("")
    const [stock, setStock] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")

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
                    const uploadData = await uploadRes.json()
                    finalImageUrl = uploadData.url
                } else {
                    const err = await uploadRes.json()
                    toast.error(err.message || "Gagal mengunggah foto produk.")
                    setIsLoading(false)
                    return
                }
            }

            const res = await fetch("/api/products", {
                method: "POST",
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
                toast.success("Produk berhasil ditambahkan!")
                router.push("/admin/products")
            } else {
                const data = await res.json()
                toast.error(data.message || "Gagal menyimpan produk.")
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-8 max-w-2xl w-full">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tambah Produk</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">Tambahkan produk baru ke toko Anda.</p>
                </div>
            </div>

            {/* Form */}
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-6 pt-6 pb-5 border-b border-border/50">
                    <CardTitle className="text-base">Informasi Produk</CardTitle>
                    <CardDescription>Isi form di bawah untuk menambah produk baru.</CardDescription>
                </CardHeader>
                <CardContent
                    className="px-6 py-6 transition-opacity"
                    style={{ opacity: isLoading ? 0.6 : 1, pointerEvents: isLoading ? "none" : "auto" }}
                >
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Image */}
                        <div className="space-y-2">
                            <Label>Foto Produk</Label>
                            <label className="block border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group relative overflow-hidden">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
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

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Produk *</Label>
                            <Input
                                id="name"
                                placeholder="contoh: Keripik Pisang Coklat"
                                className="h-11 rounded-xl"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Price & Cost */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Harga Jual (Rp) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="15000"
                                    min={0}
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="h-11 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Biaya Produksi (Rp)</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    placeholder="8000"
                                    min={0}
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stok Awal *</Label>
                            <Input
                                id="stock"
                                type="number"
                                placeholder="50"
                                min={0}
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="h-11 rounded-xl"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi *</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[110px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                placeholder="Tulis deskripsi singkat tentang produk Anda..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/admin/products">
                                <Button variant="outline" type="button" className="rounded-xl">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={isLoading} className="rounded-xl gap-2 px-6">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Produk"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
