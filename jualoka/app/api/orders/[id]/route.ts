import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// PATCH /api/orders/[id] — update order status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await verifyAuth(req)
        const { id: orderId } = await params
        const body = await req.json()
        const { status } = body

        const validStatuses = ["baru", "diproses", "dikirim", "selesai", "dibatalkan"]
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 })
        }

        // Verify store ownership
        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } })
        if (!existingOrder || existingOrder.storeId !== store.id) {
            return NextResponse.json({ message: "Order not found or unauthorized" }, { status: 404 })
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { orderItems: { include: { product: true } } }
        })

        return NextResponse.json({ message: "Order status updated", order: updatedOrder }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
