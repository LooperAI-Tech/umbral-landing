"use client";

import { Lightbulb, Rocket, BookOpen, Flame } from "lucide-react";
import { StatsCard } from "./stats-card";
import type { DashboardStats } from "@/types";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        label="Proyectos"
        value={stats.active_projects}
        icon={Lightbulb}
        variant="primary"
      />
      <StatsCard
        label="Despliegues"
        value={stats.total_deployments}
        icon={Rocket}
      />
      <StatsCard
        label="Aprendizajes"
        value={stats.total_learnings}
        icon={BookOpen}
        variant="accent"
      />
      <StatsCard
        label="Racha"
        value={`${stats.current_streak}d`}
        icon={Flame}
      />
    </div>
  );
}
