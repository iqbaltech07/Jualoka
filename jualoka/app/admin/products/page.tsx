import Link from "next/link"
import { Plus, Pencil, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const products = [
    { id: "1", name: "Keripik Singkong Pedas", price: 15000, stock: 50, status: "Laris" },
    { id: "2", name: "Seblak Instan Komplit", price: 12000, stock: 120, status: "Stabil" },
    { id: "3", name: "Kopi Gula Aren Literan", price: 65000, stock: 10, status: "Stabil" },
    { id: "4", name: "Cireng Isi Ayam Suwir", price: 18000, stock: 0, status: "Tidak Layak" },
]

const statusConfig: Record<string, { className: string; dot: string }> = {
    "Laris": { className: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
    "Stabil": { className: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
    "Tidak Layak": { className: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
}

export default function ProductsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
                    <p className="text-muted-foreground text-sm mt-1">Kelola produk dan stok toko Anda.</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="flex items-center gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Tambah Produk
                    </Button>
                </Link>
            </div>

            <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Daftar Produk ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="pl-6 text-xs uppercase tracking-wide font-semibold text-muted-foreground">Produk</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Status</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Harga</TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wide font-semibold text-muted-foreground">Stok</TableHead>
                                <TableHead className="text-right pr-6 text-xs uppercase tracking-wide font-semibold text-muted-foreground">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => {
                                const s = statusConfig[product.status] ?? statusConfig["Stabil"]
                                return (
                                    <TableRow key={product.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-sm">{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${s.className}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                                {product.status}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">Rp {product.price.toLocaleString("id-ID")}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`text-sm font-semibold ${product.stock === 0 ? "text-red-500" : "text-foreground"}`}>
                                                {product.stock}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
