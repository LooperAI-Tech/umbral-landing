"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MilestoneList } from "@/components/projects/milestone-list";
import { DeploymentLog } from "@/components/projects/deployment-log";

const statusVariant: Record<string, "secondary" | "warning" | "success" | "info"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  ON_HOLD: "info",
  COMPLETED: "success",
  ARCHIVED: "secondary",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentProject, isLoading, fetchProject, deleteProject } = useProjectStore();

  useEffect(() => {
    fetchProject(id);
  }, [id, fetchProject]);

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      await deleteProject(id);
      router.push("/dashboard/projects");
    }
  };

  if (isLoading || !currentProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const project = currentProject;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Proyectos
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              {project.display_id}
            </span>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {project.name}
            </h1>
            <Badge variant={statusVariant[project.status] || "secondary"}>
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        <Button variant="destructive" size="icon-sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progreso</span>
          <span className="font-mono text-sm text-brand-skyblue">
            {Math.round(project.progress * 100)}%
          </span>
        </div>
        <Progress value={project.progress * 100} variant="brand" />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Rama IA" value={project.ai_branch.replace("_", " ")} />
        <InfoItem label="Prioridad" value={project.priority} />
        <InfoItem label="Usuario Objetivo" value={project.target_user} />
        <InfoItem
          label="Tecnologías"
          value={project.technologies.join(", ") || "Ninguna"}
        />
      </div>

      {/* Problem statement */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">
          Problema a Resolver
        </h3>
        <p className="text-sm text-muted-foreground">{project.problem_statement}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Hitos</TabsTrigger>
          <TabsTrigger value="deployments">Despliegues</TabsTrigger>
        </TabsList>
        <TabsContent value="milestones">
          <MilestoneList projectId={project.id} />
        </TabsContent>
        <TabsContent value="deployments">
          <DeploymentLog projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <p className="text-sm text-foreground mt-1 truncate">{value}</p>
    </div>
  );
}
