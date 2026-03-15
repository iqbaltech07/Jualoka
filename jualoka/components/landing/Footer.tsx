"use client"

import Link from "next/link"
import Image from "next/image"

const NAV_LINKS = [
    { href: "#fitur", label: "Fitur" },
    { href: "#cara-kerja", label: "Cara Kerja" },
    { href: "#testimoni", label: "Testimoni" },
    { href: "/auth/login", label: "Login Admin", isRoute: true },
]

export default function Footer() {
    return (
    <footer className="bg-[#0f1f14] text-white/60 py-12">
        <div className="max-w-6xl mx-auto px-5">
            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between md:gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/logo.svg"
                        alt="Jualoka Logo"
                        width={32}
                        height={32}
                        className="rounded-xl"
                    />
                    <span className="font-bold text-lg text-white">Jualoka</span>
                </div>

                {/* Links */}
                <div className="flex flex-col items-center gap-3 md:flex-row md:flex-wrap md:gap-x-8 md:gap-y-2 text-sm">
                    {NAV_LINKS.map((link) =>
                        link.isRoute ? (
                            <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                                {link.label}
                            </Link>
                        ) : (
                            <a key={link.href} href={link.href} className="hover:text-white transition-colors">
                                {link.label}
                            </a>
                        )
                    )}
                </div>

                {/* Copyright */}
                <p className="text-xs text-center md:text-right">
                    © 2026 Jualoka. Dibuat untuk UMKM Indonesia 🇮🇩
                </p>
            </div>
        </div>
    </footer>
)
}