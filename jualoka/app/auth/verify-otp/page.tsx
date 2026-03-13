"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, RefreshCw, ChevronLeft, CheckCircle2, ArrowRight, Mail } from "lucide-react"
import { authClient } from "@/lib/auth-client"

const OTP_LENGTH = 6

function VerifyOtpPage() {
    const router = useRouter()
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
    const [email, setEmail] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const searchParams = useSearchParams()

    const otp = digits.join("")
    const isComplete = otp.length === OTP_LENGTH && digits.every(d => d !== "")

    useEffect(() => {
        const savedEmail = searchParams.get("email")
        if (savedEmail) {
            setEmail(savedEmail)
            // Focus the first box on mount
            setTimeout(() => inputRefs.current[0]?.focus(), 100)
        } else {
            router.push("/auth/register")
        }
    }, [router, searchParams])

    const handleDigitChange = useCallback((index: number, value: string) => {
        // Allow only single digit (numbers only)
        const cleaned = value.replace(/\D/g, "").slice(-1)
        setError("")

        const newDigits = [...digits]
        newDigits[index] = cleaned
        setDigits(newDigits)

        // Auto advance to next box
        if (cleaned && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }, [digits])

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                // Clear current
                const newDigits = [...digits]
                newDigits[index] = ""
                setDigits(newDigits)
            } else if (index > 0) {
                // Move to previous and clear it
                const newDigits = [...digits]
                newDigits[index - 1] = ""
                setDigits(newDigits)
                inputRefs.current[index - 1]?.focus()
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }, [digits])

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
        if (!pasted) return
        const newDigits = Array(OTP_LENGTH).fill("")
        pasted.split("").forEach((char, i) => { newDigits[i] = char })
        setDigits(newDigits)
        setError("")
        // Focus the last filled position
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
        inputRefs.current[focusIndex]?.focus()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email || !isComplete) return

        setIsLoading(true)
        setError("")
        setSuccessMessage("")

        try {
            const { error: verifyError } = await authClient.emailOtp.verifyEmail({ email, otp })

            if (verifyError) {
                setError(verifyError.message || "OTP tidak valid atau kadaluarsa.")
                // Shake and clear on error
                setDigits(Array(OTP_LENGTH).fill(""))
                setTimeout(() => inputRefs.current[0]?.focus(), 50)
                setIsLoading(false)
                return
            }

            setSuccessMessage("Verifikasi berhasil! Mengalihkan ke halaman login...")
            setTimeout(() => router.push("/auth/login"), 1500)

        } catch (err) {
            console.error("Verify OTP Error", err)
            setError("Terjadi kesalahan koneksi.")
            setIsLoading(false)
        }
    }

    async function handleResend() {
        if (!email) return
        setIsResending(true)
        setError("")
        setSuccessMessage("")
        setDigits(Array(OTP_LENGTH).fill(""))
        setTimeout(() => inputRefs.current[0]?.focus(), 50)

        try {
            const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "email-verification"
            })

            if (resendError) {
                setError(resendError.message || "Gagal mengirim ulang OTP.")
            } else {
                setSuccessMessage("OTP baru telah dikirim ke email Anda.")
            }
        } catch (err) {
            console.error("Resend OTP Error", err)
            setError("Terjadi kesalahan koneksi saat mengirim ulang.")
        }

        setIsResending(false)
    }

    if (!email) return null

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Kembali
                    </Link>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>

                    <h1 className="text-2xl font-bold">Verifikasi Email</h1>
                    <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                        Kami telah mengirim kode 6 digit ke{" "}
                        <span className="font-semibold text-foreground">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-5">
                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                        </div>
                    )}

                    {/* OTP Input — 6 individual digit boxes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Kode OTP</label>
                        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                            {digits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    disabled={isLoading || !!successMessage}
                                    onChange={(e) => handleDigitChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onFocus={(e) => e.target.select()}
                                    className={`
                                        w-full aspect-square max-w-[52px] text-center text-xl font-bold rounded-xl border-2
                                        outline-none transition-all duration-150 caret-transparent
                                        ${digit
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-border bg-white text-foreground"
                                        }
                                        focus:border-primary focus:ring-4 focus:ring-primary/15
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Masukkan kode dari email. Berlaku selama 10 menit.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !isComplete || !!successMessage}
                        className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Memverifikasi...
                            </>
                        ) : (
                            <>
                                Verifikasi Email
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>

                    {/* Resend */}
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Tidak menerima kode?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="font-semibold text-primary hover:underline disabled:opacity-60 disabled:no-underline inline-flex items-center gap-1"
                            >
                                {isResending && <RefreshCw className="h-3 w-3 animate-spin" />}
                                Kirim Ulang
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function VerifyOtpPageWrapper() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpPage />
        </React.Suspense>
    )
}
