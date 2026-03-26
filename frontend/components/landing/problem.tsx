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
    <section className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="font-mono text-lr text-community-blue-light mb-2 tracking-wider uppercase">
            El nuevo AI-Dependency
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            La IA genera tu solución.
            <br />
            <span className="text-muted-foreground">
              ¿Pero tú lo entiendes?
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {painPoints.map((point, i) => (
            <div
              key={point.title}
              className="bg-card border border-border rounded-lg p-6 group"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <point.icon className="w-8 h-8 text-community-blue-light mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-foreground mb-2 font-display">
                {point.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div
          className="max-w-2xl mx-auto bg-card border border-community-blue-light/30 rounded-lg p-6 text-center"
          data-aos="fade-up"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-community-blue-light font-semibold">
              AI Dependency Signal:
            </span>{" "}
            Puedes &quot;Construir&quot; pero no puedes &quot;Explicar, Debugear o
            Transferir&quot;. Como profesionales en tecnología, debemos ser capaces nivelar estos cuatro componentes.
          </p>
        </div>
      </div>
    </section>
  );
}
