"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { tasksApi } from "@/lib/api/tasks";
import type { Task, TaskCreate, TaskStatus } from "@/types";

const statusVariant: Record<string, "secondary" | "warning" | "info" | "destructive" | "success"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  IN_REVIEW: "info",
  BLOCKED: "destructive",
  COMPLETED: "success",
  CANCELLED: "secondary",
};

export function TaskBoard({ milestoneId }: { milestoneId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [milestoneId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksApi.list(milestoneId);
      setTasks(data);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  const handleCreate = async (data: TaskCreate) => {
    await tasksApi.create(milestoneId, data);
    setShowForm(false);
    loadTasks();
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await tasksApi.update(taskId, { status });
    loadTasks();
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
        <h4 className="text-sm font-semibold text-foreground">Tasks</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3 h-3" />
          Add
        </Button>
      </div>

      {showForm && <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground font-mono">No tasks</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-card border border-border rounded-md px-3 py-2"
            >
              <span className="font-mono text-[10px] text-muted-foreground w-12 shrink-0">
                {task.task_number}
              </span>
              <span className="text-sm text-foreground flex-1 truncate">
                {task.title}
              </span>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                className="text-[10px] font-mono bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground"
              >
                {Object.keys(statusVariant).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Badge variant={statusVariant[task.status] || "secondary"} className="text-[10px]">
                {task.complexity}
              </Badge>
            </div>
          ))}
        </div>
      )}
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
        placeholder="Task title"
        className="h-8 text-sm"
      />
      <Input
        value={form.tech_component}
        onChange={(e) => setForm({ ...form, tech_component: e.target.value })}
        placeholder="Tech component (e.g. Backend API)"
        className="h-8 text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="gradient"
          onClick={() => onSubmit(form)}
          disabled={!form.title || !form.tech_component}
        >
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
