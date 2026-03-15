"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"

type Mode = "login" | "register"

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>("login")

    // Form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState("")

    function validate(): boolean {
        const newErrors: { email?: string; password?: string } = {}
        if (!email) {
            newErrors.email = "Email wajib diisi."
        } else if (!validateEmail(email)) {
            newErrors.email = "Format email tidak valid."
        }
        if (!password) {
            newErrors.password = "Password wajib diisi."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setServerError("")
        if (!validate()) return

        setIsLoading(true)

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password
            })

            if (error) {
                setServerError(error.message || "Email atau password salah.")
                setIsLoading(false)
                // NOTE: If they required verification, better-auth might return specific error code
                return
            }

            // Successfully logged in via better-auth
            // We need to fetch the store to determine redirect
            const storeRes = await fetch("/api/stores", { credentials: "include" })
            if (!storeRes.ok) {
                // If they have no store (which shouldn't happen with our hook, but fallback)
                router.push("/onboarding/category")
                return
            }

            const storeData = await storeRes.json()
            const store = storeData.store

            // Check if user has completed store onboarding (has category)
            if (store && !store.category) {
                router.push("/onboarding/category")
            } else if (!store) {
                router.push("/onboarding/category") // Fallback just in case
            } else {
                router.push("/admin")
            }
        } catch (error) {
            console.error("Login Error", error)
            setServerError("Terjadi kesalahan koneksi.")
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden">

                {/* Tab toggle */}
                {/* <div className="flex p-1.5 gap-1 bg-muted/60 m-5 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => handleModeSwitch("login")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === "login"
                            ? "bg-white shadow-sm text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Store className="h-4 w-4" />
                        Masuk ke toko saya
                    </button>
                    <button
                        type="button"
                        onClick={() => handleModeSwitch("register")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === "register"
                            ? "bg-white shadow-sm text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <UserPlus className="h-4 w-4" />
                        Buat toko baru
                    </button>
                </div> */}

                {/* Header */}
                <div className="px-6 pb-2 pt-6">
                    <h1 className="text-2xl font-bold text-foreground">Selamat datang kembali</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Masuk ke dashboard toko Anda untuk mulai berjualan.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 pt-4 flex flex-col gap-4">

                    {/* Server error */}
                    {serverError && (
                        <div className="flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-sm text-destructive">{serverError}</p>
                        </div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                                }}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-2 ${errors.email
                                    ? "border-destructive focus:ring-destructive/20"
                                    : "border-border focus:border-primary focus:ring-primary/20"
                                    }`}
                            />
                        </div>
                        {errors.email && (
                            <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <button
                                type="button"
                                className="text-xs text-primary hover:underline font-medium"
                                tabIndex={-1}
                            >
                                Lupa password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                                }}
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? "password-error" : undefined}
                                className={`w-full h-12 pl-10 pr-12 rounded-xl border bg-white text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-2 ${errors.password
                                    ? "border-destructive focus:ring-destructive/20"
                                    : "border-border focus:border-primary focus:ring-primary/20"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1 shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            <>
                                Masuk
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-4 py-1">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">atau</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Go to register */}
                    <p className="text-center text-sm text-muted-foreground">
                        Belum punya toko?{" "}
                        <Link
                            href="/auth/register"
                            className="text-primary font-semibold hover:underline"
                        >
                            Daftar gratis
                        </Link>
                    </p>
                </form>
            </div>

            {/* Trust note */}
            <p className="text-center text-xs text-muted-foreground/60 mt-5">
                🔒 Data Anda aman dan terenkripsi
            </p>
        </div>
    )
}
