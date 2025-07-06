// Chrome extension debugging utilities
export const debugLog = (message: string, data?: any) => {
  // For Chrome extension debugging, use chrome.runtime.sendMessage or storage
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime
      .sendMessage({
        type: 'DEBUG_LOG',
        message,
        data,
        timestamp: new Date().toISOString(),
      })
      .catch(() => {
        // Fallback: store in local storage for debugging
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]')
        logs.push({ message, data, timestamp: new Date().toISOString() })
        localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50))) // Keep last 50 logs
      })
  }
}

// Simple API test function for Chrome extension
export const testGeminiInExtension = async (
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with "API working"' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return `API Test Failed: ${response.status} - ${
        errorData?.error?.message || 'Unknown error'
      }`
    }

    const data = await response.json()
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text

    return result
      ? `API Test Success: ${result}`
      : 'API Test Failed: No response'
  } catch (error) {
    return `API Test Error: ${
      error instanceof Error ? error.message : 'Connection failed'
    }`
  }
}

// View debug logs (call this in your extension popup or options page)
export const getDebugLogs = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('debug_logs') || '[]')
  } catch {
    return []
  }
}

// Clear debug logs
export const clearDebugLogs = () => {
  localStorage.removeItem('debug_logs')
}
