"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ChevronRight, X, Plus, Check, Search, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

const DROPDOWN_THRESHOLD = 7;

const selectedClass =
  "border-brand-skyblue bg-brand-skyblue/10 text-brand-skyblue";
const unselectedClass =
  "border-border text-muted-foreground hover:border-brand-skyblue/30";

// ── Dropdown for > 7 options (single select) ──

function SingleDropdown({
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const isCustom = value !== "" && !options.includes(value) && value !== "Otro";
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    onOtherChange?.(trimmed);
    setCustomInput("");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all text-left ${
          value ? selectedClass : unselectedClass
        }`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {isCustom ? value : value || "Selecciona una opción..."}
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div onMouseDown={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground font-mono"
                autoFocus
              />
            </div>
          </div>
          {/* Options */}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-colors ${
                  value === opt
                    ? "text-brand-skyblue bg-brand-skyblue/10"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                {value === opt && <Check className="w-3.5 h-3.5 shrink-0" />}
                <span className={value === opt ? "" : "pl-5"}>{opt}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Sin resultados
              </p>
            )}
          </div>
          {/* Otro */}
          {hasOther && (
            <div className="border-t border-border p-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Otro: escribe aquí..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                  className="flex-1 px-2 py-1.5 text-sm bg-transparent border border-border rounded outline-none placeholder:text-muted-foreground font-mono focus:border-brand-skyblue"
                />
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="px-2 py-1 rounded border border-brand-skyblue text-brand-skyblue hover:bg-brand-skyblue/10 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show custom value as removable chip */}
      {isCustom && (
        <span
          className={`inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-md border text-sm ${selectedClass}`}
        >
          {value}
          <button
            type="button"
            onClick={() => {
              onChange("");
              onOtherChange?.("");
            }}
            className="hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
    </div>
  );
}

// ── Dropdown for > 7 options (multi select) ──

function MultiDropdown({
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customInput, setCustomInput] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const customEntries = value.filter((v) => !options.includes(v));
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    onOtherChange?.([...customEntries, trimmed].join(", "));
    setCustomInput("");
  };

  const removeCustom = (entry: string) => {
    const newVal = value.filter((v) => v !== entry);
    const newCustom = customEntries.filter((e) => e !== entry);
    onChange(newVal);
    onOtherChange?.(newCustom.join(", "));
  };

  const selectedCount = value.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all text-left ${
          selectedCount > 0 ? selectedClass : unselectedClass
        }`}
      >
        <span className={selectedCount > 0 ? "text-foreground" : "text-muted-foreground"}>
          {selectedCount > 0
            ? `${selectedCount} seleccionado${selectedCount > 1 ? "s" : ""}`
            : "Selecciona opciones..."}
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div onMouseDown={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground font-mono"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-left transition-colors ${
                  value.includes(opt)
                    ? "text-brand-skyblue bg-brand-skyblue/10"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    value.includes(opt)
                      ? "border-brand-skyblue bg-brand-skyblue"
                      : "border-border"
                  }`}
                >
                  {value.includes(opt) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                {opt}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                Sin resultados
              </p>
            )}
          </div>
          {hasOther && (
            <div className="border-t border-border p-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Otro: escribe aquí..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                  className="flex-1 px-2 py-1.5 text-sm bg-transparent border border-border rounded outline-none placeholder:text-muted-foreground font-mono focus:border-brand-skyblue"
                />
                <button
                  type="button"
                  onClick={addCustom}
                  className="px-2 py-1 rounded border border-brand-skyblue text-brand-skyblue hover:bg-brand-skyblue/10 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.filter((v) => options.includes(v)).map((opt) => (
            <span
              key={opt}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${selectedClass}`}
            >
              {opt}
              <button type="button" onClick={() => toggle(opt)} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {customEntries.map((entry) => (
            <span
              key={entry}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${selectedClass}`}
            >
              {entry}
              <button type="button" onClick={() => removeCustom(entry)} className="hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Vertical buttons for <= 7 options (single) ──

function SingleVertical({
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
  const [customInput, setCustomInput] = useState("");
  const isCustom = value !== "" && !options.includes(value) && value !== "Otro";

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    onOtherChange?.(trimmed);
    setCustomInput("");
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => {
            onChange(opt);
            onOtherChange?.("");
          }}
          className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${
            value === opt ? selectedClass : unselectedClass
          }`}
        >
          {opt}
        </button>
      ))}
      {isCustom && (
        <span
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm ${selectedClass}`}
        >
          {value}
          <button
            type="button"
            onClick={() => {
              onChange("");
              onOtherChange?.("");
            }}
            className="ml-auto hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {hasOther && !isCustom && (
        <>
          <button
            type="button"
            onClick={() => onChange("Otro")}
            className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${
              value === "Otro" ? selectedClass : unselectedClass
            }`}
          >
            Otro
          </button>
          {value === "Otro" && (
            <div className="flex gap-2">
              <Input
                placeholder="Escribe y presiona Enter..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="px-2 py-1 rounded-md border border-brand-skyblue text-brand-skyblue hover:bg-brand-skyblue/10 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Vertical buttons for <= 7 options (multi) ──

function MultiVertical({
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
  const [customInput, setCustomInput] = useState("");
  const customEntries = value.filter((v) => !options.includes(v) && v !== "Otro");
  const showOtherInput = value.includes("Otro");

  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed || value.includes(trimmed)) return;
    const newVal = value.filter((v) => v !== "Otro");
    onChange([...newVal, trimmed, "Otro"]);
    onOtherChange?.([...customEntries, trimmed].join(", "));
    setCustomInput("");
  };

  const removeCustom = (entry: string) => {
    const newVal = value.filter((v) => v !== entry);
    const newCustom = customEntries.filter((e) => e !== entry);
    onChange(newCustom.length === 0 ? newVal.filter((v) => v !== "Otro") : newVal);
    onOtherChange?.(newCustom.join(", "));
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${
            value.includes(opt) ? selectedClass : unselectedClass
          }`}
        >
          {opt}
        </button>
      ))}
      {customEntries.map((entry) => (
        <span
          key={entry}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-md border text-sm ${selectedClass}`}
        >
          {entry}
          <button
            type="button"
            onClick={() => removeCustom(entry)}
            className="ml-auto hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {hasOther && (
        <>
          <button
            type="button"
            onClick={() => toggle("Otro")}
            className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-all ${
              showOtherInput ? selectedClass : unselectedClass
            }`}
          >
            + Otro
          </button>
          {showOtherInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Escribe y presiona Enter para agregar..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustom}
                className="px-2 py-1 rounded-md border border-brand-skyblue text-brand-skyblue hover:bg-brand-skyblue/10 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Public API: auto-switches based on option count ──

export function SingleSelectGroup(props: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  hasOther?: boolean;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  if (props.options.length > DROPDOWN_THRESHOLD) {
    return <SingleDropdown {...props} />;
  }
  return <SingleVertical {...props} />;
}

export function MultiSelectGroup(props: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  hasOther?: boolean;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  if (props.options.length > DROPDOWN_THRESHOLD) {
    return <MultiDropdown {...props} />;
  }
  return <MultiVertical {...props} />;
}

// ── Ranking (drag & drop) ──

export function RankingList({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newItems = [...items];
    const [dragged] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, dragged);
    onChange(newItems);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // Touch support
  const [touchIndex, setTouchIndex] = useState<number | null>(null);

  const handleTouchStart = (index: number) => {
    setTouchIndex(index);
  };

  const handleTouchMove = (index: number) => {
    if (touchIndex === null || touchIndex === index) return;
    const newItems = [...items];
    const [moved] = newItems.splice(touchIndex, 1);
    newItems.splice(index, 0, moved);
    onChange(newItems);
    setTouchIndex(index);
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-mono mb-2">
        Arrastra para reordenar
      </p>
      {items.map((item, i) => (
        <div
          key={item}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={() => handleDrop(i)}
          onDragEnd={handleDragEnd}
          onTouchStart={() => handleTouchStart(i)}
          onTouchMove={() => handleTouchMove(i)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm cursor-grab active:cursor-grabbing select-none transition-all ${
            dragIndex === i
              ? "opacity-50 border-brand-skyblue bg-brand-skyblue/5"
              : overIndex === i && dragIndex !== null
              ? "border-brand-skyblue border-dashed bg-brand-skyblue/5"
              : "border-border bg-background hover:border-brand-skyblue/30"
          }`}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-brand-skyblue font-mono text-xs w-5 shrink-0">
            {i + 1}.
          </span>
          <span className="flex-1 text-foreground">{item}</span>
        </div>
      ))}
    </div>
  );
}

// ── Label ──

export function QuestionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-foreground mb-2">
      {children}
    </label>
  );
}
