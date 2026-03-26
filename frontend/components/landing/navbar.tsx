"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Trophy } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";

const navLinks = [
  { label: "Cómo Funciona", href: "#how-it-works" },
  { label: "Comunidad", href: "#" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
      <div
        className={`w-full max-w-6xl flex justify-between items-center pointer-events-auto transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border border-zinc-200/50 rounded-full px-6 py-2 shadow-sm"
            : ""
        }`}
      >
        {/* Logo */}
        <a href="#" className="text-2xl tracking-tighter font-medium text-zinc-900">
          <span className="italic">{PRODUCT_NAME} </span>
          <span className="text-xs font-medium ml-0.5 align-super">®</span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-zinc-500 hover:text-zinc-900 font-medium transition-colors text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/ai-techproducts"
            className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-900 px-4 py-2 rounded-full hover:border-zinc-300 transition-colors font-medium text-sm shadow-sm"
          >
            <Trophy className="w-4 h-4" />
            AI TechProducts
          </Link>
          {/* TODO: Update Calendly URL when ready */}
          <a
            href="https://calendly.com/tryumbral/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-full transition-colors font-medium text-sm"
          >
            Reserva una demo
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-zinc-900 p-2 pointer-events-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 bg-white border border-zinc-200 rounded-2xl p-4 shadow-lg pointer-events-auto mt-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2.5 text-zinc-500 hover:text-zinc-900 font-medium transition-colors text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-zinc-100 mt-2">
            <Link
              href="/ai-techproducts"
              className="flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-900 px-4 py-2.5 rounded-full font-medium text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <Trophy className="w-4 h-4" />
              AI TechProducts
            </Link>
            <a
              href="https://calendly.com/tryumbral/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 text-white px-4 py-2.5 rounded-full text-center font-medium text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Reserva una demo
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
