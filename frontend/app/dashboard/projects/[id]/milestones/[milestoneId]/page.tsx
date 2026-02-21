"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { TaskGenerationChat } from "@/components/chat/task-generation-chat";
import { TaskBoard } from "@/components/projects/task-board";
import { milestonesApi } from "@/lib/api/milestones";
import { projectsApi } from "@/lib/api/projects";
import type { Milestone, Project } from "@/types";

const statusVariant: Record<string, "secondary" | "warning" | "destructive" | "success" | "info"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  BLOCKED: "destructive",
  COMPLETED: "success",
  SKIPPED: "info",
};

export default function MilestoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const milestoneId = params.milestoneId as string;

  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskChat, setShowTaskChat] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [projectId, milestoneId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [milestoneData, projectData] = await Promise.all([
        milestonesApi.get(milestoneId),
        projectsApi.get(projectId),
      ]);
      setMilestone(milestoneData);
      setProject(projectData);
    } catch (err) {
      console.error("Error loading milestone:", err);
      setError("No se pudo cargar el hito. Verifica que el backend esté corriendo.");
    }
    setIsLoading(false);
  };

  const handleTaskChatComplete = () => {
    setShowTaskChat(false);
    setTaskRefreshKey((k) => k + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (error || !milestone || !project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Proyecto
        </button>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            {error || "No se encontró el hito."}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={loadData}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/dashboard/projects/${projectId}`)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a {project.name}
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">
            M{milestone.milestone_number}
          </span>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {milestone.name}
          </h1>
          <Badge variant={statusVariant[milestone.status] || "secondary"}>
            {milestone.status.replace("_", " ")}
          </Badge>
        </div>
        {milestone.description && (
          <p className="text-muted-foreground mt-2">{milestone.description}</p>
        )}
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progreso</span>
          <span className="font-mono text-sm text-brand-skyblue">
            {Math.round(milestone.progress * 100)}%
          </span>
        </div>
        <Progress value={milestone.progress * 100} variant="brand" />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Entregable
          </span>
          <p className="text-sm text-foreground mt-1">{milestone.deliverable}</p>
          <Badge variant="info" className="mt-2 text-[10px]">
            {milestone.deliverable_type}
          </Badge>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Criterios de Éxito
          </span>
          <p className="text-sm text-foreground mt-1">{milestone.success_criteria}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Fecha Objetivo
          </span>
          <p className="text-sm text-foreground mt-1">
            {milestone.target_date
              ? new Date(milestone.target_date).toLocaleDateString()
              : "Sin definir"}
          </p>
        </div>
      </div>

      {/* Tasks section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Tareas</h2>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setShowTaskChat(true)}
          >
            <Sparkles className="w-4 h-4" />
            Generar Tareas con IA
          </Button>
        </div>

        <Dialog open={showTaskChat} onOpenChange={setShowTaskChat}>
          <DialogContent
            className="sm:max-w-4xl p-0 gap-0 overflow-hidden"
            showCloseButton={false}
          >
            <TaskGenerationChat
              projectId={projectId}
              projectName={project.name}
              milestoneId={milestoneId}
              milestoneName={milestone.name}
              onComplete={handleTaskChatComplete}
              onCancel={() => setShowTaskChat(false)}
            />
          </DialogContent>
        </Dialog>

        <TaskBoard key={taskRefreshKey} milestoneId={milestoneId} projectId={projectId} projectName={project.name} />
      </div>
    </div>
  );
}
