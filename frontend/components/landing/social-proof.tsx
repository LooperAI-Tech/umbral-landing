import TestimonialsCarousel from "@/components/landing/testimonials-carousel";
import { socialProof } from "@/lib/content";

export default function SocialProof() {
  return (
    <section className="w-full py-16 md:py-20 bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center" data-aos="fade-up">
          <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {socialProof.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight max-w-2xl">
            {socialProof.heading} <span className="italic text-zinc-400">{socialProof.headingItalic}</span> {socialProof.headingSuffix}
          </h2>
        </div>

        {/* Testimonials */}
        <div data-aos="fade-up">
          <TestimonialsCarousel />
        </div>
      </div>
    </section>
  );
}
