import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const body = await req.json()
        const {
            bannerEnabled,
            bannerBadge,
            bannerTitle,
            bannerDesc,
            bannerTheme,
            bannerGradient,
            bannerImageUrl,
            bannerLayout,
            bannerOpacity
        } = body

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) {
            return NextResponse.json(
                { message: "Store not found. Please complete store info first." },
                { status: 404 }
            )
        }

        const updatedStore = await prisma.store.update({
            where: { userId },
            data: {
                bannerEnabled: bannerEnabled ?? store.bannerEnabled,
                bannerBadge: bannerBadge ?? store.bannerBadge,
                bannerTitle: bannerTitle ?? store.bannerTitle,
                bannerDesc: bannerDesc ?? store.bannerDesc,
                bannerTheme: bannerTheme ?? store.bannerTheme,
                bannerGradient: bannerGradient ?? store.bannerGradient,
                bannerImageUrl: bannerImageUrl ?? store.bannerImageUrl,
                bannerLayout: bannerLayout ?? store.bannerLayout,
                bannerOpacity: bannerOpacity ?? store.bannerOpacity,
            }
        })

        return NextResponse.json(
            { message: "Banner configuration saved successfully", store: updatedStore },
            { status: 200 }
        )
    } catch (error: any) {
        console.error("Banner Config Error:", error)
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
