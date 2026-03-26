"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "¿Qué es Umbral exactamente?",
    answer:
      "Umbral es una plataforma de aprendizaje comprehension-first. A diferencia de cursos tradicionales, aprendes construyendo productos reales con IA — y un sistema de agentes verifica que entiendas lo que construiste a través de 4 dimensiones: Build, Explain, Debug y Transfer.",
  },
  {
    question: "¿Qué es AI TechProducts?",
    answer:
      "AI TechProducts es el programa estructurado que corre sobre Umbral. En 3 meses construyes productos de IA con complejidad creciente. Cada producto pasa por un ciclo de 4 semanas: Ideación → Desarrollo → Refinamiento → Demo Day. Umbral es el motor; AI TechProducts es la experiencia.",
  },
  {
    question: "¿El programa penaliza el uso de IA?",
    answer:
      "No. Puedes usar CUALQUIER herramienta de IA — ChatGPT, Copilot, Claude, Cursor, lo que quieras. La IA es clave para construir. La diferencia es que debes demostrar comprensión: explicar por qué funciona, debuggear sin IA, y transferir el patrón a otro dominio.",
  },
  {
    question: "¿Cuánto dura el programa?",
    answer:
      "Cada ciclo dura 3 meses (12 semanas). Cada producto tiene un ciclo de 4 semanas con sesión grupal semanal. El framework completo del programa junto a Umbral contempla 3 ciclos trimestrales (9 meses) con 6-8 productos desplegados.",
  },
  {
    question: "¿Qué obtengo al finalizar?",
    answer:
      "Mínimo 3 productos desplegados con usuarios reales, un perfil de comprensión detallado que evoluciona entre proyectos, y un portafolio que resiste cualquier entrevista técnica porque puedes defender cada decisión.",
  },
  {
    question: "¿Cómo mide Umbral la comprensión?",
    answer:
      "A través de 4 dimensiones: Build (¿funciona?), Explain (¿puedes explicar por qué?), Debug (¿puedes arreglarlo sin IA?), y Transfer (¿puedes aplicarlo en otro contexto?). Nuestros agentes te hacen preguntas continuamente y tu perfil se actualiza con cada producto.",
  },
  {
    question: "¿Puedo usar Umbral sin estar en el programa AI TechProducts?",
    answer:
      "Sí. Umbral puede aportar mucho valor al usarse como plataforma que te ayude a consolidar o construir productos que siempre quisiste hacer. Siempre fundamentando tu comprensión de sus componentes.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full py-16 md:py-20 px-6 flex justify-center bg-white border-t border-zinc-100">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-16">
        {/* FAQ Intro — left 1/3 */}
        <div className="w-full md:w-1/3 flex flex-col items-start gap-6" data-aos="fade-up">
          <span className="bg-zinc-100 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900">
            Preguntas <span className="italic text-zinc-500">Frecuentes</span>
          </h2>

          <div className="mt-8 pt-8 border-t border-zinc-100 w-full">
            <p className="text-xs text-zinc-500 font-normal mb-1">Email</p>
            <a href="mailto:hello@aiplaygrounds.org" className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
              hello@aiplaygrounds.org
            </a>
          </div>
        </div>

        {/* FAQ Items — right 2/3 */}
        <div className="w-full md:w-2/3 flex flex-col gap-2" data-aos="fade-up" data-aos-delay="100">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 transition-colors rounded-2xl p-6 cursor-pointer flex items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="text-base font-medium text-zinc-900 pr-4">{faq.question}</span>
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  {openIndex === i ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-4 pt-2 text-sm font-normal text-zinc-500 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
