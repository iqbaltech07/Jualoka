import { Voucher } from "./generated/prisma"

export const REWARD_TIERS = [
    { name: "S", threshold: 5000000 },
    { name: "A", threshold: 2000000 },
    { name: "B", threshold: 500000 },
    { name: "C", threshold: 100000 },
]

export function getTierFromTotal(total: number): string | null {
    for (const tier of REWARD_TIERS) {
        if (total >= tier.threshold) return tier.name
    }
    return null
}

export function pickWeightedVoucher(vouchers: Voucher[]): Voucher | null {
    if (vouchers.length === 0) return null
    if (vouchers.length === 1) return vouchers[0]

    const totalWeight = vouchers.reduce((sum, v) => sum + (v.weight || 1), 0)
    let random = Math.random() * totalWeight
    
    for (const voucher of vouchers) {
        random -= (voucher.weight || 1)
        if (random <= 0) return voucher
    }
    
    return vouchers[0]
}

export const ANTI_SPAM_MIN_TOTAL = 10000
