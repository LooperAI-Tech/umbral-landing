"use client";

import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSideChatStore } from "@/stores/sideChatStore";

export function ChatFAB() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSideChatStore();

  // Hide on full assistant page and when panel is open
  if (pathname === "/dashboard/assistant" || isOpen) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-brand-skyblue to-community-blue text-white shadow-glow hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
      title="Abrir Asistente IA"
    >
      <Bot className="w-6 h-6" />
    </button>
  );
}
