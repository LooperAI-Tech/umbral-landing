import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import { TerminalHeader } from "@/components/ui/terminal-header";
import GalaxyBackground from "@/components/backgrounds/galaxy-background";

const trustStats = [
  { value: "3", label: "productos por ciclo" },
  { value: "4", label: "dimensiones de comprensión" },
  { value: "5", label: "agentes IA" },
  { value: "100%", label: "autodidacta" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <GalaxyBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
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
              — y demuestras que entiendes cada línea. Para developers que
              quieren ir más allá de copiar y pegar.
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

            {/* Trust stats */}
            <div
              className="flex flex-wrap gap-6 mt-10 pt-6 border-t border-border/50"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold font-mono text-brand-skyblue">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal preview */}
          <div className="hidden lg:block" data-aos="fade-left" data-aos-delay="300">
            <div className="rounded-lg overflow-hidden border border-border shadow-lg">
              <TerminalHeader
                title="crear-proyecto"
                path="~/vault"
                status="online"
              />
              <div className="bg-[var(--bg-terminal)] p-5 font-mono text-sm space-y-3">
                <div>
                  <span className="text-muted-foreground">{PRODUCT_NAME}</span>
                  <span className="text-brand-skyblue"> &gt; </span>
                  <span className="text-foreground">
                    ¿Qué te gustaría construir?
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tú</span>
                  <span className="text-community-yellow"> &gt; </span>
                  <span className="text-foreground">
                    Un chatbot RAG para documentos legales
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{PRODUCT_NAME}</span>
                  <span className="text-brand-skyblue"> &gt; </span>
                  <span className="text-foreground">
                    Interesante. ¿Puedes explicarme por qué RAG y no fine-tuning
                    para este caso?
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tú</span>
                  <span className="text-community-yellow"> &gt; </span>
                  <span className="text-foreground">
                    Porque los docs cambian frecuentemente y necesito...
                  </span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-status-completed">
                    &#10003; Comprensión verificada — proyecto creado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
