import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { storeId, code, totalTransaction, customerName, customerWhatsapp } = body

        if (!storeId || !code) {
            return NextResponse.json({ message: "Store ID and Voucher Code are required" }, { status: 400 })
        }

        const voucher = await prisma.voucher.findFirst({
            where: {
                storeId,
                code: code.toUpperCase()
            }
        })

        if (!voucher) {
            return NextResponse.json({ message: "Kode voucher tidak ditemukan." }, { status: 404 })
        }

        if (!voucher.isActive) {
            return NextResponse.json({ message: "Voucher ini sudah tidak aktif." }, { status: 400 })
        }

        if (voucher.stock <= 0) {
            return NextResponse.json({ message: "Voucher sudah habis digunakan." }, { status: 400 })
        }

        if (voucher.expiresAt && new Date() > voucher.expiresAt) {
            return NextResponse.json({ message: "Voucher ini sudah kedaluwarsa." }, { status: 400 })
        }

        // Calculate Historical Total for the buyer
        const pastOrders = await prisma.order.findMany({
            where: {
                storeId,
                customerWhatsapp,
                customerName
            },
            include: {
                orderItems: true
            }
        })

        const historicalTotal = pastOrders.reduce((acc, order) => {
            return acc + order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }, 0)

        if (historicalTotal < voucher.minTransaction) {
            return NextResponse.json({ 
                message: `Voucher ini hanya untuk pelanggan dengan total belanja minimal Rp ${voucher.minTransaction.toLocaleString("id-ID")}. Total belanja Anda saat ini: Rp ${historicalTotal.toLocaleString("id-ID")}.` 
            }, { status: 400 })
        }

        return NextResponse.json({ voucher }, { status: 200 })
    } catch (error) {
        console.error("Voucher Validation Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
