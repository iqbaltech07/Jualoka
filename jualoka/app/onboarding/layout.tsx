import type { ReactNode } from "react"
import Link from "next/link"
import { Store } from "lucide-react"

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0faf4] via-white to-[#fffdf0] flex flex-col">
            {/* Top brand bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <Store className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-primary tracking-tight">Jualoka</span>
                </Link>
                <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
                    Setup Toko Baru
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center px-4 py-8">
                {children}
            </div>

            <div className="text-center py-4 text-xs text-muted-foreground/60">
                © 2026 Jualoka · Platform UMKM Indonesia
            </div>
        </div>
    )
}
