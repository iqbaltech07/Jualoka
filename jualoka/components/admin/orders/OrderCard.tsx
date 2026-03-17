"use client"

import { useState } from "react"
import {
    Phone,
    MessageCircle,
    ChevronDown,
    ArrowUpRight,
    CalendarDays,
} from "lucide-react"
import { type Order, type OrderStatus, formatDate, formatRp, initials, avatarColor } from "./ordersData"
import { StatusBadge } from "./StatusBadge"
import { StatusDropdown } from "./StatusDropdown"

export function OrderCard({
    order,
    onStatusChange,
}: {
    order: Order
    onStatusChange: (id: string, s: OrderStatus) => void
}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-start gap-4 p-5">
                {/* Avatar */}
                <div
                    className={`h-10 w-10 rounded-full bg-linear-to-br ${avatarColor(order.id)} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                    {initials(order.customer)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                            <p className="font-semibold text-sm">{order.customer || "Pembeli Tidak Diketahui"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" /> {order.phone || "Nomor tidak tersedia"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={order.status} />
                            <StatusDropdown
                                current={order.status}
                                onChange={(s) => onStatusChange(order.id, s)}
                            />
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-lg">
                            {order.orderNumber}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(order.date)}
                        </span>
                        <div className="flex flex-col items-end ml-auto">
                            {order.discountAmount > 0 && order.voucherCode && (
                                <span className="text-[10px] text-primary/80 font-semibold bg-primary/5 px-1.5 py-0.5 rounded flex items-center gap-1 mb-0.5">
                                    <span className="line-through text-muted-foreground/60 mr-1">{formatRp(order.total + order.discountAmount)}</span>
                                    Voucher: {order.voucherCode}
                                </span>
                            )}
                            <span className="text-sm font-bold text-primary">
                                {formatRp(order.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items (collapsed / expanded) */}
            <div className="border-t border-border/50">
                <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                    <span>
                        {order.items.length} item ·{" "}
                        {order.items.map((i) => i.name).join(", ").slice(0, 60)}
                        {order.items.map((i) => i.name).join(", ").length > 60 ? "…" : ""}
                    </span>
                    <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                    />
                </button>

                {expanded && (
                    <div className="px-5 pb-4 space-y-3">
                        {/* Items list */}
                        <div className="bg-muted/30 rounded-xl divide-y divide-border/50">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                                    <div>
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.qty} × {formatRp(item.price)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {formatRp(item.qty * item.price)}
                                    </span>
                                </div>
                            ))}
                            {order.discountAmount > 0 && order.voucherCode && (
                                <div className="flex items-center justify-between px-4 py-2.5 text-primary bg-primary/5 font-medium border-t border-border/50">
                                    <span className="text-sm flex flex-col">
                                        <span>Potongan Voucher</span>
                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{order.voucherCode}</span>
                                    </span>
                                    <span className="text-sm">- {formatRp(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between px-4 py-2.5 font-bold border-t border-border/50 bg-muted/20">
                                <span className="text-sm">Total Bayar</span>
                                <span className="text-sm text-primary">{formatRp(order.total)}</span>
                            </div>
                        </div>

                        {/* Note */}
                        {order.note && (
                            <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                                <span>📝</span>
                                <span>{order.note}</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <a
                                href={`https://wa.me/${(order.phone || "").replace(/\D/g, "")}?text=Halo ${encodeURIComponent(order.customer || "Kak")}, pesanan kamu ${order.orderNumber} sudah kami konfirmasi 🙏`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] rounded-xl px-4 py-2 transition-colors"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Hubungi via WhatsApp
                            </a>
                            <button
                                type="button"
                                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-white border border-border/60 rounded-xl px-4 py-2 transition-colors hover:bg-muted/30"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Detail
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
