"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import GalaxyBackground from "@/components/backgrounds/galaxy-background";

const words = ["explicarlo", "debuggearlo", "transferirlo", "defenderlo"];
const TYPING_SPEED = 100;
const DELETING_SPEED = 60;
const PAUSE_AFTER_WORD = 2000;

function useTypewriter(words: string[]) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = words[index];

    if (!isDeleting) {
      setText(current.slice(0, text.length + 1));
      if (text.length + 1 === current.length) {
        setTimeout(() => setIsDeleting(true), PAUSE_AFTER_WORD);
        return;
      }
    } else {
      setText(current.slice(0, text.length - 1));
      if (text.length - 1 === 0) {
        setIsDeleting(false);
        setIndex((i) => (i + 1) % words.length);
        return;
      }
    }
  }, [text, isDeleting, index, words]);

  useEffect(() => {
    const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting]);

  return text;
}

export default function Hero() {
  const typed = useTypewriter(words);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <GalaxyBackground />

      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-3xl">
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6"
            data-aos="fade-up"
          >
            <span className="whitespace-nowrap">
              Si no puedes{" "}
              <span className="text-gradient-brand">
                {typed}
                <span className="animate-pulse text-brand-skyblue">|</span>
              </span>
            </span>
            <br />
            no lo construiste.
          </h1>
          <p
            className="text-lg text-muted-foreground mb-8 font-mono leading-relaxed max-w-xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            La plataforma donde aprendes construyendo tecnología con IA — y
            demuestras que entiendes lo que haces. Para personas que quieren ir
            más allá.
          </p>
          <div
            className="flex flex-wrap gap-4 justify-center"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            {/* TODO: Update Calendly URL when ready */}
            <a
              href="https://calendly.com/tryumbral/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-base font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Reserva una demo
            </a>
            <a
              href="#how-it-works"
              className="border border-border text-foreground px-8 py-3 rounded-lg text-base font-medium hover:bg-accent hover:border-brand-skyblue/30 transition-all"
            >
              Cómo Funciona
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
