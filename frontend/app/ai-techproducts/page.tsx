"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { COMMUNITY_NAME, PRODUCT_NAME } from "@/lib/constants";
import AITechProducts from "@/components/landing/ai-techproducts";
import Footer from "@/components/landing/footer";

export default function AITechProductsPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 text-white text-center py-2 px-4">
        <p className="text-xs font-medium">
          Nueva cohorte próximamente — <a href="https://register.aiplaygrounds.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300 transition-colors">Regístrate para ser notificado</a>
        </p>
      </div>

      {/* Floating header — same behavior as main landing navbar */}
      <nav className="fixed top-8 left-0 right-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
        <div
          className={`w-full max-w-6xl flex justify-between items-center pointer-events-auto transition-all duration-300 ${
            scrolled
              ? "bg-white/80 backdrop-blur-md border border-zinc-200/50 rounded-full px-6 py-2 shadow-sm"
              : ""
          }`}
        >
          <Link
            href="/"
            className="text-2xl tracking-tighter font-medium text-zinc-900"
          >
            <span className="italic">{COMMUNITY_NAME} </span>
            <span className="text-xs font-medium ml-0.5 align-super">®</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-medium transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <a
              href="https://register.aiplaygrounds.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-full transition-colors font-medium text-sm"
            >
              {/* TODO: Update URL when registration app is live */}
              Postula aquí
            </a>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center pt-28">
        <AITechProducts />
      </main>

      <Footer />
    </div>
  );
}
