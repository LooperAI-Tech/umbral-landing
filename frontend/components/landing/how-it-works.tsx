import { Focus, Compass, Code2, Rocket, Brain, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Focus,
    title: "Identifica tus prioridades",
    desc: "Definimos qué áreas son tu prioridad profesional y cuáles son complementarias.",
    color: "text-brand-skyblue",
    border: "from-brand-skyblue/20 to-brand-skyblue/5",
    borderHover: "group-hover:from-brand-skyblue/40 group-hover:to-brand-skyblue/20",
  },
  {
    number: "02",
    icon: Compass,
    title: "Diseña tu producto",
    desc: "Problema, usuarios, tech stack, arquitectura e hitos. Tú decides, la IA facilita.",
    color: "text-community-yellow",
    border: "from-community-yellow/20 to-community-yellow/5",
    borderHover: "group-hover:from-community-yellow/40 group-hover:to-community-yellow/20",
  },
  {
    number: "03",
    icon: Code2,
    title: "Construye y valida",
    desc: "Loop de aprendizaje activo tarea por tarea. Comprehension Gate en cada hito.",
    color: "text-neon-cyan",
    border: "from-neon-cyan/20 to-neon-cyan/5",
    borderHover: "group-hover:from-neon-cyan/40 group-hover:to-neon-cyan/20",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Despliega con usuarios",
    desc: "Publica en línea, feedback de usuarios reales. Valida tu idea y tu desarrollo.",
    color: "text-brand-skyblue",
    border: "from-brand-skyblue/20 to-brand-skyblue/5",
    borderHover: "group-hover:from-brand-skyblue/40 group-hover:to-brand-skyblue/20",
  },
  {
    number: "05",
    icon: Brain,
    title: "Consolida tu comprensión",
    desc: "Conceptos, debugging y decisiones en tu base de conocimiento personal.",
    color: "text-community-yellow",
    border: "from-community-yellow/20 to-community-yellow/5",
    borderHover: "group-hover:from-community-yellow/40 group-hover:to-community-yellow/20",
  },
  {
    number: "06",
    icon: RefreshCw,
    title: "Itera en un nuevo producto",
    desc: "Profundiza la misma idea o toma una ruta nueva. Cada ciclo fortalece tu perfil.",
    color: "text-neon-cyan",
    border: "from-neon-cyan/20 to-neon-cyan/5",
    borderHover: "group-hover:from-neon-cyan/40 group-hover:to-neon-cyan/20",
  },
];

function HexCard({
  step,
  delay,
}: {
  step: (typeof steps)[0];
  delay: number;
}) {
  const hexClip = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

  return (
    <div
      className="relative group"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div
        className="w-44 h-48 sm:w-48 sm:h-52 relative transition-all group-hover:scale-105"
        style={{ clipPath: hexClip }}
      >
        {/* Border glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${step.border} ${step.borderHover} transition-all`}
          style={{ clipPath: hexClip }}
        />
        {/* Inner content */}
        <div
          className="absolute inset-[1px] bg-card flex flex-col items-center justify-center text-center px-5 py-6"
          style={{ clipPath: hexClip }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`font-mono text-xs ${step.color} font-bold`}>
              {step.number}
            </span>
            <step.icon className={`w-4 h-4 ${step.color}`} />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground font-display leading-tight mb-1">
            {step.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight px-1">
            {step.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const rows = [
    { pair: [steps[0], steps[1]], align: "justify-start" },
    { pair: [steps[2], steps[3]], align: "justify-center" },
    { pair: [steps[4], steps[5]], align: "justify-end" },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-border/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="font-mono text-sm text-brand-skyblue mb-2 tracking-wider uppercase">
            Cómo funciona Umbral
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Aprende construyendo.
            <br />
            Demuestra explicando.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
            Un ciclo iterativo que se repite con cada producto — cada vuelta
            profundiza tu comprensión.
          </p>
        </div>

        {/* Desktop: Hex honeycomb stepping left → center → right */}
        <div className="hidden md:flex flex-col -space-y-8">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex gap-2 sm:gap-3 ${row.align}`}
            >
              <HexCard step={row.pair[0]} delay={rowIndex * 150} />
              <HexCard step={row.pair[1]} delay={rowIndex * 150 + 100} />
            </div>
          ))}
        </div>

        {/* Mobile: 2-column grid */}
        <div className="md:hidden grid grid-cols-2 gap-2 place-items-center">
          {steps.map((step, i) => (
            <HexCard key={step.number} step={step} delay={i * 80} />
          ))}
        </div>

        {/* Loop indicator */}
        <div className="text-center mt-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-2 font-mono text-lr text-brand-skyblue/60 bg-brand-skyblue/5 border border-brand-skyblue/10 px-4 py-1.5 rounded-full">
            <RefreshCw className="w-3 h-3" />
            Cada producto es un ciclo completo — repite para profundizar
          </span>
        </div>
      </div>
    </section>
  );
}
