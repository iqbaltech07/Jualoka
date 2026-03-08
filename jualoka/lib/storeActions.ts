"use server"

import { cookies } from "next/headers"

const COOKIE_KEY = "store_is_open"

export async function actionToggleStore() {
    const jar = await cookies()
    const current = jar.get(COOKIE_KEY)?.value
    // default open = "1", closed = "0"
    const next = current === "0" ? "1" : "0"
    jar.set(COOKIE_KEY, next, { path: "/", httpOnly: false })
}

export async function getStoreOpenFromCookie(): Promise<boolean> {
    const jar = await cookies()
    const val = jar.get(COOKIE_KEY)?.value
    // undefined (first visit) = open, "1" = open, "0" = closed
    return val !== "0"
}
