"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X, Send, RotateCcw } from "lucide-react";
import { useSideChatStore } from "@/stores/sideChatStore";
import { Button } from "@/components/ui/button";
import { TerminalHeader } from "@/components/ui/terminal-header";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

export function SideChatPanel() {
  const {
    isOpen,
    close,
    messages,
    isSending,
    isInitializing,
    error,
    sendMessage,
    resetSession,
  } = useSideChatStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, close]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending) return;
    const content = input.trim();
    setInput("");
    await sendMessage(content);
  }, [input, isSending, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={close}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-[400px] max-w-[90vw] flex flex-col bg-background border-l border-border shadow-lg animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex-shrink-0">
          <TerminalHeader
            title="Asistente IA"
            path="~/chat"
            status={isSending ? "loading" : "online"}
            actions={
              <div className="flex items-center gap-1">
                <button
                  onClick={resetSession}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-bg-hover transition-colors"
                  title="Nuevo Chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={close}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-bg-hover transition-colors"
                  title="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isSending && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isInitializing ? "Inicializando..." : "Escribe tu mensaje..."
              }
              rows={1}
              disabled={isInitializing}
              className="flex-1 min-h-[36px] max-h-[100px] resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground outline-none focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] disabled:opacity-50"
            />
            <Button
              variant="gradient"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isSending || isInitializing}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">
            Shift+Enter para nueva línea · Esc para cerrar
          </p>
        </div>
      </div>
    </>
  );
}
