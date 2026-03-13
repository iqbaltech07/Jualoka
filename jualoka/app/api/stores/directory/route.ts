import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get("category")
        const q = searchParams.get("q")

        type StoreWithCount = {
            id: string
            name: string
            slug: string
            category: string | null
            bannerTheme: string
            bannerEnabled: boolean
            _count: { products: number }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stores: StoreWithCount[] = (await (prisma.store.findMany as any)({
            where: {
                // Only list stores that have at least a proper slug and name
                slug: { not: "" },
                name: { not: "" },
                ...(category && category !== "Semua" ? { category } : {}),
                ...(q ? {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { category: { contains: q, mode: "insensitive" } },
                    ]
                } : {})
            },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                bannerTheme: true,
                bannerEnabled: true,
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })) as StoreWithCount[]

        const result = stores.map((store) => ({
            id: store.id,
            name: store.name,
            slug: store.slug,
            category: store.category || "Umum",
            productCount: store._count.products,
            color: themeToColor(store.bannerTheme),
        }))

        return NextResponse.json({ stores: result }, { status: 200 })
    } catch (error) {
        console.error("Directory API error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// Map the bannerTheme to a Tailwind gradient class
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
