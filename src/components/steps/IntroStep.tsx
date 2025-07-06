// src/components/steps/IntroStep.tsx
import React from 'react'
import { Button, Input, Card } from '../UIComponents'

interface IntroStepProps {
  apiKey: string
  setApiKey: (key: string) => void
  onNext: () => void
}

export const IntroStep: React.FC<IntroStepProps> = ({
  apiKey,
  setApiKey,
  onNext,
}) => {
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <div className='text-4xl mb-3'>
          <img src='/icons/icon.png' alt='App Icon' className='w-10 h-10 ml-2' />
        </div>
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
            <br />
            <a
              href='https://youtube.com/shorts/gimu4UFFMnM?si=pKyyE-neJGWwLhKN'
              target='_blank'
              className='text-blue-600 hover:text-blue-800 text-sm underline'
            >
              Video Tutorial →
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
        onClick={onNext}
        disabled={!apiKey.trim()}
        className='w-full'
        variant='success'
      >
        Next: Setup Boilerplate →
      </Button>
    </div>
  )
}
