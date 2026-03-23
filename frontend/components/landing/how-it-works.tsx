import { Compass, Code2, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Define tu proyecto",
    desc: "Elige un problema real que te importe resolver. Umbral te ayuda a definir alcance, usuario objetivo y milestones. La IA maneja la infraestructura — tú te enfocas en las decisiones de diseño.",
  },
  {
    number: "02",
    icon: Code2,
    title: "Construye con IA que te desafía",
    desc: "Cada día sigues un loop de aprendizaje: Te Orientamos → Te Retamos → Descubres → Construyes → Explicas → Reflejas lo Principal. Nuestros agentes te hacen guían en el proceso, no solo respuestas. Umbral verifica que realmente entiendes.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Despliega y demuestra que entiendes",
    desc: "Despliega tu producto en línea. Recoge feedback de usuarios. Tu knowledge graph se actualiza — e iteras nuevamente.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 border-t border-border/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="font-mono text-sm text-brand-skyblue mb-2 tracking-wider uppercase">
            Cómo funciona Umbral
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Aprende construyendo.
            <br />
            Demuestra explicando.
          </h2>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative flex gap-6 pb-12"
              data-aos="fade-up"
              data-aos-delay={i * 200}
            >
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
  );
}
