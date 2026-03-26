"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Trophy } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";

const navLinks = [
  { label: "Cómo Funciona", href: "#how-it-works" },
  { label: "AI PlayGrounds", href: "#" },
  { label: "Para Quién", href: "#audience" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#" className="text-xl font-display font-bold text-gradient-brand">
            {PRODUCT_NAME}
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/ai-techproducts"
              className="flex items-center gap-2 border border-[var(--brand-skyblue)] text-[var(--brand-skyblue)] px-4 py-2 rounded-lg hover:bg-[var(--brand-skyblue)]/10 hover:shadow-[var(--shadow-glow)] transition-all font-semibold text-sm"
            >
              <Trophy className="w-4 h-4" />
              AI TechProducts
            </a>
            {/* TODO: Update Calendly URL when ready */}
            <a
              href="https://calendly.com/tryumbral/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[image:var(--gradient-brand)] text-white px-4 py-2 rounded-lg hover:shadow-[var(--shadow-glow)] transition-all font-semibold text-sm"
            >
              Reserva una demo
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <a
                href="/ai-techproducts"
                className="flex items-center justify-center gap-2 border border-[var(--brand-skyblue)] text-[var(--brand-skyblue)] px-4 py-2 rounded-lg font-semibold text-sm"
                onClick={() => setMobileOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                AI TechProducts
              </a>
              <a
                href="https://calendly.com/tryumbral/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[image:var(--gradient-brand)] text-white px-4 py-2 rounded-lg text-center font-semibold text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Reserva una demo
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
