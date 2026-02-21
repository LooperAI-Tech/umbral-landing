"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, Sparkles } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { TerminalHeader } from "@/components/ui/terminal-header";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  session_id: "",
  role: "assistant",
  content:
    "¡Hola! Cuéntame brevemente qué proyecto de IA/ML quieres construir y lo creamos en segundos.",
  tokens_used: 0,
  sequence_number: 0,
  created_at: new Date().toISOString(),
};

export function ProjectCreationChat() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [createdProject, setCreatedProject] = useState<{
    id: string;
    display_id: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session on mount
  useEffect(() => {
    let cancelled = false;
    chatApi
      .createSession({
        title: "New Project",
        session_type: "project_creation",
      })
      .then((session) => {
        if (!cancelled) {
          setSessionId(session.id);
          setIsInitializing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudo iniciar la sesión de creación. ¿Está corriendo el backend?");
          setIsInitializing(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const sendContent = useCallback(async (content: string) => {
    if (!content.trim() || isSending || !sessionId || createdProject) return;
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

      if (aiResponse.action === "project_created" && aiResponse.action_data) {
        setCreatedProject({
          id: aiResponse.action_data.project_id as string,
          display_id: aiResponse.action_data.display_id as string,
          name: aiResponse.action_data.project_name as string,
        });
      }
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  }, [isSending, sessionId, createdProject, messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    await sendContent(content);
  }, [input, sendContent]);

  const handleActionClick = useCallback((_action: string, value: string) => {
    sendContent(value);
  }, [sendContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-card">
      <TerminalHeader
        title="Crear Nuevo Proyecto"
        path="~/proyectos/nuevo"
        status={isSending ? "loading" : "online"}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-4 py-2 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-xs underline">
              Cerrar
            </button>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLastAssistant =
            msg.role === "assistant" &&
            !messages.slice(idx + 1).some((m) => m.role === "assistant");
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              onActionClick={isLastAssistant ? handleActionClick : undefined}
            />
          );
        })}

        {isSending && <TypingIndicator />}

        {/* Project created success banner */}
        {createdProject && (
          <div className="bg-status-completed/10 border border-status-completed/30 rounded-lg p-5 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-status-completed mx-auto" />
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                ¡Proyecto Creado!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-mono text-brand-skyblue">
                  {createdProject.display_id}
                </span>{" "}
                — {createdProject.name}
              </p>
            </div>
            <Button
              variant="gradient"
              onClick={() =>
                router.push(`/dashboard/projects/${createdProject.id}`)
              }
            >
              <Sparkles className="w-4 h-4" />
              Ir al Proyecto
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); if (error) setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder={
              createdProject
                ? "¡Proyecto creado! Haz clic en 'Ir al Proyecto' arriba."
                : isInitializing
                ? "Inicializando..."
                : "Describe tu idea de proyecto..."
            }
            rows={1}
            disabled={!!createdProject || isInitializing}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] disabled:opacity-50"
          />
          <Button
            variant="gradient"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isSending || !sessionId || !!createdProject}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mt-1.5">
          Shift+Enter para nueva línea. La IA te guiará en la creación del proyecto.
        </p>
      </div>
    </div>
  );
}
