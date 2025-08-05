// src/types.ts

export const LANGUAGES = [
  'C++',
  'Python',
  'JavaScript',
  'Java',
  'C',
  'Go',
  'Rust',
] as const

export type Language = (typeof LANGUAGES)[number]

export type StepType =
  | 'intro'
  | 'boilerplate'
  | 'generate'
  | 'extract'
  | 'settings'
  | 'suggestions'

export interface ProblemInfo {
  title: string
  difficulty: string
  tags: string[]
}

export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

// Alias if needed
export type ChatMessage = Message

export interface PromptTrackingData {
  promptsUsed: number
  lastResetDate: string
  isPremium: boolean
}

export interface UsePromptTrackingReturn {
  promptsUsed: number
  remainingPrompts: number
  isPremium: boolean
  isLoading: boolean
  incrementPromptUsage: () => Promise<void>
  resetDailyUsage: () => Promise<void>
  setPremiumStatus: (isPremium: boolean) => Promise<void>
}
