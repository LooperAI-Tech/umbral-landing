import { Code2, Briefcase, GraduationCap } from "lucide-react";

const personas = [
  {
    icon: Code2,
    role: "Developer Individual",
    problem: "Usas IA para construir pero no puedes explicar tu propio código en una entrevista.",
    outcome: "Portafolio de productos desplegados que puedes defender técnicamente. Comprensión profunda demostrable.",
  },
  {
    icon: Briefcase,
    role: "Engineering Manager / CTO",
    problem: "Tu equipo entrega código hecho con IA pero no sabes si realmente están entregando soluciones analizadas correctamente.",
    outcome: "Assessment real de entrega de valor segura. Identifica quién entiende vs. quién solo genera.",
  },
  {
    icon: GraduationCap,
    role: "Cambio de Carrera",
    problem: "Completaste cursos y tutoriales pero tu portafolio no resiste preguntas técnicas reales.",
    outcome: "Productos reales desplegados, fundamentados y probados. Un perfil de comprensión que demuestra profundidad.",
  },
];

export default function Audience() {
  return (
    <section id="audience" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center">
      <div className="mb-16 flex flex-col items-center text-center" data-aos="fade-up">
        <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
          ¿Para quién es?
        </span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 max-w-3xl">
          La primera plataforma de IA y tecnología <span className="italic text-zinc-500">diseñada para la AI-Era</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {personas.map((p, i) => (
          <div
            key={p.role}
            className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-5"
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-800">
              <p.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900">{p.role}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">El problema</p>
                <p className="text-sm font-normal text-zinc-500 leading-relaxed">{p.problem}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">El resultado</p>
                <p className="text-sm font-normal text-zinc-500 leading-relaxed">{p.outcome}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
