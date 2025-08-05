// src/hooks/usePromptTracking.ts
import { useState, useEffect } from 'react'

interface PromptTrackingData {
  promptsUsed: number
  lastResetDate: string
  isPremium: boolean
}

interface UsePromptTrackingReturn {
  promptsUsed: number
  remainingPrompts: number
  isPremium: boolean
  isLoading: boolean
  incrementPromptUsage: () => Promise<void>
  resetDailyUsage: () => Promise<void>
  setPremiumStatus: (isPremium: boolean) => Promise<void>
}

const FREE_DAILY_LIMIT = 10
const STORAGE_KEY = 'promptTracking'

export function usePromptTracking(): UsePromptTrackingReturn {
  const [promptsUsed, setPromptsUsed] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const remainingPrompts = Math.max(0, FREE_DAILY_LIMIT - promptsUsed)

  // Initialize data from Chrome storage
  useEffect(() => {
    loadPromptData()
  }, [])

  const loadPromptData = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(STORAGE_KEY)
        const data: PromptTrackingData = result[STORAGE_KEY] || {
          promptsUsed: 0,
          lastResetDate: new Date().toDateString(),
          isPremium: false,
        }

        // Check if we need to reset daily usage
        const today = new Date().toDateString()
        if (data.lastResetDate !== today) {
          data.promptsUsed = 0
          data.lastResetDate = today
          await savePromptData(data)
        }

        setPromptsUsed(data.promptsUsed)
        setIsPremium(data.isPremium)
      }
    } catch (error) {
      console.error('Error loading prompt data:', error)
    } finally {
      setIsLoading(false) // Initial Loading of data is finished
    }
  }

  const savePromptData = async (data: PromptTrackingData) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [STORAGE_KEY]: data })
      }
    } catch (error) {
      console.error('Error saving prompt data:', error)
    }
  }

  const incrementPromptUsage = async () => {
    if (isPremium) return // No limits for premium users

    const newPromptsUsed = promptsUsed + 1
    setPromptsUsed(newPromptsUsed)

    const data: PromptTrackingData = {
      promptsUsed: newPromptsUsed,
      lastResetDate: new Date().toDateString(),
      isPremium,
    }

    await savePromptData(data)
  }

  const resetDailyUsage = async () => {
    setPromptsUsed(0)

    const data: PromptTrackingData = {
      promptsUsed: 0,
      lastResetDate: new Date().toDateString(),
      isPremium,
    }

    await savePromptData(data)
  }

  const setPremiumStatus = async (premium: boolean) => {
    setIsPremium(premium)

    const data: PromptTrackingData = {
      promptsUsed,
      lastResetDate: new Date().toDateString(),
      isPremium: premium,
    }

    await savePromptData(data)
  }

  return {
    promptsUsed,
    remainingPrompts,
    isPremium,
    isLoading,
    incrementPromptUsage,
    resetDailyUsage,
    setPremiumStatus,
  }
}

// Alternative implementation for environments without Chrome extensions
export function usePromptTrackingLocal(): UsePromptTrackingReturn {
  const [promptsUsed, setPromptsUsed] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const remainingPrompts = Math.max(0, FREE_DAILY_LIMIT - promptsUsed)

  useEffect(() => {
    loadPromptDataLocal()
  }, [])

  const loadPromptDataLocal = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data: PromptTrackingData = JSON.parse(stored)

        // Check if we need to reset daily usage
        const today = new Date().toDateString()
        if (data.lastResetDate !== today) {
          data.promptsUsed = 0
          data.lastResetDate = today
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }

        setPromptsUsed(data.promptsUsed)
        setIsPremium(data.isPremium)
      }
    } catch (error) {
      console.error('Error loading prompt data from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const incrementPromptUsage = async () => {
    if (isPremium) return

    const newPromptsUsed = promptsUsed + 1
    setPromptsUsed(newPromptsUsed)

    const data: PromptTrackingData = {
      promptsUsed: newPromptsUsed,
      lastResetDate: new Date().toDateString(),
      isPremium,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const resetDailyUsage = async () => {
    setPromptsUsed(0)

    const data: PromptTrackingData = {
      promptsUsed: 0,
      lastResetDate: new Date().toDateString(),
      isPremium,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const setPremiumStatus = async (premium: boolean) => {
    setIsPremium(premium)

    const data: PromptTrackingData = {
      promptsUsed,
      lastResetDate: new Date().toDateString(),
      isPremium: premium,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return {
    promptsUsed,
    remainingPrompts,
    isPremium,
    isLoading,
    incrementPromptUsage,
    resetDailyUsage,
    setPremiumStatus,
  }
}
