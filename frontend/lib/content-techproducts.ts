// ============================================================
// AI TECHPRODUCTS PAGE CONTENT COLLECTIONS
// ============================================================
// All AI TechProducts page text lives here. Edit this file to
// update copy without touching component code.
// ============================================================

import { global } from "@/lib/content";

// ---- Page (navbar + announcement) ----
export const page = {
  announcement: "Nueva cohorte próximamente —",
  announcementLink: "Regístrate para ser notificado",
  registerUrl: "https://techproducts.aiplaygrounds.org",
  backLabel: "Volver",
  ctaLabel: "Postula aquí",
};

// ---- Header ----
export const header = {
  badge: "Powered by AI PlayGrounds",
  title: "AI Technical Products",
  subtitle:
    "Un programa donde construyes productos usando IA con mentores expertos, una comunidad para ti y en un espacio diseñado para que explotes todo tu potencial.",
};

// ---- Problem ----
export const problem = {
  badge: "El problema",
  heading: "Generar soluciones con IA es",
  headingItalic: "fácil.",
  headingSuffix: "Hacerlo bien y entenderlas, no.",
  items: [
    {
      title: "Generación sin comprensión",
      desc: "Sientes que la IA genera tu solución, pero no sabes cómo funciona, por qué se diseñó así, ni cómo corregirla cuando falla. El gap entre generar y entender crece.",
    },
    {
      title: "Sin espacios para construir",
      desc: "Te faltan entornos donde puedas construir productos de IA con acompañamiento real de expertos y personas que buscan los mismo que tú.",
    },
    {
      title: "Cursos, bootcamps, etc ... y nada más",
      desc: "Has invertido tiempo y dinero en formación, pero a la hora de construir no sabes por dónde empezar. Necesitas claridad respecto a qué construir, cómo hacerlo y qué aprender en el proceso.",
    },
  ],
};

// ---- Milestones ----
export const milestones = {
  badge: "Ciclos por Cohorte",
  heading: "5 semanas para construir, desplegar y",
  headingItalic: "demostrar.",
  items: [
    {
      week: "S1",
      title: "Ideación",
      desc: "Define la fase inicial. Crea plan con hitos y tareas. Configura tu setup inicial.",
    },
    {
      week: "S2",
      title: "Desarrollo",
      desc: "Construye el núcleo de tu solución usando IA. Controla tu progreso en Umbral. Verifica la comprensión de lo que has desarrollado.",
    },
    {
      week: "S3",
      title: "Refinamiento",
      desc: "Optimiza, itera, documenta el desarrollo de tu producto. Comprende los tradeoffs y las decisiones clave.",
    },
    {
      week: "S4",
      title: "Despliegue y Testing",
      desc: "Despliega tu producto en línea. Testea con usuarios reales. Recoge feedback y valida tu solución en un entorno real.",
    },
    {
      week: "S5",
      title: "Demo Day",
      desc: "Presenta tu producto final. Pitch técnico de 3-5 min + demo en vivo + sesión de Q&A con advisors de la comunidad.",
    },
  ],
};

// ---- Program Details ----
export const programDetails = {
  badge: "El Programa",
  heading: "Todo lo que necesitas para",
  headingItalic: "maximizar tu comprensión",
  headingSuffix: "al desarrollar productos de IA.",
  items: [
    {
      title: "Acceso completo a Umbral",
      desc: "Acceso total a la plataforma usando tu coding assistant de preferencia para guiarte en cada paso del desarrollo de tu producto.",
    },
    {
      title: "Instructores dedicados",
      desc: "Instructores a tiempo completo que te acompañan semana a semana, asegurando que avances con claridad y profundidad.",
    },
    {
      title: "Mentores especializados",
      desc: "Sesiones 1:1 o grupales con mentores expertos en tu sector o tecnología específica. Orientación personalizada cuando más la necesitas.",
    },
    {
      title: "Metodología de vanguardia",
      desc: "Nuestra metodología propia basada en la investigación más reciente sobre cómo desarrollar software en la AI-Era. Diseñada para maximizar tu comprensión.",
    },
    {
      title: "Demo Days y feedback",
      desc: "Presenta tu producto ante los advisors de nuestra comunidad. Recibe feedback directo y valida tu trabajo con expertos reales.",
    },
  ],
};

// ---- Audience ----
export const audience = {
  badge: "¿Para quién es?",
  heading: "Creado para quienes quieren ser los",
  headingItalic: " creadores del software del futuro.",
  items: [
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
  ],
};

// ---- Pricing ----
export const pricing = {
  badge: "Pago único",
  heading: "Una inversión. Todo",
  headingItalic: "incluido.",
  price: "",
  currency: "",
  priceDescription:
    "Postúlate al programa y accede a todos los beneficios de AI Technical Products por una única inversión.",
  ctaLabel: "Postula aquí",
  includedTitle: "Qué incluye",
  includedItems: [
    "12 sesiones con instructores a lo largo del programa",
    "Acceso a nuestro pool de mentores en sectores y tecnología",
    "Soportado por Umbral",
    "Metodologías de vanguardia sin sacrificar entendimiento",
    "Demo Days con feedback de nuestros advisors",
    `Acceso a la comunidad ${global.communityName} y beneficios futuros`,
  ],
};

// ---- Mission / Scholarships ----
export const mission = {
  label: "Nuestra misión",
  heading: "El talento no debería tener",
  headingItalic: "barreras económicas.",
  description:
    "AI PlayGrounds nació con una convicción: que el acceso a oportunidades de aprendizaje no puede depender de tu situación económica. Por eso ofrecemos becas en cada cohorte — porque creemos que invertir en talento comprometido es la mejor inversión que podemos hacer como comunidad.",
  quote:
    "Nadie con talento y compromiso debería quedarse fuera. Cada postulación es evaluada de forma individual.",
  steps: [
    "Completa tu postulación",
    "Indica que necesitas apoyo económico",
    "Cada caso se evalúa de forma individual y confidencial",
  ],
  ctaLabel: "Postula y solicita tu beca",
};
