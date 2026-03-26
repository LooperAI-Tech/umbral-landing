import { PRODUCT_NAME, COMPANY_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white pt-12 pb-12 px-6 w-full flex flex-col items-center">
      {/* Footer Links */}
      <div className="w-full max-w-6xl border-t border-zinc-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
        <p>&copy; 2026 {COMPANY_NAME}. Todos los derechos reservados.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">AI PlayGrounds</a>
          <a
            href="https://www.instagram.com/aiplaygroundstech/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/company/ai-playgrounds-tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
