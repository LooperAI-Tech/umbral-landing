import { create } from "zustand";
import { chatApi } from "@/lib/api/chat";
import type {
  ChatSession,
  ChatMessage,
  CreateSessionData,
  SendMessageData,
} from "@/types";

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  fetchSessions: () => Promise<void>;
  createSession: (data: CreateSessionData) => Promise<ChatSession>;
  selectSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await chatApi.listSessions("active", 100);
      set({ sessions: Array.isArray(sessions) ? sessions : [], isLoading: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudieron cargar las sesiones";
      set({ error: msg, isLoading: false });
    }
  },

  createSession: async (data: CreateSessionData) => {
    set({ isLoading: true, error: null });
    try {
      const session = await chatApi.createSession(data);
      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSession: session,
        messages: [],
        isLoading: false,
      }));
      return session;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo crear la sesión";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  selectSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const sessionWithMessages = await chatApi.getSession(sessionId);
      set({
        currentSession: sessionWithMessages,
        messages: Array.isArray(sessionWithMessages?.messages) ? sessionWithMessages.messages : [],
        isLoading: false,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo cargar la sesión";
      set({ error: msg, isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    const { currentSession } = get();
    if (!currentSession) {
      set({ error: "No hay sesión activa" });
      return;
    }

    set({ isSending: true, error: null });

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSession.id,
      role: "user",
      content,
      tokens_used: 0,
      sequence_number: get().messages.length,
      created_at: new Date().toISOString(),
    };

    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const data: SendMessageData = { content };
      const aiMessage = await chatApi.sendMessage(currentSession.id, data);

      set((state) => ({
        messages: state.messages
          .map((msg) =>
            msg.id === userMessage.id ? { ...msg, id: `user-${Date.now()}` } : msg
          )
          .concat([aiMessage]),
        isSending: false,
      }));
    } catch (error: unknown) {
      const isTimeout = error instanceof Error && error.message.includes("timeout");
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, id: `failed-${Date.now()}`, model_used: "failed" }
            : msg
        ),
        error: isTimeout
          ? "La respuesta tardó demasiado. Intenta enviar el mensaje de nuevo."
          : error instanceof Error ? error.message : "No se pudo enviar el mensaje",
        isSending: false,
      }));
    }
  },

  clearError: () => set({ error: null }),

  deleteSession: async (sessionId: string) => {
    try {
      await chatApi.deleteSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        currentSession:
          state.currentSession?.id === sessionId ? null : state.currentSession,
        messages:
          state.currentSession?.id === sessionId ? [] : state.messages,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo eliminar la sesión";
      set({ error: msg });
    }
  },

  updateSessionTitle: async (sessionId: string, title: string) => {
    try {
      const updated = await chatApi.updateSession(sessionId, { title });
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === sessionId ? updated : s
        ),
        currentSession:
          state.currentSession?.id === sessionId
            ? updated
            : state.currentSession,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "No se pudo actualizar el título";
      set({ error: msg });
    }
  },
}));
