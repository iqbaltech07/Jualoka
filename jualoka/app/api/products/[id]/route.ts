import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await verifyAuth(req)
        const { id: productId } = await params
        const body = await req.json()

        const { name, price, cost, description, stock, image } = body

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const existingProduct = await prisma.product.findUnique({ where: { id: productId } })
        if (!existingProduct || existingProduct.storeId !== store.id) {
            return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 })
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name: name ?? existingProduct.name,
                price: price !== undefined ? Number(price) : existingProduct.price,
                cost: cost !== undefined ? Number(cost) : existingProduct.cost,
                description: description ?? existingProduct.description,
                stock: stock !== undefined ? Number(stock) : existingProduct.stock,
                image: image ?? existingProduct.image
            }
        })

        return NextResponse.json({ message: "Product updated successfully", product: updatedProduct }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await verifyAuth(req)
        const { id: productId } = await params

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const existingProduct = await prisma.product.findUnique({ where: { id: productId } })
        if (!existingProduct || existingProduct.storeId !== store.id) {
            return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 })
        }

        await prisma.product.delete({ where: { id: productId } })

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
