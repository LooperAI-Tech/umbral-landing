import { create } from "zustand";
import { chatApi } from "@/lib/api/chat";
import type { ChatMessage } from "@/types";

interface SideChatState {
  isOpen: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  isSending: boolean;
  isInitializing: boolean;
  error: string | null;

  toggle: () => void;
  open: () => void;
  close: () => void;
  initSession: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  resetSession: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "side-welcome",
  session_id: "",
  role: "assistant",
  content:
    "¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?",
  tokens_used: 0,
  sequence_number: 0,
  created_at: new Date().toISOString(),
};

export const useSideChatStore = create<SideChatState>((set, get) => ({
  isOpen: false,
  sessionId: null,
  messages: [WELCOME_MESSAGE],
  isSending: false,
  isInitializing: false,
  error: null,

  toggle: () => {
    const { isOpen } = get();
    if (!isOpen) {
      get().open();
    } else {
      set({ isOpen: false });
    }
  },

  open: () => {
    set({ isOpen: true });
    const { sessionId } = get();
    if (!sessionId) {
      get().initSession();
    }
  },

  close: () => set({ isOpen: false }),

  initSession: async () => {
    set({ isInitializing: true, error: null });
    try {
      const session = await chatApi.createSession({
        title: "Asistente Rápido",
        session_type: "general",
      });
      set({ sessionId: session.id, isInitializing: false });
    } catch {
      set({
        error: "No se pudo iniciar la sesión.",
        isInitializing: false,
      });
    }
  },

  sendMessage: async (content: string) => {
    const { sessionId, isSending, messages } = get();
    if (!sessionId || isSending || !content.trim()) return;

    set({ isSending: true, error: null });

    const userMsg: ChatMessage = {
      id: `side-user-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: content.trim(),
      tokens_used: 0,
      sequence_number: messages.length,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ messages: [...state.messages, userMsg] }));

    try {
      const aiResponse = await chatApi.sendMessage(sessionId, {
        content: content.trim(),
      });
      set((state) => ({
        messages: [...state.messages, aiResponse],
        isSending: false,
      }));
    } catch {
      set({
        error: "No se pudo enviar el mensaje.",
        isSending: false,
      });
    }
  },

  resetSession: () => {
    set({
      sessionId: null,
      messages: [WELCOME_MESSAGE],
      isSending: false,
      error: null,
    });
    get().initSession();
  },
}));
