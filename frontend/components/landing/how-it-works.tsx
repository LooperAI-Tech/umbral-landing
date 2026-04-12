import { Focus, Compass, Code2, Rocket, Brain, RefreshCw } from "lucide-react";
import { howItWorks } from "@/lib/content";

const icons = [Focus, Compass, Code2, Rocket, Brain, RefreshCw];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center">
      <div className="mb-16 flex flex-col items-center text-center" data-aos="fade-up">
        <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
          {howItWorks.badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 max-w-2xl">
          {howItWorks.heading} <span className="italic text-zinc-500">{howItWorks.headingItalic}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {howItWorks.steps.map((step, i) => {
          const Icon = icons[i];
          return (
            <div
              key={step.number}
              className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm flex flex-col gap-4 group"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              {/* Icon + number */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Icon className="w-5 h-5 text-zinc-800" />
                </div>
                <span className="text-xs font-medium text-zinc-400 font-mono">{step.number}</span>
              </div>

              {/* Title + desc */}
              <div>
                <h3 className="text-xl font-medium tracking-tight text-zinc-900 mb-1">{step.title}</h3>
                <p className="text-sm font-normal text-zinc-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loop indicator */}
      <div className="flex items-center gap-2 mt-10 text-zinc-400" data-aos="fade-up">
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm font-medium">
          {howItWorks.loopText}
        </span>
      </div>
    </section>
  );
}
