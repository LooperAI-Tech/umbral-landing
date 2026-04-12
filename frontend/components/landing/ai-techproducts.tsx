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
import {
  header,
  problem,
  milestones,
  programDetails,
  audience,
  pricing,
  mission,
  page,
} from "@/lib/content-techproducts";

const problemIcons = [Shuffle, SearchX, CircleOff];
const milestoneIcons = [Lightbulb, Code2, Settings, Rocket, Presentation];
const programIcons = [Code2, Users, Star, Lightbulb, Presentation];

export default function AITechProducts() {
  return (
    <>
    <section id="ai-techproducts" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center">
      <div className="w-full">
        {/* Badge + Header */}
        <div className="text-center mb-14 flex flex-col items-center" data-aos="fade-up">
          <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
            {header.badge}
          </span>
          <h2 className="text-5xl md:text-7xl lg:text-[5rem] font-medium tracking-tight leading-[1.1] text-zinc-900">
            {header.title}
          </h2>
          <p className="text-zinc-500 mt-3 max-w-3xl text-lg font-normal">
            {header.subtitle}
          </p>
        </div>

        {/* Problem section */}
        <div className="mb-14">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xl font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              {problem.badge}
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-3xl">
              {problem.heading} <span className="italic text-zinc-500">{problem.headingItalic}</span> {problem.headingSuffix}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problem.items.map((item, i) => {
              const Icon = problemIcons[i];
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4"
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-zinc-800" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-zinc-900 mb-1">{item.title}</h4>
                    <p className="text-sm font-normal text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones — 5 weeks */}
        <div className="mb-14">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              {milestones.badge}
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-2xl">
              {milestones.heading} <span className="italic text-zinc-500">{milestones.headingItalic}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {milestones.items.map((m, i) => {
              const Icon = milestoneIcons[i];
              return (
                <div
                  key={m.week}
                  className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4 group"
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400">{m.week}</span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-4 h-4 text-zinc-800" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-zinc-900 mb-1">{m.title}</h4>
                    <p className="text-sm font-normal text-zinc-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalles del Programa */}
        <div className="mb-14">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              {programDetails.badge}
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-3xl">
              {programDetails.heading} <span className="italic text-zinc-500">{programDetails.headingItalic}</span> {programDetails.headingSuffix}
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {programDetails.items.map((item, i) => {
              const Icon = programIcons[i];
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4 w-full md:w-[calc(33.333%-1rem)]"
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-zinc-800" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-zinc-900 mb-1">{item.title}</h4>
                    <p className="text-sm font-normal text-zinc-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Para quién */}
        <div className="mb-14 w-full max-w-3xl mx-auto">
          <div className="mb-8 flex flex-col items-center text-center" data-aos="fade-up">
            <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
              {audience.badge}
            </span>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 max-w-2xl">
              {audience.heading}<span className="italic text-zinc-500">{audience.headingItalic}</span>
            </h3>
          </div>
          <div className="flex flex-col gap-0" data-aos="fade-up">
            {audience.items.map((item, i) => (
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
            {pricing.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight max-w-2xl">
            {pricing.heading} <span className="italic text-zinc-400">{pricing.headingItalic}</span>
          </h2>
        </div>

        {/* Pricing card */}
        <div className="max-w-5xl mx-auto bg-zinc-950 rounded-[2rem] border border-zinc-800 p-8 md:p-12 flex flex-col lg:flex-row gap-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 40%)" }} />

          {/* Left — price */}
          <div className="relative flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-5xl md:text-6xl font-medium tracking-tight">{pricing.price}</span>
                <span className="text-lg text-zinc-500 font-normal mb-2">{pricing.currency}</span>
              </div>
              <p className="text-sm font-normal text-zinc-400 max-w-sm leading-relaxed">
                {pricing.priceDescription}
              </p>
            </div>
          </div>

          {/* Right — what's included */}
          <div className="relative flex-1 bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800">
            <h4 className="text-sm font-medium text-white mb-5">{pricing.includedTitle}</h4>
            <ul className="flex flex-col gap-3 mb-8">
              {pricing.includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-normal text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={page.registerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white text-zinc-900 hover:bg-zinc-100 transition-colors py-4 rounded-full text-center text-sm font-medium block"
            >
              {pricing.ctaLabel}
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
                  {mission.label}
                </span>
              </div>

              {/* Two-column layout */}
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left — mission statement */}
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-4 leading-snug">
                    {mission.heading}{" "}
                    <span className="italic text-zinc-400">{mission.headingItalic}</span>
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                    {mission.description}
                  </p>
                </div>

                {/* Right — details + CTA */}
                <div className="flex-1 flex flex-col justify-between">
                  {/* Quote callout */}
                  <blockquote className="border-l-2 border-white/20 pl-5 mb-6">
                    <p className="text-base text-zinc-300 italic leading-relaxed">
                      &ldquo;{mission.quote}&rdquo;
                    </p>
                  </blockquote>

                  {/* How it works */}
                  <div className="flex flex-col gap-3 mb-6">
                    {mission.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-medium flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-zinc-400">{step}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={page.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-300 transition-colors group"
                  >
                    {mission.ctaLabel}
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
