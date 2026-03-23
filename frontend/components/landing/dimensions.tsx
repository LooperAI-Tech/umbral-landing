const dimensions = [
  {
    letter: "B",
    title: "¿Puedes Explicar?",
    desc: "El código funciona, resuelve el problema y entiendo como desplegarlo.",
    question: '"¿Sé cómo corre esto?"',
    color: "text-status-completed",
    borderColor: "border-status-completed/30",
    bgColor: "from-status-completed/5",
  },
  {
    letter: "E",
    title: "¿Puedes Explicar?",
    desc: "Puedes articular POR QUÉ funciona, POR QUÉ esta diseñado y construido así, etc.",
    question: '"Explícame las decisiones que has tomado."',
    color: "text-[#A78BFA]",
    borderColor: "border-[#A78BFA]/30",
    bgColor: "from-[#A78BFA]/5",
  },
  {
    letter: "D",
    title: "¿Puedes Corregir?",
    desc: "Puedes encontrar y arreglar errores sin ayuda de IA.",
    question: '"Aquí hay una versión rota — ¿qué está mal?"',
    color: "text-status-blocked",
    borderColor: "border-status-blocked/30",
    bgColor: "from-status-blocked/5",
  },
  {
    letter: "T",
    title: "¿Puedes Transferir?",
    desc: "Puedes aplicar el patrón a un dominio completamente diferente.",
    question: '"¿Cómo funcionaría esto en otro contexto"',
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
            El diferenciador
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Las 4 Dimensiones de Comprensión
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Más allá de &quot;¿funciona el código?&quot; — medimos lo que la
            dependencia de IA no detecta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dimensions.map((dim, i) => (
            <div
              key={dim.letter}
              className={`bg-card border ${dim.borderColor} rounded-lg p-6 text-center glow-hover transition-all group bg-gradient-to-b ${dim.bgColor} to-transparent`}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div
                className={`w-14 h-14 rounded-full border-2 ${dim.borderColor} flex items-center justify-center mx-auto mb-4 ${dim.color} text-xl font-bold font-mono group-hover:scale-110 transition-transform`}
              >
                {dim.letter}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2 font-display">
                {dim.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                {dim.desc}
              </p>
              <p className={`text-xs italic ${dim.color} font-mono`}>
                {dim.question}
              </p>
            </div>
          ))}
        </div>

        {/* Insight callout */}
        {/* <div
          className="max-w-3xl mx-auto bg-card border border-community-yellow/30 rounded-lg p-6 text-center"
          data-aos="fade-up"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-community-yellow font-semibold">
              La señal clave:
            </span>{" "}
            Alto en <span className="text-foreground font-medium">Build</span> +
            bajo en{" "}
            <span className="text-foreground font-medium">
              Explain / Debug / Transfer
            </span>{" "}
            = estás generando código que no te pertenece intelectualmente. Umbral
            detecta este patrón y te desafía a cerrarlo.
          </p>
        </div> */}
      </div>
    </section>
  );
}
