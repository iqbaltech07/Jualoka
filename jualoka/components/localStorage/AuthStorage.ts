export type AuthUser = {
    email: string
    name: string
    token: string // dummy token untuk simulasi
}

const AUTH_KEY = "jualoka_user"
export const AUTH_COOKIE = "jualoka_auth"

export function getAuthUser(): AuthUser | null {
    try {
        const stored = localStorage.getItem(AUTH_KEY)
        return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
        return null
    }
}

export function saveAuthUser(user: AuthUser): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    // Simpan juga ke cookie agar middleware bisa baca
    document.cookie = `${AUTH_COOKIE}=${user.token}; path=/; max-age=604800; SameSite=Lax`
}

export function clearAuthUser(): void {
    localStorage.removeItem(AUTH_KEY)
    // Hapus cookie
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
    return getAuthUser() !== null
}
