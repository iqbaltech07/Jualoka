import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// GET all products for the logged in user's store
export async function GET(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return NextResponse.json({ message: "Store not found" }, { status: 404 })
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            include: {
                orderItems: {
                    where: {
                        order: {
                            createdAt: {
                                gte: thirtyDaysAgo
                            }
                        }
                    },
                    select: {
                        quantity: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const productsWithSales = products.map((p: any) => {
            const totalSold30Days = p.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
            const { orderItems, ...productData } = p
            return {
                ...productData,
                totalSold30Days
            }
        })

        return NextResponse.json({ products: productsWithSales }, { status: 200 })
    } catch (error: any) {
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

// CREATE a new product
export async function POST(req: Request) {
    try {
        const userId = await verifyAuth(req)

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) return NextResponse.json({ message: "Store not found" }, { status: 404 })

        const body = await req.json()
        const { name, price, cost, description, stock, image } = body

        if (!name || price === undefined || stock === undefined) {
            return NextResponse.json({ message: "Name, price, and stock are required" }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: {
                storeId: store.id,
                name,
                price: Number(price),
                cost: cost ? Number(cost) : null,
                description: description || "",
                stock: Number(stock),
                image: image || null
            }
        })

        return NextResponse.json({ message: "Product created successfully", product }, { status: 201 })
    } catch (error: any) {
        console.error("Create Product Error:", error)
        if (error.message === "Missing or invalid token" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
