"use client";

import { cn } from "@/lib/utils";
import type { LearningCategory } from "@/types";

const CATEGORIES: (LearningCategory | "ALL")[] = [
  "ALL",
  "PROMPT_ENGINEERING", "RAG_RETRIEVAL", "FINE_TUNING", "MODEL_SELECTION",
  "EMBEDDINGS", "AGENTS", "EVALUATION", "DATA_PROCESSING", "MLOPS",
  "DEPLOYMENT", "UX_PATTERNS", "ARCHITECTURE", "PERFORMANCE", "SECURITY",
  "COST_OPTIMIZATION", "OTHER",
];

interface CategoryFilterProps {
  selected: LearningCategory | null;
  onChange: (category: LearningCategory | null) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = cat === "ALL" ? selected === null : selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat === "ALL" ? null : (cat as LearningCategory))}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-mono transition-colors",
              isActive
                ? "bg-brand-skyblue/20 text-brand-skyblue border border-brand-skyblue/30"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            {cat === "ALL" ? "All" : cat.replace(/_/g, " ")}
          </button>
        );
      })}
    </div>
  );
}
