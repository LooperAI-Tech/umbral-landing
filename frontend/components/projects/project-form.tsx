"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/stores/projectStore";
import type { AIBranch, Priority } from "@/types";

const AI_BRANCHES: { value: AIBranch; label: string }[] = [
  { value: "GENAI_LLM", label: "GenAI / LLM" },
  { value: "ML_TRADITIONAL", label: "ML Tradicional" },
  { value: "COMPUTER_VISION", label: "Visión por Computadora" },
  { value: "NLP", label: "NLP" },
  { value: "REINFORCEMENT_LEARNING", label: "Aprendizaje por Refuerzo" },
  { value: "MLOPS", label: "MLOps" },
  { value: "DATA_ENGINEERING", label: "Ingeniería de Datos" },
  { value: "OTHER", label: "Otro" },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
];

export function ProjectForm() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    ai_branch: "GENAI_LLM" as AIBranch,
    problem_statement: "",
    target_user: "",
    technologies: "",
    priority: "MEDIUM" as Priority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const project = await createProject({
        ...form,
        technologies: form.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.push(`/dashboard/projects/${project.id}`);
    } catch {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nombre del Proyecto *
        </label>
        <Input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Mi Proyecto de IA"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Descripción
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Breve descripción de tu proyecto..."
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Rama de IA *
          </label>
          <select
            value={form.ai_branch}
            onChange={(e) => updateField("ai_branch", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] outline-none"
          >
            {AI_BRANCHES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Prioridad
          </label>
          <select
            value={form.priority}
            onChange={(e) => updateField("priority", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Problema a Resolver *
        </label>
        <textarea
          value={form.problem_statement}
          onChange={(e) => updateField("problem_statement", e.target.value)}
          placeholder="¿Qué problema resuelve este proyecto?"
          rows={3}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Usuario Objetivo *
        </label>
        <Input
          value={form.target_user}
          onChange={(e) => updateField("target_user", e.target.value)}
          placeholder="¿Para quién es esto?"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Tecnologías
        </label>
        <Input
          value={form.technologies}
          onChange={(e) => updateField("technologies", e.target.value)}
          placeholder="Python, FastAPI, React (separadas por coma)"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear Proyecto"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
