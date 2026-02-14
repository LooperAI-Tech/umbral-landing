"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/types";

const statusVariant: Record<string, "default" | "warning" | "success" | "secondary" | "info"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  ON_HOLD: "info",
  COMPLETED: "success",
  ARCHIVED: "secondary",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="bg-card border border-border rounded-lg p-5 glow-hover transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono text-xs text-muted-foreground">
            {project.display_id}
          </span>
          <h3 className="text-base font-semibold text-foreground group-hover:text-brand-skyblue transition-colors mt-0.5">
            {project.name}
          </h3>
        </div>
        <Badge variant={statusVariant[project.status] || "secondary"}>
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Progress value={project.progress * 100} variant="brand" className="flex-1" />
        <span className="text-xs font-mono text-muted-foreground">
          {Math.round(project.progress * 100)}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 4 && (
          <span className="text-[10px] font-mono text-muted-foreground">
            +{project.technologies.length - 4}
          </span>
        )}
      </div>
    </Link>
  );
}
