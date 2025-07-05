import React, { useEffect, useState } from 'react'

const LANGUAGES = ['C++', 'Python', 'JavaScript', 'Java', 'C']

// Detect if current page is a coding platform
const detectCodingPlatform = (url: string) => {
  return /leetcode\.com|geeksforgeeks\.org|codingninjas\.com|codeforces\.com|codechef\.com/i.test(
    url
  )
}

// Extract problem name from different platforms
const extractProblemName = (url: string, pageText: string) => {
  if (url.includes('leetcode.com')) {
    const match = pageText.match(/(\d+\.\s*[^\\n]+)/)
    return match ? match[1] : 'LeetCode Problem'
  } else if (url.includes('geeksforgeeks.org')) {
    const match = pageText.match(/Problem\s*:\s*([^\\n]+)/)
    return match ? match[1] : 'GeeksForGeeks Problem'
  } else if (url.includes('codeforces.com')) {
    const match = pageText.match(/([A-Z]\.\s*[^\\n]+)/)
    return match ? match[1] : 'Codeforces Problem'
  } else if (url.includes('codechef.com')) {
    const match = pageText.match(/Problem\s*Code\s*:\s*([^\\n]+)/)
    return match ? match[1] : 'CodeChef Problem'
  }
  return 'Coding Problem'
}

// Default boilerplates for different languages
const getDefaultBoilerplate = (language: string) => {
  switch (language) {
    case 'C++':
      return `#include <bits/stdc++.h>
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
}`
    case 'Python':
      return `class Solution:
    def solution_function(self):
        # Your solution here
        pass

if __name__ == "__main__":
    sol = Solution()
    # Driver code will be generated here`
    case 'JavaScript':
      return `class Solution {
    solutionFunction() {
        // Your solution here
    }
}

// Driver code will be generated here
const sol = new Solution();`
    case 'Java':
      return `import java.util.*;
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
}`
    case 'C':
      return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Your solution function here

int main() {
    // Driver code will be generated here
    return 0;
}`
    default:
      return ''
  }
}

// Generate prompt for extracting function
const generateExtractPrompt = (code: string, language: string) => {
  return `Given this ${language} code with driver code and solution implementation:

"""
${code}
"""

Please extract ONLY the following for ${language} competitive programming submission:
1. Solution class/function with all implemented methods
2. Any helper functions or classes that are part of the solution
3. Global variables or constants used by the solution (if any)
4. Remove all main function, driver code, input/output handling, and test cases

IMPORTANT:
- Keep the solution logic intact
- Maintain proper class structure if applicable
- Include necessary imports/headers for the solution only
- Do not include any main function or driver code
- Do not wrap the code in markdown code blocks (no \`\`\`${language.toLowerCase()} or \`\`\`)
- Return clean, submittable code only

Only return the extracted solution code, no explanation.`
}

// Extract function using Gemini AI
const extractFunctionWithAI = async (
  code: string,
  language: string,
  apiKey: string
) => {
  const prompt = generateExtractPrompt(code, language)

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
        apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )

    const data = await response.json()
    let text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Error extracting function.'

    // Clean up markdown code fences if present
    text = text
      .replace(/^```\w*\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    return text
  } catch (error) {
    return 'Error: Failed to extract function. Please check your API key and try again.'
  }
}

export default function Popup() {
  const [step, setStep] = useState<
    'intro' | 'boilerplate' | 'generate' | 'extract' | 'settings'
  >('intro')
  const [apiKey, setApiKey] = useState('')
  const [customBoilerplate, setCustomBoilerplate] = useState('')
  const [language, setLanguage] = useState('C++')
  const [driverCode, setDriverCode] = useState('')
  const [extractCode, setExtractCode] = useState('')
  const [extractedFunction, setExtractedFunction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [problemName, setProblemName] = useState('')
  const [previousStep, setPreviousStep] = useState<'generate' | 'extract'>(
    'generate'
  )

  // Initialize popup state
  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || ''
      setCurrentUrl(url)
    })

    // Load saved data
    chrome.storage.local.get(
      ['hasSeenIntro', 'geminiApiKey', 'customBoilerplate'],
      (result) => {
        if (result.hasSeenIntro) {
          // User has seen intro, determine which screen to show
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0]?.url || ''
            if (detectCodingPlatform(url)) {
              setStep('generate')
              setPreviousStep('generate')
            } else {
              setStep('extract')
              setPreviousStep('extract')
            }
          })
        }

        if (result.geminiApiKey) setApiKey(result.geminiApiKey)
        if (result.customBoilerplate)
          setCustomBoilerplate(result.customBoilerplate)
      }
    )
  }, [])

  // Save intro completion and move to boilerplate
  const finishIntro = () => {
    if (!apiKey.trim()) {
      alert('Please enter your Gemini API key')
      return
    }

    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
      setStep('boilerplate')
    })
  }

  // Save boilerplate and finish setup
  const finishBoilerplate = () => {
    const boilerplateToSave =
      customBoilerplate || getDefaultBoilerplate(language)

    chrome.storage.local.set(
      {
        customBoilerplate: boilerplateToSave,
        hasSeenIntro: true,
      },
      () => {
        // Determine next screen based on current page
        if (detectCodingPlatform(currentUrl)) {
          setStep('generate')
          setPreviousStep('generate')
        } else {
          setStep('extract')
          setPreviousStep('extract')
        }
      }
    )
  }

  // Open settings screen
  const openSettings = () => {
    setStep('settings')
  }

  // Generate prompt for driver code
  const generatePrompt = (
    lang: string,
    problem: string,
    boilerplate: string
  ) => {
    return `Given this problem description:

"""
${problem}
"""

Please generate driver code in ${lang} that:
1. Uses this boilerplate structure:
${boilerplate}

2. Creates appropriate input/output handling for the problem
3. Calls the solution function with proper parameters
4. Handles multiple test cases if needed
5. For C++, include common competitive programming headers like bits/stdc++.h

IMPORTANT: 
- DO NOT implement the actual solution logic
- Leave the solution function empty with a comment "// Your solution here"
- Only provide the driver code with input/output handling
- Do not wrap the code in markdown code blocks (no \`\`\`cpp or \`\`\`)
- Return plain code only without any markdown formatting

Only return the complete driver code structure, no explanation.`
  }

  // Generate driver code
  const handleGenerate = async () => {
    setIsLoading(true)

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id! },
        func: () => document.body.innerText,
      },
      async (results) => {
        const problemText =
          results?.[0]?.result?.slice(0, 3000) || 'Problem text not found.'
        const extractedProblemName = extractProblemName(currentUrl, problemText)
        setProblemName(extractedProblemName)

        const boilerplate = customBoilerplate || getDefaultBoilerplate(language)
        const prompt = generatePrompt(language, problemText, boilerplate)

        try {
          const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
              apiKey,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          )

          const data = await response.json()
          let text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Error generating code.'

          // Clean up markdown code fences if present
          text = text
            .replace(/^```\w*\n?/, '')
            .replace(/\n?```$/, '')
            .trim()

          setDriverCode(text)
        } catch (error) {
          setDriverCode(
            'Error: Failed to generate code. Please check your API key.'
          )
        }

        setIsLoading(false)
      }
    )
  }

  // Extract function from pasted code using AI
  const handleExtract = async () => {
    if (!extractCode.trim()) {
      alert('Please paste your code first')
      return
    }

    if (!apiKey.trim()) {
      alert('Please set your Gemini API key in settings')
      return
    }

    setIsLoading(true)
    const extracted = await extractFunctionWithAI(extractCode, language, apiKey)
    setExtractedFunction(extracted)
    setIsLoading(false)
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Copied to clipboard!')
    })
  }

  // Save settings
  const saveSettings = () => {
    const boilerplateToSave =
      customBoilerplate || getDefaultBoilerplate(language)

    chrome.storage.local.set(
      {
        geminiApiKey: apiKey,
        customBoilerplate: boilerplateToSave,
      },
      () => {
        alert('✅ Settings saved!')
        setStep(previousStep)
      }
    )
  }

  // Reset all data
  const resetAllData = () => {
    if (
      confirm(
        'Are you sure you want to reset all data? This will clear your API key and custom boilerplate.'
      )
    ) {
      chrome.storage.local.clear(() => {
        setApiKey('')
        setCustomBoilerplate('')
        setStep('intro')
        alert('✅ All data reset!')
      })
    }
  }

  // Render intro screen
  const renderIntro = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h1 className='text-xl font-bold mb-2'>🚀 Welcome to LeetVSCode!</h1>
        <p className='text-sm text-gray-600 mb-4'>
          Your ultimate coding companion for competitive programming
        </p>
      </div>

      <div className='bg-blue-50 p-3 rounded border-l-4 border-blue-500'>
        <h3 className='font-semibold text-blue-700 mb-1'>📖 Learn More</h3>
        <a
          href='https://example.com/leetvscode-intro'
          target='_blank'
          className='text-blue-600 underline text-sm'
        >
          Read our introduction blog →
        </a>
      </div>

      <div>
        <label className='block mb-2 font-medium'>🔐 Gemini API Key:</label>
        <input
          type='password'
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder='Enter your Gemini API key'
          className='w-full border rounded px-3 py-2 text-sm'
        />
        <div className='mt-2 text-xs text-gray-600'>
          <p>
            •{' '}
            <a
              href='https://makersuite.google.com/app/apikey'
              target='_blank'
              className='text-blue-600 underline'
            >
              Get your FREE Gemini API key here →
            </a>
          </p>
          <p>• Your key stays local and is never sent to us</p>
          <p>• Completely free with generous usage limits</p>
        </div>
      </div>

      <button
        onClick={finishIntro}
        className='w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700'
      >
        Next: Setup Boilerplate →
      </button>
    </div>
  )

  // Render boilerplate screen
  const renderBoilerplate = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h1 className='text-xl font-bold mb-2'>⚙️ Custom Boilerplate</h1>
        <p className='text-sm text-gray-600'>
          Customize your default code template (optional)
        </p>
      </div>

      <div>
        <label className='block mb-2 font-medium'>🧪 Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className='w-full border rounded px-3 py-2 text-sm'
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block mb-2 font-medium'>📝 Your Boilerplate:</label>
        <textarea
          value={customBoilerplate}
          onChange={(e) => setCustomBoilerplate(e.target.value)}
          placeholder={`Leave empty to use default template:\n\n${getDefaultBoilerplate(
            language
          )}`}
          className='w-full border rounded px-3 py-2 text-xs font-mono h-48'
        />
        <p className='text-xs text-gray-600 mt-1'>
          Leave empty to use our optimized template with competitive programming
          headers
        </p>
      </div>

      <button
        onClick={finishBoilerplate}
        className='w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700'
      >
        Save & Start Coding! 🎯
      </button>
    </div>
  )

  // Render generate screen
  const renderGenerate = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h1 className='text-lg font-bold mb-1'>🔧 Generate Driver Code</h1>
        {problemName && (
          <p className='text-sm text-gray-600 bg-gray-50 p-2 rounded'>
            📋 {problemName}
          </p>
        )}
        <button
          onClick={openSettings}
          className='text-xs text-blue-600 underline hover:text-blue-800'
        >
          ⚙️ Settings
        </button>
      </div>

      <div>
        <label className='block mb-2 font-medium'>🧪 Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className='w-full border rounded px-3 py-2 text-sm'
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className='w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400'
      >
        {isLoading ? '⏳ Generating...' : '🚀 Generate Driver Code'}
      </button>

      {driverCode && (
        <div className='space-y-2'>
          <h3 className='font-semibold'>📄 Generated Code:</h3>
          <textarea
            value={driverCode}
            readOnly
            className='w-full border rounded px-3 py-2 text-xs font-mono h-48 bg-gray-50'
          />
          <button
            onClick={() => copyToClipboard(driverCode)}
            className='w-full bg-gray-800 text-white py-2 rounded font-medium hover:bg-gray-900'
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}

      <div className='text-center pt-2 border-t'>
        <button
          onClick={() => setStep('extract')}
          className='text-blue-600 text-sm underline'
        >
          Need to extract function? Click here →
        </button>
      </div>
    </div>
  )

  // Render extract screen
  const renderExtract = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h1 className='text-lg font-bold mb-1'>🔍 Extract Function</h1>
        <p className='text-sm text-gray-600'>
          Paste your VS Code solution to extract submittable function
        </p>
        <button
          onClick={openSettings}
          className='text-xs text-blue-600 underline hover:text-blue-800'
        >
          ⚙️ Settings
        </button>
      </div>

      <div>
        <label className='block mb-2 font-medium'>🧪 Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className='w-full border rounded px-3 py-2 text-sm'
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block mb-2 font-medium'>
          📝 Your VS Code Solution:
        </label>
        <textarea
          value={extractCode}
          onChange={(e) => setExtractCode(e.target.value)}
          placeholder='Paste your complete VS Code solution here...'
          className='w-full border rounded px-3 py-2 text-xs font-mono h-32'
        />
      </div>

      <button
        onClick={handleExtract}
        disabled={isLoading}
        className='w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700 disabled:bg-gray-400'
      >
        {isLoading ? '⏳ Extracting...' : '🔍 Extract Function'}
      </button>

      {extractedFunction && (
        <div className='space-y-2'>
          <h3 className='font-semibold'>✂️ Extracted Function:</h3>
          <textarea
            value={extractedFunction}
            readOnly
            className='w-full border rounded px-3 py-2 text-xs font-mono h-48 bg-gray-50'
          />
          <button
            onClick={() => copyToClipboard(extractedFunction)}
            className='w-full bg-gray-800 text-white py-2 rounded font-medium hover:bg-gray-900'
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}

      <div className='text-center pt-2 border-t'>
        <button
          onClick={() => setStep('generate')}
          className='text-blue-600 text-sm underline'
        >
          ← Back to Generate Driver Code
        </button>
      </div>
    </div>
  )

  // Render settings screen
  const renderSettings = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h1 className='text-lg font-bold mb-2'>⚙️ Settings</h1>
        <p className='text-sm text-gray-600'>
          Update your API key and boilerplate
        </p>
      </div>

      <div>
        <label className='block mb-2 font-medium'>🔐 Gemini API Key:</label>
        <input
          type='password'
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder='Enter your Gemini API key'
          className='w-full border rounded px-3 py-2 text-sm'
        />
      </div>

      <div>
        <label className='block mb-2 font-medium'>🧪 Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className='w-full border rounded px-3 py-2 text-sm'
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block mb-2 font-medium'>📝 Custom Boilerplate:</label>
        <textarea
          value={customBoilerplate}
          onChange={(e) => setCustomBoilerplate(e.target.value)}
          placeholder={`Leave empty to use default template:\n\n${getDefaultBoilerplate(
            language
          )}`}
          className='w-full border rounded px-3 py-2 text-xs font-mono h-32'
        />
      </div>

      <div className='space-y-2'>
        <button
          onClick={saveSettings}
          className='w-full bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700'
        >
          💾 Save Settings
        </button>

        <button
          onClick={resetAllData}
          className='w-full bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700'
        >
          🗑️ Reset All Data
        </button>
      </div>

      <div className='text-center pt-2 border-t'>
        <button
          onClick={() => setStep(previousStep)}
          className='text-blue-600 text-sm underline'
        >
          ← Back to {previousStep === 'generate' ? 'Generate' : 'Extract'}
        </button>
      </div>
    </div>
  )

  return (
    <div className='w-96 max-h-96 overflow-y-auto p-4 font-sans'>
      {step === 'intro' && renderIntro()}
      {step === 'boilerplate' && renderBoilerplate()}
      {step === 'generate' && renderGenerate()}
      {step === 'extract' && renderExtract()}
      {step === 'settings' && renderSettings()}

      <div className='text-center mt-4 pt-2 border-t text-xs text-gray-500'>
        🙏 Hare Krishna! Made with devotion
      </div>
    </div>
  )
}
