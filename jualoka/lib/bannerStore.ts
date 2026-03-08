/**
 * bannerStore.ts
 * Dummy in-memory store for banner configuration.
 * In production, this would be replaced with a real database / API integration.
 */

export type BannerTheme =
    | "green"
    | "blue"
    | "purple"
    | "orange"
    | "red"
    | "custom"

export type BannerLayout = "left" | "center"

export interface BannerConfig {
    /** Whether the banner is visible on the store page */
    enabled: boolean
    /** Small badge text above the title */
    badge: string
    /** Main headline */
    title: string
    /** Sub-description */
    description: string
    /** Color theme preset */
    theme: BannerTheme
    /** Custom gradient (used when theme === 'custom') */
    customGradient: string
    /** Background image URL (optional, leave empty to disable) */
    imageUrl: string
    /** Text alignment layout */
    layout: BannerLayout
    /** Overlay image opacity 0–100 */
    imageOpacity: number
}

const defaultBanner: BannerConfig = {
    enabled: true,
    badge: "Produk UMKM Pilihan",
    title: "Produk Segar & Lezat\nLangsung dari Dapur Kami",
    description:
        "Pesan sekarang dan dapatkan langsung via WhatsApp. Nikmati kelezatan khas UMKM lokal!",
    theme: "green",
    customGradient: "from-[#1a7035] to-[#2ea855]",
    imageUrl:
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop",
    layout: "left",
    imageOpacity: 10,
}

// Singleton mutable store (dummy — resets on page reload)
let _banner: BannerConfig = { ...defaultBanner }

export function getBannerConfig(): BannerConfig {
    return { ..._banner }
}

export function saveBannerConfig(config: BannerConfig): void {
    _banner = { ...config }
}

export function resetBannerConfig(): void {
    _banner = { ...defaultBanner }
}

// Preset gradient classes per theme
export const THEME_GRADIENTS: Record<BannerTheme, string> = {
    green: "from-[#1a7035] to-[#2ea855]",
    blue: "from-[#1e40af] to-[#3b82f6]",
    purple: "from-[#6d28d9] to-[#a78bfa]",
    orange: "from-[#c2410c] to-[#f97316]",
    red: "from-[#991b1b] to-[#ef4444]",
    custom: "",
}

export const THEME_COLORS: Record<BannerTheme, string> = {
    green: "#1a7035",
    blue: "#1e40af",
    purple: "#6d28d9",
    orange: "#c2410c",
    red: "#991b1b",
    custom: "#1a7035",
}

export const THEME_LABELS: Record<BannerTheme, string> = {
    green: "Hijau (Default)",
    blue: "Biru",
    purple: "Ungu",
    orange: "Oranye",
    red: "Merah",
    custom: "Custom Warna",
}
