import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { THEME_GRADIENTS, BannerConfig } from "@/lib/bannerStore"
import { ProductGrid } from "@/components/toko/ProductGrid"
import { notFound } from "next/navigation"
export const dynamic = "force-dynamic"
import { BackButton } from "@/components/toko/BackButton"
import { CheckoutConfirmModal } from "@/components/toko/CheckoutConfirmModal"

function StoreBanner({ config }: { config: any }) {
    if (!config.enabled) return null

    let customStyle = {}
    let gradientClass = ""

    if (config.theme === "custom" && config.customGradient) {
        const startMatch = config.customGradient.match(/from-\[([^\]]+)\]/)
        const endMatch = config.customGradient.match(/to-\[([^\]]+)\]/)
        if (startMatch && endMatch) {
            customStyle = { backgroundImage: `linear-gradient(to bottom right, ${startMatch[1]}, ${endMatch[1]})` }
        } else {
            gradientClass = `bg-gradient-to-br ${config.customGradient}`
        }
    } else {
        gradientClass = `bg-gradient-to-br ${THEME_GRADIENTS[config.theme as keyof typeof THEME_GRADIENTS] || THEME_GRADIENTS.green}`
    }

    const titleLines = (config.title || "").split("\n")

    return (
        <div
            className={`relative rounded-3xl overflow-hidden ${gradientClass} p-8 sm:p-12 text-white shadow-xl ${config.layout === "center" ? "text-center" : "text-left"}`}
            style={customStyle}
        >
            {config.imageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${config.imageUrl}')`,
                        opacity: (config.imageOpacity || 25) / 100,
                    }}
                />
            )}
            <div className={`relative z-10 ${config.layout === "center" ? "max-w-lg mx-auto" : "max-w-lg"}`}>
                {config.badge && (
                    <div className="inline-flex items-center gap-2 bg-secondary text-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">
                        <Star className="h-3 w-3 fill-current" />
                        {config.badge}
                    </div>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                    {titleLines.map((line: string, i: number) => (
                        <span key={i}>
                            {line}
                            {i < titleLines.length - 1 && <br />}
                        </span>
                    ))}
                </h1>
                {config.description && (
                    <p className="text-white/80 text-sm sm:text-base">{config.description}</p>
                )}
            </div>
        </div>
    )
}

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
    return `http://localhost:${process.env.PORT || 3000}`
}

export default async function StorePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = await params
    const slug = resolvedParams.slug

    try {
        const url = `${getBaseUrl()}/api/stores/${slug}`
        const res = await fetch(url, { cache: "no-store" })

        if (!res.ok) {
            notFound()
        }

        const data = await res.json()
        const store = data.store

        if (!store) notFound()

        const isOpen: boolean = store.isOpen ?? true
        const closedMessage = "Toko sedang tutup sementara. Kami akan segera kembali! 🙏"

        const bannerConfig: BannerConfig = {
            enabled: store.bannerEnabled,
            badge: store.bannerBadge,
            title: store.bannerTitle,
            description: store.bannerDesc,
            theme: store.bannerTheme,
            customGradient: store.bannerGradient,
            layout: store.bannerLayout,
            imageUrl: store.bannerImageUrl,
            imageOpacity: store.bannerOpacity
        }

        return (
            <div className="flex flex-col gap-10">
                {/* Back button */}
                <BackButton />

                {/* Hero Banner */}
                <StoreBanner config={bannerConfig} />

                {/* CLOSED OVERLAY */}
                {!isOpen && (
                    <div className="rounded-3xl border-2 border-dashed border-red-300 bg-red-50 px-8 py-12 flex flex-col items-center text-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
                            🔴
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-red-700">Toko Sedang Tutup</h2>
                            <p className="text-red-500/80 text-sm mt-1 max-w-xs">{closedMessage}</p>
                        </div>
                        <span className="text-xs text-red-400 bg-red-100 px-3 py-1 rounded-full font-medium">
                            Silakan kembali lagi nanti
                        </span>
                    </div>
                )}

                {/* Heading */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Semua Produk</h2>
                        <p className="text-muted-foreground text-sm mt-0.5">{store.products.length} produk tersedia</p>
                    </div>
                </div>

                {/* Product Grid */}
                <ProductGrid products={store.products} isOpen={isOpen} storeId={store.id} />

                {/* Checkout Confirm Modal */}
                <CheckoutConfirmModal slug={slug} storeId={store.id} />
            </div>
        )
    } catch (err) {
        console.error(err)
        return <div className="p-10 text-center">Gagal memuat toko. Coba lagi nanti.</div>
    }
}