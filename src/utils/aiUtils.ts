// src/utils/aiUtils.ts
import { Language } from '../types'
import {
  debugLog,
  testGeminiInExtension,
  getDebugLogs,
  clearDebugLogs,
} from './debugUtils'

export const generateDriverPrompt = (
  html: string,
  language: Language,
  boilerplate: string
): string => {
  return `You are an expert competitive programming assistant. Analyze this HTML page from a coding platform and generate PERFECT driver code.

"""
${html}
"""

TASK: Generate complete, working driver code in ${language} that:
1. Parses input EXACTLY as shown in the problem examples
2. Handles the specific input/output format correctly
3. Calls the solution class/functions properly
4. Produces the exact expected output format
5. DO NOT IMPLEMENT THE SOLUTION, LEAVE THE SOLUTION FUNCTION EMPTY WITH COMMENT "Implement Here ... "
6. **DECLARE ALL CLASSES/STRUCTS BEFORE THE MAIN FUNCTION AND HELPER FUNCTIONS**

CRITICAL ANALYSIS STEPS:
1. **Problem Type Detection**: 
   - Is this a class-based problem with operations? (like ["Constructor", "method1", "method2"])
   - Is this a single function problem? if yes, don't take test case input even if the boilerplate consists it
   - Are there multiple test cases?

2. **Input Format Analysis**:
   - Extract the EXACT input format from examples
   - Note if arrays are represented as [1,2,3] or separated by spaces
   - Check if strings are quoted or not
   - Identify nested structures like [[1,2],[3,4]]

3. **Output Format Analysis**:
   - Check if output should be [null, result1, null, result2] format
   - Or just plain results
   - Note spacing and formatting requirements

PARSING STRATEGY FOR DIFFERENT PROBLEM TYPES:

**For Class-Based Problems (Operations Array):**
Use simple string parsing with these helper functions:

vector<string> parseOperations(const string& str) {
    vector<string> ops;
    size_t start = 0;
    while ((start = str.find('"', start)) != string::npos) {
        size_t end = str.find('"', start + 1);
        ops.push_back(str.substr(start + 1, end - start - 1));
        start = end + 1;
    }
    return ops;
}

vector<int> parseArray(const string& str) {
    vector<int> result;
    stringstream ss;
    for (char c : str) {
        if (c == '-' || isdigit(c)) ss << c;
        else if (ss.tellp() > 0) {
            result.push_back(stoi(ss.str()));
            ss.str(""); ss.clear();
        }
    }
    if (ss.tellp() > 0) result.push_back(stoi(ss.str()));
    return result;
}

**For Single Function Problems:**
Read input according to constraints, call function once, output result.

**For Multiple Test Cases:**
int t; cin >> t;
while (t--) { /* Process each test case */ }

BOILERPLATE INTEGRATION:
${boilerplate}

QUALITY REQUIREMENTS:
- **Declare Solution class before any function that uses it**
- Code must compile without errors
- Handle all edge cases mentioned in constraints
- Use efficient I/O (ios_base::sync_with_stdio(false) for C++)
- Parse input 'exactly' as shown in examples
- Output format must match expected output precisely
- Handle empty arrays, negative numbers, large numbers
- Memory management (delete objects if needed)
- Add "Hare Krishna! Chant and be happy" comment at the top of the code
- Declare Every varible that is generated.

COMMON PITFALLS TO AVOID:
- **Don't place class declarations after functions that use them**
- Don't overcomplicate parsing - use simple string operations
- Don't assume input format - extract it from examples
- Don't forget to handle the constructor as first operation
- Don't mix up parameter order
- Don't add extra spaces or formatting in output
- Don't implement solution logic - leave empty with "// Your solution here"
- Add "Hare Krishna! Chant and be happy" comment at the top of the code

EXAMPLE INPUT PARSING FOR OPERATIONS:
If example shows:
Input: ["FindSumPairs", "count", "add", "count"]
       [[1,1,2,2,2,3],[1,4,5,2,5,4]]
       [7]
       [3,2]
       [8]

Your driver should:
1. Parse operations array from first line
2. Parse constructor parameters from second line (nested arrays)
3. For each operation after constructor, read next line for parameters
4. Output in format: [null, result1, null, result2]
5. Add "Hare Krishna! Chant and be happy" comment at the top of the code

DEBUGGING HINTS:
- Print parsed values to stderr for debugging
- Test with the exact example input provided
- Verify array parsing with nested structures
- Check if your output format matches exactly (including brackets, commas, nulls)

OUTPUT: Return ONLY the complete working code without markdown formatting with no backticks. The code should be ready to compile and run.`
}

export const generateExtractPrompt = (
  code: string,
  language: Language
): string => {
  return `Extract the submittable solution from this ${language} code.

TASK: Clean up driver code and extract ONLY the solution parts needed for online judge submission. Also, Don't Implement Your Own Solution, just extract the solution from the given code.

INPUT CODE:
"""
${code}
"""

EXTRACTION RULES:

KEEP (Solution Parts):
- Solution class with all methods implemented
- Helper functions that are part of the solution algorithm
- Required headers/imports for the solution
- Global variables/constants used by the solution
- Template definitions if used in solution
- Typedef/using declarations for solution
- Given Original Logic and don't implement yours' or change it
- Add "Hare Krishna! Chant and be happy" comment at the top of the code

REMOVE (Driver Parts):
- main() function completely
- Input/output handling code
- Parsing functions (parseArray, parseOperations, etc.)
- Test case loops
- Debug prints and comments
- Object instantiation and deletion
- Result formatting and output statements

QUALITY CHECKS:
- Do not include or implement your own solution
- Ensure all solution methods are complete
- Keep proper class structure
- Maintain correct method signatures
- Include all necessary headers
- Remove any driver-specific code
- Ensure clean, readable formatting
- Add "Hare Krishna! Chant and be happy" comment at the top of the code

EXAMPLE TRANSFORMATION:
BEFORE (Driver Code):
#include <bits/stdc++.h>
using namespace std;
class Solution { /* solution implementation */ };
vector<int> parseArray(string s) { ... }  // REMOVE
int main() { ... }  // REMOVE

AFTER (Clean Solution):
#include <bits/stdc++.h>
using namespace std;
class Solution { /* solution implementation */ };

OUTPUT: Return clean, submittable code without markdown formatting with no backticks. The code should be ready to paste directly into online judges.`
}

export const callGeminiAPI = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
  try {

    console.log('API Key length:', apiKey.length)
    console.log('API Key prefix:', apiKey.substring(0, 10))
    console.log('API Key format check:', validateApiKey(apiKey))

    debugLog('Calling Gemini API', { promptLength: prompt.length })

    // Validate API key first
    if (!validateApiKey(apiKey)) {
      throw new Error('Invalid API key format')
    }

    // Try gemini-1.5-flash first, fallback to gemini-pro
    const models = ['gemini-1.5-flash', 'gemini-pro']
    let lastError: Error | null = null

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
        })

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          debugLog(`API Error Response for ${model}`, {
            status: response.status,
            error: errorText,
          })

          // Handle specific error cases
          if (response.status === 400) {
            throw new Error(`Invalid request: ${errorText}`)
          } else if (response.status === 401) {
            throw new Error('Invalid API key')
          } else if (response.status === 403) {
            throw new Error('API key lacks required permissions')
          } else if (response.status === 429) {
            throw new Error('Rate limit exceeded')
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
          fullResponse: data,
        })

        if (!data.candidates || !data.candidates[0]) {
          debugLog(`No candidates in response for ${model}`, { fullData: data })
          throw new Error(
            `No response from Gemini API (${model}) - no candidates returned`
          )
        }

        const candidate = data.candidates[0]
        debugLog(`Candidate data for ${model}`, { candidate })

        // Check if content was blocked
        if (candidate.finishReason === 'SAFETY') {
          debugLog(`Content blocked by safety filters for ${model}`, {
            candidate,
          })
          throw new Error(`Content blocked by safety filters (${model})`)
        }

        if (
          !candidate.content ||
          !candidate.content.parts ||
          !candidate.content.parts[0]
        ) {
          debugLog(`Invalid candidate structure for ${model}`, { candidate })
          throw new Error(
            `Invalid response structure from Gemini API (${model})`
          )
        }

        let text = candidate.content.parts[0].text

        if (!text || text.trim().length === 0) {
          debugLog(`Empty response text for ${model}`, { candidate })
          throw new Error(`Empty response from Gemini API (${model})`)
        }

        // Enhanced cleanup of markdown formatting
        text = text
          .replace(/^```\w*\n?/, '')
          .replace(/\n?```$/, '')
          .replace(/^```/, '')
          .replace(/```$/, '')
          .trim()

        // Additional cleanup for common AI formatting issues
        text = text
          .replace(/^Here's the.*?:\n/i, '')
          .replace(/^The complete.*?:\n/i, '')
          .replace(/\n\n+/g, '\n\n')
          .trim()

        debugLog(`API Success with ${model}`, { responseLength: text.length })
        return text
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        debugLog(`Failed with ${model}`, { error: lastError.message })
        // Continue to next model
      }
    }

    // If all models failed, throw the last error
    throw lastError || new Error('All models failed')
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    debugLog('API Error', { error: errorMessage, fullError: error })
    console.error('Gemini API Error:', error)
    return `Error: ${errorMessage}`
  }
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

// Rate limiting helper
let lastApiCall = 0
const API_RATE_LIMIT = 1000 // 1 second between calls

export const rateLimitedApiCall = async (
  prompt: string,
  apiKey: string
): Promise<string> => {
  const now = Date.now()
  const timeSinceLastCall = now - lastApiCall

  if (timeSinceLastCall < API_RATE_LIMIT) {
    await new Promise((resolve) =>
      setTimeout(resolve, API_RATE_LIMIT - timeSinceLastCall)
    )
  }

  lastApiCall = Date.now()
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
