"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faq } from "@/lib/content";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full py-16 md:py-20 px-6 flex justify-center bg-white border-t border-zinc-100">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-16">
        {/* FAQ Intro — left 1/3 */}
        <div className="w-full md:w-1/3 flex flex-col items-start gap-6" data-aos="fade-up">
          <span className="bg-zinc-100 text-zinc-800 text-xs font-medium px-4 py-1.5 rounded-full">
            {faq.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900">
            {faq.heading} <span className="italic text-zinc-500">{faq.headingItalic}</span>
          </h2>
        </div>

        {/* FAQ Items — right 2/3 */}
        <div className="w-full md:w-2/3 flex flex-col gap-2" data-aos="fade-up" data-aos-delay="100">
          {faq.items.map((item, i) => (
            <div key={i}>
              <button
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 transition-colors rounded-2xl p-6 cursor-pointer flex items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="text-base font-medium text-zinc-900 pr-4">{item.question}</span>
                <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                  {openIndex === i ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </div>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-4 pt-2 text-sm font-normal text-zinc-500 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
