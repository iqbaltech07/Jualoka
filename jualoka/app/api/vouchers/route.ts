import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const vouchers = await prisma.voucher.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: "desc" }
        })

        // Auto-deactivate vouchers that have expired but are still marked active
        const now = new Date()
        const expiredIds = vouchers
            .filter(v => v.isActive && v.expiresAt && v.expiresAt < now)
            .map(v => v.id)

        if (expiredIds.length > 0) {
            await prisma.voucher.updateMany({
                where: { id: { in: expiredIds } },
                data: { isActive: false }
            })
            // Refresh the list after deactivation
            const updated = await prisma.voucher.findMany({
                where: { storeId: store.id },
                orderBy: { createdAt: "desc" }
            })
            return NextResponse.json({ vouchers: updated }, { status: 200 })
        }

        return NextResponse.json({ vouchers }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { code, discount, minTransaction, stock, isActive, expiresAt, tier, weight, threshold } = body

        if (!code || typeof discount !== 'number') {
            return NextResponse.json({ message: "Code and discount are required" }, { status: 400 })
        }

        // Check if code already exists
        const existing = await prisma.voucher.findUnique({ where: { code } })
        if (existing) {
            return NextResponse.json({ message: "Voucher code already exists" }, { status: 400 })
        }

        const voucher = await prisma.voucher.create({
            data: {
                storeId: store.id,
                code: code.toUpperCase(),
                discount,
                minTransaction: minTransaction || 0,
                stock: stock !== undefined ? stock : 1,
                isActive: isActive !== undefined ? isActive : true,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                tier: tier || null,
                weight: weight !== undefined ? weight : 1,
                threshold: threshold !== undefined ? threshold : 0,
            }
        })

        return NextResponse.json({ voucher }, { status: 201 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
