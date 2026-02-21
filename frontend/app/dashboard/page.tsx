"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Rocket, BookOpen } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useProjectStore } from "@/stores/projectStore";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { dashboardApi } from "@/lib/api/dashboard";
import { learningsApi } from "@/lib/api/learnings";
import type { Deployment, Learning } from "@/types";

const EMPTY_STATS = {
  total_projects: 0,
  active_projects: 0,
  completed_projects: 0,
  total_milestones: 0,
  completed_milestones: 0,
  total_tasks: 0,
  completed_tasks: 0,
  total_deployments: 0,
  total_learnings: 0,
  current_streak: 0,
};

const statusVariant: Record<string, "default" | "warning" | "success" | "secondary" | "info"> = {
  ACTIVE: "success",
  PREPARING: "warning",
  DEPLOYING: "warning",
  DEPRECATED: "secondary",
  ROLLED_BACK: "default",
  FAILED: "default",
};

export default function DashboardPage() {
  const {
    stats,
    isLoading: statsLoading,
    fetchStats,
  } = useDashboardStore();
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    fetchProjects,
  } = useProjectStore();

  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([]);
  const [deploymentsLoaded, setDeploymentsLoaded] = useState(false);
  const [recentLearnings, setRecentLearnings] = useState<Learning[]>([]);
  const [learningsLoaded, setLearningsLoaded] = useState(false);

  const loadDeployments = useCallback(async () => {
    try {
      const data = await dashboardApi.getRecentDeployments(5);
      setRecentDeployments(Array.isArray(data) ? data : []);
    } catch {
      /* silent */
    }
    setDeploymentsLoaded(true);
  }, []);

  const loadLearnings = useCallback(async () => {
    try {
      const data = await learningsApi.list({ limit: 6 });
      setRecentLearnings(Array.isArray(data?.learnings) ? data.learnings : []);
    } catch {
      /* silent */
    }
    setLearningsLoaded(true);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchProjects();
    loadDeployments();
    loadLearnings();
  }, [fetchStats, fetchProjects, loadDeployments, loadLearnings]);

  const displayStats = stats || (!statsLoading ? EMPTY_STATS : null);

  // Last 3 active projects only
  const activeProjects = (projects ?? [])
    .filter((p) => p.status === "IN_PROGRESS")
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Panel
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Resumen de tu B&oacute;veda de Aprendizaje en IA
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {statsLoading && !displayStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={displayStats || EMPTY_STATS} />
      )}

      {/* Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Proyectos</h2>
          <Link
            href="/dashboard/projects"
            className="text-sm text-brand-skyblue hover:underline font-mono"
          >
            Ver todo
          </Link>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : projectsError ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No se pudieron cargar los proyectos. Asegura que el backend este corriendo.
            </p>
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sin proyectos activos.
            </p>
            <Button variant="gradient" asChild>
              <Link href="/dashboard/projects/new">
                Crear Nuevo Proyecto
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Deployments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Rocket className="w-5 h-5 text-brand-skyblue" />
            Despliegues Recientes
          </h2>
        </div>

        {!deploymentsLoaded ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : recentDeployments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay despliegues. Despliega una versión de tu proyecto para verla aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(recentDeployments ?? []).map((dep) => (
              <div
                key={dep.id}
                className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-brand-skyblue font-semibold">
                    v{dep.version}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dep.environment}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[dep.status] || "secondary"}>
                    {dep.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(dep.deploy_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Learnings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-community-yellow" />
            Aprendizajes Recientes
          </h2>
          <Link
            href="/dashboard/learnings"
            className="text-sm text-brand-skyblue hover:underline font-mono"
          >
            Ver todo
          </Link>
        </div>

        {!learningsLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : recentLearnings.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aún no hay aprendizajes documentados.{" "}
              <Link
                href="/dashboard/learnings"
                className="text-brand-skyblue hover:underline"
              >
                Empieza a documentar
              </Link>{" "}
              lo que aprendes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recentLearnings ?? []).map((learning) => (
              <div
                key={learning.id}
                className="bg-card border border-border rounded-lg p-4 glow-hover transition-all"
              >
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  {learning.concept}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {learning.what_learned}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-community-yellow bg-community-yellow/10 px-2 py-0.5 rounded-full">
                    {learning.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(learning.date_learned).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
