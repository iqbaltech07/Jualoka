import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { StoreCard, type StoreCardData } from "@/components/toko/StoreCard"
import { StoreHero } from "@/components/toko/StoreHero"
import { StoreCtaBanner } from "@/components/toko/StoreCtaBanner"
import { StoresClientPage } from "@/components/toko/StoresClientPage"
import { THEME_GRADIENTS, type BannerTheme } from "@/lib/bannerStore"

// Always fresh data
export const dynamic = "force-dynamic"

// Map bannerTheme & bannerGradient → Tailwind gradient
function getStoreColor(theme: string, customGradient?: string | null): string {
    if (theme === "custom" && customGradient) {
        return customGradient
    }
    return THEME_GRADIENTS[theme as BannerTheme] || THEME_GRADIENTS.green
}

export default async function StoresPage() {
    type RawStoreWithCount = {
        id: string
        name: string
        slug: string
        category: string | null
        bannerTheme: string
        bannerGradient: string | null
        _count: { products: number }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawStores: RawStoreWithCount[] = (await (prisma.store.findMany as any)({
        where: {
            slug: { not: "" },
            name: { not: "" },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            bannerTheme: true,
            bannerGradient: true,
            _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
    })) as RawStoreWithCount[]

    const stores: StoreCardData[] = rawStores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category || "Umum",
        productCount: s._count.products,
        color: getStoreColor(s.bannerTheme, s.bannerGradient),
    }))

    return <StoresClientPage stores={stores} />
}
