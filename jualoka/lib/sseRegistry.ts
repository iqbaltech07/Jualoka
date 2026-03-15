/**
 * In-memory registry for Server-Sent Events (SSE) streams.
 * Each connected admin holds a reference to a ReadableStreamDefaultController.
 * When a new order arrives, we notify all streams registered for that storeId.
 * 
 * We use a global singleton pattern to ensure the registry persists across 
 * Hot Module Replacements (HMR) in Next.js development mode.
 */

type SSEController = ReadableStreamDefaultController<Uint8Array>

const globalForSSE = globalThis as unknown as {
    sseRegistry: Map<string, Set<SSEController>>
}

const registry = globalForSSE.sseRegistry ?? new Map<string, Set<SSEController>>()

if (process.env.NODE_ENV !== "production") {
    globalForSSE.sseRegistry = registry
}

export function registerStream(storeId: string, controller: SSEController): () => void {
    if (!registry.has(storeId)) {
        registry.set(storeId, new Set())
    }
    registry.get(storeId)!.add(controller)
    console.log(`[SSE] Client registered for store ${storeId}. Total streams: ${registry.get(storeId)?.size}`)

    // Return a cleanup function
    return () => {
        registry.get(storeId)?.delete(controller)
        console.log(`[SSE] Client disconnected for store ${storeId}. Total streams: ${registry.get(storeId)?.size ?? 0}`)
        if (registry.get(storeId)?.size === 0) {
            registry.delete(storeId)
        }
    }
}

export function notifyNewOrder(storeId: string, order: unknown) {
    const streams = registry.get(storeId)
    console.log(`[SSE] Notifying for store ${storeId}. Registered streams: ${streams?.size ?? 0}`)
    
    if (!streams || streams.size === 0) return

    const payload = `event: new_order\ndata: ${JSON.stringify(order)}\n\n`
    const encoded = new TextEncoder().encode(payload)

    for (const controller of streams) {
        try {
            controller.enqueue(encoded)
        } catch {
            // Stream is closed — remove it
            streams.delete(controller)
        }
    }
}
