import TestimonialsCarousel from "@/components/landing/testimonials-carousel";

const stats = [
  { value: "9", label: "meses de programa completo" },
  { value: "6-8", label: "productos desplegados" },
  { value: "3", label: "ciclos trimestrales" },
  { value: "5", label: "agentes IA especializados" },
];

export default function SocialProof() {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        <div data-aos="fade-up">
          <TestimonialsCarousel />
        </div>
      </div>
    </section>
  );
}
