import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
  variant?: "default" | "brand" | "accent";
}

function Progress({ value = 0, variant = "default", className, ...props }: ProgressProps) {
  const barStyles = {
    default: "bg-primary",
    brand: "bg-[image:var(--gradient-brand)]",
    accent: "bg-[image:var(--gradient-accent)]",
  };

  return (
    <div
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          barStyles[variant]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export { Progress }
