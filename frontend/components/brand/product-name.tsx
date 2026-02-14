"use client";

import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductNameProps {
  showTagline?: boolean;
  className?: string;
}

export function ProductName({ showTagline = false, className }: ProductNameProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-display font-bold text-gradient-brand text-xl tracking-tight">
        {PRODUCT_NAME}
      </span>
      {showTagline && (
        <span className="text-xs text-muted-foreground font-mono">
          {PRODUCT_TAGLINE}
        </span>
      )}
    </div>
  );
}
