import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint to get store details and catalog by slug
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params

        const store = await prisma.store.findUnique({
            where: { slug },
            select: {
                id: true,
                userId: true,
                name: true,
                slug: true,
                whatsappNumber: true,
                isOpen: true,
                bannerEnabled: true,
                bannerBadge: true,
                bannerTitle: true,
                bannerDesc: true,
                bannerTheme: true,
                bannerGradient: true,
                bannerImageUrl: true,
                bannerLayout: true,
                bannerOpacity: true,
                category: true,
                products: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        description: true,
                        image: true,
                        stock: true, // Needed for stock limit enforcement on frontend
                    }
                }
            }
        })

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 })
        }

        return NextResponse.json({ store }, { status: 200 })
    } catch (error) {
        console.error("Public Store Fetch Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

