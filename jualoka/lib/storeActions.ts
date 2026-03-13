"use server"

import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { headers } from "next/headers"

/**
 * Toggle the store's isOpen status in the database.
 * This ensures the status is visible across ALL devices (not just the admin's browser).
 */
export async function actionToggleStore(): Promise<{ isOpen: boolean }> {
    const userId = await verifyAuth(undefined as unknown as Request)
    const store = await prisma.store.findUnique({ where: { userId }, select: { id: true, isOpen: true } })
    if (!store) throw new Error("Store not found")

    const updated = await prisma.store.update({
        where: { id: store.id },
        data: { isOpen: !store.isOpen },
        select: { isOpen: true }
    })
    return updated
}
