"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";

const words = ["explicarlo", "debuggearlo", "transferirlo", "defenderlo"];
const TYPING_SPEED = 100;
const DELETING_SPEED = 60;
const PAUSE_AFTER_WORD = 2000;

const marqueeKeywords = [
  "RAG", "LLMOps", "AI-Assisted Coding", "Fine-tuning", "ML&DL",
  "Prompt Engineering", "LLMs", "Agents", "MLOps", "SDD",
  "RAG", "LLMOps", "AI-Assisted Coding", "Fine-tuning", "ML&DL",
  "Prompt Engineering", "LLMs", "Agents", "MLOps", "SDD",
];

function useTypewriter(wordList: string[]) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = wordList[index];
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
        setIndex((i) => (i + 1) % wordList.length);
        return;
      }
    }
  }, [text, isDeleting, index, wordList]);

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
    <div className="relative w-full">
      {/* Background blur decoration — sits outside section overflow */}
      <div className="absolute -right-40 -top-40 opacity-30 pointer-events-none z-0 blur-[120px]">
        <img src="https://framerusercontent.com/images/922LPrLT3JS7JXQbJxraBeoo8I.png" alt="" className="w-[900px] h-auto" />
      </div>

    <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-40 pb-20 md:pt-52 md:pb-32 flex flex-col items-center text-center overflow-hidden">

      {/* Scrolling keywords marquee */}
      <div className="w-full max-w-lg mb-8 overflow-hidden mask-edges">
        <div className="animate-marquee gap-3 py-2">
          {marqueeKeywords.map((kw, i) => (
            <span
              key={`${kw}-${i}`}
              className="bg-white/60 backdrop-blur-md border border-zinc-200/50 text-zinc-600 text-xs font-medium px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-3xl flex flex-col items-center">
        <h1
          className="text-5xl md:text-7xl lg:text-[5rem] font-medium tracking-tight leading-[1.1] mb-6 text-zinc-900"
          data-aos="fade-up"
        >
          <span className="whitespace-nowrap">
            Si no puedes{" "}
            <span className="italic text-zinc-500">
              {typed}
              <span className="animate-pulse text-zinc-400">|</span>
            </span>
          </span>
          <br />
          no lo construiste.
        </h1>

        <p
          className="text-lg md:text-xl font-normal text-zinc-500 mb-10 max-w-lg leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          La plataforma donde aprendes a desarrollar productos de IA y tecnología usando agentes de codificación — y
          demuestras que entiendes lo que haces.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {/* TODO: Update Calendly URL when ready */}
          <a
            href="https://calendly.com/tryumbral/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white transition-colors rounded-full py-4 px-8 text-base font-medium flex justify-center items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Reserva una demo
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto bg-white border border-zinc-200 hover:border-zinc-300 transition-colors rounded-full py-4 px-8 text-base font-medium text-zinc-900 flex justify-center items-center shadow-sm"
          >
            Cómo Funciona
          </a>
        </div>
      </div>
    </section>
    </div>
  );
}
