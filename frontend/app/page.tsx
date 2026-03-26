import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Problem from "@/components/landing/problem";
import HowItWorks from "@/components/landing/how-it-works";
import Dimensions from "@/components/landing/dimensions";
import Audience from "@/components/landing/audience";
import SocialProof from "@/components/landing/social-proof";
import FAQ from "@/components/landing/faq";
import FinalCTA from "@/components/landing/final-cta";
import Footer from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Dimensions />
        <Audience />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
