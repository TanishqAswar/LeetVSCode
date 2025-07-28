// src/utils/aiUtils.ts
import { Language, ProblemInfo } from '../types'
import {
  debugLog,
  testGeminiInExtension,
  getDebugLogs,
  clearDebugLogs,
} from './debugUtils'

// Enhanced rate limiting configuration
interface RateLimitConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRetries: 5,
  baseDelay: 2000, // Start with 2 seconds
  maxDelay: 60000, // Max 60 seconds
  backoffMultiplier: 2,
}

// Track API calls per minute
class APIRateLimiter {
  private callTimes: number[] = []
  private readonly maxCallsPerMinute = 15 // Conservative limit
  private readonly timeWindow = 60000 // 1 minute

  canMakeCall(): boolean {
    const now = Date.now()
    // Remove calls older than 1 minute
    this.callTimes = this.callTimes.filter(
      (time) => now - time < this.timeWindow
    )
    return this.callTimes.length < this.maxCallsPerMinute
  }

  recordCall(): void {
    this.callTimes.push(Date.now())
  }

  getNextAvailableTime(): number {
    if (this.callTimes.length === 0) return 0
    const oldestCall = Math.min(...this.callTimes)
    return Math.max(0, this.timeWindow - (Date.now() - oldestCall))
  }
}

const rateLimiter = new APIRateLimiter()

export const generateDriverPrompt = (
  html: string,
  language: Language,
  boilerplate: string
): string => {
  return `You are an expert competitive programming assistant. Generate complete driver code in ${language} that parses input EXACTLY as shown in examples.

HTML: ${html}
BOILERPLATE: ${boilerplate}

REQUIREMENTS:
1. Declare all classes/structs BEFORE main function
2. Parse input exactly matching example format  
3. Leave solution empty with "// Implement solution here"
4. Add "// Hare Krishna! Chant and be happy" at top
5. Handle exact output format (including [null, result] for class problems)

IMPORTANT: DO NOT IMPLEMENT YOUR SOLUTION

PROBLEM TYPES:
- **Class-based**: Operations array like ["Constructor", "method1", "method2"] 
- **Single function**: One function call, ignore test case input if boilerplate has it
- **Multiple test cases**: Loop with t test cases

PARSING HELPERS:
For C++:
vector<vector<int>> parseNestedArray(const string& s) {
    vector<vector<int>> result;
    vector<int> current;
    string num = "";
    bool inArray = false;
    
    for (char c : s) {
        if (c == '[') {
            inArray = true;
            if (!current.empty()) result.push_back(current), current.clear();
        }
        else if (c == ']') {
            if (!num.empty()) current.push_back(stoi(num)), num = "";
            if (inArray && !current.empty()) result.push_back(current), current.clear();
            inArray = false;
        }
        else if (c == ',' || c == ' ') {
            if (!num.empty()) current.push_back(stoi(num)), num = "";
        }
        else if (c == '-' || isdigit(c)) {
            num += c;
        }
    }
    return result;
}

vector<string> parseOps(const string& s) {
    vector<string> ops;
    bool inQuote = false;
    string current = "";
    for (char c : s) {
        if (c == '"') inQuote = !inQuote;
        else if (inQuote) current += c;
        else if (!current.empty()) ops.push_back(current), current = "";
    }
    return ops;
}

For graphs, trees, linked lists - build appropriate data structures from parsed arrays.

INPUT PATTERNS:
- Arrays: [1,2,3] or 1 2 3
- Nested: [[1,2],[3,4]]
- Graphs: [[0,1],[1,2]] (edges) + n (nodes)
- Trees: [1,2,3,null,null,4,5] (level-order, null=-1)
- LinkedLists: [1,2,3,4,5]
- Strings: "hello" or hello

OUTPUT PATTERNS:
- Class problems: [null, result1, null, result2]
- Function problems: direct result
- Trees/Lists: convert back to array format

EXAMPLE CLASS PARSING:
Input: ["FindSumPairs", "count", "add", "count"]
       [[1,1,2,2,2,3],[1,4,5,2,5,4]]
       [7]
       [3,2]
       [8]

Process: Parse operations → Parse constructor params → For each operation read next line → Output [null, result1, null, result2]

STRUCTURE:
// Hare Krishna! Chant and be happy
#include <bits/stdc++.h>
using namespace std;

class Solution {
    // Implement solution here
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Parse input, build data structures, call solution, format output
    return 0;
}

OUTPUT: Complete working driver code without markdown formatting or backticks. Also No Implementation of the given function.`
}

export const generateExtractPrompt = (
  code: string,
  language: Language
): string => {
  return `Extract submittable solution from ${language} code. Keep original logic unchanged. Do not implement your own logic even if the given logic is wrong.

CODE: ${code}

KEEP: Solution class, helper functions, headers, constants, original implementation
REMOVE: main(), parsing functions, I/O code, driver logic
REMEMBER: DO NOT IMPLEMENT OR CHANGE ANY LOGIC
Add "// Hare Krishna! Chant and be happy" at top.

OUTPUT: Clean solution code (no markdown, no backticks).`
}

// Enhanced delay function with exponential backoff
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Calculate delay with exponential backoff and jitter
function calculateDelay(attempt: number, config: RateLimitConfig): number {
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  )

  // Add jitter (±20% randomness)
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5)
  return Math.floor(exponentialDelay + jitter)
}

export const callGeminiAPI = async (
  prompt: string,
  apiKey: string,
  preserveMarkdown: boolean = false,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): Promise<string> => {
  // Check rate limiter first
  if (!rateLimiter.canMakeCall()) {
    const waitTime = rateLimiter.getNextAvailableTime()
    debugLog('Rate limiter: waiting', { waitTime })
    await delay(waitTime + 1000) // Add 1 second buffer
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      debugLog(`API attempt ${attempt + 1}`, {
        promptLength: prompt.length,
        apiKeyValid: validateApiKey(apiKey),
      })

      // Validate API key
      if (!validateApiKey(apiKey)) {
        throw new Error('Invalid API key format')
      }

      const models = ['gemini-1.5-flash']

      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.3,
                  topP: 0.9,
                  topK: 40,
                  maxOutputTokens: 2048,
                },
                safetySettings: [
                  {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_NONE',
                  },
                  {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_NONE',
                  },
                  {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_NONE',
                  },
                  {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE',
                  },
                ],
              }),
            }
          )

          debugLog(`API Response Status for ${model}`, {
            status: response.status,
            ok: response.ok,
            attempt: attempt + 1,
          })

          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')

            // Handle rate limiting specifically
            if (response.status === 429) {
              debugLog('Rate limit hit', { attempt: attempt + 1, status: 429 })

              // Extract retry-after if available
              const retryAfter = response.headers.get('retry-after')
              const waitTime = retryAfter
                ? parseInt(retryAfter) * 1000
                : calculateDelay(attempt, config)

              debugLog('Rate limit: waiting', { waitTime, retryAfter })

              if (attempt < config.maxRetries) {
                await delay(waitTime)
                throw new Error(`Rate limited, retrying after ${waitTime}ms`)
              } else {
                throw new Error('Rate limit exceeded - maximum retries reached')
              }
            }

            // Handle other HTTP errors
            if (response.status === 400) {
              throw new Error(`Invalid request: ${errorText}`)
            } else if (response.status === 401) {
              throw new Error('Invalid API key')
            } else if (response.status === 403) {
              throw new Error('API key lacks required permissions')
            } else if (response.status === 503) {
              debugLog('Service unavailable', { attempt: attempt + 1 })
              if (attempt < config.maxRetries) {
                await delay(calculateDelay(attempt, config))
                throw new Error('Service temporarily unavailable, retrying...')
              } else {
                throw new Error('Service unavailable - maximum retries reached')
              }
            }

            throw new Error(
              `HTTP error! status: ${response.status} - ${errorText}`
            )
          }

          const data = await response.json()
          debugLog(`API Response Data for ${model}`, {
            hasData: !!data,
            hasCandidates: !!data?.candidates,
            candidatesLength: data?.candidates?.length || 0,
          })

          if (!data.candidates || !data.candidates[0]) {
            throw new Error(
              `No response from Gemini API (${model}) - no candidates returned`
            )
          }

          const candidate = data.candidates[0]

          // Check if content was blocked
          if (candidate.finishReason === 'SAFETY') {
            throw new Error(`Content blocked by safety filters (${model})`)
          }

          if (
            !candidate.content ||
            !candidate.content.parts ||
            !candidate.content.parts[0]
          ) {
            throw new Error(
              `Invalid response structure from Gemini API (${model})`
            )
          }

          let text = candidate.content.parts[0].text

          if (!text || text.trim().length === 0) {
            throw new Error(`Empty response from Gemini API (${model})`)
          }

          // Record successful call
          rateLimiter.recordCall()

          // Clean up response based on use case
          if (preserveMarkdown) {
            text = text.trim()
            if (text.startsWith('```') && text.endsWith('```')) {
              const lines = text.split('\n')
              if (lines.length > 2) {
                text = lines.slice(1, -1).join('\n').trim()
              }
            }
          } else {
            text = text
              .replace(/^```\w*\n?/, '')
              .replace(/\n?```$/, '')
              .replace(/^```/, '')
              .replace(/```$/, '')
              .trim()

            text = text
              .replace(/^Here's the.*?:\n/i, '')
              .replace(/^The complete.*?:\n/i, '')
              .replace(/\n\n+/g, '\n\n')
              .trim()
          }

          debugLog(`API Success with ${model}`, {
            responseLength: text.length,
            attempt: attempt + 1,
          })
          return text
        } catch (modelError) {
          lastError =
            modelError instanceof Error
              ? modelError
              : new Error('Unknown model error')
          debugLog(`Model ${model} failed`, {
            error: lastError.message,
            attempt: attempt + 1,
          })
          // Continue to retry logic
          break
        }
      }

      // If we get here, the model failed - check if we should retry
      if (
        lastError?.message.includes('Rate limited') ||
        lastError?.message.includes('Service temporarily unavailable')
      ) {
        // These are retryable errors, continue to next attempt
        continue
      } else {
        // Non-retryable error, break out of retry loop
        break
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      debugLog(`Attempt ${attempt + 1} failed`, { error: lastError.message })

      // If this is the last attempt, don't delay
      if (attempt < config.maxRetries) {
        const delayTime = calculateDelay(attempt, config)
        debugLog('Retrying after delay', {
          delayTime,
          nextAttempt: attempt + 2,
        })
        await delay(delayTime)
      }
    }
  }

  // All attempts failed
  const errorMessage = lastError?.message || 'All API attempts failed'
  debugLog('All attempts exhausted', { error: errorMessage })
  throw new Error(
    `API Error after ${config.maxRetries + 1} attempts: ${errorMessage}`
  )
}

// Enhanced utility function to validate generated code
export const validateDriverCode = (
  code: string,
  language: Language
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Basic validation
  if (!code || code.trim().length === 0) {
    errors.push('Generated code is empty')
    return { isValid: false, errors }
  }

  if (language === 'C++') {
    // Check for essential C++ elements
    if (!code.includes('#include')) {
      errors.push('Missing #include statements')
    }
    if (!code.includes('int main(')) {
      errors.push('Missing main function')
    }
    if (!code.includes('return 0')) {
      errors.push('Main function should return 0')
    }
    if (
      code.includes('// Your solution here') &&
      !code.includes('class') &&
      !code.includes('struct')
    ) {
      errors.push('Solution class/struct seems to be missing')
    }
  }

  // Check for common issues
  if (code.includes('```')) {
    errors.push('Code contains markdown formatting')
  }
  if (code.length < 50) {
    errors.push('Generated code seems too short')
  }
  if (code.includes('Error:')) {
    errors.push('Code contains error messages')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Helper function to enhance prompts with problem-specific context
export const enhancePromptWithContext = (
  basePrompt: string,
  problemInfo: { title: string; difficulty: string; tags: string[] }
): string => {
  const contextualHints: string[] = []

  // Add hints based on problem tags
  if (problemInfo.tags.includes('Hash Table')) {
    contextualHints.push(
      '- This problem likely uses hash tables/unordered_map for efficient lookups'
    )
  }
  if (problemInfo.tags.includes('Design')) {
    contextualHints.push(
      '- This is a design problem - focus on correct class structure and method implementation'
    )
  }
  if (problemInfo.tags.includes('Array')) {
    contextualHints.push(
      '- Pay attention to array indexing and bounds checking'
    )
  }
  if (problemInfo.tags.includes('Two Pointers')) {
    contextualHints.push(
      '- Consider two-pointer technique for efficient array processing'
    )
  }

  // Add difficulty-specific hints
  if (problemInfo.difficulty === 'Easy') {
    contextualHints.push(
      '- This is an Easy problem - focus on straightforward implementation'
    )
  } else if (problemInfo.difficulty === 'Medium') {
    contextualHints.push(
      '- This is a Medium problem - may require optimization or clever data structures'
    )
  } else if (problemInfo.difficulty === 'Hard') {
    contextualHints.push(
      '- This is a Hard problem - expect complex algorithms or advanced data structures'
    )
  }

  if (contextualHints.length > 0) {
    return `${basePrompt}\n\nPROBLEM-SPECIFIC HINTS:\n${contextualHints.join(
      '\n'
    )}\n`
  }

  return basePrompt
}

// Utility to check API key validity
export const validateApiKey = (apiKey: string): boolean => {
  return !!(apiKey && apiKey.trim().length > 0 && apiKey.startsWith('AIza'))
}

// Remove the old rate limiting approach
export const rateLimitedApiCall = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
  // Just use the enhanced callGeminiAPI with built-in rate limiting
  return callGeminiAPI(prompt, apiKey)
}

// Test function to debug API issues
export const testApiConnection = async (apiKey: string): Promise<string> => {
  try {
    debugLog('Testing API connection', { keyLength: apiKey.length })

    const testPrompt = 'Say "Hello, API is working!"'
    const result = await callGeminiAPI(testPrompt, apiKey)

    debugLog('Test result', { result })
    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    debugLog('Test failed', { error: errorMessage })
    return `Test failed: ${errorMessage}`
  }
}

// export function generateSuggestionPrompt(
//   problemHtml: string,
//   language: Language,
//   problemInfo: ProblemInfo,
//   userQuery?: string
// ): string {
//   const basePrompt = `
// 🕉️ DIVINE GUIDANCE SYSTEM 🕉️

// You are a coding mentor with the wisdom of Lord Krishna from the Bhagavad Gita. Your role is to guide programmers towards solutions with hints, not direct answers unless user asks for it. Always maintain a spiritual, encouraging tone.

// PROBLEM CONTEXT:
// - Title: ${problemInfo.title}
// - Difficulty: ${problemInfo.difficulty}
// - Language: ${language}
// - Tags: ${problemInfo.tags.join(', ')}

// HTML CONTENT:
// ${problemHtml}

// GUIDANCE PRINCIPLES:
// 1. 🙏 Always start with "Hare Krishna, dear friend!" or similar spiritual greeting
// 2. 💡 Provide HINTS and GUIDANCE, never direct solutions or complete code until user asks for it
// 3. 🧘‍♂️ Use spiritual metaphors and Krishna's wisdom when explaining concepts
// 4. 🌸 Be encouraging and supportive, like Krishna guiding Arjuna
// 5. 📚 Break down complex problems into smaller, manageable steps
// 6. 🎯 Ask guiding questions that lead to self-discovery
// 7. 🕊️ End with "May Krishna bless your coding journey!" or "Chant and Be Happy"

// RESPONSE STYLE:
// - Use emojis appropriately ( 🙏 💎 🌸 📚 💡)
// - Keep responses concise but meaningful
// - Encourage independent thinking
// - Don't Consider yourself as Krishna but just a senior spiritual and coding mentor

// ${
//   userQuery
//     ? `USER'S SPECIFIC QUESTION: ${userQuery}`
//     : 'INITIAL GUIDANCE REQUEST: Provide initial hints and direction for this problem.'
// }

// Remember: Your goal is to illuminate the path, not walk it for them. Guide them like Krishna guided Arjuna in the Bhagavad Gita.
// `

//   return basePrompt
// }

// export function generateFollowUpPrompt(
//   previousConversation: string,
//   userQuery: string,
//   language: Language,
//   problemInfo: ProblemInfo
// ): string {
//   return `
// 🕉️ CONTINUATION OF DIVINE GUIDANCE 🕉️

// PREVIOUS CONVERSATION:
// ${previousConversation}

// CURRENT PROBLEM:
// - Title: ${problemInfo.title}
// - Language: ${language}

// USER'S NEW QUESTION: ${userQuery}

// Continue the guidance with the same spiritual tone and principles:
// 1. 🙏 Acknowledge their question with grace
// 2. 💡 Provide helpful hints without giving away the solution until the user asks for it
// 3. 🧘‍♂️ Use Krishna's wisdom and spiritual metaphors
// 4. 🌸 Be encouraging and supportive
// 5. 🕊️ Guide them towards self-discovery
// 6. If the user asks for solution, then give him the solution with proper commented mistakes of his and correct version.

// Remember: You are their spiritual coding mentor, helping them grow through understanding, not dependency.
// `
// }

// // Updated helper functions to specify markdown preservation
// export async function getAISuggestion(
//   apiKey: string,
//   problemHtml: string,
//   language: Language,
//   problemInfo: ProblemInfo,
//   userQuery?: string,
//   conversationHistory?: string
// ): Promise<string> {
//   try {
//     let prompt: string

//     if (conversationHistory && userQuery) {
//       // This is a follow-up question
//       prompt = generateFollowUpPrompt(
//         conversationHistory,
//         userQuery,
//         language,
//         problemInfo
//       )
//     } else {
//       // This is initial suggestion or first question
//       prompt = generateSuggestionPrompt(
//         problemHtml,
//         language,
//         problemInfo,
//         userQuery
//       )
//     }

//     // Preserve markdown for AI suggestions since they likely contain formatted content
//     const response = await callGeminiAPI(prompt, apiKey, true)

//     return response
//   } catch (error) {
//     console.error('AI Suggestion error:', error)
//     throw new Error(`Failed to get AI suggestion, ${error}`)
//   }
// }

// // Helper to build conversation history for context
// export function buildConversationHistory(
//   messages: Array<{ type: 'user' | 'ai'; content: string }>
// ): string {
//   return messages
//     .map((msg) =>
//       msg.type === 'user'
//         ? `DEVOTEE: ${msg.content}`
//         : `AI'S GUIDANCE: ${msg.content}`
//     )
//     .join('\n\n')
// }

export function generateSuggestionPrompt(
  problemHtml: string,
  language: Language,
  problemInfo: ProblemInfo,
  userQuery?: string
): string {
  const basePrompt = `
🕉️ DIVINE GUIDANCE SYSTEM 🕉️

You are a coding mentor with the wisdom of Lord Krishna from the Bhagavad Gita. Your role is to guide programmers towards solutions with hints, not direct answers unless user asks for it. Always maintain a spiritual, encouraging tone.

PROBLEM CONTEXT:
- Title: ${problemInfo.title}
- Difficulty: ${problemInfo.difficulty}
- Language: ${language}
- Tags: ${problemInfo.tags.join(', ')}

HTML CONTENT:
${problemHtml}

GUIDANCE PRINCIPLES:
1. 🙏 Always start with "Hare Krishna, dear friend!" or similar spiritual greeting
2. 💡 Provide HINTS and GUIDANCE, never direct solutions or complete code until user asks for it
3. 🧘‍♂️ Use spiritual metaphors and Krishna's wisdom when explaining concepts
4. 🌸 Be encouraging and supportive, like Krishna guiding Arjuna
5. 📚 Break down complex problems into smaller, manageable steps
6. 🎯 Ask guiding questions that lead to self-discovery
7. 🕊️ End with "May Krishna bless your coding journey!" or "Chant and Be Happy"

RESPONSE STYLE:
- Use emojis appropriately ( 🙏 💎 🌸 📚 💡)
- Keep responses concise but meaningful
- Encourage independent thinking
- Don't Consider yourself as Krishna but just a senior spiritual and coding mentor

${
  userQuery
    ? `USER'S SPECIFIC QUESTION: ${userQuery}`
    : 'INITIAL GUIDANCE REQUEST: Provide initial hints and direction for this problem.'
}

Remember: Your goal is to illuminate the path, not walk it for them. Guide them like Krishna guided Arjuna in the Bhagavad Gita.
`

  return basePrompt
}

export function generateFollowUpPrompt(
  previousConversation: string,
  userQuery: string,
  language: Language,
  problemInfo: ProblemInfo,
  problemHtml: string
): string {
  return `
🕉️ CONTINUATION OF DIVINE GUIDANCE 🕉️

ORIGINAL PROBLEM CONTEXT:
- Title: ${problemInfo.title}
- Difficulty: ${problemInfo.difficulty}
- Language: ${language}
- Tags: ${problemInfo.tags.join(', ')}

PROBLEM STATEMENT:
${problemHtml}

PREVIOUS CONVERSATION:
${previousConversation}

USER'S NEW QUESTION: ${userQuery}

Continue the guidance with the same spiritual tone and principles:
1. 🙏 Acknowledge their question with grace
2. 💡 Provide helpful hints without giving away the solution until the user asks for it
3. 🧘‍♂️ Use Krishna's wisdom and spiritual metaphors
4. 🌸 Be encouraging and supportive
5. 🕊️ Guide them towards self-discovery
6. If the user asks for solution, then give him the solution with proper commented mistakes of his and correct version.

Remember: You are their spiritual coding mentor, helping them grow through understanding, not dependency. Reference the previous conversation to maintain continuity.
`
}

// Helper to validate if context history should be used
export function shouldUseContextHistory(
  conversationHistory?: string,
  userQuery?: string
): boolean {
  return !!(
    (
      conversationHistory &&
      conversationHistory.trim() &&
      userQuery &&
      userQuery.trim() &&
      conversationHistory.length > 10
    ) // Minimum meaningful history length
  )
}

// Enhanced helper to build conversation history with better formatting
export function buildConversationHistory(
  messages: Array<{ type: 'user' | 'ai'; content: string; timestamp?: string }>
): string {
  if (!messages || messages.length === 0) {
    return ''
  }

  return messages
    .filter((msg) => msg.content && msg.content.trim()) // Remove empty messages
    .map((msg, index) => {
      const prefix = msg.type === 'user' ? 'DEVOTEE' : 'MENTOR'
      const timestamp = msg.timestamp ? ` (${msg.timestamp})` : ''
      return `${prefix}${timestamp}: ${msg.content.trim()}`
    })
    .join('\n\n---\n\n') // Better separation between exchanges
}

// Single improved getAISuggestion function
export async function getAISuggestion(
  apiKey: string,
  problemHtml: string,
  language: Language,
  problemInfo: ProblemInfo,
  userQuery?: string,
  conversationHistory?: string
): Promise<string> {
  try {
    let prompt: string

    if (shouldUseContextHistory(conversationHistory, userQuery)) {
      // This is a follow-up question with valid history
      prompt = generateFollowUpPrompt(
        conversationHistory!,
        userQuery!,
        language,
        problemInfo,
        problemHtml
      )
    } else {
      // This is initial suggestion or first question
      prompt = generateSuggestionPrompt(
        problemHtml,
        language,
        problemInfo,
        userQuery
      )
    }

    // Preserve markdown for AI suggestions since they likely contain formatted content
    const response = await callGeminiAPI(prompt, apiKey, true)

    return response
  } catch (error) {
    console.error('AI Suggestion error:', error)
    throw new Error(`Failed to get AI suggestion: ${error}`)
  }
}