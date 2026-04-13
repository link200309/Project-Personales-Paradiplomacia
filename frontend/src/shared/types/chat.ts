import type { PersonalityId } from "@/shared/types/personality"

export type MessageRole = "user" | "assistant" | "system"

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  personalityId?: PersonalityId
}

export interface ComparativeResponse {
  personalityId: PersonalityId
  personalityName: string
  content: string
}

export interface ComparativeResult {
  responses: ComparativeResponse[]
  optionalSummary?: string
}

export interface ComparativeTurn {
  id: string
  prompt: string
  createdAt: string
  result: ComparativeResult
}
