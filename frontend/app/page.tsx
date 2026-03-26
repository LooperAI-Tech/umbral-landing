import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Problem from "@/components/landing/problem";
import HowItWorks from "@/components/landing/how-it-works";
import Dimensions from "@/components/landing/dimensions";
import Audience from "@/components/landing/audience";
import SocialProof from "@/components/landing/social-proof";
import FAQ from "@/components/landing/faq";

import Footer from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col relative">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full">
        <Hero />
        <Problem />
        <HowItWorks />
        <Dimensions />
        <Audience />
        <SocialProof />
        <FAQ />

      </main>
      <Footer />
    </div>
  );
}
