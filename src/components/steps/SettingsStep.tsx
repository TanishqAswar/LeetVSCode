// src/components/steps/SettingsStep.tsx
import React, { useState } from 'react'
import { Button, Input, Select, Textarea } from '../UIComponents'
import { Language, LANGUAGES } from '../../types'
import { getDefaultBoilerplate } from '../../utils/boilerplateUtils'
import { Eye, EyeOff } from 'lucide-react'

interface SettingsStepProps {
  apiKey: string
  setApiKey: (key: string) => void
  language: Language
  setLanguage: (lang: Language) => void
  customBoilerplate: string
  setCustomBoilerplate: (boilerplate: string) => void
  isPlatformPage: boolean
  onBack: () => void
  onReset: () => void
}

export const SettingsStep: React.FC<SettingsStepProps> = ({
  apiKey,
  setApiKey,
  language,
  setLanguage,
  customBoilerplate,
  setCustomBoilerplate,
  isPlatformPage,
  onBack,
  onReset,
}) => {
  const [showApiKey, setShowApiKey] = useState(false)

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey)
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-3xl mb-3'>⚙️</div>
        <h1 className='text-lg font-bold text-gray-900 mb-2'>Settings</h1>
        <p className='text-sm text-gray-600'>Update your preferences</p>
      </div>

      {/* API Key Input with Toggle */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700'>
          🔐 Gemini API Key
        </label>
        <a
          href='https://aistudio.google.com/app/apikey'
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 hover:text-blue-800 text-sm underline'
        >
          Don't Have One? Get For Free →
        </a>
        <div className='relative'>
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={setApiKey}
            placeholder='Enter your Gemini API key'
            className='pr-10'
          />
          <button
            type='button'
            onClick={toggleApiKeyVisibility}
            className='absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none'
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      <Select
        label='🧪 Default Language'
        value={language}
        onChange={(value) => setLanguage(value as Language)}
        options={LANGUAGES}
      />

      <Textarea
        label='📝 Custom Boilerplate'
        value={customBoilerplate}
        onChange={setCustomBoilerplate}
        placeholder={`Default template:\n\n${getDefaultBoilerplate(language)}`}
        rows={6}
      />

      <div className='space-y-3'>
        <Button
          onClick={() => {
            alert('✅ Settings saved!')
            onBack()
          }}
          variant='success'
          className='w-full'
        >
          💾 Save Settings
        </Button>

        <Button onClick={onReset} variant='danger' className='w-full'>
          🗑️ Reset All Data
        </Button>
      </div>

      <div className='text-center pt-4 border-t border-gray-200'>
        <Button onClick={onBack} variant='ghost' size='sm'>
          ← Back
        </Button>
      </div>
    </div>
  )
}
