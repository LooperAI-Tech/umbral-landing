import { Brain, Layers, Zap } from "lucide-react";

const pillars = [
  {
    icon: Brain,
    title: "Comprensión Real",
    subtitle: "No memorizas. Entiendes.",
    desc: "Nuestro framework mide si realmente comprendes lo que construiste — no solo si funciona. Construir, explicar, corregir y aplicar en otro contexto. Eso es dominar una tecnología.",
    color: "text-brand-skyblue",
    borderColor: "border-brand-skyblue/30",
    bgColor: "from-brand-skyblue/5",
  },
  {
    icon: Layers,
    title: "Esfuerzo que Cuenta",
    subtitle: "Tu energía donde importa.",
    desc: "Eliminamos el esfuerzo que no genera aprendizaje. La IA resuelve lo mecánico. Tú te enfocas en entender la lógica, las decisiones y los trade-offs.",
    color: "text-community-yellow",
    borderColor: "border-community-yellow/30",
    bgColor: "from-community-yellow/5",
  },
  {
    icon: Zap,
    title: "Complejidad Progresiva",
    subtitle: "Creces proyecto a proyecto.",
    desc: "Cada producto que construyes sube el nivel. Empiezas resolviendo un problema simple, terminas diseñando sistemas completos con múltiples técnicas de IA. Tu perfil evoluciona contigo.",
    color: "text-neon-cyan",
    borderColor: "border-neon-cyan/30",
    bgColor: "from-neon-cyan/5",
  },
];

export default function Dimensions() {
  return (
    <section id="dimensions" className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="font-mono text-sm text-community-yellow mb-2 tracking-wider uppercase">
            Nuestro Framework
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Un sistema diseñado para que
            <br />
            <span className="text-gradient-brand">
              domines lo que construyes
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            No es otro curso. Es un método que combina ciencia del aprendizaje
            con desarrollo de productos con IA — para que cada hora invertida
            se convierta en comprensión profunda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`bg-card border ${pillar.borderColor} rounded-lg p-8 glow-hover transition-all group bg-gradient-to-b ${pillar.bgColor} to-transparent`}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <pillar.icon
                className={`w-10 h-10 ${pillar.color} mb-4 group-hover:scale-110 transition-transform`}
              />
              <h3 className="text-lg font-semibold text-foreground mb-1 font-display">
                {pillar.title}
              </h3>
              <p className={`text-sm font-medium ${pillar.color} mb-3 font-mono`}>
                {pillar.subtitle}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div
          className="max-w-3xl mx-auto bg-card border border-community-yellow/30 rounded-lg p-6 text-center"
          data-aos="fade-up"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-community-yellow font-semibold">
              El resultado:
            </span>{" "}
            No solo construyes soluciones con IA — sino que puedes explicar cada decisión, resolver problemas sin depender de nadie, y
            aplicar lo aprendido en cualquier contexto nuevo.
          </p>
        </div>
      </div>
    </section>
  );
}
