"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { milestonesApi } from "@/lib/api/milestones";
import type { Milestone, MilestoneCreate } from "@/types";

const statusVariant: Record<string, "secondary" | "warning" | "destructive" | "success" | "info"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  BLOCKED: "destructive",
  COMPLETED: "success",
  SKIPPED: "info",
};

export function MilestoneList({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      const data = await milestonesApi.list(projectId);
      setMilestones(data);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  const handleCreate = async (data: MilestoneCreate) => {
    await milestonesApi.create(projectId, data);
    setShowForm(false);
    loadMilestones();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Milestones</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {showForm && <MilestoneForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground font-mono py-4">
          No milestones yet
        </p>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    M{m.milestone_number}
                  </span>
                  <span className="text-sm font-medium text-foreground">{m.name}</span>
                </div>
                <Badge variant={statusVariant[m.status] || "secondary"} className="text-[10px]">
                  {m.status}
                </Badge>
              </div>
              {m.deliverable && (
                <p className="text-xs text-muted-foreground mb-2">{m.deliverable}</p>
              )}
              <Progress value={m.progress * 100} variant="brand" className="h-1.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: MilestoneCreate) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    deliverable: "",
    success_criteria: "",
  });

  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
      <Input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Milestone name"
      />
      <Input
        value={form.deliverable}
        onChange={(e) => setForm({ ...form, deliverable: e.target.value })}
        placeholder="What will be delivered?"
      />
      <Input
        value={form.success_criteria}
        onChange={(e) => setForm({ ...form, success_criteria: e.target.value })}
        placeholder="How do you know it's done?"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="gradient"
          onClick={() => onSubmit(form)}
          disabled={!form.name || !form.deliverable || !form.success_criteria}
        >
          Create
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
