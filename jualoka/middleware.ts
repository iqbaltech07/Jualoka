import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE = "jualoka_auth"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(AUTH_COOKIE)?.value

    const isLoggedIn = !!token

    if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            const url = request.nextUrl.clone()
            url.pathname = "/auth/login"
            return NextResponse.redirect(url)
        }
    }

    if (pathname.startsWith("/onboarding")) {
        if (!isLoggedIn) {
            const url = request.nextUrl.clone()
            url.pathname = "/auth/login"
            return NextResponse.redirect(url)
        }
    }

    if (pathname === "/auth/login" && isLoggedIn) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*", "/onboarding/:path*", "/auth/login"],
}