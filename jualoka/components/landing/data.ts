import {
    Store,
    ShoppingCart,
    BarChart3,
    Package,
    TrendingUp,
    Zap,
    type LucideIcon,
} from "lucide-react"

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export type Feature = {
    icon: LucideIcon
    title: string
    desc: string
    color: string
    border: string
}

export type Step = {
    num: string
    title: string
    desc: string
}

export type Testimonial = {
    name: string
    role: string
    avatar: string
    color: string
    quote: string
    stars: number
}

// --------------------------------------------------------------------------
// Data
// --------------------------------------------------------------------------

export const FEATURES: Feature[] = [
    {
        icon: Store,
        title: "Toko Online Instan",
        desc: "Buat halaman toko dengan URL unik dalam hitungan menit. Tak perlu skill teknis.",
        color: "bg-emerald-50 text-emerald-600",
        border: "border-emerald-100",
    },
    {
        icon: ShoppingCart,
        title: "Pesanan via WhatsApp",
        desc: "Pelanggan checkout langsung ke WhatsApp Anda. Sederhana, cepat, dan tanpa aplikasi tambahan.",
        color: "bg-amber-50 text-amber-600",
        border: "border-amber-100",
    },
    {
        icon: BarChart3,
        title: "Analitik Produk Otomatis",
        desc: "Sistem mencatat setiap penjualan dan menampilkan mana produk yang laris dan mana yang perlu dipertimbangkan.",
        color: "bg-blue-50 text-blue-600",
        border: "border-blue-100",
    },
    {
        icon: Package,
        title: "Manajemen Stok",
        desc: "Pantau stok produk Anda secara real-time agar tidak kehabisan di saat yang paling dibutuhkan.",
        color: "bg-purple-50 text-purple-600",
        border: "border-purple-100",
    },
    {
        icon: TrendingUp,
        title: "Keputusan Berbasis Data",
        desc: "Ketahui produk mana yang layak diproduksi lebih banyak berdasarkan data penjualan nyata.",
        color: "bg-rose-50 text-rose-600",
        border: "border-rose-100",
    },
    {
        icon: Zap,
        title: "Mudah & Cepat",
        desc: "Antarmuka yang sederhana dan ramah pengguna, dirancang khusus untuk pemilik UMKM non-teknis.",
        color: "bg-orange-50 text-orange-600",
        border: "border-orange-100",
    },
]

export const STEPS: Step[] = [
    {
        num: "01",
        title: "Buat Akun & Setup Toko",
        desc: "Daftarkan toko Anda, isi nama, nomor WhatsApp, dan URL toko unik Anda.",
    },
    {
        num: "02",
        title: "Upload Produk",
        desc: "Tambahkan foto, nama, harga, dan deskripsi produk dengan mudah dalam beberapa klik.",
    },
    {
        num: "03",
        title: "Bagikan Link Toko",
        desc: "Share link toko Anda ke media sosial atau WhatsApp. Pelanggan langsung bisa melihat katalog.",
    },
    {
        num: "04",
        title: "Terima Pesanan & Analisis",
        desc: "Pesanan masuk otomatis, dan Anda bisa memantau performa produk dari dashboard.",
    },
]

export const TESTIMONIALS: Testimonial[] = [
    {
        name: "Siti Rahayu",
        role: "Pemilik Toko Kue Rumahan",
        avatar: "S",
        color: "from-pink-400 to-rose-500",
        quote:
            "Dulu saya bingung produk mana yang paling laku. Sekarang dengan Jualoka, saya bisa fokus produksi yang benar-benar dipesan pelanggan.",
        stars: 5,
    },
    {
        name: "Budi Santoso",
        role: "Pengusaha Keripik UMKM",
        avatar: "B",
        color: "from-blue-400 to-indigo-500",
        quote:
            "Link toko saya viral di grup WhatsApp. Pesanan meningkat 3x lipat sejak pakai Jualoka. Setup-nya gampang banget!",
        stars: 5,
    },
    {
        name: "Ahmad Fauzi",
        role: "Penjual Minuman Botolan",
        avatar: "A",
        color: "from-emerald-400 to-teal-500",
        quote:
            "Fitur analitik produknya sangat membantu. Saya tahu persis mana yang laris dan mana yang harus dikurangi produksinya.",
        stars: 5,
    },
]
