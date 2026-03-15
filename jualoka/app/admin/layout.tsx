"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Package, LayoutDashboard, ShoppingCart, Settings, ChevronRight, LogOut, BarChart, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Toaster } from "sonner"
import { toast } from "sonner"
import { useEffect } from "react"

const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/analysis", label: "Analisis", icon: BarChart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
]

function SidebarNav({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href))
                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onClose}
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
    const { data: session } = authClient.useSession()
    const user = session?.user

    async function handleLogout() {
        await authClient.signOut()
        window.location.reload()
    }

    const initial = user?.name
        ? user.name.trim()[0].toUpperCase()
        : "A"

    return (
        <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/10">
                <div className="h-8 w-8 rounded-full bg-[#fac023] flex items-center justify-center text-[#1a1a1a] font-bold text-sm shrink-0">
                    {initial}
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

function OrderNotifier() {
    const pathname = usePathname()
    const isOrdersPage = pathname === "/admin/orders"

    useEffect(() => {
        const es = new EventSource("/api/orders/notify", { withCredentials: true })

        es.addEventListener("new_order", (e) => {
            try {
                const raw = JSON.parse(e.data)
                const itemCount = raw.orderItems?.length ?? 0

                // Jika sedang di halaman orders, kirim data terbaru agar tabel bisa render instan
                if (isOrdersPage) {
                    window.dispatchEvent(new CustomEvent("refreshOrders", { detail: raw }))
                    toast.success("Pesanan baru masuk!", { duration: 3000 })
                } else {
                    toast.success("Pesanan baru masuk!", {
                        description: `Dari ${raw.customerName} · ${itemCount} item`,
                        duration: 10000,
                        action: {
                            label: "Lihat Pesanan",
                            onClick: () => { window.location.href = "/admin/orders" },
                        },
                    })
                }
            } catch (err) {
                console.error("SSE parse error", err)
            }
        })

        es.onerror = () => { }

        return () => es.close()
    }, [isOrdersPage])

    return null
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <>
            <div className="flex min-h-screen bg-[#f8fafb]">
                {/* Sidebar desktop */}
                <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50">
                    <div className="flex flex-col h-full bg-gradient-to-b from-[#1a7035] to-[#218b42] shadow-xl">
                        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-inner overflow-hidden">
                                <Image src="/logo.svg" alt="Jualoka" width={36} height={36} className="rounded-xl" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-base leading-none">Jualoka</p>
                                <p className="text-white/50 text-xs mt-0.5">Admin Panel</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <SidebarNav />
                        </div>
                        <AdminUserFooter />
                    </div>
                </aside>

                {/* Mobile drawer */}
                {mobileOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <aside className="fixed inset-y-0 right-0 z-50 w-72 flex flex-col md:hidden bg-gradient-to-b from-[#1a7035] to-[#218b42] shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-inner overflow-hidden">
                                        <Image src="/logo.svg" alt="Jualoka" width={36} height={36} className="rounded-xl" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-base leading-none">Jualoka</p>
                                        <p className="text-white/50 text-xs mt-0.5">Admin Panel</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="text-white/60 hover:text-white transition-colors p-1"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-6">
                                <SidebarNav onClose={() => setMobileOpen(false)} />
                            </div>
                            <AdminUserFooter />
                        </aside>
                    </>
                )}

                {/* Main */}
                <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                    <header className={cn(
                        "h-16 border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-6 shadow-sm",
                        mobileOpen && "md:flex hidden"
                    )}>
                        {/* Logo mobile */}
                        <div className="flex items-center gap-2 md:hidden">
                            <Image src="/logo.svg" alt="Jualoka" width={32} height={32} className="rounded-xl" />
                            <span className="font-bold text-primary">Jualoka</span>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            {/* Avatar desktop */}
                            <div className="hidden md:flex h-8 w-8 rounded-full bg-[#fac023] items-center justify-center text-[#1a1a1a] font-bold text-sm">
                                A
                            </div>
                            {/* Hamburger mobile */}
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-colors"
                                aria-label="Buka menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
            <OrderNotifier />
            <Toaster richColors position="top-right" />
        </>
    )
}