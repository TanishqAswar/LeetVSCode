// src/components/steps/ExtractStep.tsx (COMPLETED)
import React from 'react'
import { useState } from 'react'
import { Button, Select, Card, Textarea, LoadingSpinner } from '../UIComponents'
import { Language, LANGUAGES } from '../../types'
import { copyToClipboard } from '../../utils/commonUtils'

interface ExtractStepProps {
  language: Language
  setLanguage: (lang: Language) => void
  extractCode: string
  setExtractCode: (code: string) => void
  extractedFunction: string
  isLoading: boolean
  apiKey: string
  onExtract: () => void
  onSettings: () => void
  onGenerate: () => void
}

export const ExtractStep: React.FC<ExtractStepProps> = ({
  language,
  setLanguage,
  extractCode,
  setExtractCode,
  extractedFunction,
  isLoading,
  apiKey,
  onExtract,
  onSettings,
  onGenerate,
  
}

) => {

  const [copyState, setCopyState] = useState('copy')

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-3xl mb-3'>🔍</div>
        <h1 className='text-lg font-bold text-gray-900 mb-2'>
          Extract Function
        </h1>
        <p className='text-sm text-gray-600'>
          Paste your VS Code solution to extract submittable code
        </p>
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

      <Textarea
        label='📝 Your VS Code Solution'
        value={extractCode}
        onChange={setExtractCode}
        placeholder='Paste your complete VS Code solution here...'
        rows={6}
      />

      <Button
        onClick={onExtract}
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
            <div className='flex items-center gap-4 mb-3'>
              <h3 className='font-semibold text-gray-900 flex items-center flex-1'>
                <span className='mr-2'>✂️</span>
                Extracted Function
              </h3>
              <Button
                onClick={async () => {
                  setCopyState('copying')
                  await copyToClipboard(extractedFunction)
                  setCopyState('copied')
                  setTimeout(() => setCopyState('copy'), 2000)
                }}
                variant='secondary'
                disabled={
                  !extractedFunction ||
                  extractedFunction.trim() === '' ||
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
            <Textarea
              value={extractedFunction || 'No function extracted yet...'}
              readOnly
              rows={12}
              className={!extractedFunction ? 'text-gray-400' : ''}
            />
          </div>
        </Card>
      )}

      <div className='text-center pt-4 border-t border-gray-200'>
        <Button onClick={onGenerate} variant='ghost' size='sm'>
          ← Back to Generate
        </Button>
      </div>
    </div>
  )
}
