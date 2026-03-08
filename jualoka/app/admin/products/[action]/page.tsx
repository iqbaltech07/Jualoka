import Link from "next/link"
import { ArrowLeft, ImagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function ProductFormPage({
    params,
}: {
    params: Promise<{ action: string }>
}) {
    const { action } = await params
    const isEdit = action !== "new"

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
                    <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit Produk" : "Tambah Produk"}</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">{isEdit ? "Perbarui detail produk Anda." : "Tambahkan produk baru ke toko Anda."}</p>
                </div>
            </div>

            {/* Form */}
            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-6 pt-6 pb-5 border-b border-border/50">
                    <CardTitle className="text-base">Informasi Produk</CardTitle>
                    <CardDescription>Isi form di bawah untuk {isEdit ? "mengupdate" : "menambah"} produk.</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6">
                    <form className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>Foto Produk *</Label>
                            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                                <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Klik untuk upload foto</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, WEBP (Maks. 5MB)</p>
                                <input type="file" className="hidden" accept="image/*" />
                            </div>
                        </div>

                        {/* Product Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Produk *</Label>
                            <Input id="name" placeholder="contoh: Keripik Pisang Coklat" className="h-11 rounded-xl" required />
                        </div>

                        {/* Price & Cost */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Harga Jual (Rp) *</Label>
                                <Input id="price" type="number" placeholder="15000" className="h-11 rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Biaya Produksi (Rp)</Label>
                                <Input id="cost" type="number" placeholder="8000" className="h-11 rounded-xl" />
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stok Awal *</Label>
                            <Input id="stock" type="number" placeholder="50" className="h-11 rounded-xl" required />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi *</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[110px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                placeholder="Tulis deskripsi singkat tentang produk Anda..."
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Link href="/admin/products">
                                <Button variant="outline" type="button" className="rounded-xl">Batal</Button>
                            </Link>
                            <Button type="submit" className="rounded-xl gap-2 px-6">
                                Simpan Produk
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
