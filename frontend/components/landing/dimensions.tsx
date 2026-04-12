import { Brain, Layers, Zap } from "lucide-react";
import { dimensions } from "@/lib/content";

const icons = [Brain, Layers, Zap];

export default function Dimensions() {
  return (
    <section id="dimensions" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center overflow-hidden">
      <div className="mb-16 flex flex-col items-center text-center" data-aos="fade-up">
        <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
          {dimensions.badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 max-w-3xl">
          {dimensions.heading} <span className="italic text-zinc-500">{dimensions.headingItalic}</span> {dimensions.headingSuffix}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
        {dimensions.pillars.map((pillar, i) => {
          const Icon = icons[i];
          return (
            <div
              key={pillar.title}
              className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-6"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-800">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-0.5">{pillar.title}</h3>
                <p className="text-sm font-medium text-zinc-400 mb-2">{pillar.subtitle}</p>
                <p className="text-sm font-normal text-zinc-500 leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div
        className="max-w-3xl bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center"
        data-aos="fade-up"
      >
        <p className="text-sm text-zinc-500 leading-relaxed">
          <span className="text-zinc-900 font-medium">{dimensions.calloutLabel}</span>{" "}
          {dimensions.calloutText}
        </p>
      </div>
    </section>
  );
}
