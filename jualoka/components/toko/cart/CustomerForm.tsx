"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface CustomerFormProps {
    form: { name: string; whatsapp: string }
    onChange: (field: string, value: string) => void
    waError: string
}

export function CustomerForm({ form, onChange, waError }: CustomerFormProps) {
    return (
        <div className="space-y-4 pt-5 border-t border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Pembeli</h3>
            <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nama Lengkap *</Label>
                <Input
                    id="name"
                    placeholder="Budi Santoso"
                    className="h-10 rounded-xl text-sm"
                    required
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="wa" className="text-xs">Nomor WhatsApp *</Label>
                <Input
                    id="wa"
                    type="tel"
                    inputMode="numeric"
                    placeholder="08123456789"
                    className={`h-10 rounded-xl text-sm ${waError ? "border-destructive focus:ring-destructive/20" : ""}`}
                    required
                    value={form.whatsapp}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "")
                        onChange("whatsapp", val)
                    }}
                />
                {waError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {waError}
                    </p>
                )}
            </div>
        </div>
    )
}
