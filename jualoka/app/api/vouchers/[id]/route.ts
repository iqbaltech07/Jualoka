import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await verifyAuth(req)
        const { id } = await params

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { code, discount, minTransaction, stock, isActive, expiresAt, tier, weight, threshold } = body

        // Verify the voucher belongs to this store
        const existing = await prisma.voucher.findUnique({ where: { id } })
        if (!existing || existing.storeId !== store.id) {
            return NextResponse.json({ message: "Voucher not found access denied" }, { status: 404 })
        }

        // Check if updating code to one that exists on a DIFFERENT voucher
        if (code && code.toUpperCase() !== existing.code) {
            const checkCode = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } })
            if (checkCode) {
                return NextResponse.json({ message: "Voucher code already exists" }, { status: 400 })
            }
        }

        const data: any = {}
        if (code !== undefined) data.code = code.toUpperCase()
        if (discount !== undefined) data.discount = discount
        if (minTransaction !== undefined) data.minTransaction = minTransaction
        if (stock !== undefined) data.stock = stock
        if (isActive !== undefined) data.isActive = isActive
        if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null
        if (tier !== undefined) data.tier = tier
        if (weight !== undefined) data.weight = weight
        if (threshold !== undefined) data.threshold = threshold

        const voucher = await prisma.voucher.update({
            where: { id },
            data
        })

        return NextResponse.json({ voucher }, { status: 200 })
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
        const { id } = await params

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        // Verify the voucher belongs to this store
        const existing = await prisma.voucher.findUnique({ where: { id } })
        if (!existing || existing.storeId !== store.id) {
            return NextResponse.json({ message: "Voucher not found or access denied" }, { status: 404 })
        }

        await prisma.voucher.delete({ where: { id } })

        return NextResponse.json({ message: "Voucher deleted successfully" }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
