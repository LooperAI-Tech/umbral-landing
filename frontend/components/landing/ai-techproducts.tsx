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
} from "lucide-react";

const milestones = [
  {
    week: "S1",
    title: "Ideación",
    desc: "Define problema, usuario, solución, tech stack. Crea plan con hitos y tareas. Setup inicial.",
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
    desc: "Optimiza, itera, documenta. Auto-debugging sin IA. Explicación de tradeoffs.",
    icon: Settings,
  },
  {
    week: "S4",
    title: "Demo Day",
    desc: "Deploy final en línea. Testeo con usuarios reales. Presentación técnica + demo + Q&A.",
    icon: Presentation,
  },
];

const evaluation = [
  { label: "Comprensión Técnica", weight: "35%", color: "bg-brand-skyblue" },
  { label: "Diseño del Producto", weight: "25%", color: "bg-community-yellow" },
  { label: "Funcionalidad", weight: "25%", color: "bg-status-completed" },
  { label: "Innovación", weight: "15%", color: "bg-[#A78BFA]" },
  { label: "Presentación", weight: "10%", color: "bg-neon-cyan" },
];

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
          <span className="inline-block bg-brand-skyblue/10 border border-brand-skyblue/30 text-brand-skyblue text-xs font-mono px-3 py-1 rounded-full mb-4">
            Powered by AI PlayGrounds
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
            AI TechProducts
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Un programa donde construyes productos reales usando IA con un grupo de mentores expertos
            y en un espacio diseñado para que explotes tu potencial.
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
              &ldquo;Dejar de que la IA hagas las cosas por mí
              <br />
              <span className="text-community-yellow">
                — y empezar a co-crear con ella.
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
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
                    1 Sesión grupal semanal con mentores expertos.
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
                    Productos desplegados, perfil de comprensión
                    detallado, portafolio defendible y fuente de conocimiento personal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluation */}
          <div
            className="bg-card border border-border rounded-xl p-8"
            data-aos="fade-left"
          >
            <h3 className="text-lg font-display font-bold text-foreground mb-6">
              Evaluación (100 pts)
            </h3>
            <div className="space-y-3">
              {evaluation.map((e) => (
                <div key={e.label} className="flex items-center gap-3">
                  <div className="w-12 text-right font-mono text-sm text-foreground font-bold">
                    {e.weight}
                  </div>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${e.color} rounded-full`}
                      style={{ width: e.weight }}
                    />
                  </div>
                  <div className="text-muted-foreground text-xs w-40">
                    {e.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
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
            <Link
              href="/early-access"
              className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-base font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Solicitar Acceso
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
