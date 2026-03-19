import { Star } from "lucide-react"
import {
    BannerConfig,
    THEME_GRADIENTS,
} from "@/lib/bannerStore"

export function BannerPreview({ config }: { config: BannerConfig }) {
    let customStyle = {}
    let gradientClass = ""

    if (config.theme === "custom" && config.customGradient) {
        const startMatch = config.customGradient.match(/from-\[([^\]]+)\]/)
        const endMatch = config.customGradient.match(/to-\[([^\]]+)\]/)
        if (startMatch && endMatch) {
            customStyle = { backgroundImage: `linear-gradient(to bottom right, ${startMatch[1]}, ${endMatch[1]})` }
        } else {
            gradientClass = `bg-gradient-to-br ${config.customGradient}`
        }
    } else {
        gradientClass = `bg-gradient-to-br ${THEME_GRADIENTS[config.theme] || THEME_GRADIENTS.blue}`
    }

    const titleLines = (config.title || "").split("\n")
    return (
        <div
            className={`relative rounded-2xl overflow-hidden ${gradientClass} p-5 sm:p-8 text-white shadow-lg min-h-[140px] flex items-center ${config.layout === "center" ? "justify-center text-center" : "justify-start text-left"}`}
            style={customStyle}
        >
            {config.imageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${config.imageUrl}')`,
                        opacity: config.imageOpacity / 100,
                    }}
                />
            )}
            <div className={`relative z-10 ${config.layout === "center" ? "max-w-lg" : "max-w-xl"}`}>
                {config.badge && (
                    <div className="inline-flex items-center gap-2 bg-[#fac023] text-[#1a1a1a] text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <Star className="h-3 w-3 fill-current" />
                        {config.badge}
                    </div>
                )}
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight mb-2 break-words">
                    {titleLines.map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < titleLines.length - 1 && <br />}
                        </span>
                    ))}
                </h2>
                {config.description && (
                    <p className="text-white/80 text-sm break-words">{config.description}</p>
                )}
            </div>
        </div>
    )
}
