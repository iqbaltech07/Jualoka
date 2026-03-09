export type OnboardingData = {
    category?: string
    storeName?: string
    slug?: string
    whatsapp?: string
    banner?: object
}

const ONBOARDING_KEY = "jualoka_onboarding"

export function getOnboardingData(): OnboardingData {
    try {
        const stored = localStorage.getItem(ONBOARDING_KEY)
        return stored ? (JSON.parse(stored) as OnboardingData) : {}
    } catch {
        return {}
    }
}

export function saveOnboardingData(data: Partial<OnboardingData>): void {
    const current = getOnboardingData()
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ ...current, ...data }))
}

export function clearOnboardingData(): void {
    localStorage.removeItem(ONBOARDING_KEY)
}

export function getOnboardingStep(): number {
    const data = getOnboardingData()
    if (!data.category) return 1
    if (!data.storeName || !data.slug || !data.whatsapp) return 2
    if (!data.banner) return 3
    return 4 // selesai
}
