"use client";

import { useEffect, useRef } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Hans Figueroa",
    role: "Steve Jobs de Zarate",
    quote:
      "Umbral me ayudó a organizar mi primer proyecto de NLP desde cero. El asistente de IA me guió paso a paso y ahora tengo un chatbot desplegado en producción.",
    avatar: "HF",
  },
  {
    name: "Kevin Huaman",
    role: "El Hechicero del Backend",
    quote:
      "Lo mejor es el repositorio de aprendizajes. Antes perdía mis notas en docs sueltos, ahora todo está conectado a mis proyectos y puedo revisarlo cuando quiera.",
    avatar: "KH",
  },
  {
    name: "Max Veramendi",
    role: "JAVA y Bombero Man",
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

  const items = [...testimonials, ...testimonials];

  return (
    <div
      className="relative overflow-hidden mask-edges"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div ref={trackRef} className="flex gap-6 w-max py-4">
        {items.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="w-[350px] shrink-0 bg-zinc-800/50 border border-zinc-700 rounded-3xl p-8 flex flex-col gap-6"
          >
            <Quote className="w-6 h-6 text-zinc-500" />
            <p className="text-sm font-normal leading-relaxed text-zinc-300 flex-grow">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
