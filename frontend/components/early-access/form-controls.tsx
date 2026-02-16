"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SingleSelectGroup({
  options,
  value,
  onChange,
  hasOther,
  otherValue,
  onOtherChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  hasOther?: boolean;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
            value === opt
              ? "border-brand-skyblue bg-brand-skyblue/10 text-brand-skyblue"
              : "border-border text-muted-foreground hover:border-brand-skyblue/30"
          }`}
        >
          {opt}
        </button>
      ))}
      {hasOther && (
        <>
          <button
            type="button"
            onClick={() => onChange("Otro")}
            className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
              value === "Otro"
                ? "border-brand-skyblue bg-brand-skyblue/10 text-brand-skyblue"
                : "border-border text-muted-foreground hover:border-brand-skyblue/30"
            }`}
          >
            Otro
          </button>
          {value === "Otro" && (
            <Input
              placeholder="Especifica..."
              value={otherValue || ""}
              onChange={(e) => onOtherChange?.(e.target.value)}
              className="mt-1 w-full"
            />
          )}
        </>
      )}
    </div>
  );
}

export function MultiSelectGroup({
  options,
  value,
  onChange,
  hasOther,
  otherValue,
  onOtherChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  hasOther?: boolean;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
            value.includes(opt)
              ? "border-brand-skyblue bg-brand-skyblue/10 text-brand-skyblue"
              : "border-border text-muted-foreground hover:border-brand-skyblue/30"
          }`}
        >
          {opt}
        </button>
      ))}
      {hasOther && (
        <>
          <button
            type="button"
            onClick={() => toggle("Otro")}
            className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
              value.includes("Otro")
                ? "border-brand-skyblue bg-brand-skyblue/10 text-brand-skyblue"
                : "border-border text-muted-foreground hover:border-brand-skyblue/30"
            }`}
          >
            Otro
          </button>
          {value.includes("Otro") && (
            <Input
              placeholder="Especifica..."
              value={otherValue || ""}
              onChange={(e) => onOtherChange?.(e.target.value)}
              className="mt-1 w-full"
            />
          )}
        </>
      )}
    </div>
  );
}

export function RankingList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onChange(newItems);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div
          key={item}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          <span className="text-brand-skyblue font-mono text-xs w-5 shrink-0">
            {i + 1}.
          </span>
          <span className="flex-1 text-foreground">{item}</span>
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuestionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-2">
      {children}
    </label>
  );
}
