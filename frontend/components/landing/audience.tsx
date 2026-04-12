import { Code2, Briefcase, GraduationCap } from "lucide-react";
import { audience } from "@/lib/content";

const icons = [Code2, Briefcase, GraduationCap];

export default function Audience() {
  return (
    <section id="audience" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col items-center">
      <div className="mb-16 flex flex-col items-center text-center" data-aos="fade-up">
        <span className="bg-white border border-zinc-200 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
          {audience.badge}
        </span>
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 max-w-3xl">
          {audience.heading} <span className="italic text-zinc-500">{audience.headingItalic}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {audience.personas.map((p, i) => {
          const Icon = icons[i];
          return (
            <div
              key={p.role}
              className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm flex flex-col gap-5"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-800">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900">{p.role}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">{audience.problemLabel}</p>
                  <p className="text-sm font-normal text-zinc-500 leading-relaxed">{p.problem}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider mb-1">{audience.outcomeLabel}</p>
                  <p className="text-sm font-normal text-zinc-500 leading-relaxed">{p.outcome}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
