import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
    try {
        await verifyAuth(req)

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ message: "GEMINI_API_KEY is not configured on the server." }, { status: 500 })
        }

        const body = await req.json()
        const { data, period } = body

        if (!data) {
            return NextResponse.json({ message: "Analysis data is required for insights." }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
Anda adalah seorang asisten analitik bisnis ahli untuk UMKM kuliner/ritel.
Berikan ringkasan eksekutif dan insight yang sangat mudah dipahami, singkat, padat, dan "eye-catching". 
Tujuannya adalah membantu pemilik UMKM memahami performa bisnis dalam periode ${period} terakhir tanpa menggunakan bahasa teknis yang rumit.

Data Bisnis Saat Ini:
- Total Revenue: Rp ${data.overview.revenue.toLocaleString('id-ID')}
- Pertumbuhan Revenue: ${data.overview.revenueGrowth > 0 ? '+' : ''}${data.overview.revenueGrowth}% (dibanding periode sblmnya)
- Total Pesanan: ${data.overview.orders}
- Status Kesehatan Bisnis: ${data.overview.healthScore}/100 (${data.overview.healthStatus})
- Volume Item Terjual: ${data.performance.volume} porsi/item
- Rata-rata Nilai Pesanan (AOV): Rp ${data.performance.aov.toLocaleString('id-ID')}
- Total Pelanggan Unik: ${data.customers.total} (Repeat Rate: ${data.customers.repeatRate}%)
- Produk Terlaris Teratas: ${data.productAnalysis.top.map((p: any) => `${p.name} (${p.sold} terjual, ${p.status})`).join(', ')}
- Produk Paling Tidak Laku: ${data.productAnalysis.worst.map((p: any) => `${p.name} (${p.sold} terjual, ${p.status})`).join(', ')}

STRUKTUR JAWABAN (Gunakan Markdown tebal/miring/emoji secukupnya. JANGAN terlalu panjang):
1. **Ringkasan Kondisi Bisnis** (Maks 3 kalimat, bahas pertumbuhan revenue & kesehatan).
2. **Kinerja Produk** (Maks 3 kalimat, highlight produk paling laris dan saran singkat untuk produk kurang laku).
3. **Saran Aksi (Actionable Advice)** (Berikan 2 bullet point nasihat konkrit yang bisa dilakukan hari ini).
`

        const result = await model.generateContent(prompt)
        const text = result.response.text()

        return NextResponse.json({ insight: text }, { status: 200 })
    } catch (error: any) {
        console.error("AI Insight Error:", error)
        return NextResponse.json({ message: error.message || "Failed to generate AI insights." }, { status: 500 })
    }
}
