"use client";

import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeStyles = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <Link
      href="/dashboard"
      className={cn(
        "font-display font-bold tracking-tight text-gradient-brand hover:opacity-80 transition-opacity",
        sizeStyles[size],
        className
      )}
    >
      {PRODUCT_NAME}
    </Link>
  );
}
