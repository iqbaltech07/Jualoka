"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, Store, AlertCircle, ArrowRight, ChevronLeft, Info } from "lucide-react"
import { authClient } from "@/lib/auth-client"

type RegisterData = {
    name: string
    email: string
    password: string
}

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function RegisterPage() {
    const router = useRouter()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [otp, setOtp] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    function validate(): boolean {
        const newErrors: Record<string, string> = {}
        if (!name.trim()) newErrors.name = "Nama toko wajib diisi."
        if (!email) {
            newErrors.email = "Email wajib diisi."
        } else if (!validateEmail(email)) {
            newErrors.email = "Format email tidak valid."
        }
        if (!password) {
            newErrors.password = "Password wajib diisi."
        } else if (password.length < 8) {
            newErrors.password = "Password minimal 8 karakter."
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = "Konfirmasi password wajib diisi."
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Password tidak cocok."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        setIsLoading(true)
        setErrors({})

        try {
            const { error } = await authClient.signUp.email({
                email,
                password,
                name: name // Use store name as the user name for MVP
            })

            if (error) {
                setErrors({ email: error.message || "Registrasi gagal." })
                setIsLoading(false)
                return
            }

            // Send email verification OTP
            const otpRes = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "email-verification",
            })

            if (otpRes.error) {
                setErrors({ email: otpRes.error.message || "Gagal mengirim OTP." })
                setIsLoading(false)
                return
            }

            router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)

        } catch (error) {
            console.error("Register Error:", error)
            setErrors({ email: "Terjadi kesalahan koneksi." })
        }

        setIsLoading(false)
    }

    async function handleContinue() {
        router.push("/auth/verify-otp")
    }

    function clearField(field: string) {
        setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
    }

    const PasswordStrength = ({ pw }: { pw: string }) => {
        if (!pw) return null
        const strength = pw.length < 8 ? 1 : pw.length < 12 ? 2 : 3
        const labels = ["Lemah", "Cukup", "Kuat"]
        const colors = ["bg-destructive", "bg-secondary", "bg-primary"]
        return (
            <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? colors[strength - 1] : "bg-border"}`}
                        />
                    ))}
                </div>
                <span className={`text-[11px] font-semibold ${strength === 1 ? "text-destructive" : strength === 2 ? "text-secondary-foreground" : "text-primary"}`}>
                    {labels[strength - 1]}
                </span>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden">

                <div className="px-6 pt-6 pb-2">
                    <Link
                        href="/auth/login"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Kembali ke Login
                    </Link>
                    <h1 className="text-2xl font-bold">Buat Toko Baru</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Daftar gratis dan mulai berjualan di Jualoka hari ini.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 pt-4 flex flex-col gap-4">

                    {/* Nama Toko */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="name" className="text-sm font-medium">Nama Toko</label>
                        <div className="relative">
                            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="name"
                                type="text"
                                autoComplete="organization"
                                placeholder="Contoh: Toko Berkah UMKM"
                                value={name}
                                onChange={(e) => { setName(e.target.value); clearField("name") }}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "name-error" : undefined}
                                className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-2 ${errors.name ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"}`}
                            />
                        </div>
                        {errors.name && (
                            <p id="name-error" className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearField("email") }}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-2 ${errors.email ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"}`}
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
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Min. 8 karakter"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); clearField("password") }}
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? "password-error" : "password-strength"}
                                className={`w-full h-12 pl-10 pr-12 rounded-xl border bg-white text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-2 ${errors.password ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"}`}
                            />
                            <button type="button" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <div id="password-strength"><PasswordStrength pw={password} /></div>
                        {errors.password && (
                            <p id="password-error" className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Konfirmasi Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <input
                                id="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Ulangi password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); clearField("confirmPassword") }}
                                aria-invalid={!!errors.confirmPassword}
                                aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                                className={`w-full h-12 pl-10 pr-12 rounded-xl border bg-white text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground/50 focus:ring-2 ${errors.confirmPassword ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"}`}
                            />
                            <button type="button" onClick={() => setShowConfirm(s => !s)} aria-label="Toggle confirm password" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p id="confirm-error" className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
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
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            <>
                                Buat Toko
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        Sudah punya akun?{" "}
                        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}