"use client";

import {
  Lightbulb,
  Target,
  CheckSquare,
  Rocket,
  BookOpen,
  Flame,
} from "lucide-react";
import { StatsCard } from "./stats-card";
import type { DashboardStats } from "@/types";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatsCard
        label="Projects"
        value={stats.active_projects}
        icon={Lightbulb}
        variant="primary"
      />
      <StatsCard
        label="Milestones"
        value={`${stats.completed_milestones}/${stats.total_milestones}`}
        icon={Target}
      />
      <StatsCard
        label="Tasks"
        value={`${stats.completed_tasks}/${stats.total_tasks}`}
        icon={CheckSquare}
      />
      <StatsCard
        label="Deployments"
        value={stats.total_deployments}
        icon={Rocket}
      />
      <StatsCard
        label="Learnings"
        value={stats.total_learnings}
        icon={BookOpen}
        variant="accent"
      />
      <StatsCard
        label="Streak"
        value={`${stats.current_streak}d`}
        icon={Flame}
      />
    </div>
  );
}
