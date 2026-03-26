import { Sparkles } from "lucide-react";
import { COMMUNITY_NAME } from "@/lib/constants";

export default function FinalCTA() {
  return (
    <section className="w-full py-16 md:py-20 relative flex flex-col items-center justify-center overflow-hidden min-h-[400px] border-y border-zinc-200/50 bg-zinc-100/50">
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl px-6 text-center" data-aos="fade-up">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-zinc-900 leading-[1.1]">
          Demuestra lo que sabes. Construye lo que <span className="italic text-zinc-500">importa.</span>
        </h2>
        <p className="text-lg font-normal text-zinc-500 max-w-md">
          Únete a {COMMUNITY_NAME} y sé parte del equipo que está revolucionando la forma en
          la que se aprende y desarrolla con IA.
        </p>
        <a
          href="https://calendly.com/tryumbral/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-zinc-900 hover:bg-zinc-800 text-white transition-colors rounded-full py-4 px-8 text-base font-medium inline-flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Reserva una demo
        </a>
      </div>
    </section>
  );
}
