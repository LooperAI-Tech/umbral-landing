"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, CheckCircle2, ListChecks } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { TerminalHeader } from "@/components/ui/terminal-header";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/types";

interface TaskGenerationChatProps {
  projectId: string;
  projectName: string;
  milestoneId: string;
  milestoneName: string;
  onComplete: () => void;
  onCancel: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  session_id: "",
  role: "assistant",
  content:
    "¡Vamos a definir las tareas para este hito! Ya tengo el contexto del proyecto y el hito.\n\n¿Tienes tareas en mente o prefieres que sugiera algunas basándome en el entregable y los criterios de éxito?",
  tokens_used: 0,
  sequence_number: 0,
  created_at: new Date().toISOString(),
};

export function TaskGenerationChat({
  projectId,
  projectName,
  milestoneId,
  milestoneName,
  onComplete,
  onCancel,
}: TaskGenerationChatProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [createdTasks, setCreatedTasks] = useState<{
    count: number;
    milestoneId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    chatApi
      .createSession({
        title: `Tareas: ${milestoneName}`,
        session_type: "task_generation",
        project_id: projectId,
        milestone_id: milestoneId,
      })
      .then((session) => {
        if (!cancelled) {
          setSessionId(session.id);
          setIsInitializing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudo iniciar la sesión. ¿Está corriendo el backend?");
          setIsInitializing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, milestoneId, milestoneName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !sessionId || createdTasks) return;
    const content = input.trim();
    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content,
      tokens_used: 0,
      sequence_number: messages.length,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const aiResponse = await chatApi.sendMessage(sessionId, { content });
      setMessages((prev) => [...prev, aiResponse]);

      if (aiResponse.action === "tasks_created" && aiResponse.action_data) {
        setCreatedTasks({
          count: aiResponse.action_data.count as number,
          milestoneId: aiResponse.action_data.milestone_id as string,
        });
      }
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sessionId, createdTasks, messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-h-[600px]">
      <TerminalHeader
        title={`Tareas: ${milestoneName}`}
        path={`~/proyectos/${projectName}/tareas`}
        status={isSending ? "loading" : "online"}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-4 py-2 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-xs underline">
              Cerrar
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isSending && <TypingIndicator />}

        {createdTasks && (
          <div className="bg-status-completed/10 border border-status-completed/30 rounded-lg p-5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-status-completed mx-auto" />
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                ¡Tareas Creadas!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Se crearon{" "}
                <span className="font-mono text-brand-skyblue">
                  {createdTasks.count}
                </span>{" "}
                tareas para este hito.
              </p>
            </div>
            <Button variant="gradient" onClick={onComplete}>
              <ListChecks className="w-4 h-4" />
              Ver Tareas
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              createdTasks
                ? "¡Tareas creadas! Haz clic en 'Ver Tareas' arriba."
                : isInitializing
                ? "Inicializando..."
                : "Describe las tareas que necesitas..."
            }
            rows={1}
            disabled={!!createdTasks || isInitializing}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] disabled:opacity-50"
          />
          <Button
            variant="gradient"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending || !sessionId || !!createdTasks}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-muted-foreground font-mono">
            Shift+Enter para nueva línea
          </p>
          <button
            onClick={onCancel}
            className="text-[10px] text-muted-foreground hover:text-foreground font-mono underline"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
