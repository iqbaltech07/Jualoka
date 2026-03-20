import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { deleteBlobImage } from "@/lib/vercelBlob"

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

        if (typeof body.gamificationEnabled === "boolean") {
            const store = await prisma.store.update({
                where: { userId },
                data: { gamificationEnabled: body.gamificationEnabled },
                select: { gamificationEnabled: true }
            })
            return NextResponse.json({ gamificationEnabled: store.gamificationEnabled }, { status: 200 })
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

export async function DELETE(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({
            where: { userId },
            include: {
                products: {
                    select: { image: true }
                }
            }
        })

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 })
        }

        // Gather all Vercel Blob URLs associated with this store
        const blobUrlsToDelete: string[] = []
        
        if (store.bannerImageUrl) {
            blobUrlsToDelete.push(store.bannerImageUrl)
        }

        for (const product of store.products) {
            if (product.image) {
                blobUrlsToDelete.push(product.image)
            }
        }

        // 1. Delete the user from the database (Cascades will delete store, products & orders in DB)
        await prisma.user.delete({ where: { id: userId } })

        // 2. Delete all files from Vercel Blob concurrently
        if (blobUrlsToDelete.length > 0) {
            await Promise.allSettled(
                blobUrlsToDelete.map(url => deleteBlobImage(url))
            )
        }

        return NextResponse.json({ message: "Store and associated files deleted successfully" }, { status: 200 })
    } catch (error: any) {
        console.error("Store DELETE Error:", error)
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
