"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useProjectStore } from "@/stores/projectStore";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { stats, activities, isLoading: statsLoading, fetchStats, fetchActivity } =
    useDashboardStore();
  const { projects, isLoading: projectsLoading, fetchProjects } =
    useProjectStore();

  useEffect(() => {
    fetchStats();
    fetchActivity(10);
    fetchProjects();
  }, [fetchStats, fetchActivity, fetchProjects]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Your AI Learning Vault overview
          </p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {statsLoading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}

      {/* Projects + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Active Projects
            </h2>
            <Link
              href="/dashboard/projects"
              className="text-sm text-brand-skyblue hover:underline font-mono"
            >
              View all
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No projects yet. Start tracking your AI journey!
              </p>
              <Button variant="gradient" asChild>
                <Link href="/dashboard/projects/new">Create Your First Project</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <div className="bg-card border border-border rounded-lg p-4">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
