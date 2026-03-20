import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { storeId, code, totalTransaction, customerWhatsapp } = body

        if (!storeId || !code) {
            return NextResponse.json({ message: "Store ID and Voucher Code are required" }, { status: 400 })
        }

        const voucher = await prisma.voucher.findFirst({
            where: {
                storeId,
                code: code.toUpperCase()
            }
        })

        const claim = await prisma.rewardClaim.findFirst({
            where: {
                storeId,
                customerWhatsapp,
                voucherId: voucher?.id,
            }
        })

        if (claim && claim.isUsed) {
            return NextResponse.json({ message: "Voucher ini sudah pernah kamu gunakan sebelumnya." }, { status: 400 })
        }

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

        // Transaction Total Check
        const currentTotal = parseInt(totalTransaction) || 0
        if (currentTotal < voucher.minTransaction) {
            return NextResponse.json({
                message: `Voucher ini hanya bisa digunakan dengan total belanja minimal Rp ${voucher.minTransaction.toLocaleString("id-ID")}.`
            }, { status: 400 })
        }

        return NextResponse.json({ voucher }, { status: 200 })
    } catch (error) {
        console.error("Voucher Validation Error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
