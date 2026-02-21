"use client";

import { useState, useEffect } from "react";
import { Plus, Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TaskBuilderChat } from "@/components/chat/task-builder-chat";
import { tasksApi } from "@/lib/api/tasks";
import type { Task, TaskCreate, TaskStatus } from "@/types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusColor: Record<string, string> = {
  PLANNED: "text-muted-foreground",
  IN_PROGRESS: "text-community-yellow",
  COMPLETED: "text-status-completed",
  CANCELLED: "text-muted-foreground line-through",
};

interface TaskBoardProps {
  milestoneId: string;
  projectId: string;
  projectName: string;
}

export function TaskBoard({ milestoneId, projectId, projectName }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [builderTask, setBuilderTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, [milestoneId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksApi.list(milestoneId);
      setTasks(Array.isArray(data) ? data : []);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  const handleCreate = async (data: TaskCreate) => {
    await tasksApi.create(milestoneId, data);
    setShowForm(false);
    loadTasks();
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await tasksApi.update(taskId, { status: newStatus });
    } catch {
      // Revert on failure
      loadTasks();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await tasksApi.delete(deleteTarget.id);
      // Optimistic removal
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    } catch {
      loadTasks();
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Tareas</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3 h-3" />
          Agregar
        </Button>
      </div>

      {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground font-mono">Sin tareas</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-card border border-border rounded-md px-3 py-2 group"
            >
              <span className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">
                {task.task_number}
              </span>
              <span className={`text-sm flex-1 truncate ${
                task.status === "CANCELLED" ? "line-through text-muted-foreground" :
                task.status === "COMPLETED" ? "text-status-completed" : "text-foreground"
              }`}>
                {task.title}
              </span>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                className={`text-[10px] font-mono bg-transparent border border-border rounded px-1.5 py-0.5 ${statusColor[task.status] || "text-muted-foreground"}`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setBuilderTask(task)}
                className="p-1 rounded hover:bg-brand-skyblue/10 text-brand-skyblue transition-colors"
                title="Asistente de construcción"
              >
                <Bot className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(task)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar tarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Tarea</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la tarea{" "}
              <span className="font-mono text-foreground">{deleteTarget?.task_number}</span>{" "}
              &quot;{deleteTarget?.title}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Builder chat dialog */}
      <Dialog open={!!builderTask} onOpenChange={(open) => !open && setBuilderTask(null)}>
        <DialogContent
          className="sm:max-w-4xl p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          {builderTask && (
            <TaskBuilderChat
              projectId={projectId}
              projectName={projectName}
              milestoneId={milestoneId}
              taskId={builderTask.id}
              taskTitle={builderTask.title}
              onCancel={() => setBuilderTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: TaskCreate) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    tech_component: "",
    task_type: "DEVELOPMENT" as const,
  });

  return (
    <div className="bg-secondary/50 border border-border rounded-md p-3 space-y-2">
      <Input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Título de la tarea"
        className="h-8 text-sm"
      />
      <Input
        value={form.tech_component}
        onChange={(e) => setForm({ ...form, tech_component: e.target.value })}
        placeholder="Componente técnico (ej. Backend API)"
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="gradient"
          onClick={() => onSubmit(form)}
          disabled={!form.title || !form.tech_component}
        >
          Agregar
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
