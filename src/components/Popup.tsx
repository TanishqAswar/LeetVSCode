// src/components/Popup.tsx (MAIN COMPONENT)
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
} from '../utils/aiUtils'
import { testApiConnection } from '../utils/aiUtils'

import { useLocalStorage, useCurrentTab } from '../hooks/useCustomHooks'
import { IntroStep } from './steps/IntroStep'
import { BoilerplateStep } from './steps/BoilerplateStep'
import { GenerateStep } from './steps/GenerateStep'
import { ExtractStep } from './steps/ExtractStep'
import { SettingsStep } from './steps/SettingsStep'

export default function Popup() {
  const [step, setStep] = useState<StepType>('intro')
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

  // Test your API key
  testApiConnection('your-api-key-here').then((result) => {
    console.log('Test result:', result)
  })

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
      alert('✅ All data reset!')
    }
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
      </div>
    </div>
  )
}
