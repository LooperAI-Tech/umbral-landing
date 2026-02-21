"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import {
  Cpu,
  Target,
  Users,
  Layers,
  BarChart3,
  Wrench,
} from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface ProjectSummaryData {
  name?: string;
  ai_branch_label?: string;
  problem_statement?: string;
  target_user?: string;
  technologies?: string[];
  level?: string;
  priority_label?: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  onActionClick?: (action: string, value: string) => void;
}

const SELECT_ACTIONS = ["select_ai_branch", "select_priority", "select_level"];

const AI_BRANCH_ICONS: Record<string, string> = {
  GENAI_LLM: "IA Generativa / LLMs",
  ML_TRADITIONAL: "Machine Learning",
  COMPUTER_VISION: "Vision por Computadora",
  NLP: "Procesamiento de Lenguaje",
  REINFORCEMENT_LEARNING: "Aprendizaje por Refuerzo",
  MLOPS: "MLOps / Infraestructura",
  DATA_ENGINEERING: "Ingenieria de Datos",
  OTHER: "Otra area",
};

function ProjectSummaryCard({ data }: { data: ProjectSummaryData }) {
  const fields = [
    {
      icon: Cpu,
      label: "Area de IA",
      value: data.ai_branch_label,
      color: "text-neon-cyan",
    },
    {
      icon: Target,
      label: "Problema",
      value: data.problem_statement,
      color: "text-brand-skyblue",
    },
    {
      icon: Users,
      label: "Usuario objetivo",
      value: data.target_user,
      color: "text-community-yellow",
    },
    {
      icon: Layers,
      label: "Nivel",
      value: data.level,
      color: "text-status-completed",
    },
    {
      icon: BarChart3,
      label: "Prioridad",
      value: data.priority_label,
      color: "text-community-blue-light",
    },
  ];

  return (
    <div className="mt-3 rounded-lg border border-brand-skyblue/30 bg-[var(--bg-terminal)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-brand-skyblue/20 bg-brand-skyblue/5">
        <h3 className="text-base font-display font-semibold text-foreground">
          {data.name}
        </h3>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-3">
        {fields.map(
          (field) =>
            field.value && (
              <div key={field.label} className="flex items-start gap-3">
                <field.icon
                  className={cn("w-4 h-4 mt-0.5 shrink-0", field.color)}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {field.label}
                  </span>
                  <p className="text-sm text-foreground leading-snug">
                    {field.value}
                  </p>
                </div>
              </div>
            )
        )}

        {/* Technologies as pills */}
        {data.technologies && data.technologies.length > 0 && (
          <div className="flex items-start gap-3">
            <Wrench className="w-4 h-4 mt-0.5 shrink-0 text-community-yellow" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Stack Tecnologico
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {data.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs font-mono rounded-md bg-brand-skyblue/10 text-brand-skyblue border border-brand-skyblue/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageBubble({ message, onActionClick }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isFailed = message.model_used === "failed";

  const isSelectAction =
    message.action &&
    SELECT_ACTIONS.includes(message.action) &&
    Array.isArray(message.action_data?.options);

  const isProjectSummary = message.action === "project_summary" && message.action_data;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3 text-sm",
          isUser
            ? isFailed
              ? "bg-destructive/10 text-foreground border border-destructive/30"
              : "bg-brand-skyblue/20 text-foreground border border-brand-skyblue/30"
            : "bg-card text-foreground border border-border"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-[var(--bg-terminal)] [&_pre]:border [&_pre]:border-[var(--border-subtle)] [&_pre]:rounded-md [&_code]:font-mono [&_code]:text-neon-cyan [&_a]:text-brand-skyblue [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:font-mono [&_th]:bg-brand-skyblue/10 [&_th]:text-brand-skyblue [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:border [&_th]:border-border [&_th]:font-semibold [&_td]:px-3 [&_td]:py-2 [&_td]:border [&_td]:border-border [&_td]:text-foreground [&_tr:hover]:bg-brand-skyblue/5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Project summary card */}
        {isProjectSummary && (
          <ProjectSummaryCard data={message.action_data as ProjectSummaryData} />
        )}

        {/* Inline selection buttons — only rendered when onActionClick is provided */}
        {isSelectAction && onActionClick && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
            {(message.action_data!.options as SelectOption[]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onActionClick?.(message.action!, opt.label)}
                className="px-3 py-2 rounded-md border border-brand-skyblue/30 text-sm text-foreground hover:bg-brand-skyblue/10 hover:border-brand-skyblue transition-all text-left"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {isFailed && (
          <p className="text-[10px] text-destructive font-mono mt-1">
            Error al enviar
          </p>
        )}

        <span className="block text-[10px] text-muted-foreground font-mono mt-2">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
