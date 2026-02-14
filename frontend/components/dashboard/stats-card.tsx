"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "accent";
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  const variantStyles = {
    default: "border-border hover:border-border/50",
    primary:
      "border-brand-skyblue/30 hover:border-brand-skyblue bg-gradient-to-br from-brand-skyblue/5 to-transparent",
    accent:
      "border-community-yellow/30 hover:border-community-yellow bg-gradient-to-br from-community-yellow/5 to-transparent",
  };

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-200 bg-card glow-hover",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-brand-skyblue uppercase tracking-wider">
          {label}
        </span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-3xl font-bold text-foreground font-mono">
        {value}
      </div>
    </div>
  );
}
