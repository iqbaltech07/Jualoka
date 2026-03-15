import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registerStream } from "@/lib/sseRegistry"

/**
 * GET /api/orders/notify
 * Keeps a long-lived SSE connection open for the authenticated seller.
 * The admin dashboard connects here to receive real-time order notifications.
 */

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    // Verify the seller is authenticated
    let userId: string
    try {
        userId = await verifyAuth(req)
    } catch {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const store = await prisma.store.findUnique({ where: { userId }, select: { id: true } })
    if (!store) {
        return NextResponse.json({ message: "Store not found" }, { status: 404 })
    }

    const storeId = store.id
    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            // Send a "connected" keepalive comment so the browser knows it's alive
            controller.enqueue(encoder.encode(": connected\n\n"))

            // Register and get cleanup fn
            const cleanup = registerStream(storeId, controller)

            // Send periodic keepalive to prevent proxy/Cloudflare timeouts
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": ping\n\n"))
                } catch {
                    clearInterval(keepAlive)
                    cleanup()
                }
            }, 25_000)

            // Listen for client disconnect
            req.signal.addEventListener("abort", () => {
                clearInterval(keepAlive)
                cleanup()
                try { controller.close() } catch { /* already closed */ }
            })
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "private, no-cache, no-store, no-transform, must-revalidate",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no", // Disable Nginx buffering
        },
    })
}
