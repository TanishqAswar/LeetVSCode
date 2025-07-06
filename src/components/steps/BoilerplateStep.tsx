// src/components/steps/BoilerplateStep.tsx
import React from 'react'
import { Button, Select, Textarea } from '../UIComponents'
import { Language, LANGUAGES } from '../../types'
import { getDefaultBoilerplate } from '../../utils/boilerplateUtils'

interface BoilerplateStepProps {
  language: Language
  setLanguage: (lang: Language) => void
  customBoilerplate: string
  setCustomBoilerplate: (boilerplate: string) => void
  onBack: () => void
  onComplete: () => void
}

export const BoilerplateStep: React.FC<BoilerplateStepProps> = ({
  language,
  setLanguage,
  customBoilerplate,
  setCustomBoilerplate,
  onBack,
  onComplete,
}) => {
  return (
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
        <Button onClick={onBack} variant='ghost' className='flex-1'>
          ← Back
        </Button>
        <Button onClick={onComplete} variant='success' className='flex-1'>
          Start Coding! 🎯
        </Button>
      </div>
    </div>
  )
}
