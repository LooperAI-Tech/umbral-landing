"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LearningCreate, LearningCategory, ConfidenceLevel } from "@/types";

const CATEGORIES: LearningCategory[] = [
  "PROMPT_ENGINEERING", "RAG_RETRIEVAL", "FINE_TUNING", "MODEL_SELECTION",
  "EMBEDDINGS", "AGENTS", "EVALUATION", "DATA_PROCESSING", "MLOPS",
  "DEPLOYMENT", "UX_PATTERNS", "ARCHITECTURE", "PERFORMANCE", "SECURITY",
  "COST_OPTIMIZATION", "OTHER",
];

const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  "EXPLORING", "LEARNING", "PRACTICING", "CONFIDENT", "EXPERT",
];

interface LearningFormProps {
  onSubmit: (data: LearningCreate) => Promise<void>;
  onCancel: () => void;
}

export function LearningForm({ onSubmit, onCancel }: LearningFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<LearningCreate>({
    concept: "",
    category: "OTHER",
    what_learned: "",
    when_to_use: "",
    when_not_to_use: "",
    implemented_in: "",
    confidence_level: "LEARNING",
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      });
    } catch { /* handled */ }
    setIsSubmitting(false);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Concept *</label>
        <Input
          value={form.concept}
          onChange={(e) => update("concept", e.target.value)}
          placeholder="What concept did you learn?"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confidence</label>
          <select
            value={form.confidence_level}
            onChange={(e) => update("confidence_level", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px]"
          >
            {CONFIDENCE_LEVELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">What I Learned *</label>
        <textarea
          value={form.what_learned}
          onChange={(e) => update("what_learned", e.target.value)}
          placeholder="Describe what you learned..."
          rows={3}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">When to Use *</label>
        <textarea
          value={form.when_to_use}
          onChange={(e) => update("when_to_use", e.target.value)}
          placeholder="When should this be applied?"
          rows={2}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">When NOT to Use *</label>
        <textarea
          value={form.when_not_to_use}
          onChange={(e) => update("when_not_to_use", e.target.value)}
          placeholder="When should this NOT be applied?"
          rows={2}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Implemented In *</label>
        <Input
          value={form.implemented_in}
          onChange={(e) => update("implemented_in", e.target.value)}
          placeholder="Where did you apply this? (project, file, etc.)"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tags</label>
        <Input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="python, fastapi, rag (comma separated)"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Learning"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
