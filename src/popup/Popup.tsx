import React, { useEffect, useState } from 'react'

const LANGUAGES = [
  'C++',
  'Python',
  'JavaScript',
  'Java',
  'C',
  'Go',
  'Rust',
] as const

// Types
type Language = (typeof LANGUAGES)[number]
type ProblemInfo = {
  title: string
  difficulty: string
  tags: string[]
}

// Platform detection and parsing utilities
const detectCodingPlatform = (url: string) => {
  return /leetcode\.com|geeksforgeeks\.org|codingninjas\.com|codeforces\.com|codechef\.com|hackerrank\.com|atcoder\.jp/i.test(
    url
  )
}

const extractProblemInfo = (url: string, html: string): ProblemInfo => {
  let title = 'Coding Problem'
  let difficulty = ''
  let tags: string[] = []

  if (url.includes('leetcode.com')) {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' - LeetCode', '').trim()
    }

    // Extract difficulty
    const difficultyMatch = html.match(/difficulty[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/data-cy="topic-tag"[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .slice(0, 3)
  } else if (url.includes('geeksforgeeks.org')) {
    const titleMatch = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
  } else if (url.includes('codeforces.com')) {
    const titleMatch = html.match(/<div[^>]*class="title"[^>]*>([^<]*)<\/div>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
  }

  return { title, difficulty, tags }
}

// Language-specific boilerplates
const getDefaultBoilerplate = (language: Language): string => {
  const boilerplates: Record<Language, string> = {
    'C++': `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Your solution function here
    
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    Solution sol;
    // Driver code will be generated here
    
    return 0;
}`,
    Python: `class Solution:
    def solution_function(self):
        # Your solution here
        pass

if __name__ == "__main__":
    sol = Solution()
    # Driver code will be generated here`,
    JavaScript: `class Solution {
    solutionFunction() {
        // Your solution here
    }
}

// Driver code will be generated here
const sol = new Solution();`,
    Java: `import java.util.*;
import java.io.*;

class Solution {
    public void solutionFunction() {
        // Your solution here
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
        // Driver code will be generated here
    }
}`,
    C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Your solution function here

int main() {
    // Driver code will be generated here
    return 0;
}`,
    Go: `package main

import (
    "fmt"
)

// Your solution function here

func main() {
    // Driver code will be generated here
}`,
    Rust: `use std::io;

// Your solution function here

fn main() {
    // Driver code will be generated here
}`,
  }

  return boilerplates[language] || ''
}

// AI prompt generators
const generateDriverPrompt = (
  html: string,
  language: Language,
  boilerplate: string
) => {
  return `Analyze this complete HTML page from a competitive programming website:

"""
${html}
"""

Based on the problem description, constraints, examples, and input/output format found in the HTML:

1. Generate complete driver code in ${language} using this boilerplate structure:
${boilerplate}

2. Create proper input/output handling based on the exact format specified in the problem
3. Handle multiple test cases if mentioned
4. Parse input correctly according to the problem's input format
5. Call the solution function with appropriate parameters
6. Output results in the exact format required

IMPORTANT:
- DO NOT implement the solution logic - leave solution functions empty with "// Your solution here"
- Extract input/output format from the HTML content
- Handle edge cases mentioned in constraints
- if '[]', ',' are there in the input , include them as part of the input and then extract the input 
- For competitive programming, optimize for speed (fast I/O in C++)
- Return only the complete code without markdown formatting
- Make sure the code compiles and runs correctly

Provide only the complete working code with proper input/output handling.`
}

const generateExtractPrompt = (code: string, language: Language) => {
  return `Extract the submittable solution from this ${language} code:

"""
${code}
"""

Extract ONLY:
1. Solution class/function with all implemented methods
2. Helper functions that are part of the solution
3. Required imports/headers for the solution
4. Global variables/constants used by solution

REMOVE:
- Main function and driver code
- Input/output handling
- Test cases and debugging code
- Comments about driver code

Return clean, submittable code that can be directly pasted into online judges.
Do not include markdown formatting - return plain code only.`
}

// API utilities
const callGeminiAPI = async (prompt: string, apiKey: string) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            topK: 10,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    const data = await response.json()
    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Error generating response.'

    // Clean up markdown formatting
    text = text
      .replace(/^```\w*\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    return text
  } catch (error) {
    console.error('Gemini API Error:', error)
    return 'Error: Failed to connect to Gemini API. Please check your API key and connection.'
  }
}

// Custom hooks
const useLocalStorage = (key: string, defaultValue: any) => {
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

const useCurrentTab = () => {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setTab(tabs[0] || null)
    })
  }, [])

  return tab
}

// UI Components
const Button = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => {
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    ghost:
      'text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  className = '',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  className?: string
}) => (
  <div className={className}>
    {label && (
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
    />
  </div>
)

const Select = ({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  className?: string
}) => (
  <div className={className}>
    {label && (
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)

const Textarea = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  readOnly = false,
  className = '',
}: {
  label?: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
  className?: string
}) => (
  <div className={className}>
    {label && (
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono resize-none ${
        readOnly ? 'bg-gray-50' : ''
      }`}
    />
  </div>
)

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}
  >
    {children}
  </div>
)

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

const LoadingSpinner = () => (
  <div className='flex items-center justify-center'>
    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
  </div>
)

// Main component
export default function Popup() {
  const [step, setStep] = useState<
    'intro' | 'boilerplate' | 'generate' | 'extract' | 'settings'
  >('intro')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('C++')
  const [problemInfo, setProblemInfo] = useState<ProblemInfo>({
    title: '',
    difficulty: '',
    tags: [],
  })

  // Local storage hooks
  const [apiKey, setApiKey] = useLocalStorage('geminiApiKey', '')
  const [customBoilerplate, setCustomBoilerplate] = useLocalStorage(
    'customBoilerplate',
    ''
  )
  const [hasSeenIntro, setHasSeenIntro] = useLocalStorage('hasSeenIntro', false)

  // State for generated/extracted code
  const [driverCode, setDriverCode] = useState('')
  const [extractCode, setExtractCode] = useState('')
  const [extractedFunction, setExtractedFunction] = useState('')

  const currentTab = useCurrentTab()
  const isPlatformPage = currentTab
    ? detectCodingPlatform(currentTab.url || '')
    : false

  // Initialize popup
  useEffect(() => {
    if (hasSeenIntro) {
      setStep(isPlatformPage ? 'generate' : 'extract')
    }
  }, [hasSeenIntro, isPlatformPage])

  // Copy to clipboard utility
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      alert('✅ Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('❌ Failed to copy to clipboard')
    }
  }

  // Generate driver code
  const handleGenerate = async () => {
    if (!currentTab?.id) return

    setIsLoading(true)

    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => document.documentElement.outerHTML,
      })

      const html = result.result
      const currentUrl = currentTab.url || ''
      const info = extractProblemInfo(currentUrl, `${html}`)
      setProblemInfo(info)

      const boilerplate = customBoilerplate || getDefaultBoilerplate(language)
      const prompt = generateDriverPrompt(`${html}`, language, boilerplate)

      const code = await callGeminiAPI(prompt, apiKey)
      setDriverCode(code)
    } catch (error) {
      console.error('Generate error:', error)
      setDriverCode('Error: Failed to generate driver code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Extract function
  const handleExtract = async () => {
    if (!extractCode.trim()) {
      alert('Please paste your code first')
      return
    }

    setIsLoading(true)

    try {
      const prompt = generateExtractPrompt(extractCode, language)
      const extracted = await callGeminiAPI(prompt, apiKey)
      setExtractedFunction(extracted)
    } catch (error) {
      console.error('Extract error:', error)
      setExtractedFunction(
        'Error: Failed to extract function. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Setup completion
  const completeSetup = () => {
    setHasSeenIntro(true)
    setStep(isPlatformPage ? 'generate' : 'extract')
  }

  // Render functions
  const renderIntro = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-4xl mb-3'>🚀</div>
        <h1 className='text-xl font-bold text-gray-900 mb-2'>
          Welcome to LeetVSCode!
        </h1>
        <p className='text-sm text-gray-600'>
          Your ultimate coding companion for competitive programming
        </p>
      </div>

      <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
        <div className='flex items-start space-x-3'>
          <div className='text-blue-600 text-xl'>💡</div>
          <div>
            <h3 className='font-semibold text-blue-900 mb-1'>
              Getting Started
            </h3>
            <p className='text-sm text-blue-700 mb-2'>
              LeetVSCode helps you generate driver code and extract solutions
              seamlessly.
            </p>
            <a
              href='https://makersuite.google.com/app/apikey'
              target='_blank'
              className='text-blue-600 hover:text-blue-800 text-sm underline'
            >
              Get your FREE Gemini API key →
            </a>
          </div>
        </div>
      </Card>

      <Input
        label='🔐 Gemini API Key'
        type='password'
        value={apiKey}
        onChange={setApiKey}
        placeholder='Enter your Gemini API key'
      />

      <div className='text-xs text-gray-500 space-y-1'>
        <p>• Your API key is stored locally and never shared</p>
        <p>• Free tier includes generous usage limits</p>
        <p>• Required for AI-powered code generation</p>
      </div>

      <Button
        onClick={() => setStep('boilerplate')}
        disabled={!apiKey.trim()}
        className='w-full'
        variant='success'
      >
        Next: Setup Boilerplate →
      </Button>
    </div>
  )

  const renderBoilerplate = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-3xl mb-3'>⚙️</div>
        <h1 className='text-xl font-bold text-gray-900 mb-2'>
          Customize Boilerplate
        </h1>
        <p className='text-sm text-gray-600'>
          Set up your preferred code template (optional)
        </p>
      </div>

      <Select
        label='🧪 Programming Language'
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        options={LANGUAGES}
      />

      <Textarea
        label='📝 Custom Boilerplate'
        value={customBoilerplate}
        onChange={setCustomBoilerplate}
        placeholder={`Leave empty to use default template:\n\n${getDefaultBoilerplate(
          language
        )}`}
        rows={8}
      />

      <div className='text-xs text-gray-500'>
        💡 Leave empty to use our optimized templates with competitive
        programming headers
      </div>

      <div className='flex space-x-3'>
        <Button
          onClick={() => setStep('intro')}
          variant='ghost'
          className='flex-1'
        >
          ← Back
        </Button>
        <Button onClick={completeSetup} variant='success' className='flex-1'>
          Start Coding! 🎯
        </Button>
      </div>
    </div>
  )

  const renderGenerate = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-3xl mb-3'>🔧</div>
        <h1 className='text-lg font-bold text-gray-900 mb-2'>
          Generate Driver Code
        </h1>

        {problemInfo.title && (
          <Card className='bg-gray-50 border-gray-200'>
            <div className='space-y-2'>
              <h3 className='font-semibold text-gray-900 text-sm'>
                {problemInfo.title}
              </h3>
              <div className='flex flex-wrap gap-1'>
                {problemInfo.difficulty && (
                  <Badge
                    variant={
                      problemInfo.difficulty === 'Hard'
                        ? 'error'
                        : problemInfo.difficulty === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {problemInfo.difficulty}
                  </Badge>
                )}
                {problemInfo.tags.map((tag) => (
                  <Badge key={tag} variant='default'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        <Button onClick={() => setStep('settings')} variant='ghost' size='sm'>
          ⚙️ Settings
        </Button>
      </div>

      <Select
        label='🧪 Language'
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        options={LANGUAGES}
      />

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !apiKey}
        className='w-full'
        variant='primary'
      >
        {isLoading ? (
          <div className='flex items-center justify-center space-x-2'>
            <LoadingSpinner />
            <span>Generating...</span>
          </div>
        ) : (
          '🚀 Generate Driver Code'
        )}
      </Button>

      {driverCode && (
        <Card>
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-900 flex items-center'>
              <span className='mr-2'>📄</span>
              Generated Code
            </h3>
            <Textarea value={driverCode} readOnly rows={12} />
            <Button
              onClick={() => copyToClipboard(driverCode)}
              variant='secondary'
              className='w-full'
            >
              📋 Copy to Clipboard
            </Button>
          </div>
        </Card>
      )}

      <div className='text-center pt-4 border-t border-gray-200'>
        <Button onClick={() => setStep('extract')} variant='ghost' size='sm'>
          Need to extract function? →
        </Button>
      </div>
    </div>
  )

  const renderExtract = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-3xl mb-3'>🔍</div>
        <h1 className='text-lg font-bold text-gray-900 mb-2'>
          Extract Function
        </h1>
        <p className='text-sm text-gray-600'>
          Paste your VS Code solution to extract submittable code
        </p>

        <Button onClick={() => setStep('settings')} variant='ghost' size='sm'>
          ⚙️ Settings
        </Button>
      </div>

      <Select
        label='🧪 Language'
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        options={LANGUAGES}
      />

      <Textarea
        label='📝 Your VS Code Solution'
        value={extractCode}
        onChange={setExtractCode}
        placeholder='Paste your complete VS Code solution here...'
        rows={6}
      />

      <Button
        onClick={handleExtract}
        disabled={isLoading || !apiKey || !extractCode.trim()}
        className='w-full'
        variant='primary'
      >
        {isLoading ? (
          <div className='flex items-center justify-center space-x-2'>
            <LoadingSpinner />
            <span>Extracting...</span>
          </div>
        ) : (
          '🔍 Extract Function'
        )}
      </Button>

      {extractedFunction && (
        <Card>
          <div className='space-y-3'>
            <h3 className='font-semibold text-gray-900 flex items-center'>
              <span className='mr-2'>✂️</span>
              Extracted Function
            </h3>
            <Textarea value={extractedFunction} readOnly rows={12} />
            <Button
              onClick={() => copyToClipboard(extractedFunction)}
              variant='secondary'
              className='w-full'
            >
              📋 Copy to Clipboard
            </Button>
          </div>
        </Card>
      )}

      <div className='text-center pt-4 border-t border-gray-200'>
        <Button onClick={() => setStep('generate')} variant='ghost' size='sm'>
          ← Back to Generate
        </Button>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-3xl mb-3'>⚙️</div>
        <h1 className='text-lg font-bold text-gray-900 mb-2'>Settings</h1>
        <p className='text-sm text-gray-600'>Update your preferences</p>
      </div>

      <Input
        label='🔐 Gemini API Key'
        type='password'
        value={apiKey}
        onChange={setApiKey}
        placeholder='Enter your Gemini API key'
      />

      <Select
        label='🧪 Language'
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        options={LANGUAGES}
      />

      <Textarea
        label='📝 Custom Boilerplate'
        value={customBoilerplate}
        onChange={setCustomBoilerplate}
        placeholder={`Default template:\n\n${getDefaultBoilerplate(language)}`}
        rows={8}
      />

      <div className='space-y-3'>
        <Button
          onClick={() => {
            alert('✅ Settings saved!')
            setStep(isPlatformPage ? 'generate' : 'extract')
          }}
          variant='success'
          className='w-full'
        >
          💾 Save Settings
        </Button>

        <Button
          onClick={() => {
            if (
              confirm(
                'Reset all data? This will clear your API key and custom boilerplate.'
              )
            ) {
              chrome.storage.local.clear()
              setApiKey('')
              setCustomBoilerplate('')
              setHasSeenIntro(false)
              setStep('intro')
              alert('✅ All data reset!')
            }
          }}
          variant='danger'
          className='w-full'
        >
          🗑️ Reset All Data
        </Button>
      </div>

      <div className='text-center pt-4 border-t border-gray-200'>
        <Button
          onClick={() => setStep(isPlatformPage ? 'generate' : 'extract')}
          variant='ghost'
          size='sm'
        >
          ← Back
        </Button>
      </div>
    </div>
  )

  return (
    <div className='w-96 max-h-[600px] overflow-y-auto bg-gray-50'>
      <div className='p-4 space-y-4'>
        {step === 'intro' && renderIntro()}
        {step === 'boilerplate' && renderBoilerplate()}
        {step === 'generate' && renderGenerate()}
        {step === 'extract' && renderExtract()}
        {step === 'settings' && renderSettings()}
      </div>

    </div>
  )
}