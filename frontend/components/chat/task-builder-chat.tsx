"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { TerminalHeader } from "@/components/ui/terminal-header";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/types";

interface TaskBuilderChatProps {
  projectId: string;
  projectName: string;
  milestoneId: string;
  taskId: string;
  taskTitle: string;
  onCancel: () => void;
}

export function TaskBuilderChat({
  projectId,
  projectName,
  milestoneId,
  taskId,
  taskTitle,
  onCancel,
}: TaskBuilderChatProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const welcomeMsg: ChatMessage = {
    id: "welcome",
    session_id: "",
    role: "assistant",
    content: `Estoy listo para ayudarte con **${taskTitle}**. Ya tengo el contexto de tu proyecto, hito y las tareas hermanas.\n\n¿En qué necesitas ayuda? Puedo:\n- Guiarte paso a paso en la implementación\n- Resolver dudas técnicas\n- Sugerir código o arquitectura\n- Ayudar con bloqueadores`,
    tokens_used: 0,
    sequence_number: 0,
    created_at: new Date().toISOString(),
  };
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    chatApi
      .createSession({
        title: `Builder: ${taskTitle}`,
        session_type: "task_builder",
        project_id: projectId,
        milestone_id: milestoneId,
        task_id: taskId,
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
  }, [projectId, milestoneId, taskId, taskTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || !sessionId) return;
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
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sessionId, messages.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[75vh] max-h-[700px]">
      <TerminalHeader
        title={taskTitle}
        path={`~/proyectos/${projectName}/builder`}
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

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInitializing
                ? "Inicializando..."
                : "¿En qué necesitas ayuda con esta tarea?"
            }
            rows={1}
            disabled={isInitializing}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] disabled:opacity-50"
          />
          <Button
            variant="gradient"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending || !sessionId}
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
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
