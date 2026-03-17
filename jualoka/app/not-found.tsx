import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f8fafb] flex flex-col items-center justify-center px-4 text-center">
            <Image src="/logo.svg" alt="Jualoka" width={56} height={56} className="rounded-2xl mb-6" />
            <h1 className="text-6xl font-black text-primary mb-2">404</h1>
            <h2 className="text-xl font-bold mb-2">Halaman Tidak Ditemukan</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm">
                Halaman yang kamu cari tidak ada atau sudah dipindahkan.
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm text-sm"
            >
                Kembali ke Beranda
            </Link>
        </div>
    )
}