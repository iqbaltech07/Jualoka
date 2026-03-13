import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { StoreCard, type StoreCardData } from "@/components/toko/StoreCard"
import { StoreHero } from "@/components/toko/StoreHero"
import { StoreCtaBanner } from "@/components/toko/StoreCtaBanner"
import { StoresClientPage } from "@/components/toko/StoresClientPage"

// Always fresh data
export const dynamic = "force-dynamic"

// Map bannerTheme → Tailwind gradient
function themeToColor(theme: string): string {
    const map: Record<string, string> = {
        green: "from-emerald-400 to-green-600",
        blue: "from-blue-400 to-indigo-600",
        purple: "from-purple-400 to-violet-600",
        orange: "from-orange-400 to-amber-500",
        red: "from-rose-400 to-red-600",
        teal: "from-teal-400 to-cyan-600",
        gray: "from-slate-400 to-gray-600",
    }
    return map[theme] || "from-emerald-400 to-green-600"
}

export default async function StoresPage() {
    type RawStoreWithCount = {
        id: string
        name: string
        slug: string
        category: string | null
        bannerTheme: string
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
        color: themeToColor(s.bannerTheme),
    }))

    return <StoresClientPage stores={stores} />
}
