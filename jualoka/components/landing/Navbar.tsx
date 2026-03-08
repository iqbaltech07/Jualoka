import Link from "next/link"
import { Store, ChevronRight } from "lucide-react"

const NAV_LINKS = [
    { href: "/toko", label: "Jelajahi Toko" },
    { href: "#fitur", label: "Fitur" },
    { href: "#cara-kerja", label: "Cara Kerja" },
    { href: "#testimoni", label: "Testimoni" },
]

export default function Navbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm">
            <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-5">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <Store className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-foreground">Jualoka</span>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    {NAV_LINKS.map((link) => (
                        <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Masuk
                    </Link>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                        Mulai Gratis
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </nav>
    )
}
