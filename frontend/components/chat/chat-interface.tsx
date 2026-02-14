"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  PanelRightOpen,
  PanelRightClose,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { chatApi } from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { TerminalHeader } from "@/components/ui/terminal-header";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ContextPanel } from "./context-panel";
import { cn } from "@/lib/utils";
import type { ExtractedLearning } from "@/types";

export function ChatInterface() {
  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    error,
    fetchSessions,
    createSession,
    selectSession,
    sendMessage,
    deleteSession,
    clearError,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [extractedLearnings, setExtractedLearnings] = useState<ExtractedLearning[] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput("");
    if (!currentSession) {
      await createSession({
        title: content.slice(0, 50),
        project_id: selectedProjectId || undefined,
      });
    }
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await createSession({
      title: "New Chat",
      project_id: selectedProjectId || undefined,
    });
  };

  const handleExtractLearnings = async () => {
    if (!currentSession) return;
    setIsExtracting(true);
    try {
      const result = await chatApi.extractLearnings(currentSession.id);
      setExtractedLearnings(result.learnings);
    } catch {
      /* handled */
    }
    setIsExtracting(false);
  };

  return (
    <div className="flex h-full">
      {/* Session sidebar */}
      <div className="w-56 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b border-border">
          <Button
            variant="gradient"
            size="sm"
            className="w-full"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            Nuevo Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer group",
                currentSession?.id === session.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <button
                onClick={() => selectSession(session.id)}
                className="flex-1 text-left truncate"
              >
                {session.title || "Sin título"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground px-2 py-4">
              Aún no hay conversaciones
            </p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TerminalHeader
          title={currentSession?.title || "Asistente IA"}
          path="~/asistente"
          status={isSending ? "loading" : "online"}
          actions={
            <div className="flex items-center gap-1">
              {currentSession && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleExtractLearnings}
                  disabled={isExtracting}
                  title="Extraer aprendizajes de este chat"
                >
                  <Sparkles className="w-4 h-4 text-community-yellow" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setContextOpen(!contextOpen)}
                title="Panel de contexto"
              >
                {contextOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </Button>
            </div>
          }
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-4 py-2 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-xs underline">
                Cerrar
              </button>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  Inicia una Conversación
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Pregunta sobre conceptos de IA/ML, obtén ayuda con tus proyectos o
                  discute tu camino de aprendizaje. La IA conoce el contexto de tu
                  proyecto.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isSending && <TypingIndicator />}

          {/* Extracted learnings display */}
          {extractedLearnings && (
            <div className="bg-community-yellow/10 border border-community-yellow/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-community-yellow flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Aprendizajes Extraídos ({extractedLearnings.length})
                </h4>
                <button
                  onClick={() => setExtractedLearnings(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cerrar
                </button>
              </div>
              {extractedLearnings.map((l, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-md p-3 text-xs space-y-1"
                >
                  <p className="font-semibold text-foreground">{l.concept}</p>
                  <p className="text-muted-foreground">{l.what_learned}</p>
                  <div className="flex gap-2">
                    <span className="font-mono text-brand-skyblue">
                      {l.category}
                    </span>
                    <span className="font-mono text-community-yellow">
                      {l.confidence_level}
                    </span>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground font-mono">
                Ve a la página de Aprendizajes para guardar estos en tu bóveda.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta lo que quieras sobre IA/ML..."
              rows={1}
              className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px]"
            />
            <Button
              variant="gradient"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isSending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1.5">
            Shift+Enter para nueva línea. Impulsado por Gemini.
          </p>
        </div>
      </div>

      {/* Context panel */}
      <ContextPanel
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />
    </div>
  );
}
