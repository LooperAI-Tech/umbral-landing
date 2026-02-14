"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LearningCard } from "@/components/learnings/learning-card";
import { LearningForm } from "@/components/learnings/learning-form";
import { CategoryFilter } from "@/components/learnings/category-filter";
import { learningsApi } from "@/lib/api/learnings";
import type { Learning, LearningCategory, LearningCreate } from "@/types";

export default function LearningsPage() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LearningCategory | null>(null);

  const loadLearnings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await learningsApi.list({
        q: query || undefined,
        category: category || undefined,
        limit: 50,
      });
      setLearnings(data.learnings);
      setTotal(data.total);
    } catch { /* handled */ }
    setIsLoading(false);
  }, [query, category]);

  useEffect(() => {
    loadLearnings();
  }, [loadLearnings]);

  const handleCreate = async (data: LearningCreate) => {
    await learningsApi.create(data);
    setShowForm(false);
    loadLearnings();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Aprendizajes
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            {total} ideas documentadas
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Nuevo Aprendizaje
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Documentar un Aprendizaje
          </h2>
          <LearningForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aprendizajes..."
            className="pl-9"
          />
        </div>
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : learnings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            {query || category
              ? "Ningún aprendizaje coincide con tus filtros"
              : "Aún no hay aprendizajes documentados! Empieza a construir tu bóveda de conocimiento!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learnings.map((learning) => (
            <LearningCard key={learning.id} learning={learning} />
          ))}
        </div>
      )}
    </div>
  );
}
