import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { CartBadge } from "@/components/toko/CartBadge"

export default async function TokoLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const storeName = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

    // Fetch store id safely for SSR
    // Ideally should be handled differently but for MVP we fetch here
    let storeId = ""
    try {
        const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const storeRes = await fetch(`${url}/api/stores/${slug}`, { next: { revalidate: 60 } })
        if (storeRes.ok) {
            const data = await storeRes.json()
            storeId = data.store.id
        }
    } catch(e) { /* ignore */ }

    return (
        <div className="min-h-screen bg-[#f8fafb] flex flex-col">
            {/* Sticky header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
                <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
                    {/* Logo/Store name */}
                    <Link href={`/toko/${slug}`} className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <ShoppingBag className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{storeName}</span>
                    </Link>

                    {/* Cart */}
                    <Link
                        href={`/toko/${slug}/cart`}
                        className="relative flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        <span>Keranjang</span>
                        <CartBadge storeId={storeId} />
                    </Link>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
                {children}
            </main>

            <footer className="border-t border-border/50 bg-white py-6 text-center text-sm text-muted-foreground">
                <p>
                    © 2025 <span className="font-semibold text-primary">{storeName}</span> · Powered by{" "}
                    <span className="font-semibold">Jualoka</span>
                </p>
            </footer>
        </div>
    )
}
