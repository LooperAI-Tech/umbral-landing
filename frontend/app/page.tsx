import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Lightbulb,
  BookOpen,
  Bot,
  Rocket,
  BarChart3,
  Sparkles,
  MessageSquare,
  Target,
  GraduationCap,
} from "lucide-react";
import {
  PRODUCT_NAME,
  COMPANY_NAME,
  COMMUNITY_NAME,
} from "@/lib/constants";
import { TerminalHeader } from "@/components/ui/terminal-header";
import GalaxyBackground from "@/components/backgrounds/galaxy-background";
import TestimonialsCarousel from "@/components/landing/testimonials-carousel";

const features = [
  {
    icon: Lightbulb,
    title: "Seguimiento de Proyectos",
    desc: "Organiza tus proyectos de AI/ML con hitos, tareas y seguimiento de despliegues. La IA te ayuda a definir proyectos a través de conversación.",
    color: "text-brand-skyblue",
  },
  {
    icon: BookOpen,
    title: "Repositorio de Aprendizajes",
    desc: "Documenta lo que aprendiste, cuándo usarlo y cuándo no. Repetición espaciada integrada para mantener el conocimiento fresco.",
    color: "text-community-yellow",
  },
  {
    icon: Bot,
    title: "Asistente de IA",
    desc: "IA con contexto que conoce tus proyectos, stack y historial de aprendizaje. Parte de un sistema multi-agente que crece contigo.",
    color: "text-neon-cyan",
  },
  {
    icon: Rocket,
    title: "Registro de Despliegues",
    desc: "Registra versiones desplegadas con feedback, métricas y planes de mejora. Despliega temprano, despliega seguido.",
    color: "text-status-completed",
  },
  {
    icon: BarChart3,
    title: "Panel de Progreso",
    desc: "Visualiza tus estadísticas, rachas y progreso en todos tus proyectos de un vistazo. Mantén la motivación con crecimiento visible.",
    color: "text-community-blue-light",
  },
  {
    icon: Sparkles,
    title: "Extracción de Aprendizajes",
    desc: "La IA analiza tus conversaciones y extrae aprendizajes estructurados automáticamente. Nunca pierdas una idea.",
    color: "text-community-yellow-light",
  },
];

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Define tu proyecto",
    desc: "Chatea con la IA para dar forma a tu idea. Hace las preguntas correctas y estructura todo por ti.",
  },
  {
    number: "02",
    icon: Target,
    title: "Construye y rastrea progreso",
    desc: "Divide el trabajo en hitos y tareas. Rastrea despliegues, recopila feedback e itera con propósito.",
  },
  {
    number: "03",
    icon: GraduationCap,
    title: "Documenta aprendizajes",
    desc: "Captura lo que aprendes en el camino. La IA extrae ideas de tus conversaciones automáticamente.",
  },
];

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-display font-bold text-gradient-brand">
              {PRODUCT_NAME}
            </span>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#about" className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm">
                Quiénes somos
              </Link>
              <Link href="#products" className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm">
                Nuestros productos
              </Link>
              <Link href="#blog" className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm">
                Blog
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/sign-up"
                className="bg-[image:var(--gradient-brand)] text-white px-4 py-2 rounded-lg hover:shadow-[var(--shadow-glow)] transition-all font-semibold text-sm"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
          <GalaxyBackground />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-sm text-brand-skyblue mb-4 tracking-wider uppercase">
                {COMMUNITY_NAME} presenta
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                Construye Proyectos de IA.
                <br />
                <span className="text-gradient-brand">Rastrea Todo.</span>
              </h1>
              <p className="text-4xl md:text-5xl lg:text-2xl font-display font-bold text-foreground leading-tight mb-6d">
                Develop, Ship and Learn
              </p>
              <p className="text-lg text-muted-foreground mb-8 font-mono leading-relaxed">
                La plataforma donde aprendes conceptos fundamentales de IA y otras tecnologías mientras desarrollas productos que otros pueden usar. Tu portafolio se construye mientras aprendes!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-up"
                  className="bg-[image:var(--gradient-brand)] text-white px-8 py-3 rounded-lg text-base font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Empieza Gratis
                </Link>
                <Link
                  href="#features"
                  className="border border-border text-foreground px-8 py-3 rounded-lg text-base font-medium hover:bg-accent hover:border-brand-skyblue/30 transition-all"
                >
                  Saber Más
                </Link>
              </div>
            </div>

            {/* Terminal preview */}
            <div className="hidden lg:block">
              <div className="rounded-lg overflow-hidden border border-border shadow-lg">
                <TerminalHeader
                  title="crear-proyecto"
                  path="~/vault"
                  status="online"
                />
                <div className="bg-[var(--bg-terminal)] p-5 font-mono text-sm space-y-3">
                  <div>
                    <span className="text-muted-foreground">asistente</span>
                    <span className="text-brand-skyblue"> &gt; </span>
                    <span className="text-foreground">
                      ¿Qué te gustaría construir?
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">tú</span>
                    <span className="text-community-yellow"> &gt; </span>
                    <span className="text-foreground">
                      Un chatbot RAG para documentos legales
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">asistente</span>
                    <span className="text-brand-skyblue"> &gt; </span>
                    <span className="text-foreground">
                      Gran idea! Eso cae en{" "}
                      <span className="text-neon-cyan">GenAI/LLM</span>. ¿Quién es
                      el usuario objetivo?
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">tú</span>
                    <span className="text-community-yellow"> &gt; </span>
                    <span className="text-foreground">
                      Bufetes pequeños que necesitan búsqueda rápida de docs
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-status-completed">
                      &#10003; Proyecto PRJ-001 creado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* Características */}
        <section id="features" className="py-20 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="font-mono text-sm text-brand-skyblue mb-2 tracking-wider uppercase">
                Características
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Tu Bóveda de Aprendizaje en IA
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Todo lo que necesitas para aprender AI/ML construyendo proyectos reales.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-lg p-6 glow-hover transition-all group"
                >
                  <feature.icon
                    className={`w-8 h-8 ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
                  />
                  <h3 className="text-lg font-semibold text-foreground mb-2 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo Funciona */}
        <section className="py-20 border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="font-mono text-sm text-community-yellow mb-2 tracking-wider uppercase">
                Cómo Funciona
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Tres pasos hacia tu bóveda
              </h2>
            </div>
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={step.number} className="relative flex gap-6 pb-12">
                  {i < steps.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-px bg-border" />
                  )}
                  <div className="shrink-0 w-12 h-12 rounded-full bg-card border border-brand-skyblue/30 flex items-center justify-center font-mono text-sm text-brand-skyblue font-bold z-10">
                    {step.number}
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <step.icon className="w-5 h-5 text-brand-skyblue" />
                      <h3 className="text-lg font-semibold text-foreground font-display">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TestimonialsCarousel />

        {/* CTA Comunidad */}
        <section className="py-20 border-t border-border/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-card border border-border rounded-xl p-10 glow-hover transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_70%)] pointer-events-none" />
              <div className="relative">
                <p className="font-mono text-sm text-community-yellow mb-3 tracking-wider uppercase">
                  Acceso Beta
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Únete a {COMMUNITY_NAME}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  Estamos incorporando builders que quieren aprender AI/ML
                  construyendo productos reales. Cupos limitados.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href="https://chat.whatsapp.com/ET8AwrRVyg712LIrs6pz59"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-10 py-3.5 rounded-lg text-lg font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Obtener Acceso Anticipado
                  </a>
                  <a
                    href="https://www.linkedin.com/company/ai-playgrounds-tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-accent hover:border-brand-skyblue/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Síguenos en LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-muted-foreground font-mono text-sm">
              &copy; 2026 {COMPANY_NAME}. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-6 font-mono text-sm">
              <span className="text-muted-foreground">
                Made with love by {COMMUNITY_NAME} ❤️
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
