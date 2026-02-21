"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MilestoneGenerationChat } from "@/components/chat/milestone-generation-chat";
import { milestonesApi } from "@/lib/api/milestones";
import type { Milestone } from "@/types";

const statusVariant: Record<string, "secondary" | "warning" | "destructive" | "success" | "info"> = {
  PLANNED: "secondary",
  IN_PROGRESS: "warning",
  BLOCKED: "destructive",
  COMPLETED: "success",
  SKIPPED: "info",
};

export function MilestoneList({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    setIsLoading(true);
    try {
      const data = await milestonesApi.list(projectId);
      setMilestones(Array.isArray(data) ? data : []);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  const handleChatComplete = () => {
    setShowChat(false);
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
        <h3 className="text-base font-semibold text-foreground">Hitos</h3>
        <Button variant="secondary" size="sm" onClick={() => setShowChat(true)}>
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent
          className="sm:max-w-4xl p-0 gap-0 overflow-hidden"
          showCloseButton={false}
        >
          <MilestoneGenerationChat
            projectId={projectId}
            projectName={projectName}
            onComplete={handleChatComplete}
            onCancel={() => setShowChat(false)}
          />
        </DialogContent>
      </Dialog>

      {milestones.length === 0 ? (
        <p className="text-sm text-muted-foreground font-mono py-4">
          Aún no hay hitos
        </p>
      ) : (
        <div className="space-y-3">
          {(milestones ?? []).map((m) => (
            <div
              key={m.id}
              className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-brand-skyblue/50 transition-colors"
              onClick={() => router.push(`/dashboard/projects/${projectId}/milestones/${m.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    M{m.milestone_number}
                  </span>
                  <span className="text-sm font-medium text-foreground">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[m.status] || "secondary"} className="text-[10px]">
                    {m.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
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
