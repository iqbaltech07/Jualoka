"use client"

import { Sparkles, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

interface AiInsightCardProps {
    aiInsight: string
    isAiLoading: boolean
    onGenerate: () => void
}

export function AiInsightCard({ aiInsight, isAiLoading, onGenerate }: AiInsightCardProps) {
    return (
        <div className="rounded-2xl overflow-hidden border border-violet-200/60 shadow-lg shadow-violet-500/5">
            <div className="bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Gemini AI Insight</h2>
                        <p className="text-[11px] text-white/70">Analisis cerdas berdasarkan data toko Anda</p>
                    </div>
                </div>
                {!aiInsight && !isAiLoading && (
                    <Button 
                        onClick={onGenerate}
                        size="sm"
                        className="bg-white text-violet-700 hover:bg-violet-50 font-bold rounded-xl text-xs h-8 px-4 shadow-none transition-all"
                    >
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        Hasilkan
                    </Button>
                )}
            </div>

            <div className="bg-white px-6 py-5">
                {isAiLoading ? (
                    <div className="flex items-center gap-3 py-2 text-sm text-violet-600">
                        <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                        <span className="font-medium">Gemini sedang menganalisis data bisnis Anda…</span>
                    </div>
                ) : aiInsight ? (
                    <div className="prose prose-sm prose-zinc max-w-none
                        prose-p:text-zinc-600 prose-p:leading-relaxed
                        prose-strong:text-violet-700
                        prose-headings:text-zinc-900 prose-headings:font-bold
                        prose-li:text-zinc-600 prose-li:py-0.5"
                    >
                        <ReactMarkdown>{aiInsight}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-400 py-1">
                        Klik <span className="font-semibold text-violet-600">Hasilkan</span> untuk mendapatkan ringkasan kondisi bisnis beserta saran tindakan dari AI.
                    </p>
                )}
            </div>
        </div>
    )
}
