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
        {/* Stats row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14"
          data-aos="fade-up"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-card border border-border rounded-lg p-6"
            >
              <div className="text-3xl md:text-4xl font-bold font-mono text-brand-skyblue mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div data-aos="fade-up">
          <TestimonialsCarousel />
        </div>

        {/* Logo bar placeholder */}
        <div
          className="flex items-center justify-center gap-8 mt-14 opacity-50"
          data-aos="fade-up"
        >
          {/* TODO: Add real partner/ally logos when provided */}
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            AI PlayGrounds
          </span>
          <span className="text-border">|</span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            LooperTech
          </span>
        </div>
      </div>
    </section>
  );
}
