import {
  Clock,
  Users,
  Award,
  Lightbulb,
  Code2,
  Settings,
  Rocket,
  Presentation,
  MessageCircle,
  Star,
  Shuffle,
  SearchX,
  CircleOff,
  Heart,
  ArrowRight,
} from "lucide-react";

const milestones = [
  {
    week: "S1",
    title: "Ideación",
    desc: "Define la fase inicial. Crea plan con hitos y tareas. Configura tu setup inicial.",
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
    desc: "Optimiza, itera, documenta el desarrollo de tu producto. Comprende los tradeoffs y las decisiones clave.",
    icon: Settings,
  },
  {
    week: "S4",
    title: "Despliegue y Testing",
    desc: "Despliega tu producto en línea. Testea con usuarios reales. Recoge feedback y valida tu solución en un entorno real.",
    icon: Rocket,
  },
  {
    week: "S5",
    title: "Demo Day",
    desc: "Presenta tu producto final. Pitch técnico de 3-5 min + demo en vivo + sesión de Q&A con advisors de la comunidad.",
    icon: Presentation,
  },
];

const programDetails = [
  { icon: Code2, title: "Acceso completo a Umbral", desc: "Acceso total a la plataforma usando tu coding assistant de preferencia para guiarte en cada paso del desarrollo de tu producto." },
  { icon: Users, title: "Instructores dedicados", desc: "Instructores a tiempo completo que te acompañan semana a semana, asegurando que avances con claridad y profundidad." },
  { icon: Star, title: "Mentores especializados", desc: "Sesiones 1:1 o grupales con mentores expertos en tu sector o tecnología específica. Orientación personalizada cuando más la necesitas." },
  { icon: Lightbulb, title: "Metodología de vanguardia", desc: "Nuestra metodología propia basada en la investigación más reciente sobre cómo desarrollar software en la AI-Era. Diseñada para maximizar tu comprensión." },
  { icon: Presentation, title: "Demo Days y feedback", desc: "Presenta tu producto ante los advisors de nuestra comunidad. Recibe feedback directo y valida tu trabajo con expertos reales." },
];


export default function AITechProducts() {
  return (
    <>
    <section id="ai-techproducts" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center">
      <div className="w-full">
        {/* Badge + Header */}
        <div className="text-center mb-14 flex flex-col items-center" data-aos="fade-up">
          <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
            Powered by AI PlayGrounds
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900">
            AI Technical Products
          </h2>
          <p className="text-zinc-500 mt-3 max-w-3xl text-lg font-normal">
            Un programa donde construyes productos usando IA con un grupo de mentores expertos
            y en un espacio diseñado para que explotes todo tu potencial.
          </p>
        </div>

        {/* Problem section */}
        <div className="mb-14">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              El problema
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-3xl">
              Generar código con IA es <span className="italic text-zinc-500">fácil.</span> Entender lo que generaste, no.
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shuffle,
                title: "Generación sin comprensión",
                desc: "La IA genera tu solución en segundos, pero no sabes cómo funciona, por qué se diseñó así, ni cómo corregirla cuando falla. El gap entre generar y comprender sigue creciendo.",
              },
              {
                icon: SearchX,
                title: "Sin espacios reales para construir",
                desc: "Faltan entornos donde puedas construir productos de IA con acompañamiento real de expertos. Los cursos enseñan teoría, pero nadie te guía mientras construyes algo de verdad.",
              },
              {
                icon: CircleOff,
                title: "Cursos, bootcamps, videos... y parálisis",
                desc: "Has invertido tiempo y dinero en formación, pero a la hora de construir no sabes por dónde empezar. El miedo a fallar te paraliza porque nadie te enseñó que fallar es parte del proceso.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-zinc-800" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-zinc-900 mb-1">{item.title}</h4>
                  <p className="text-sm font-normal text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones — 5 weeks */}
        <div className="mb-14">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              Ciclos por Cohorte
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-2xl">
              5 semanas para construir, desplegar y <span className="italic text-zinc-500">demostrar.</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {milestones.map((m, i) => (
              <div
                key={m.week}
                className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4 group"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400">{m.week}</span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <m.icon className="w-4 h-4 text-zinc-800" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-zinc-900 mb-1">{m.title}</h4>
                  <p className="text-sm font-normal text-zinc-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del Programa — full width section */}
        <div className="mb-14">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              El Programa
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-3xl">
              Todo lo que necesitas para <span className="italic text-zinc-500">maximizar tu comprensión</span> al desarrollar productos de IA.
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {programDetails.map((item, i) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4 w-full md:w-[calc(33.333%-1rem)]"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-zinc-800" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-zinc-900 mb-1">{item.title}</h4>
                  <p className="text-sm font-normal text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Para quién — list style, no more boxes */}
        <div className="mb-14 w-full max-w-3xl mx-auto">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              ¿Para quién es?
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-2xl">
              Creado para quienes quieren ser los<span className="italic text-zinc-500"> creadores del software del futuro.</span>
            </h3>
          </div>
          <div className="flex flex-col gap-0" data-aos="fade-up">
            {[
              {
                headline: "Developers que sienten que la IA hace el trabajo por ellos",
                desc: "Usas coding assistants todos los días pero sientes que solo aceptas lo que generan. Quieres recuperar el control y entender cada decisión de lo que construyes.",
              },
              {
                headline: "Personas que quieren usar IA para construir — y entender qué hacen",
                desc: "Te entusiasma la idea de crear con coding assistants, pero no quieres solo copiar y pegar. Quieres saber qué está pasando, por qué funciona y cómo mejorarlo.",
              },
              {
                headline: "Profesionales que quieren dar el salto a AI como builders",
                desc: "Vienes de otro campo o estás empezando en tech. Quieres un camino concreto para construir productos de IA con coding assistants, no más cursos solo teóricos.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 py-6 border-b border-zinc-100 last:border-b-0 group"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-medium mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h4 className="text-base font-medium text-zinc-900 mb-1 group-hover:text-zinc-600 transition-colors">
                    {item.headline}
                  </h4>
                  <p className="text-sm font-normal text-zinc-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>

    {/* Pricing — full width dark section */}
    <section className="w-full bg-zinc-900 text-white py-16 md:py-20 px-6" data-aos="fade-up">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            Pago único
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight max-w-2xl">
            Una inversión. Todo <span className="italic text-zinc-400">incluido.</span>
          </h2>
        </div>

        {/* Pricing card */}
        <div className="max-w-5xl mx-auto bg-zinc-950 rounded-[2rem] border border-zinc-800 p-8 md:p-12 flex flex-col lg:flex-row gap-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 40%)" }} />

          {/* Left — price */}
          <div className="relative flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl md:text-6xl font-medium tracking-tight">$600</span>
                <span className="text-lg text-zinc-500 font-normal mb-2">USD</span>
              </div>
              <p className="text-sm font-normal text-zinc-400 max-w-sm leading-relaxed">
                Postúlate al programa y accede a todos los beneficios de AI Technical Products por una única inversión.
              </p>
            </div>
          </div>

          {/* Right — what's included */}
          <div className="relative flex-1 bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800">
            <h4 className="text-sm font-medium text-white mb-5">Qué incluye</h4>
            <ul className="flex flex-col gap-3 mb-8">
              {[
                "12 sesiones con instructor a lo largo del programa",
                "Acceso a nuestro pool de mentores en sector y tecnología",
                "Plataforma Umbral con coding assistant integrado",
                "Metodologías de vanguardia sin sacrificar comprensión",
                "Demo Days con feedback de advisors de la comunidad",
                "Acceso a la comunidad AI PlayGrounds y beneficios futuros",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-normal text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="https://register.aiplaygrounds.org"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-zinc-900 hover:bg-zinc-100 transition-colors py-4 rounded-full text-center text-sm font-medium block"
            >
              {/* TODO: Update URL when registration app is live */}
              Postula aquí
            </a>
          </div>
        </div>

        {/* Becas — Mission Block */}
        <div className="max-w-5xl mx-auto mt-12" data-aos="fade-up">
          <div className="relative rounded-[2rem] border border-zinc-700 overflow-hidden">
            {/* Gradient accent top border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="p-8 md:p-12">
              {/* Icon + label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Nuestra misión
                </span>
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left — mission statement */}
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-4 leading-snug">
                    El talento no debería tener{" "}
                    <span className="italic text-zinc-400">barreras económicas.</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                    AI PlayGrounds nació con una convicción: que el acceso a oportunidades reales de
                    aprendizaje no puede depender de tu situación económica. Por eso ofrecemos becas
                    en cada cohorte — porque creemos que invertir en talento comprometido es la mejor
                    inversión que podemos hacer como comunidad.
                  </p>
                </div>

                {/* Right — details + CTA */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Quote callout */}
                  <blockquote className="border-l-2 border-white/20 pl-5 mb-6">
                    <p className="text-base text-zinc-300 italic leading-relaxed">
                      "Nadie con talento y compromiso debería quedarse fuera. Cada postulación es
                      evaluada de forma individual — lo que nos importa es tu determinación, no tu
                      billetera."
                    </p>
                  </blockquote>

                  {/* How it works */}
                  <div className="flex flex-col gap-3 mb-6">
                    {[
                      "Completa tu postulación normalmente",
                      "Indica que necesitas apoyo económico",
                      "Cada caso se evalúa de forma individual y confidencial",
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-medium flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-zinc-400">{step}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="https://register.aiplaygrounds.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors group"
                  >
                    Postula y solicita tu beca
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
  );
}
