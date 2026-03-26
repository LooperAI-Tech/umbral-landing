import { Sparkles } from "lucide-react";
import { COMMUNITY_NAME } from "@/lib/constants";

export default function FinalCTA() {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="bg-card border border-border rounded-xl p-10 glow-hover transition-all relative overflow-hidden"
          data-aos="fade-up"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative">
            <p className="font-mono text-sm text-community-yellow mb-3 tracking-wider uppercase">
              Agenda tu espacio
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Demuestra lo que sabes.
              <br />
              <span className="text-gradient-brand">Construye lo que importa.</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Únete a {COMMUNITY_NAME} y sé parte del equipo que esta revolucionando la forma en
              la que se aprende y desarrolla con IA. Cupos limitados.
            </p>
            {/* TODO: Update Calendly URL when ready */}
            <a
              href="https://calendly.com/tryumbral/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-10 py-3.5 rounded-lg text-lg font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Reserva un demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
