"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Package, LayoutDashboard, ShoppingCart, Settings, Store, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { getAuthUser, clearAuthUser, type AuthUser } from "@/components/localStorage/AuthStorage"

const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
]

function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                            isActive
                                ? "bg-white/15 text-white shadow-sm"
                                : "text-white/60 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <Icon className={cn("h-4 w-4 flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
                        <span className="flex-1">{label}</span>
                        {isActive && <ChevronRight className="h-3 w-3 opacity-70" />}
                    </Link>
                )
            })}
        </nav>
    )
}

function AdminUserFooter() {
    const router = useRouter()
    const [user, setUser] = useState<AuthUser | null>(null)

    useEffect(() => {
        setUser(getAuthUser())
    }, [])

    function handleLogout() {
        clearAuthUser()
        router.push("/auth/login")
    }

    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "A"

    return (
        <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/10">
                <div className="h-8 w-8 rounded-full bg-[#fac023] flex items-center justify-center text-[#1a1a1a] font-bold text-sm shrink-0">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{user?.name ?? "Admin"}</p>
                    <p className="text-white/50 text-xs truncate">{user?.email ?? "Pemilik Toko"}</p>
                </div>
                <button
                    onClick={handleLogout}
                    title="Keluar"
                    className="text-white/50 hover:text-white transition-colors shrink-0"
                    aria-label="Keluar"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#f8fafb]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50">
                {/* Gradient background */}
                <div className="flex flex-col h-full bg-gradient-to-b from-[#1a7035] to-[#218b42] shadow-xl">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                            <Store className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-base leading-none">Jualoka</p>
                            <p className="text-white/50 text-xs mt-0.5">Admin Panel</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                        <SidebarNav />
                    </div>

                    {/* Footer */}
                    <AdminUserFooter />
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-16 border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-6 shadow-sm">
                    <div className="flex items-center gap-2 md:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-primary">Jualoka</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#fac023] flex items-center justify-center text-[#1a1a1a] font-bold text-sm">
                            A
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
