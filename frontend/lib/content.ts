// ============================================================
// LANDING PAGE CONTENT COLLECTIONS
// ============================================================
// All landing page text lives here. Edit this file to update
// copy without touching component code.
// ============================================================

// ---- Global ----
export const global = {
  productName: "Umbral",
  companyName: "AI PlayGrounds",
  communityName: "AI PlayGrounds",
  communityUrl: "https://aiplaygrounds.org",
  contactEmail: "contact@aiplaygrounds.org",
  calendlyUrl: "https://calendly.com/tryumbral/30min",
  instagramUrl: "https://www.instagram.com/aiplaygroundstech/?hl=es",
  linkedinUrl: "https://www.linkedin.com/company/ai-playgrounds-tech/",
};

// ---- Navbar ----
export const navbar = {
  links: [
    { label: "Cómo Funciona", href: "#how-it-works" },
    { label: "Comunidad", href: "#" },
    { label: "Para Quién", href: "#audience" },
    { label: "FAQ", href: "#faq" },
  ],
  ctaPrimary: "Reserva una demo",
  ctaSecondary: "AI TechProducts",
};

// ---- Hero ----
export const hero = {
  typewriterWords: ["explicarlo", "corregirlo", "transferirlo", "escalarlo"],
  headingPrefix: "Si no puedes",
  headingSuffix: "no lo construiste.",
  subheading:
    "La plataforma donde aprendes a desarrollar productos de IA y tecnología usando agentes de codificación y demuestras que entiendes lo que haces.",
  ctaPrimary: "Reserva una demo",
  ctaSecondary: "Cómo Funciona",
  marqueeKeywords: [
    "RAG Systems",
    "Product Oriented Learning",
    "AI-Assisted Development",
    "Architectures",
    "Machine Learning",
    "Deep Learning",
    "Prompt Engineering",
    "LLMs",
    "Agents",
    "Spec-Driven Development",
    "AI Operations",
  ],
};

// ---- Problem ----
export const problem = {
  badge: "El nuevo AI-Dependency",
  heading: "La IA genera tu solución.",
  headingItalic: "¿Pero tú la entiendes?",
  calloutLabel: "Alerta:",
  calloutText:
    "Puedes construir pero no puedes explicar el funcionamiento, resolver errores o migrar tus soluciones. Debemos ser capaces de nivelar estos cuatro componentes.",
  painPoints: [
    {
      title: "El ciclo de dependencia",
      desc: "Le pides a la IA que lo construya y funciona. Se rompe, le pides que lo arregle y también funciona. En ambos casos no sabes qué hizo ni cómo.",
    },
    {
      title: "No puedes explicar tu propio código",
      desc: "Tu proyecto funciona, pero si alguien te pregunta cómo o por qué tomaste esa decisión, no tienes respuesta.",
    },
    {
      title: "Tu portafolio no resiste preguntas",
      desc: "Tienes proyectos desplegados, pero en una entrevista técnica no puedes defender las decisiones de arquitectura ni debuggear en vivo.",
    },
    {
      title: "La parálisis de los cursos en línea",
      desc: "Has completado cursos, workshops y bootcamps pero no te sientes preparado para lanzar algo. No sabes cómo iniciar y la duda te paraliza en avanzar.",
    },
  ],
};

// ---- How It Works ----
export const howItWorks = {
  badge: "Cómo funciona",
  heading: "Aprende construyendo. Demuestra",
  headingItalic: "explicando.",
  loopText: "Cada producto es un ciclo completo — repite para profundizar",
  steps: [
    {
      number: "01",
      title: "Identifica tus prioridades",
      desc: "Definimos qué áreas del desarrollo son tu prioridad profesional y cuáles son complementarias. Umbral adapta la experiencia a tu perfil.",
    },
    {
      number: "02",
      title: "Diseña tu producto",
      desc: "Nombre, problema, usuarios, tech stack, arquitectura e hitos. Tú tomas las decisiones — la IA facilita, no decide por ti.",
    },
    {
      number: "03",
      title: "Construye y valida",
      desc: "Avanza tarea por tarea con un loop de aprendizaje activo. Cada hito incluye un Comprehension Gate antes de seguir.",
    },
    {
      number: "04",
      title: "Despliega con usuarios",
      desc: "Publica en línea y ponlo frente a usuarios reales. El feedback externo valida si tu idea y tu desarrollo funcionan.",
    },
    {
      number: "05",
      title: "Consolida tu comprensión",
      desc: "Conceptos, debugging, arquitectura y decisiones quedan en tu base de conocimiento personal — compartida entre proyectos.",
    },
    {
      number: "06",
      title: "Itera en un nuevo producto",
      desc: "Profundiza la misma idea, explora el mismo concepto desde otro ángulo, o toma una ruta nueva. Cada ciclo fortalece tu perfil.",
    },
  ],
};

// ---- Dimensions / Framework ----
export const dimensions = {
  badge: "Nuestro Framework",
  heading: "Un sistema diseñado para que",
  headingItalic: "domines",
  headingSuffix: "lo que construyes",
  calloutLabel: "El resultado:",
  calloutText:
    "No solo construyes soluciones con IA — sino que puedes explicar cada decisión, resolver problemas sin depender de nadie, y aplicar lo aprendido en cualquier contexto nuevo.",
  pillars: [
    {
      title: "Comprensión Real",
      subtitle: "No solo aceptas. Entiendes.",
      desc: "Nuestro framework mide si realmente comprendes lo que construiste — no solo si funciona. Construir, explicar, corregir y aplicar en otro contexto. Eso es dominar una tecnología.",
    },
    {
      title: "Esfuerzo que Cuenta",
      subtitle: "Tu energía donde importa.",
      desc: "Eliminamos el esfuerzo que no genera aprendizaje. La IA resuelve lo mecánico. Tú te enfocas en entender la lógica, las decisiones y los trade-offs.",
    },
    {
      title: "Complejidad Progresiva",
      subtitle: "Creces proyecto a proyecto.",
      desc: "Cada producto que construyes sube el nivel. Empiezas resolviendo un problema simple, terminas diseñando sistemas completos con múltiples técnicas de IA. Tu perfil evoluciona contigo.",
    },
  ],
};

// ---- Audience ----
export const audience = {
  badge: "¿Para quién es?",
  heading: "La primera plataforma de IA y tecnología",
  headingItalic: "diseñada para la AI-Era",
  problemLabel: "El problema",
  outcomeLabel: "El resultado",
  personas: [
    {
      role: "Perfiles Tech",
      problem:
        "Usas IA para construir pero no puedes explicar tu propio código en una entrevista.",
      outcome:
        "Portafolio de productos desplegados que puedes defender técnicamente. Comprensión demostrable.",
    },
    {
      role: "Engineering Manager / CTO",
      problem:
        "Tu equipo entrega código hecho con IA pero no sabes si realmente están entregando soluciones analizadas correctamente.",
      outcome:
        "Assessment de entrega de valor segura. Ten el control de lo que tus colaboradores entregan.",
    },
    {
      role: "Cambio de Carrera",
      problem:
        "Completaste cursos y tutoriales pero estás atrapado en tutoriales y no puedes aplicar lo aprendido.",
      outcome:
        "Productos reales desplegados, fundamentados y probados. Construye un perfil que demuestra comprensión.",
    },
  ],
};

// ---- Social Proof ----
export const socialProof = {
  badge: "Testimonios",
  heading: "Personas que ya están",
  headingItalic: "construyendo",
  headingSuffix: "diferente.",
  testimonials: [
    {
      name: "Hans Figueroa",
      role: "Steve Jobs de Zarate",
      quote:
        "Umbral me ayudó a organizar mi primer proyecto de NLP desde cero. El asistente de IA me guió paso a paso y ahora tengo un chatbot desplegado en producción.",
      avatar: "HF",
    },
    {
      name: "Kevin Huaman",
      role: "El Hechicero del Backend",
      quote:
        "Lo mejor es el repositorio de aprendizajes. Antes perdía mis notas en docs sueltos, ahora todo está conectado a mis proyectos y puedo revisarlo cuando quiera.",
      avatar: "KH",
    },
    {
      name: "Max Veramendi",
      role: "JAVA y Bombero Man",
      quote:
        "En dos semanas pasé de tener solo una idea a tener un MVP desplegado con métricas. El sistema de hitos y tareas te mantiene enfocado sin sentirte abrumado.",
      avatar: "MV",
    },
    {
      name: "Edith Canelo",
      role: "Data Analyst",
      quote:
        "No soy técnica pero quería entender IA. Con Umbral pude crear mi propio proyecto de computer vision con la guía del asistente. Ahora entiendo lo que construye mi equipo.",
      avatar: "EC",
    },
  ],
};

// ---- FAQ ----
export const faq = {
  badge: "FAQ",
  heading: "Preguntas",
  headingItalic: "Frecuentes",
  items: [
    {
      question: "¿Qué es Umbral exactamente?",
      answer:
        "Umbral es una plataforma de aprendizaje que impulsa la comprensión técnica. A diferencia de cursos tradicionales, aprendes construyendo productos de IA asistido por IA — y un sistema de agentes verifica que entiendas lo que construiste.",
    },
    {
      question: "¿Qué es AI TechProducts?",
      answer:
        "AI TechProducts es el programa estructurado que corre sobre Umbral. En 3 meses construyes productos de IA con complejidad creciente. Cada producto pasa por un ciclo de 4 semanas: Ideación → Desarrollo → Refinamiento → Demo Day. Umbral es el motor; AI TechProducts es la experiencia.",
    },
    {
      question: "¿El programa penaliza el uso de IA?",
      answer:
        "No. Puedes usar CUALQUIER herramienta de IA — ChatGPT, Copilot, Claude, Cursor, lo que quieras. La IA es clave para construir. La diferencia es que debes demostrar comprensión: explicar por qué funciona, debuggear sin IA, y transferir el patrón a otro dominio.",
    },
    {
      question: "¿Cuánto dura el programa?",
      answer:
        "Cada ciclo dura 3 meses (12 semanas). Cada producto tiene un ciclo de 4 semanas con sesión grupal semanal. El framework completo del programa junto a Umbral contempla 3 ciclos trimestrales (9 meses) con 6-8 productos desplegados.",
    },
    {
      question: "¿Qué obtengo al finalizar?",
      answer:
        "Mínimo 3 productos desplegados con usuarios reales, un perfil de comprensión detallado que evoluciona entre proyectos, y un portafolio que resiste cualquier entrevista técnica porque puedes defender cada decisión.",
    },
    {
      question: "¿Cómo mide Umbral la comprensión?",
      answer:
        "A través de 4 dimensiones: Build (¿funciona?), Explain (¿puedes explicar por qué?), Debug (¿puedes arreglarlo sin IA?), y Transfer (¿puedes aplicarlo en otro contexto?). Nuestros agentes te hacen preguntas continuamente y tu perfil se actualiza con cada producto.",
    },
    {
      question: "¿Puedo usar Umbral sin estar en el programa AI TechProducts?",
      answer:
        "Sí. Umbral puede aportar mucho valor al usarse como plataforma que te ayude a consolidar o construir productos que siempre quisiste hacer. Siempre fundamentando tu comprensión de sus componentes.",
    },
  ],
};

// ---- Footer ----
export const footer = {
  copyright: `© 2026 ${global.companyName}. Todos los derechos reservados.`,
  contactLabel: "Contáctanos",
};
