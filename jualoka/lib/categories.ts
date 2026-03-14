import {
    UtensilsCrossed,
    Coffee,
    Shirt,
    Palette,
    Sparkles,
    ShoppingBag,
    Laptop,
    Wrench,
    MoreHorizontal,
    type LucideIcon,
} from "lucide-react"

export type StoreCategory = 
    | "Makanan & Minuman" 
    | "Fashion & Pakaian" 
    | "Kecantikan & Kesehatan"
    | "Kerajinan & Seni"
    | "Elektronik & Gadget"
    | "Jasa & Layanan"
    | "Lainnya"

export const STORE_CATEGORIES: StoreCategory[] = [
    "Makanan & Minuman",
    "Fashion & Pakaian",
    "Kecantikan & Kesehatan",
    "Kerajinan & Seni",
    "Elektronik & Gadget",
    "Jasa & Layanan",
    "Lainnya",
]

export const CATEGORY_ICONS: Record<StoreCategory, LucideIcon> = {
    "Makanan & Minuman": ShoppingBag,
    "Fashion & Pakaian": Shirt,
    "Kecantikan & Kesehatan": Sparkles,
    "Kerajinan & Seni": Palette,
    "Elektronik & Gadget": Laptop,
    "Jasa & Layanan": Wrench,
    "Lainnya": MoreHorizontal,
}

export const CATEGORY_COLORS: Record<StoreCategory, string> = {
    "Makanan & Minuman": "from-rose-400 to-red-500",
    "Fashion & Pakaian": "from-purple-400 to-indigo-500",
    "Kecantikan & Kesehatan": "from-pink-400 to-rose-500",
    "Kerajinan & Seni": "from-emerald-400 to-teal-500",
    "Elektronik & Gadget": "from-blue-400 to-cyan-500",
    "Jasa & Layanan": "from-slate-500 to-slate-700",
    "Lainnya": "from-gray-400 to-gray-500",
}
