"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Panel",
  "/dashboard/projects": "Proyectos",
  "/dashboard/learnings": "Aprendizajes",
  "/dashboard/assistant": "Asistente IA",
  "/dashboard/settings": "Configuración",
};

export function Header({ onMenuClick, className }: HeaderProps) {
  const pathname = usePathname();

  const getTitle = () => {
    if (routeTitles[pathname]) return routeTitles[pathname];
    if (pathname.startsWith("/dashboard/projects/")) return "Detalle del Proyecto";
    return "Panel";
  };

  const getBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "~/dashboard";
    return "~/" + segments.join("/");
  };

  return (
    <header
      className={cn(
        "h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0",
        className
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Terminal-style breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="text-brand-skyblue">umbral</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-community-blue">{getBreadcrumb()}</span>
        <span className="text-muted-foreground">$</span>
        <span className="text-foreground">{getTitle()}</span>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="w-2 h-2 rounded-full bg-status-completed animate-pulse" />
        <span className="font-mono text-xs text-muted-foreground uppercase">
          online
        </span>
      </div>
    </header>
  );
}
