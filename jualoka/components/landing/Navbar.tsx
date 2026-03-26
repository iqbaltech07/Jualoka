"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Menu, X } from "lucide-react"

const NAV_LINKS = [
    { href: "/toko", label: "Jelajahi Toko" },
    { href: "/#fitur", label: "Fitur" },
    { href: "/#cara-kerja", label: "Cara Kerja" },
    { href: "/#testimoni", label: "Testimoni" },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm">
            <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-5">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <Image
                        src="/logo.svg"
                        alt="Jualoka Logo"
                        width={32}
                        height={32}
                        className="rounded-xl"
                    />
                    <span className="font-bold text-lg text-primary">Jualoka</span>
                </Link>

                {/* Nav links desktop */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTAs desktop */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/auth/login"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Masuk
                    </Link>
                    <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        Mulai Gratis
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* Hamburger button mobile */}
                <button
                    type="button"
                    onClick={() => setIsOpen((o) => !o)}
                    className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white/80 backdrop-blur-md border-t border-black/5 px-5 py-4 flex flex-col gap-3">
                    {NAV_LINKS.map((link) => (
                    <Link    
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                        {link.label}
                    </Link>
            ))}
            <div className="border-t border-border/50 pt-3 flex flex-col gap-2">
                <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                    Masuk
                </Link>
                <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                >
                    Mulai Gratis
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    )
}
        </nav >
    )
}