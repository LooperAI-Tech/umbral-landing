/**
 * Chat types and interfaces
 */

export type TeachingMethod = 'practical' | 'conceptual' | 'analogical' | 'step-by-step'

export type AIModel =
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4'
  | 'anthropic/claude-3-sonnet'
  | 'anthropic/claude-3-opus'
  | 'meta-llama/llama-3-70b-instruct'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  session_id: string
  role: MessageRole
  content: string
  model_used?: string
  tokens_used: number
  teaching_method?: string
  sequence_number: number
  created_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  concept_id?: string
  title?: string
  ai_model: AIModel
  teaching_method: TeachingMethod
  status: string
  total_messages: number
  total_tokens: number
  created_at: string
  updated_at: string
  last_message_at?: string
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[]
}

export interface CreateSessionData {
  title?: string
  ai_model?: AIModel
  teaching_method?: TeachingMethod
  concept_id?: string
}

export interface SendMessageData {
  content: string
  ai_model?: AIModel
  teaching_method?: TeachingMethod
}

export interface UpdateSessionData {
  title?: string
  ai_model?: AIModel
  teaching_method?: TeachingMethod
  status?: string
}
