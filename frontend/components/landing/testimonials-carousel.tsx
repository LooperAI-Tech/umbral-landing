"use client";

import { useEffect, useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Hans Figueroa",
    role: "Data Engineer",
    quote:
      "Umbral me ayudó a organizar mi primer proyecto de NLP desde cero. El asistente de IA me guió paso a paso y ahora tengo un chatbot desplegado en producción.",
    avatar: "HF",
  },
  {
    name: "Kevin Huaman",
    role: "Data Scientist y Founder",
    quote:
      "Lo mejor es el repositorio de aprendizajes. Antes perdía mis notas en docs sueltos, ahora todo está conectado a mis proyectos y puedo revisarlo cuando quiera.",
    avatar: "KH",
  },
  {
    name: "Edhu Nuñez",
    role: "CTO y Tech Founder",
    quote:
      "La comunidad AI PlayGrounds es increíble. Construir proyectos reales mientras aprendes es mucho más efectivo que solo ver tutoriales. Umbral hace que todo fluya.",
    avatar: "EN",
  },
  {
    name: "Max Veramendi",
    role: "Systems Engineer",
    quote:
      "En dos semanas pasé de tener solo una idea a tener un MVP desplegado con métricas. El sistema de hitos y tareas te mantiene enfocado sin sentirte abrumado.",
    avatar: "MV",
  },
  {
    name: "Edith Canelo",
    role: "Data Analyst",
    quote:
      "No soy técnica pero quería entender IA. Con Umbral pude crear mi propio proyecto de computer vision con la guía del asistente. Ahora entiendo lo que construye mi equipo.",
    avatar: "EC",
  },
];

export default function TestimonialsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const positionRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationId: number;
    const speed = 0.5;

    function animate() {
      if (!pausedRef.current) {
        positionRef.current -= speed;
        const halfWidth = track!.scrollWidth / 2;
        if (Math.abs(positionRef.current) >= halfWidth) {
          positionRef.current = 0;
        }
        track!.style.transform = `translateX(${positionRef.current}px)`;
      }
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Duplicate items for seamless loop
  const items = [...testimonials, ...testimonials];

  return (
    <section className="py-20 border-t border-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="font-mono text-sm text-brand-skyblue mb-2 tracking-wider uppercase">
            Testimonios
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Lo que dicen nuestros builders
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Personas reales construyendo proyectos reales con Umbral.
          </p>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div ref={trackRef} className="flex gap-6 w-max">
          {items.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="w-[350px] shrink-0 bg-card border border-border rounded-lg p-6 transition-all hover:border-brand-skyblue/30 hover:shadow-[var(--shadow-glow)]"
            >
              <Quote className="w-5 h-5 text-brand-skyblue/40 mb-3" />
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[image:var(--gradient-brand)] flex items-center justify-center text-xs font-bold text-white font-mono">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
