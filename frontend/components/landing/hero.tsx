"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import Spline from "@splinetool/react-spline";
import GalaxyBackground from "@/components/backgrounds/galaxy-background";

const trustStats = [
  { value: "4", label: "dimensiones de Comprensión" },
  { value: "3", label: "Niveles Cognitivos" },
  { value: "100%", label: "autodidacta con guías de expertos" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <GalaxyBackground />

      {/* 3D Scene — absolute, right side, masked edges for seamless blend */}
      <div
        ref={(el) => {
          if (!el) return;
          const handler = (e: WheelEvent) => {
            e.stopPropagation();
            window.scrollBy({ top: e.deltaY, behavior: "auto" });
          };
          el.addEventListener("wheel", handler, { passive: false });
        }}
        className="absolute inset-0 left-1/3 hidden lg:block z-20 overflow-hidden"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 70% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 70% 50%, black 30%, transparent 100%)",
        }}
      >
        <Spline
          scene="https://prod.spline.design/iRO0AYoop5w3Mu9e/scene.splinecode"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 min-h-[calc(100vh-4rem)] flex items-center pointer-events-none">
        <div className="max-w-xl pointer-events-auto">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6"
            data-aos="fade-up"
          >
            Si no puedes explicarlo,
            <br />
            <span className="text-gradient-brand">no lo construiste.</span>
          </h1>
          <p
            className="text-lg text-muted-foreground mb-8 font-mono leading-relaxed max-w-lg"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            La plataforma donde aprendes construyendo productos reales con IA
            — y demuestras que entiendes lo que haces. Para personas que
            quieren ir más allá.
          </p>
          <div
            className="flex flex-wrap gap-4"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <Link
              href="/early-access"
              className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-base font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Acceso Anticipado
            </Link>
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
