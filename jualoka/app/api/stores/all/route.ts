import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public: list all stores
export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        const result = stores.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            whatsappNumber: s.whatsappNumber,
            createdAt: s.createdAt,
            productCount: s._count.products,
        }))

        return NextResponse.json({ stores: result }, { status: 200 })
    } catch (error: any) {
        console.error("Store List Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
