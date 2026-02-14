"use client";

import { useState, useEffect } from "react";
import { Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deploymentsApi } from "@/lib/api/deployments";
import type { Deployment, DeploymentCreate } from "@/types";

const statusVariant: Record<string, "secondary" | "warning" | "success" | "destructive" | "info"> = {
  PREPARING: "secondary",
  DEPLOYING: "warning",
  ACTIVE: "success",
  DEPRECATED: "info",
  ROLLED_BACK: "destructive",
  FAILED: "destructive",
};

export function DeploymentLog({ projectId }: { projectId: string }) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadDeployments();
  }, [projectId]);

  const loadDeployments = async () => {
    setIsLoading(true);
    try {
      const data = await deploymentsApi.list(projectId);
      setDeployments(data);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  const handleCreate = async (data: DeploymentCreate) => {
    await deploymentsApi.create(projectId, data);
    setShowForm(false);
    loadDeployments();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Deployments</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Log Deploy
        </Button>
      </div>

      {showForm && <DeploymentForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {deployments.length === 0 ? (
        <p className="text-sm text-muted-foreground font-mono py-4">
          No deployments logged yet
        </p>
      ) : (
        <div className="space-y-3">
          {deployments.map((d) => (
            <div key={d.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    v{d.version}
                  </span>
                  <Badge variant={statusVariant[d.status] || "secondary"} className="text-[10px]">
                    {d.status}
                  </Badge>
                  <Badge variant="info" className="text-[10px]">
                    {d.environment}
                  </Badge>
                </div>
                {d.access_url && (
                  <a
                    href={d.access_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-skyblue hover:text-brand-skyblue-light"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {d.release_notes && (
                <p className="text-xs text-muted-foreground">{d.release_notes}</p>
              )}
              <p className="text-[10px] font-mono text-muted-foreground mt-2">
                {new Date(d.deploy_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeploymentForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: DeploymentCreate) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    version: "",
    version_major: 0,
    version_minor: 1,
    version_patch: 0,
    release_notes: "",
    access_url: "",
  });

  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input
          type="number"
          value={form.version_major}
          onChange={(e) => setForm({ ...form, version_major: parseInt(e.target.value) || 0 })}
          placeholder="Major"
        />
        <Input
          type="number"
          value={form.version_minor}
          onChange={(e) => setForm({ ...form, version_minor: parseInt(e.target.value) || 0 })}
          placeholder="Minor"
        />
        <Input
          type="number"
          value={form.version_patch}
          onChange={(e) => setForm({ ...form, version_patch: parseInt(e.target.value) || 0 })}
          placeholder="Patch"
        />
      </div>
      <Input
        value={form.release_notes}
        onChange={(e) => setForm({ ...form, release_notes: e.target.value })}
        placeholder="Release notes"
      />
      <Input
        value={form.access_url}
        onChange={(e) => setForm({ ...form, access_url: e.target.value })}
        placeholder="Access URL (optional)"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="gradient"
          onClick={() =>
            onSubmit({
              ...form,
              version: `${form.version_major}.${form.version_minor}.${form.version_patch}`,
            })
          }
        >
          Log Deployment
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
