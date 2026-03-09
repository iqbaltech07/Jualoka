import {
    UtensilsCrossed,
    Coffee,
    Shirt,
    Palette,
    Sparkles,
    type LucideIcon,
} from "lucide-react"

export type StoreCategory = "Makanan" | "Minuman" | "Fashion" | "Kerajinan" | "Kecantikan"

export const STORE_CATEGORIES: StoreCategory[] = [
    "Makanan",
    "Minuman",
    "Fashion",
    "Kerajinan",
    "Kecantikan",
]

export const CATEGORY_ICONS: Record<StoreCategory, LucideIcon> = {
    Makanan: UtensilsCrossed,
    Minuman: Coffee,
    Fashion: Shirt,
    Kerajinan: Palette,
    Kecantikan: Sparkles,
}

export const CATEGORY_COLORS: Record<StoreCategory, string> = {
    Makanan: "from-orange-400 to-rose-500",
    Minuman: "from-amber-400 to-orange-500",
    Fashion: "from-purple-400 to-indigo-500",
    Kerajinan: "from-emerald-400 to-teal-500",
    Kecantikan: "from-pink-400 to-rose-500",
}
