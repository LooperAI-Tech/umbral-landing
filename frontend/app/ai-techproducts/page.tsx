import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import AITechProducts from "@/components/landing/ai-techproducts";
import Footer from "@/components/landing/footer";

export default function AITechProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with back link */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-xl font-display font-bold text-gradient-brand"
            >
              {PRODUCT_NAME}
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Link>
              <a
                href="https://register.aiplaygrounds.org"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[image:var(--gradient-brand)] text-white px-4 py-2 rounded-lg hover:shadow-[var(--shadow-glow)] transition-all font-semibold text-sm"
              >
                {/* TODO: Update URL when registration app is live */}
                Postúlate aquí
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        <AITechProducts />
      </main>

      <Footer />
    </div>
  );
}
