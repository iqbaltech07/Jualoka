const STATUS_CFG: Record<string, { label: string; cls: string }> = {
    baru: { label: "Baru", cls: "bg-blue-50 text-blue-600" },
    diproses: { label: "Diproses", cls: "bg-amber-50 text-amber-600" },
    dikirim: { label: "Dikirim", cls: "bg-purple-50 text-purple-600" },
    selesai: { label: "Selesai", cls: "bg-emerald-50 text-emerald-600" },
}

export function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_CFG[status] ?? { label: status, cls: "bg-muted text-muted-foreground" }
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

