import Link from "next/link"
import { Store } from "lucide-react"

const NAV_LINKS = [
    { href: "#fitur", label: "Fitur" },
    { href: "#cara-kerja", label: "Cara Kerja" },
    { href: "#testimoni", label: "Testimoni" },
    { href: "/admin", label: "Login Admin", isRoute: true },
]

export default function Footer() {
    return (
        <footer className="bg-[#0f1f14] text-white/60 py-12">
            <div className="max-w-6xl mx-auto px-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white">Jualoka</span>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
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
                        © 2025 Jualoka. Dibuat untuk UMKM Indonesia 🇮🇩
                    </p>
                </div>
            </div>
        </footer>
    )
}
