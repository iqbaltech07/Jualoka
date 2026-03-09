"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, AlertCircle, CheckCircle2, RotateCcw, ShieldCheck } from "lucide-react"
import { saveAuthUser } from "@/components/localStorage/AuthStorage"

type PendingRegister = {
    name: string
    email: string
    password: string
    otp: string
}

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export default function VerifyOtpPage() {
    const router = useRouter()
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
    const [resendOtp, setResendOtp] = useState<string | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return
        const id = setInterval(() => setCountdown((c) => c - 1), 1000)
        return () => clearInterval(id)
    }, [countdown])

    const handleInput = useCallback(
        (index: number, value: string) => {
            if (!/^\d*$/.test(value)) return // only digits
            const char = value.slice(-1) // take last char (handles paste on single box)
            const newDigits = [...digits]
            newDigits[index] = char
            setDigits(newDigits)
            setError(null)
            setResendOtp(null)

            // Move focus forward
            if (char && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus()
            }
        },
        [digits]
    )

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace" && !digits[index] && index > 0) {
                inputRefs.current[index - 1]?.focus()
            }
        },
        [digits]
    )

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
            if (!pasted) return
            const newDigits = Array(OTP_LENGTH).fill("")
            pasted.split("").forEach((ch, i) => { newDigits[i] = ch })
            setDigits(newDigits)
            setError(null)
            // Focus last filled or next
            const next = Math.min(pasted.length, OTP_LENGTH - 1)
            inputRefs.current[next]?.focus()
        },
        []
    )

    async function handleVerify() {
        const code = digits.join("")
        if (code.length < OTP_LENGTH) {
            setError("Masukkan 6 digit kode OTP terlebih dahulu.")
            return
        }

        setIsVerifying(true)
        await new Promise((r) => setTimeout(r, 600))

        const raw = localStorage.getItem("jualoka_pending_register")
        if (!raw) {
            setError("Data registrasi tidak ditemukan. Silakan daftar ulang.")
            setIsVerifying(false)
            return
        }

        const pending: PendingRegister = JSON.parse(raw)
        if (code !== pending.otp) {
            setError("Kode OTP salah. Periksa kembali atau kirim ulang.")
            setIsVerifying(false)
            // Shake animation
            inputRefs.current[0]?.focus()
            return
        }

        // OTP benar → simpan user
        saveAuthUser({
            email: pending.email,
            name: pending.name,
            token: `token-${Date.now()}`,
        })
        localStorage.removeItem("jualoka_pending_register")
        setSuccess(true)
        setIsVerifying(false)

        await new Promise((r) => setTimeout(r, 1000))
        router.push("/onboarding/category")
    }

    function handleResend() {
        const raw = localStorage.getItem("jualoka_pending_register")
        if (!raw) return
        const pending: PendingRegister = JSON.parse(raw)
        const newOtp = generateOTP()
        pending.otp = newOtp
        localStorage.setItem("jualoka_pending_register", JSON.stringify(pending))
        setResendOtp(newOtp)
        setCountdown(RESEND_COOLDOWN)
        setDigits(Array(OTP_LENGTH).fill(""))
        setError(null)
        inputRefs.current[0]?.focus()
    }

    const pending: PendingRegister | null = (() => {
        try {
            const raw = localStorage.getItem("jualoka_pending_register")
            return raw ? JSON.parse(raw) : null
        } catch { return null }
    })()

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden">

                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Kembali ke Daftar
                    </Link>

                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold">Verifikasi OTP</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {pending
                            ? <>Masukkan kode OTP yang ditampilkan setelah Anda submit form registrasi untuk <strong>{pending.email}</strong>.</>
                            : "Masukkan kode OTP 6 digit dari simulasi."}
                    </p>
                </div>

                <div className="px-6 pb-6 pt-4 flex flex-col gap-5">

                    {/* Resend OTP display */}
                    {resendOtp && (
                        <div className="bg-gradient-to-r from-primary/8 to-primary/5 border-2 border-primary/20 rounded-2xl p-4 text-center">
                            <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-1">Kode OTP Simulasi (Baru)</p>
                            <p className="text-3xl font-black tracking-[0.3em] text-primary">{resendOtp}</p>
                        </div>
                    )}

                    {/* 6 OTP Inputs */}
                    <div>
                        <div className="flex items-center gap-2 justify-center" onPaste={handlePaste}>
                            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el }}
                                    id={`otp-${i}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digits[i]}
                                    onChange={(e) => handleInput(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    aria-label={`Digit OTP ke-${i + 1}`}
                                    className={`h-14 w-12 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-150 focus:ring-2 ${error ? "border-destructive focus:ring-destructive/20 bg-destructive/5" : success ? "border-primary bg-primary/5 focus:ring-primary/20" : digits[i] ? "border-primary bg-primary/5 focus:ring-primary/20" : "border-border focus:border-primary focus:ring-primary/20 bg-white"}`}
                                />
                            ))}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 mt-3 text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="flex items-center gap-2 mt-3 text-primary">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <p className="text-sm font-semibold">OTP benar! Mengarahkan ke onboarding…</p>
                            </div>
                        )}
                    </div>

                    {/* Verify button */}
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || success || digits.join("").length < OTP_LENGTH}
                        className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isVerifying ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Memverifikasi...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" /> Terverifikasi!
                            </>
                        ) : (
                            "Verifikasi OTP"
                        )}
                    </button>

                    {/* Resend */}
                    <div className="text-center">
                        {countdown > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Kirim ulang OTP dalam{" "}
                                <span className="font-semibold text-foreground tabular-nums">
                                    {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
                                </span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Kirim ulang OTP
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
