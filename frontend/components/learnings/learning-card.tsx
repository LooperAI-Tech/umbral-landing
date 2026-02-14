"use client";

import { Badge } from "@/components/ui/badge";
import type { Learning } from "@/types";

const confidenceColors: Record<string, "secondary" | "info" | "warning" | "success" | "default"> = {
  EXPLORING: "secondary",
  LEARNING: "info",
  PRACTICING: "warning",
  CONFIDENT: "success",
  EXPERT: "default",
};

export function LearningCard({
  learning,
  onClick,
}: {
  learning: Learning;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 glow-hover transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">
          {learning.concept}
        </h3>
        <Badge
          variant={confidenceColors[learning.confidence_level] || "secondary"}
          className="text-[10px] shrink-0"
        >
          {learning.confidence_level}
        </Badge>
      </div>

      <Badge variant="info" className="text-[10px] mb-2">
        {learning.category.replace("_", " ")}
      </Badge>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {learning.what_learned}
      </p>

      <div className="flex flex-wrap gap-1">
        {learning.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
