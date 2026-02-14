"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, CheckCircle2, Target } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { TerminalHeader } from "@/components/ui/terminal-header";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/types";

interface MilestoneGenerationChatProps {
  projectId: string;
  projectName: string;
  onComplete: () => void;
  onCancel: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  session_id: "",
  role: "assistant",
  content:
    "¡Hola! Vamos a planificar los hitos de tu proyecto. Cuéntame:\n\n- ¿Cuáles son los objetivos principales?\n- ¿Cuánto tiempo tienes disponible?\n- ¿Qué quieres lograr primero?",
  tokens_used: 0,
  sequence_number: 0,
  created_at: new Date().toISOString(),
};

export function MilestoneGenerationChat({
  projectId,
  projectName,
  onComplete,
  onCancel,
}: MilestoneGenerationChatProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [createdMilestones, setCreatedMilestones] = useState<{
    count: number;
    projectId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    chatApi
      .createSession({
        title: `Hitos: ${projectName}`,
        session_type: "milestone_generation",
        project_id: projectId,
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
  }, [projectId, projectName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !sessionId || createdMilestones) return;
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

      if (aiResponse.action === "milestones_created" && aiResponse.action_data) {
        setCreatedMilestones({
          count: aiResponse.action_data.count as number,
          projectId: aiResponse.action_data.project_id as string,
        });
      }
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sessionId, createdMilestones, messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[55vh] max-h-[480px]">
      <TerminalHeader
        title={`Hitos: ${projectName}`}
        path="~/proyectos/hitos"
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

        {createdMilestones && (
          <div className="bg-status-completed/10 border border-status-completed/30 rounded-lg p-3 text-center space-y-2">
            <CheckCircle2 className="w-5 h-5 text-status-completed mx-auto" />
            <div>
              <h3 className="text-sm font-display font-semibold text-foreground">
                ¡Hitos Creados!
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Se crearon{" "}
                <span className="font-mono text-brand-skyblue">
                  {createdMilestones.count}
                </span>{" "}
                hitos para tu proyecto.
              </p>
            </div>
            <Button variant="gradient" size="sm" onClick={onComplete}>
              <Target className="w-3.5 h-3.5" />
              Ver Hitos
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              createdMilestones
                ? "¡Hitos creados! Haz clic en 'Ver Hitos' arriba."
                : isInitializing
                ? "Inicializando..."
                : "Describe tus objetivos y timeline..."
            }
            rows={1}
            disabled={!!createdMilestones || isInitializing}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] disabled:opacity-50"
          />
          <Button
            variant="gradient"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending || !sessionId || !!createdMilestones}
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
