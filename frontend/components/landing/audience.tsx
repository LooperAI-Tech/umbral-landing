import { Code2, Briefcase, GraduationCap } from "lucide-react";

const personas = [
  {
    icon: Code2,
    role: "Developer Individual",
    problem:
      "Usas IA para construir pero no puedes explicar tu propio código en una entrevista.",
    outcome:
      "Portafolio de productos desplegados que puedes defender técnicamente. Comprensión profunda demostrable.",
    color: "text-brand-skyblue",
    borderColor: "border-brand-skyblue/30",
  },
  {
    icon: Briefcase,
    role: "Engineering Manager / CTO",
    problem:
      "Tu equipo entrega código hecho con IA pero no sabes si realmente están entregando soluciones analizadas correctamente.",
    outcome:
      "Assessment real de entrega de valor segura. Identifica quién entiende vs. quién solo genera.",
    color: "text-community-yellow",
    borderColor: "border-community-yellow/30",
  },
  {
    icon: GraduationCap,
    role: "Cambio de Carrera",
    problem:
      "Completaste cursos y tutoriales pero tu portafolio no resiste preguntas técnicas reales.",
    outcome:
      "Productos reales desplegados, fundamentados y probados. Un perfil de comprensión que demuestra profundidad, no solo completitud.",
    color: "text-neon-cyan",
    borderColor: "border-neon-cyan/30",
  },
];

export default function Audience() {
  return (
    <section id="audience" className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="font-mono text-lr text-brand-skyblue mb-2 tracking-wider uppercase">
            ¿Para quién es?
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            La primera escuela de tecnología
            <br />
            <span className="text-gradient-brand">para la AI Era</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, i) => (
            <div
              key={p.role}
              className={`bg-card border ${p.borderColor} rounded-lg p-6 glow-hover transition-all`}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <p.icon className={`w-8 h-8 ${p.color} mb-4`} />
              <h3 className="text-base font-semibold text-foreground mb-3 font-display">
                {p.role}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-xs text-status-blocked mb-1 uppercase tracking-wider">
                    El problema
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {p.problem}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs text-status-completed mb-1 uppercase tracking-wider">
                    El resultado
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {p.outcome}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
