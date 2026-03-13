import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const body = await req.json()
        const { name, slug, whatsappNumber, category } = body

        // If they are only updating the category (from the category onboarding screen)
        if (category && !name && !slug && !whatsappNumber) {
             const existingStore = await prisma.store.findUnique({ where: { userId } })
             if (!existingStore) {
                  return NextResponse.json({ message: "Store not found to update category" }, { status: 404 })
             }
             const updatedStore = await prisma.store.update({
                 where: { userId },
                 data: { category }
             })
             return NextResponse.json({ message: "Category updated", store: updatedStore }, { status: 200 })
        }

        if (!name || !slug || !whatsappNumber) {
            return NextResponse.json(
                { message: "Name, slug, and WhatsApp number are required" },
                { status: 400 }
            )
        }

        const existingStore = await prisma.store.findUnique({ where: { slug } })
        if (existingStore && existingStore.userId !== userId) {
            return NextResponse.json(
                { message: "URL Toko sudah digunakan oleh orang lain" },
                { status: 400 }
            )
        }

        const store = await prisma.store.upsert({
            where: { userId },
            update: { name, slug, whatsappNumber, ...(category && { category }) },
            create: { userId, name, slug, whatsappNumber, ...(category && { category }) }
        })

        return NextResponse.json({ message: "Store saved successfully", store }, { status: 200 })
    } catch (error: any) {
        console.error("Store Setup Error:", error)
        if (error.message === "Missing or invalid token") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const userId = await verifyAuth(req)
        const body = await req.json()

        if (typeof body.isOpen === "boolean") {
            const store = await prisma.store.update({
                where: { userId },
                data: { isOpen: body.isOpen },
                select: { isOpen: true }
            })
            return NextResponse.json({ isOpen: store.isOpen }, { status: 200 })
        }

        return NextResponse.json({ message: "No valid field to update" }, { status: 400 })
    } catch (error: any) {
        console.error("Store PATCH Error:", error)
        if (error.message === "Missing or invalid token") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 })
        }

        return NextResponse.json({ store }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
