"use client"

import { useState } from "react"
import { Store, Image } from "lucide-react"
import { BannerTab } from "@/components/admin/settings/BannerTab"
import { StoreInfoTab } from "@/components/admin/settings/StoreInfoTab"

type Tab = "info" | "banner"

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "info", label: "Informasi Toko", icon: Store },
    { id: "banner", label: "Kustomisasi Banner", icon: Image },
]

export default function StoreSettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("info")

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Pengaturan Toko</h1>
                <p className="text-muted-foreground text-sm mt-1">Kelola informasi, tampilan, dan profil toko Anda.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/60 rounded-2xl p-1 w-fit">
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === "info" ? <StoreInfoTab /> : <BannerTab />}
        </div>
    )
}
