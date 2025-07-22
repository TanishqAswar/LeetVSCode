// src/components/steps/GenerateStep.tsx (UPDATED)
import React, { useState } from 'react'
import {
  Button,
  Select,
  Card,
  Badge,
  Textarea,
  LoadingSpinner,
} from '../UIComponents'
import { Language, LANGUAGES, ProblemInfo } from '../../types'
import { copyToClipboard } from '../../utils/commonUtils'

interface GenerateStepProps {
  language: Language
  setLanguage: (lang: Language) => void
  problemInfo: ProblemInfo
  isLoading: boolean
  apiKey: string
  driverCode: string
  onGenerate: () => void
  onSettings: () => void
  onExtract: () => void
  onSuggestions: () => void // Added this missing prop
}

export const GenerateStep: React.FC<GenerateStepProps> = ({
  language,
  setLanguage,
  problemInfo,
  isLoading,
  apiKey,
  driverCode,
  onGenerate,
  onSettings,
  onExtract,
  onSuggestions, // Added this missing prop
}) => {
  const [copyState, setCopyState] = useState('copy')

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h1 className='text-lg font-bold text-gray-900 mb-2 mt-5'>
          🔧 Generate Driver Code
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
              </div>
            </div>
          </Card>
        )}

        <Button onClick={onSettings} variant='ghost' size='sm'>
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
        onClick={onGenerate}
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
          <div className='flex items-center gap-4 mb-3'>
            <h3 className='font-semibold text-gray-900 flex items-center flex-1'>
              <span className='mr-2'>📄</span>
              Generated Code
            </h3>
            <Button
              onClick={async () => {
                setCopyState('copying')
                await copyToClipboard(driverCode)
                setCopyState('copied')
                setTimeout(() => setCopyState('copy'), 2000)
              }}
              variant='secondary'
              disabled={
                !driverCode ||
                driverCode.trim() === '' ||
                copyState === 'copying'
              }
            >
              {copyState === 'copying'
                ? '⏳ Copying...'
                : copyState === 'copied'
                ? '✅ Copied!'
                : '📋 Copy'}
            </Button>
          </div>
          <Textarea value={driverCode} readOnly rows={12} />
        </Card>
      )}

      {/* Navigation Buttons - matching the ExtractStep design */}
      <div className='text-center pt-4 border-t border-gray-200'>
        <Button onClick={onExtract} variant='ghost' size='md'>
          🔍 Extract Function
        </Button>
      </div>
    </div>
  )
}
