"use client"

import { MessageCircle, AlertCircle, Ticket } from "lucide-react"
import { CartItem as CartItemType } from "@/lib/cartApi"
import { Voucher } from "@/lib/voucherStore"
import { CustomerForm } from "./CustomerForm"
import { VoucherSection } from "./VoucherSection"

interface OrderSummaryProps {
    items: CartItemType[]
    total: number
    appliedVoucher: Voucher | null
    finalTotal: number
    form: { name: string; whatsapp: string }
    onFormChange: (field: string, value: string) => void
    waError: string
    voucherCode: string
    setVoucherCode: (code: string) => void
    voucherError: string
    voucherApplying: boolean
    handleApplyVoucher: () => Promise<void>
    handleRemoveVoucher: () => void
    checkoutError: string
    isLoading: boolean
    hasVouchers: boolean
    handleCheckout: (e: React.FormEvent) => void
}

export function OrderSummary({
    items,
    total,
    appliedVoucher,
    finalTotal,
    form,
    onFormChange,
    waError,
    voucherCode,
    setVoucherCode,
    voucherError,
    voucherApplying,
    handleApplyVoucher,
    handleRemoveVoucher,
    checkoutError,
    isLoading,
    hasVouchers,
    handleCheckout
}: OrderSummaryProps) {
    const isWhatsappValid = form.whatsapp.length >= 12

    return (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden sticky top-24">
            <div className="px-6 py-5 bg-linear-to-r from-primary/5 to-primary/10 border-b border-border/50">
                <h2 className="text-base font-semibold">Ringkasan Pesanan</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
                {items.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate pr-2">{it.name} ×{it.quantity}</span>
                        <span className="font-medium shrink-0">Rp {(it.price * it.quantity).toLocaleString("id-ID")}</span>
                    </div>
                ))}
                {appliedVoucher && (
                    <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 flex items-center gap-1.5">
                            <Ticket className="h-3.5 w-3.5" />
                            Diskon ({appliedVoucher.code})
                        </span>
                        <span className="font-medium text-emerald-600">-Rp {appliedVoucher.discount.toLocaleString("id-ID")}</span>
                    </div>
                )}
                <div className="border-t border-border/50 pt-3 mt-1">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <div className="text-right">
                            {appliedVoucher && (
                                <span className="text-xs text-muted-foreground line-through block">Rp {total.toLocaleString("id-ID")}</span>
                            )}
                            <span className="text-xl font-bold text-primary">Rp {finalTotal.toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </div>
            </div>

            <form id="checkout" onSubmit={handleCheckout} className="px-6 pb-6 space-y-4 border-t border-border/50 pt-5">
                <CustomerForm form={form} onChange={onFormChange} waError={waError} />
                <VoucherSection
                    voucherCode={voucherCode}
                    setVoucherCode={setVoucherCode}
                    appliedVoucher={appliedVoucher}
                    voucherError={voucherError}
                    voucherApplying={voucherApplying}
                    handleApplyVoucher={handleApplyVoucher}
                    handleRemoveVoucher={handleRemoveVoucher}
                    isWhatsappValid={isWhatsappValid}
                    hasVouchers={hasVouchers}
                />
            </form>

            <div className="px-6 pb-6">
                {checkoutError && (
                    <div className="mb-3 flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-sm text-destructive">{checkoutError}</p>
                    </div>
                )}
                <button 
                    form="checkout" 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20b858] text-white font-semibold h-12 rounded-xl transition-colors shadow-sm text-sm disabled:opacity-50"
                >
                    <MessageCircle className="h-5 w-5" />
                    {isLoading ? "Memproses..." : "Pesan via WhatsApp"}
                </button>
            </div>
        </div>
    )
}
