"use client";

import { useEffect } from "react";
import { X, Lightbulb, BookOpen } from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { cn } from "@/lib/utils";

interface ContextPanelProps {
  open: boolean;
  onClose: () => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}

export function ContextPanel({
  open,
  onClose,
  selectedProjectId,
  onSelectProject,
}: ContextPanelProps) {
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    if (open && projects.length === 0) fetchProjects();
  }, [open, projects.length, fetchProjects]);

  if (!open) return null;

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col shrink-0 h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Contexto</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" />
            Contexto del Proyecto
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Selecciona un proyecto para dar contexto a la IA sobre tu trabajo.
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => onSelectProject(null)}
              className={cn(
                "w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
                !selectedProjectId
                  ? "bg-brand-skyblue/20 text-brand-skyblue"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              Sin proyecto (general)
            </button>
            {(projects ?? []).map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={cn(
                  "w-full text-left text-xs px-3 py-2 rounded-md transition-colors",
                  selectedProjectId === p.id
                    ? "bg-brand-skyblue/20 text-brand-skyblue"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {p.display_id}
                </span>
                <br />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            Consejos
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>Pregunta sobre tu stack tecnológico para ayuda específica del proyecto</li>
            <li>Usa &quot;Extraer Aprendizajes&quot; para guardar ideas de tu conversación</li>
            <li>Referencia números de hitos para orientación específica</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
