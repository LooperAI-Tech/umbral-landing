/**
 * Chat Zustand store
 */

import { create } from 'zustand'
import { chatApi } from '@/lib/api/chat'
import type {
  ChatSession,
  ChatMessage,
  AIModel,
  TeachingMethod,
  CreateSessionData,
  SendMessageData,
} from '@/types/chat'

interface ChatState {
  // State
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  error: string | null

  // AI settings
  selectedModel: AIModel
  selectedTeachingMethod: TeachingMethod

  // Actions
  fetchSessions: () => Promise<void>
  createSession: (data: CreateSessionData) => Promise<ChatSession>
  selectSession: (sessionId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  setModel: (model: AIModel) => void
  setTeachingMethod: (method: TeachingMethod) => void
  clearError: () => void
  deleteSession: (sessionId: string) => Promise<void>
  exportSession: (sessionId: string, format: string) => Promise<Blob>
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  selectedModel: 'openai/gpt-4-turbo',
  selectedTeachingMethod: 'conceptual',

  // Fetch user sessions
  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const sessions = await chatApi.listSessions('active', 100)
      set({ sessions, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch sessions',
        isLoading: false
      })
    }
  },

  // Create new session
  createSession: async (data: CreateSessionData) => {
    set({ isLoading: true, error: null })
    try {
      const session = await chatApi.createSession({
        ...data,
        ai_model: data.ai_model || get().selectedModel,
        teaching_method: data.teaching_method || get().selectedTeachingMethod,
      })

      set((state) => ({
        sessions: [session, ...state.sessions],
        currentSession: session,
        messages: [],
        isLoading: false,
      }))

      return session
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create session',
        isLoading: false
      })
      throw error
    }
  },

  // Select and load a session
  selectSession: async (sessionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const sessionWithMessages = await chatApi.getSession(sessionId)

      set({
        currentSession: sessionWithMessages,
        messages: sessionWithMessages.messages,
        selectedModel: sessionWithMessages.ai_model,
        selectedTeachingMethod: sessionWithMessages.teaching_method,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to load session',
        isLoading: false
      })
    }
  },

  // Send message and get AI response
  sendMessage: async (content: string) => {
    const { currentSession, selectedModel, selectedTeachingMethod } = get()

    if (!currentSession) {
      set({ error: 'No active session' })
      return
    }

    set({ isSending: true, error: null })

    // Optimistically add user message
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSession.id,
      role: 'user',
      content,
      tokens_used: 0,
      sequence_number: get().messages.length,
      created_at: new Date().toISOString(),
    }

    set((state) => ({
      messages: [...state.messages, userMessage],
    }))

    try {
      const messageData: SendMessageData = {
        content,
        ai_model: selectedModel,
        teaching_method: selectedTeachingMethod,
      }

      const aiMessage = await chatApi.sendMessage(currentSession.id, messageData)

      // Replace temp user message and add AI response
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, id: aiMessage.id.replace('-ai', '-user') }
            : msg
        ).concat([aiMessage]),
        isSending: false,
      }))

      // Update session stats
      if (currentSession) {
        set((state) => ({
          currentSession: state.currentSession ? {
            ...state.currentSession,
            total_messages: state.currentSession.total_messages + 2,
            total_tokens: state.currentSession.total_tokens + aiMessage.tokens_used,
            last_message_at: aiMessage.created_at,
          } : null,
        }))
      }
    } catch (error: any) {
      // Remove optimistic user message on error
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== userMessage.id),
        error: error.response?.data?.detail || 'Failed to send message',
        isSending: false,
      }))
    }
  },

  // Set AI model
  setModel: (model: AIModel) => {
    set({ selectedModel: model })
  },

  // Set teaching method
  setTeachingMethod: (method: TeachingMethod) => {
    set({ selectedTeachingMethod: method })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Delete session
  deleteSession: async (sessionId: string) => {
    try {
      await chatApi.deleteSession(sessionId)

      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        messages: state.currentSession?.id === sessionId ? [] : state.messages,
      }))
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to delete session' })
      throw error
    }
  },

  // Export session
  exportSession: async (sessionId: string, format: string) => {
    try {
      return await chatApi.exportSession(sessionId, format)
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to export session' })
      throw error
    }
  },

  // Update session title
  updateSessionTitle: async (sessionId: string, title: string) => {
    try {
      const updatedSession = await chatApi.updateSession(sessionId, { title })

      set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? updatedSession : s),
        currentSession: state.currentSession?.id === sessionId ? updatedSession : state.currentSession,
      }))
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Failed to update session title' })
      throw error
    }
  },
}))
