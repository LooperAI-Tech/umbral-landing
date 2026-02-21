"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, AlertTriangle } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MilestoneList } from "@/components/projects/milestone-list";
import { DeploymentLog } from "@/components/projects/deployment-log";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectStatus } from "@/types";

const STATUS_OPTIONS: {
  value: ProjectStatus;
  label: string;
  variant: "secondary" | "warning" | "success" | "destructive";
}[] = [
  { value: "PLANNED", label: "Planificado", variant: "secondary" },
  { value: "IN_PROGRESS", label: "Activo", variant: "warning" },
  { value: "COMPLETED", label: "Desplegado", variant: "success" },
  { value: "DELETED", label: "Eliminado", variant: "destructive" },
];

const statusVariant: Record<string, "secondary" | "warning" | "success" | "info" | "destructive"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  ON_HOLD: "info",
  COMPLETED: "success",
  ARCHIVED: "secondary",
  DELETED: "destructive",
};

const statusLabel: Record<string, string> = {
  PLANNED: "Planificado",
  IN_PROGRESS: "Activo",
  ON_HOLD: "En Pausa",
  COMPLETED: "Desplegado",
  ARCHIVED: "Archivado",
  DELETED: "Eliminado",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentProject, isLoading, fetchProject, updateProject, deleteProject } =
    useProjectStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProject(id);
  }, [id, fetchProject]);

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === currentProject?.status) return;

    if (newStatus === "DELETED") {
      setShowDeleteDialog(true);
      return;
    }

    await updateProject(id, { status: newStatus });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(id);
      router.push("/dashboard/projects");
    } catch {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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

          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="focus:outline-none">
                <Badge
                  variant={statusVariant[project.status] || "secondary"}
                  className="cursor-pointer"
                >
                  {statusLabel[project.status] || project.status.replace("_", " ")}
                  <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[170px]">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Badge variant={opt.variant} className="text-[10px] px-2 py-0">
                    {opt.label}
                  </Badge>
                  {project.status === opt.value && (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      actual
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {project.description && (
          <p className="text-muted-foreground mt-2">{project.description}</p>
        )}
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
        <InfoItem label="Rama de la IA" value={project.ai_branch.replace("_", " ")} />
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
          <MilestoneList projectId={project.id} projectName={project.name} />
        </TabsContent>
        <TabsContent value="deployments">
          <DeploymentLog projectId={project.id} />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Eliminar Proyecto</DialogTitle>
                <DialogDescription className="mt-1">
                  Esta accion eliminara permanentemente{" "}
                  <span className="font-semibold text-foreground">
                    {project.name}
                  </span>{" "}
                  y todos sus hitos, tareas y despliegues asociados.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar Proyecto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
