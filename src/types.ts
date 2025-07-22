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

export type ProblemInfo = {
  title: string
  difficulty: string
  tags: string[]
}

export type StepType =
  | 'intro'
  | 'boilerplate'
  | 'generate'
  | 'extract'
  | 'settings'
  | 'suggestions' // Added this for AI suggestions feature

// Optional: Add interface for chat messages if you want to export it
export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}
