"use client"

export type Voucher = {
    id: string
    code: string        // 6-char alphanumeric
    discount: number    // nominal diskon (Rp)
    minTransaction: number
    stock: number       // berapa kali bisa di-redeem
}

const STORAGE_KEY = "jualoka_vouchers"

function generateId(): string {
    return crypto.randomUUID()
}

export function generateCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no ambiguous chars
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export function getVouchers(): Voucher[] {
    if (typeof window === "undefined") return []
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

function saveVouchers(vouchers: Voucher[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers))
}

export function addVoucher(partial?: Partial<Omit<Voucher, "id" | "code">>): Voucher {
    const voucher: Voucher = {
        id: generateId(),
        code: generateCode(),
        discount: partial?.discount ?? 0,
        minTransaction: partial?.minTransaction ?? 0,
        stock: partial?.stock ?? 1,
    }
    const vouchers = getVouchers()
    vouchers.push(voucher)
    saveVouchers(vouchers)
    return voucher
}

export function updateVoucher(id: string, updates: Partial<Pick<Voucher, "discount" | "minTransaction" | "stock">>): Voucher | null {
    const vouchers = getVouchers()
    const idx = vouchers.findIndex(v => v.id === id)
    if (idx === -1) return null
    vouchers[idx] = { ...vouchers[idx], ...updates }
    saveVouchers(vouchers)
    return vouchers[idx]
}

export function deleteVoucher(id: string): boolean {
    const vouchers = getVouchers()
    const filtered = vouchers.filter(v => v.id !== id)
    if (filtered.length === vouchers.length) return false
    saveVouchers(filtered)
    return true
}

export function redeemVoucher(id: string): boolean {
    const vouchers = getVouchers()
    const idx = vouchers.findIndex(v => v.id === id)
    if (idx === -1 || vouchers[idx].stock <= 0) return false
    vouchers[idx].stock -= 1
    saveVouchers(vouchers)
    return true
}

export function findBestVoucher(total: number): Voucher | null {
    const vouchers = getVouchers()
    const eligible = vouchers
        .filter(v => v.stock > 0 && v.discount > 0 && total >= v.minTransaction)
        .sort((a, b) => b.discount - a.discount)
    return eligible.length > 0 ? eligible[0] : null
}

export function findVoucherByCode(code: string, total: number): { voucher: Voucher | null; error: string } {
    if (!code.trim()) return { voucher: null, error: "Masukkan kode voucher." }
    const vouchers = getVouchers()
    const found = vouchers.find(v => v.code.toUpperCase() === code.trim().toUpperCase())
    if (!found) return { voucher: null, error: "Kode voucher tidak ditemukan." }
    if (found.stock <= 0) return { voucher: null, error: "Voucher sudah habis digunakan." }
    if (total < found.minTransaction) return { voucher: null, error: `Minimum belanja Rp ${found.minTransaction.toLocaleString("id-ID")} untuk voucher ini.` }
    return { voucher: found, error: "" }
}
