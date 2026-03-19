"use client";

import { useState } from "react";
import { FAQItem } from "@/components/ui/faq-item";

const faqs = [
  {
    question: "¿Qué es Umbral exactamente?",
    answer:
      "Umbral es una plataforma de aprendizaje comprehension-first. A diferencia de cursos tradicionales, aprendes construyendo productos reales con IA — y un sistema de agentes verifica que entiendas lo que construiste a través de 4 dimensiones: Build, Explain, Debug y Transfer.",
  },
  {
    question: "¿Qué es AI TechProducts?",
    answer:
      "AI TechProducts es el programa estructurado que corre sobre Umbral. En 3 meses construyes 3 productos de IA con complejidad creciente. Cada producto pasa por un ciclo de 4 semanas: Ideación → Desarrollo → Refinamiento → Demo Day. Umbral es el motor; AI TechProducts es la experiencia.",
  },
  {
    question: "¿El programa penaliza el uso de IA?",
    answer:
      "No. Puedes usar CUALQUIER herramienta de IA — ChatGPT, Copilot, Claude, Cursor, lo que quieras. La IA es bienvenida para construir. La diferencia es que debes demostrar comprensión: explicar por qué funciona, debuggear sin IA, y transferir el patrón a otro dominio.",
  },
  {
    question: "¿Cuánto dura el programa?",
    answer:
      "Cada ciclo dura 3 meses (12 semanas). Construyes 3 productos, uno por mes. Cada producto tiene un ciclo de 4 semanas con sesión grupal semanal obligatoria. El framework completo de Umbral contempla 3 ciclos trimestrales (9 meses) con 6-8 productos desplegados.",
  },
  {
    question: "¿Qué obtengo al finalizar?",
    answer:
      "Mínimo 3 productos desplegados con usuarios reales, un perfil de comprensión detallado que evoluciona entre proyectos, documentación pública de tus aprendizajes, y un portafolio que resiste cualquier entrevista técnica porque puedes defender cada decisión.",
  },
  {
    question: "¿Cómo mide Umbral la comprensión?",
    answer:
      "A través de 4 dimensiones: Build (¿funciona?), Explain (¿puedes explicar por qué?), Debug (¿puedes arreglarlo sin IA?), y Transfer (¿puedes aplicarlo en otro contexto?). Agentes de IA te hacen preguntas continuamente — no solo en checkpoints — y tu perfil se actualiza con cada interacción.",
  },
  {
    question: "¿Cuál es la diferencia entre Umbral y AI TechProducts?",
    answer:
      "Umbral es la plataforma (el motor): mide comprensión, tiene agentes IA, knowledge graph, y seguimiento de progreso. AI TechProducts es el programa (la experiencia): tiene estructura de 3 meses, facilitador, sesiones grupales, Demo Days y evaluación. AI TechProducts corre sobre Umbral.",
  },
  {
    question: "¿Es para individuos o equipos?",
    answer:
      "Ambos. Individuos se inscriben en AI TechProducts para construir su portafolio y demostrar comprensión. Equipos y empresas pueden usar Umbral como herramienta de assessment para medir la comprensión real de IA en sus developers — más allá de si el código funciona.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 border-t border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="font-mono text-sm text-brand-skyblue mb-2 tracking-wider uppercase">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-3" data-aos="fade-up">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
