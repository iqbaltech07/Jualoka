import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import CtaSection from "@/components/landing/CtaSection"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <CtaSection />
            <Footer />
        </div>
    )
}