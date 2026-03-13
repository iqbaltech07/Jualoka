import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

// Helper to get or create a session ID from cookies
async function getSessionId() {
    const cookieStore = await cookies()
    let sessionId = cookieStore.get("cartSessionId")?.value

    if (!sessionId) {
        // Generate a new random session ID
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        
        // Ensure to await the setting of cookies in Next.js 15+ if required, or handle via headers directly
        // Note: setting cookies in a Server Component / Route Handler might require returning the response with the cookie set
    }

    return sessionId
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const storeId = searchParams.get("storeId")
        
        if (!storeId) {
             return NextResponse.json({ message: "storeId is required" }, { status: 400 })
        }

        const sessionId = await getSessionId()

        const cart = await prisma.cart.findFirst({
            where: { sessionId, storeId },
            include: {
                items: {
                     include: { product: true }
                }
            }
        })

        // Format for frontend (to match old CartItem format)
        const formattedItems = cart?.items.map(item => ({
            id: item.productId,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image
        })) || []

        const res = NextResponse.json({ items: formattedItems })
        
        // Ensure cookie is set on the response
        const cookieStore = await cookies()
        if (!cookieStore.has("cartSessionId")) {
             res.cookies.set("cartSessionId", sessionId, { 
                 httpOnly: true, 
                 path: "/",
                 maxAge: 60 * 60 * 24 * 7 // 7 days
             })
        }

        return res
    } catch (error) {
        console.error("Cart GET Error", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const { storeId, productId, quantity = 1 } = await req.json()
        
        if (!storeId || !productId) {
             return NextResponse.json({ message: "storeId and productId required" }, { status: 400 })
        }

        const sessionId = await getSessionId()

        // Upsert Cart
        const cart = await prisma.cart.upsert({
             where: { sessionId }, // Need to handle storeId mismatch ideally, but MVP uses sessionId unique constraint
             update: {},
             create: { sessionId, storeId }
        })

        // Upsert CartItem
        const existingItem = await prisma.cartItem.findUnique({
            where: { 
                cartId_productId: { cartId: cart.id, productId }
            }
        })

        if (existingItem) {
             await prisma.cartItem.update({
                 where: { id: existingItem.id },
                 data: { quantity: existingItem.quantity + quantity }
             })
        } else {
             await prisma.cartItem.create({
                 data: { cartId: cart.id, productId, quantity }
             })
        }

        const res = NextResponse.json({ message: "Added to cart" })
        const cookieStore = await cookies()
        if (!cookieStore.has("cartSessionId")) {
             res.cookies.set("cartSessionId", sessionId, { 
                 httpOnly: true, 
                 path: "/",
                 maxAge: 60 * 60 * 24 * 7 // 7 days
             })
        }
        return res
        
    } catch (error) {
        console.error("Cart POST Error", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const { productId, quantity } = await req.json()
        const sessionId = await getSessionId()

        const cart = await prisma.cart.findUnique({ where: { sessionId } })
        if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 })

        if (quantity <= 0) {
            // Delete item
            await prisma.cartItem.delete({
                 where: { cartId_productId: { cartId: cart.id, productId } }
            })
        } else {
            // Update quantity
            await prisma.cartItem.update({
                 where: { cartId_productId: { cartId: cart.id, productId } },
                 data: { quantity }
            })
        }

        return NextResponse.json({ message: "Cart updated" })
    } catch (error) {
        console.error("Cart PATCH Error", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const productId = searchParams.get("productId")
        const clearAll = searchParams.get("clearAll")
        
        const sessionId = await getSessionId()
        const cart = await prisma.cart.findUnique({ where: { sessionId } })
        
        if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 })

        if (clearAll === "true") {
             await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
        } else if (productId) {
             await prisma.cartItem.delete({
                 where: { cartId_productId: { cartId: cart.id, productId } }
             })
        }

        return NextResponse.json({ message: "Deleted" })

    } catch (error) {
        console.error("Cart DELETE Error", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
