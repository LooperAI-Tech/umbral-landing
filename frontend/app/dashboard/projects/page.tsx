"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const { projects, isLoading, hasFetched, error, fetchProjects } =
    useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const showSkeleton = isLoading && !hasFetched;
  const showEmpty = hasFetched && projects.length === 0 && !error;
  const showError = hasFetched && !!error && projects.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Proyectos
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Tu rastreador de proyectos AI/ML
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Link>
        </Button>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : showError ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No se pudieron cargar los proyectos. Asegúrate de que el backend esté corriendo.
          </p>
          <Button variant="secondary" onClick={() => fetchProjects()}>
            Reintentar
          </Button>
        </div>
      ) : showEmpty ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aún no hay proyectos
          </h3>
          <p className="text-muted-foreground mb-6">
            Crea tu primer proyecto para empezar a rastrear tu camino de
            aprendizaje en IA.
          </p>
          <Button variant="gradient" asChild>
            <Link href="/dashboard/projects/new">Crear Proyecto</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects ?? []).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
