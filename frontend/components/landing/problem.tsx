import { ShieldQuestion, RefreshCw, HelpCircle, CircleOff } from "lucide-react";
import { problem } from "@/lib/content";

const icons = [RefreshCw, HelpCircle, ShieldQuestion, CircleOff];

export default function Problem() {
  return (
    <section className="w-full py-16 md:py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
      <div className="text-center mb-16" data-aos="fade-up">
        <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 inline-block shadow-sm">
          {problem.badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 max-w-2xl mx-auto">
          {problem.heading} <span className="italic text-zinc-500">{problem.headingItalic}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-10">
        {problem.painPoints.map((point, i) => {
          const Icon = icons[i];
          return (
            <div
              key={point.title}
              className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-4 group"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-800">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-900 mb-1">
                  {point.title}
                </h3>
                <p className="text-sm font-normal text-zinc-500 leading-relaxed">
                  {point.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Callout */}
      <div
        className="max-w-2xl bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center"
        data-aos="fade-up"
      >
        <p className="text-sm text-zinc-500 leading-relaxed">
          <span className="text-zinc-900 font-medium">{problem.calloutLabel}</span>{" "}
          {problem.calloutText}
        </p>
      </div>
      </div>
    </section>
  );
}
