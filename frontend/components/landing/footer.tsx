import { Instagram } from "lucide-react";
import { PRODUCT_NAME, COMPANY_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-xl font-display font-bold text-gradient-brand">
              {PRODUCT_NAME}
            </span>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              AI PlayGrounds Community
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-mono text-xs text-brand-skyblue uppercase tracking-wider mb-3">
              Umbral
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#dimensions" className="hover:text-foreground transition-colors">
                  Dimensiones
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Program */}
          <div>
            <h4 className="font-mono text-xs text-brand-skyblue uppercase tracking-wider mb-3">
              AI TechProducts
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#ai-techproducts" className="hover:text-foreground transition-colors">
                  AI TechProducts
                </a>
              </li>
              <li>
                <a
                  href="/docs/ai-technical-products-reglamento.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Reglamento
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  FAQ del Programa
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-mono text-xs text-brand-skyblue uppercase tracking-wider mb-3">
              Sobre Nosotros
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  AI PlayGrounds
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  LooperAI
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
          <div className="text-muted-foreground font-mono text-sm">
            &copy; 2026 {COMPANY_NAME}. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://www.instagram.com/aiplaygroundstech/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/ai-playgrounds-tech/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
