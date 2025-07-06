// src/hooks/useCustomHooks.ts
import { useState, useEffect } from 'react'

export const useLocalStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined) {
        setValue(result[key])
      }
    })
  }, [key])

  const updateValue = (newValue: any) => {
    setValue(newValue)
    chrome.storage.local.set({ [key]: newValue })
  }

  return [value, updateValue]
}

export const useCurrentTab = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setTab(tabs[0] || null)
    })
  }, [])

  return tab
}
