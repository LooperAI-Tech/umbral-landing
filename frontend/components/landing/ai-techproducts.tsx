import Link from "next/link";
import {
  FileText,
  Clock,
  Users,
  Award,
  Lightbulb,
  Code2,
  Settings,
  Presentation,
  Bot,
  ShieldCheck,
  Rocket,
  MessageCircle,
  Star,
} from "lucide-react";

const milestones = [
  {
    week: "S1",
    title: "Ideación",
    desc: "Define la fase inicial. Crea plan con hitos y tareas. Configura tu setup inicial.",
    icon: Lightbulb,
  },
  {
    week: "S2",
    title: "Desarrollo",
    desc: "Construye el núcleo de tu solución usando IA. Controla tu progreso en Umbral. Verifica la comprensión de lo que has desarrollado.",
    icon: Code2,
  },
  {
    week: "S3",
    title: "Refinamiento",
    desc: "Optimiza, itera, documenta el desarrollo de tu producto. Comprende los tradeoffs y las decisiones clave.",
    icon: Settings,
  },
  {
    week: "S4",
    title: "Demo Day",
    desc: "Despliegue final en línea. Testea con usuarios reales. Presenta tu pitch a nuestros advisors de comunidad.",
    icon: Presentation,
  },
];

const evaluation = [
  { label: "Comprensión Técnica", weight: 30, cssColor: "#0EA5E9" },
  { label: "Diseño del Producto", weight: 20, cssColor: "#FCD34D" },
  { label: "Funcionalidad", weight: 20, cssColor: "#4ADE80" },
  { label: "Innovación", weight: 15, cssColor: "#A78BFA" },
  { label: "Presentación", weight: 15, cssColor: "#22D3EE" },
];

function buildDonutGradient() {
  const gap = 1; // % gap between all segments
  const bgColor = "#111827"; // matches card background
  const totalGaps = evaluation.length * gap;
  const usable = 100 - totalGaps; // space left for actual segments
  let cumulative = 0;
  const stops: string[] = [];
  for (const e of evaluation) {
    // Gap before each segment
    stops.push(`${bgColor} ${cumulative}%`);
    cumulative += gap;
    stops.push(`${bgColor} ${cumulative}%`);
    // Segment
    const segSize = (e.weight / 100) * usable;
    stops.push(`${e.cssColor} ${cumulative}%`);
    cumulative += segSize;
    stops.push(`${e.cssColor} ${cumulative}%`);
  }
  return `conic-gradient(from -90deg, ${stops.join(", ")})`;
}

const differentiators = [
  {
    icon: Bot,
    title: "Usa CUALQUIER herramienta de IA",
    desc: "No restringimos herramientas. Usa ChatGPT, Copilot, Claude, lo que quieras. La señal no es si usaste IA — es si entiendes lo que produjo.",
  },
  {
    icon: ShieldCheck,
    title: "Demuestra comprensión, no solo output",
    desc: "No evaluamos si funciona. Evaluamos si puedes explicar por qué funciona, debuggear sin ayuda, y defender tus decisiones técnicas.",
  },
  {
    icon: Rocket,
    title: "Productos reales con usuarios reales",
    desc: "No son ejercicios ni tutoriales reempacados. Cada producto se despliega, se testea con usuarios reales, y se presenta en Demo Days.",
  },
];

export default function AITechProducts() {
  return (
    <section id="ai-techproducts" className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge + Header */}
        <div className="text-center mb-14" data-aos="fade-up">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-skyblue/10 border border-brand-skyblue/30 text-brand-skyblue text-xs font-mono px-3 py-1 rounded-full mb-4 hover:bg-brand-skyblue/20 transition-colors"
          >
            Powered by AI PlayGrounds
          </a>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            AI TechProducts
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Un programa donde construyes productos usando IA con un grupo de mentores expertos
            y en un espacio diseñado para que explotes todo tu potencial.
          </p>
        </div>

        {/* Philosophy quote */}
        <div
          className="max-w-3xl mx-auto mb-14"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <blockquote className="bg-card border border-community-yellow/30 rounded-xl p-8 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3">
              <span className="text-community-yellow font-mono text-xs uppercase tracking-wider">
                Aspecto Clave
              </span>
            </div>
            <p className="text-xl md:text-2xl font-display font-bold text-foreground italic leading-relaxed">
              &ldquo;Dejar que la IA haga todo el trabajo por mí
              <br />
              <span className="text-community-yellow">
                — y empezar a co-crear y comprender con ella.
              </span>
              &rdquo;
            </p>
          </blockquote>
        </div>

        {/* Milestones timeline */}
        <div className="mb-14">
          <h3
            className="text-center font-mono text-sm text-brand-skyblue mb-8 tracking-wider uppercase"
            data-aos="fade-up"
          >
            Ciclo por Batch
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m, i) => (
              <div
                key={m.week}
                className="bg-card border border-border rounded-lg p-5 glow-hover transition-all relative"
                data-aos="fade-up"
                data-aos-delay={i * 150}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs text-brand-skyblue font-bold bg-brand-skyblue/10 px-2 py-0.5 rounded">
                    {m.week}
                  </span>
                  <m.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-2 font-display">
                  {m.title}
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Program details + Evaluation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14 items-stretch">
          {/* Details */}
          <div
            className="bg-card border border-border rounded-xl p-8"
            data-aos="fade-right"
          >
            <h3 className="text-lg font-display font-bold text-foreground mb-6">
              Detalles del Programa
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-brand-skyblue shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium text-sm">
                    Duración
                  </p>
                  <p className="text-muted-foreground text-xs">
                    3 meses por ciclo. Sprints de 4 semanas.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="w-5 h-5 text-community-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium text-sm">Formato</p>
                  <p className="text-muted-foreground text-xs">
                    Autodidacta con espacios dedicados para tu crecimiento.
                    Sesiones grupales semanales con mentores expertos.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Award className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium text-sm">
                    Qué obtienes
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Productos desplegados, perfil de skills detallado, portafolio personal para la AI-Era
                    y base de conocimiento personal replicable en cualquier proyecto.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MessageCircle className="w-5 h-5 text-brand-skyblue shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium text-sm">
                    Sesiones activas
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Espacios para compartir tus descubrimientos, pedir feedback o ayuda, mostrar lo que aprendiste y escuchar a otros hacerlo. Aprendizaje colaborativo real.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Star className="w-5 h-5 text-community-yellow shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium text-sm">
                    Comunidad y beneficios
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Acceso a la comunidad AI PlayGrounds enfocada en el human layer de la IA. Prioridad y descuentos en todos los programas futuros: bootcamps, workshops, eventos y más.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation — Donut + tags */}
          <div
            className="bg-card border border-border rounded-xl p-8"
            data-aos="fade-left"
          >
            <h3 className="text-lg font-display font-bold text-foreground mb-6">
              Evaluación
            </h3>

            <div className="flex items-center gap-6 justify-center">
              {/* Donut */}
              <div className="relative w-48 h-48 shrink-0">
                <div
                  className="w-full h-full rounded-full"
                  style={{ background: buildDonutGradient() }}
                />
                <div className="absolute inset-[30%] rounded-full bg-card" />
              </div>

              {/* Tags with percentage */}
              <div className="flex flex-col gap-2 flex-1">
                {evaluation.map((e) => (
                  <div key={e.label} className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold w-10 text-right"
                      style={{ color: e.cssColor }}
                    >
                      {e.weight}%
                    </span>
                    <span
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                      style={{
                        color: e.cssColor,
                        borderColor: `${e.cssColor}40`,
                        backgroundColor: `${e.cssColor}15`,
                      }}
                    >
                      {e.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-5 italic">
              La Comprensión Técnica es el criterio de mayor peso. No basta con
              que funcione — debes demostrar que entiendes cómo y por qué.
            </p>
          </div>
        </div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {differentiators.map((d, i) => (
            <div
              key={d.title}
              className="bg-card border border-border rounded-lg p-6 glow-hover transition-all group"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <d.icon className="w-8 h-8 text-brand-skyblue mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-base font-semibold text-foreground mb-2 font-display">
                {d.title}
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {d.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="text-center" data-aos="fade-up">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/docs/ai-technical-products-reglamento.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[var(--brand-skyblue)] text-[var(--brand-skyblue)] px-8 py-3 rounded-lg text-base font-semibold hover:bg-[var(--brand-skyblue)]/10 hover:shadow-[var(--shadow-glow)] transition-all"
            >
              <FileText className="w-5 h-5" />
              Ver Reglamento Completo
            </a>
            <a
              href="https://register.aiplaygrounds.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-base font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {/* TODO: Update URL when registration app is live */}
              Postúlate aquí
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
