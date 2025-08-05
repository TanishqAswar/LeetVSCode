// src/components/Popup.tsx
import React, { useEffect, useState } from 'react'
import { Language, ProblemInfo, StepType } from '../types'
import {
  detectCodingPlatform,
  extractProblemInfo,
} from '../utils/platformUtils'
import { getDefaultBoilerplate } from '../utils/boilerplateUtils'
import {
  generateDriverPrompt,
  generateExtractPrompt,
  callGeminiAPI,
  getAISuggestion,
  buildConversationHistory,
} from '../utils/aiUtils'
import { testApiConnection } from '../utils/aiUtils'

import { useLocalStorage, useCurrentTab } from '../hooks/useCustomHooks'
import { usePromptTracking } from '../hooks/usePromptTracking'
import { IntroStep } from './steps/IntroStep'
import { BoilerplateStep } from './steps/BoilerplateStep'
import { GenerateStep } from './steps/GenerateStep'
import { ExtractStep } from './steps/ExtractStep'
import { SettingsStep } from './steps/SettingsStep'
import { AISuggestionStep } from './steps/AISuggestionStep'
import UpgradeModal from './modals/UpgradeModal'

function Popup() {
  const [step, setStep] = useState<StepType>('intro')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('C++')
  const [problemInfo, setProblemInfo] = useState<ProblemInfo>({
    title: '',
    difficulty: '',
    tags: [],
  })

  // Local storage hooks - 1
  const [apiKey, setApiKey] = useLocalStorage('geminiApiKey', '')
  const [customBoilerplate, setCustomBoilerplate] = useLocalStorage(
    'customBoilerplate',
    ''
  )
  const [hasSeenIntro, setHasSeenIntro] = useLocalStorage('hasSeenIntro', false)

  // Prompt tracking hook
  const {
    promptsUsed,
    remainingPrompts,
    isPremium,
    isLoading: isTrackingLoading,
    incrementPromptUsage,
    setPremiumStatus,
  } = usePromptTracking()

  // State for generated/extracted code
  const [driverCode, setDriverCode] = useState('')
  const [extractCode, setExtractCode] = useState('')
  const [extractedFunction, setExtractedFunction] = useState('')

  // State for AI suggestions
  const [currentProblemHtml, setCurrentProblemHtml] = useState('')
  const [suggestionMessages, setSuggestionMessages] = useState<
    Array<{ type: 'user' | 'ai'; content: string }>
  >([])

  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

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
      setCurrentProblemHtml(html) // Store for AI suggestions
      console.log(html)

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

  // Handle AI suggestions with prompt tracking
  const handleGetSuggestion = async (userQuery?: string): Promise<string> => {
    // Check if user has reached limit before making API call
    if (!isPremium && remainingPrompts <= 0) {
      throw new Error(
        'Daily limit reached. Please upgrade for unlimited prompts!'
      )
    }

    let htmlContent = currentProblemHtml

    // If we don't have HTML content, fetch it
    if (!htmlContent && currentTab?.id) {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => document.documentElement.outerHTML,
      })
      htmlContent = result.result
      setCurrentProblemHtml(htmlContent)

      // Also extract problem info if we don't have it
      if (!problemInfo.title) {
        const currentUrl = currentTab.url || ''
        const info = extractProblemInfo(currentUrl, htmlContent)
        setProblemInfo(info)
      }
    }

    // Build conversation history for context
    const conversationHistory =
      suggestionMessages.length > 0
        ? buildConversationHistory(suggestionMessages)
        : undefined

    try {
      const response = await getAISuggestion(
        apiKey,
        htmlContent,
        language,
        problemInfo,
        userQuery,
        conversationHistory
      )

      // Only increment usage after successful API call
      await incrementPromptUsage()

      return response
    } catch (error) {
      console.error('AI suggestion error:', error)
      throw error
    }
  }

  // Handle prompt usage tracking
  const handlePromptUsed = async () => {
    await incrementPromptUsage()
  }

  // Handle upgrade flow
  const handleShowUpgrade = () => {
    setShowUpgradeModal(true)
  }

  const handleUpgradeConfirm = () => {
    // This will be triggered when the UpgradeModal successfully activates premium
    setPremiumStatus(true)
    setShowUpgradeModal(false)
  }

  const handleSupportClick = (type: 'support' | 'gita' | 'discuss') => {
    const urls = {
      support: 'https://coff.ee/tanishq_aswar',
      discuss: 'https://github.com/TanishqAswar/LeetVSCode/discussions',
      gita: getRandomGitaContent(),
    }

    chrome.tabs.create({ url: urls[type] })
  }

  function getRandomGitaContent(): string {
    const gitaLinks = [
      'https://gitadaily.com/', // Chaitanya Charan Prabhu's blog
      'https://www.youtube.com/watch?v=cBmpasCxlNI', // Janvi Mataji Bhajans
      'https://youtu.be/gjFyOTNUB6E?si=stgZHBH6UOU_pkSE', // Hari Haraye Namah
      'https://youtu.be/ODJ3evaA5iA?si=EV2HRSfneCYb4dG6', // Gauranga Prabhu lectures
    ]

    const randomIndex = Math.floor(Math.random() * gitaLinks.length)
    return gitaLinks[randomIndex]
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

  // Reset all data
  const handleReset = () => {
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
      setSuggestionMessages([]) // Clear suggestion history
      alert('✅ All data reset!')
    }
  }

  // Show loading state while tracking data loads
  if (isTrackingLoading) {
    return (
      <div className='w-96 h-64 flex items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-2'>
          <div className='w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-sm text-gray-600'>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-96 max-h-[600px] overflow-y-auto bg-gray-50'>
      <div className='p-4 space-y-4'>
        {step === 'intro' && (
          <IntroStep
            apiKey={apiKey}
            setApiKey={setApiKey}
            onNext={() => setStep('boilerplate')}
          />
        )}
        {step === 'boilerplate' && (
          <BoilerplateStep
            language={language}
            setLanguage={setLanguage}
            customBoilerplate={customBoilerplate}
            setCustomBoilerplate={setCustomBoilerplate}
            onBack={() => setStep('intro')}
            onComplete={completeSetup}
          />
        )}
        {step === 'generate' && (
          <GenerateStep
            language={language}
            setLanguage={setLanguage}
            problemInfo={problemInfo}
            isLoading={isLoading}
            apiKey={apiKey}
            driverCode={driverCode}
            onGenerate={handleGenerate}
            onSettings={() => setStep('settings')}
            onExtract={() => setStep('extract')}
            onSuggestions={() => setStep('suggestions')}
          />
        )}
        {step === 'extract' && (
          <ExtractStep
            language={language}
            setLanguage={setLanguage}
            extractCode={extractCode}
            setExtractCode={setExtractCode}
            extractedFunction={extractedFunction}
            isLoading={isLoading}
            apiKey={apiKey}
            onExtract={handleExtract}
            onSettings={() => setStep('settings')}
            onGenerate={() => setStep('generate')}
            onSuggestions={() => setStep('suggestions')}
          />
        )}
        {step === 'suggestions' && (
          <AISuggestionStep
            language={language}
            problemInfo={problemInfo}
            apiKey={apiKey}
            isLoading={isLoading}
            onBack={() => setStep(isPlatformPage ? 'generate' : 'extract')}
            onGetSuggestion={handleGetSuggestion}
            isPremium={isPremium}
            promptsUsed={promptsUsed}
            remainingPrompts={remainingPrompts}
            freeLimit={10}
            onPromptUsed={handlePromptUsed}
            onShowUpgrade={handleShowUpgrade}
          />
        )}
        {step === 'settings' && (
          <SettingsStep
            apiKey={apiKey}
            setApiKey={setApiKey}
            language={language}
            setLanguage={setLanguage}
            customBoilerplate={customBoilerplate}
            setCustomBoilerplate={setCustomBoilerplate}
            isPlatformPage={isPlatformPage}
            onBack={() => setStep(isPlatformPage ? 'generate' : 'extract')}
            onReset={handleReset}
          />
        )}

        {/* Support Section - Always visible at bottom */}
        <div className='border-t border-gray-200 pt-4 mt-4'>
          <div className='text-center'>
            <div className='flex flex-col items-center gap-2'>
              {/* Top row: Support, Stressed, and Discuss buttons */}
              <div className='flex justify-center items-center gap-2 flex-wrap'>
                {/* Kindly Support Button */}
                <div className='group relative'>
                  <button
                    onClick={() => handleSupportClick('support')}
                    className='px-2 py-2 h-9 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition-colors flex items-center gap-1'
                  >
                    💝 Kindly Support
                  </button>
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-40 text-center z-10 leading-relaxed'>
                    As an individual developer and maintainer, your support
                    keeps this project going.
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800'></div>
                  </div>
                </div>

                {/* Stressed Button */}
                <div className='group relative'>
                  <button
                    onClick={() => handleSupportClick('gita')}
                    className='px-3 py-2 h-9 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs rounded-md transition-all duration-300 flex items-center gap-1'
                  >
                    😇 Stressed?
                  </button>
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-40 text-center z-10 leading-relaxed'>
                    Try Reading Bhagavad Gita, Listening Beautiful Bhajans, or
                    just watch a small video
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-orange-600'></div>
                  </div>
                </div>

                {/* Discuss Button */}
                {step !== 'intro' && (
                  <div className='group relative'>
                    <button
                      onClick={() => handleSupportClick('discuss')}
                      className='px-3 py-2 h-9 bg-gradient-to-r from-purple-400 to-blue-500 text-white text-xs rounded-md transition-all duration-300 flex items-center gap-2'
                    >
                      💭 Discuss
                    </button>
                    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gradient-to-r from-gray-600 to-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-40 text-center z-10 leading-relaxed'>
                      Report a bug, Demand a Feature, Or just Discuss
                      <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-600'></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom row: AI Suggestion button only */}
              {step !== 'intro' &&
                step !== 'boilerplate' &&
                step !== 'settings' &&
                step !== 'suggestions' && (
                  <div className='flex justify-center items-center w-full'>
                    {/* AI Suggestion Button */}
                    <div className='group relative max-w-xs'>
                      <button
                        onClick={() => setStep('suggestions')}
                        className='px-6 py-2 h-9 bg-gray-600 text-white text-xs rounded-md transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800'
                      >
                        🧘‍♂️ Get AI Guidance
                      </button>
                      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-40 text-center z-10 leading-relaxed'>
                        {!isPremium && remainingPrompts <= 0
                          ? 'Daily limit reached. Upgrade for unlimited prompts!'
                          : 'Get AI hints and ask for follow-ups'}
                        <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black'></div>
                      </div>
                    </div>
                  </div>
                )}
              {!apiKey && (
                <p className='text-red-500 text-xs text-center'>
                  Please set your Gemini API key in settings to use AI features
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgradeConfirm}
      />
    </div>
  )
}

// Add default export
export default Popup
