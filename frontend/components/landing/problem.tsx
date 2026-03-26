import { ShieldQuestion, RefreshCw, HelpCircle, CircleOff } from "lucide-react";

const painPoints = [
  {
    icon: RefreshCw,
    title: "El ciclo de dependencia",
    desc: "Le pides a la IA que lo construya y funciona. Se rompe, le pides que lo arregle y también funciona. En ambos casos no sabes qué hizo ni cómo.",
  },
  {
    icon: HelpCircle,
    title: "No puedes explicar tu propio código",
    desc: "Tu proyecto funciona, pero si alguien te pregunta cómo o por qué tomaste esa decisión, no tienes respuesta.",
  },
  {
    icon: ShieldQuestion,
    title: "Tu portafolio no resiste preguntas",
    desc: "Tienes proyectos desplegados, pero en una entrevista técnica no puedes defender las decisiones de arquitectura ni debuggear en vivo.",
  },
  {
    icon: CircleOff,
    title: "La parálisis de los cursos en línea",
    desc: "Has completado cursos, workshops y bootcamps pero no te sientes preparado para lanzar algo. No sabes cómo iniciar y la duda te paraliza en avanzar.",
  },
];

export default function Problem() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center">
      <div className="text-center mb-16" data-aos="fade-up">
        <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 inline-block shadow-sm">
          El nuevo AI-Dependency
        </span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 max-w-2xl mx-auto">
          La IA genera tu solución. <span className="italic text-zinc-500">¿Pero tú lo entiendes?</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
        {painPoints.map((point, i) => (
          <div
            key={point.title}
            className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4 group"
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-800">
              <point.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 mb-1">
                {point.title}
              </h3>
              <p className="text-sm font-normal text-zinc-500 leading-relaxed">
                {point.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      <div
        className="max-w-2xl bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center"
        data-aos="fade-up"
      >
        <p className="text-sm text-zinc-500 leading-relaxed">
          <span className="text-zinc-900 font-medium">Alerta:</span>{" "}
          Puedes construir pero no puedes explicar el funcionamiento, resolver errores o
          migrar tus soluciones. Debemos ser capaces de nivelar estos cuatro componentes.
        </p>
      </div>
    </section>
  );
}
