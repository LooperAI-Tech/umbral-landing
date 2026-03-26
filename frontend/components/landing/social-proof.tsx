import TestimonialsCarousel from "@/components/landing/testimonials-carousel";

export default function SocialProof() {
  return (
    <section className="w-full py-16 md:py-20 bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center" data-aos="fade-up">
          <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            Comunidad
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight max-w-2xl">
            Personas que ya están <span className="italic text-zinc-400">construyendo</span> diferente.
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
