// src/components/steps/AISuggestionStep.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Language, ProblemInfo } from '../../types'
import { AdvancedMarkdownRenderer } from '../MarkdownRenderer'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface AISuggestionStepProps {
  language: Language
  problemInfo: ProblemInfo
  apiKey: string
  isLoading: boolean
  onBack: () => void
  onGetSuggestion: (userQuery?: string) => Promise<string>
  // Add these new props for prompt tracking
  isPremium?: boolean
  promptsUsed?: number
  remainingPrompts?: number
  freeLimit?: number
  onPromptUsed?: () => void
  onShowUpgrade?: () => void
}

export function AISuggestionStep({
  language,
  problemInfo,
  apiKey,
  isLoading,
  onBack,
  onGetSuggestion,
  isPremium = false,
  promptsUsed = 0,
  remainingPrompts = 2,
  freeLimit = 2,
  onPromptUsed,
  onShowUpgrade,
}: AISuggestionStepProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLimitReached = !isPremium && remainingPrompts <= 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleInitialSuggestion = async () => {
    if (isLimitReached) {
      onShowUpgrade?.()
      return
    }

    setIsProcessing(true)
    try {
      const suggestion = await onGetSuggestion()
      addMessage('ai', suggestion)
    } catch (error: any) {
      if (error.message?.includes('Daily limit reached')) {
        onShowUpgrade?.()
      } else {
        addMessage(
          'ai',
          `🙏 Forgive me, dear devotee! Something went wrong. Please try again. ${error}`
        )
      }
      console.log(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return

    if (isLimitReached) {
      onShowUpgrade?.()
      return
    }

    const query = userInput.trim()
    setUserInput('')
    addMessage('user', query)

    setIsProcessing(true)
    try {
      const response = await onGetSuggestion(query)
      addMessage('ai', response)
    } catch (error: any) {
      if (error.message?.includes('Daily limit reached')) {
        onShowUpgrade?.()
      } else {
        addMessage(
          'ai',
          `🙏 Forgive me, dear devotee! Something went wrong. Please try again. ${error}`
        )
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    if (isLimitReached) {
      onShowUpgrade?.()
      return
    }
    setUserInput(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <button
          onClick={onBack}
          className='text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1'
        >
          ← Back
        </button>
        <h2 className='text-lg font-semibold text-gray-800'>🕉️ AI Guidance</h2>
        <div className='w-12'></div>
      </div>

      {/* Usage Indicator - Only show for non-premium users */}
      {!isPremium && (
        <div className='bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-200'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-orange-800'>
              🔥 {remainingPrompts} prompts remaining today
            </span>
            {isLimitReached ? (
              <button
                onClick={onShowUpgrade}
                className='text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition-colors'
              >
                Upgrade
              </button>
            ) : (
              <span className='text-xs text-orange-600'>Free tier</span>
            )}
          </div>
          {promptsUsed > 0 && (
            <div className='w-full bg-orange-200 rounded-full h-1 mt-2'>
              <div
                className='bg-orange-500 h-1 rounded-full transition-all duration-300'
                style={{
                  width: `${Math.min((promptsUsed / freeLimit) * 100, 100)}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Premium Badge for Premium Users */}
      {isPremium && (
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200'>
          <div className='flex items-center justify-center gap-2'>
            <span className='text-sm text-green-800'>✨ Premium Active</span>
            <span className='text-xs bg-green-500 text-white px-2 py-1 rounded-full'>
              Unlimited
            </span>
          </div>
        </div>
      )}

      {/* Problem Info */}
      {problemInfo.title && (
        <div className='bg-orange-50 p-3 rounded-lg border border-orange-200'>
          <h3 className='font-medium text-orange-800'>{problemInfo.title}</h3>
          {problemInfo.difficulty && (
            <p className='text-sm text-orange-600 mt-1'>
              Difficulty: {problemInfo.difficulty}
            </p>
          )}
          <p className='text-sm text-gray-600 mt-1'>Language: {language}</p>
        </div>
      )}

      {/* Welcome Section - Shows when no messages */}
      {messages.length === 0 && (
        <div
          className='text-center py-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200'
          style={{ padding: '2px' }}
        >
          <div className='mb-3'>
            <span className='text-4xl'>🧘‍♂️</span>
          </div>
          <h3 className='text-lg font-medium text-gray-800 '>I'm CodeTatva</h3>
          <h4 className='text-md font-normal text-gray-800 mb-2'>
            Your Spiritual Coding Spirit
          </h4>
          <p className='text-sm text-gray-600 mb-4'>
            Ask me anything about this problem - hints, approaches,
            explanations, or specific questions
          </p>

          {/* Quick Start Buttons */}
          <div className='flex flex-wrap justify-center gap-2 mb-4'>
            <button
              onClick={handleInitialSuggestion}
              disabled={!apiKey || isProcessing}
              className={`px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLimitReached ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              💡 Get a hint
            </button>
            <button
              onClick={() =>
                handleQuickAction("What's the best approach for this problem?")
              }
              disabled={isLimitReached}
              className={`px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300 ${
                isLimitReached ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              🎯 Ask about approach
            </button>
          </div>

          {!apiKey && (
            <p className='text-red-500 text-xs'>
              Please set your Gemini API key in settings first
            </p>
          )}

          {isLimitReached && (
            <div className='mt-4'>
              <p className='text-orange-600 text-xs mb-2'>
                Daily limit reached. Upgrade for unlimited prompts!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className='bg-white border rounded-lg max-h-80 overflow-y-auto'>
          <div className='p-4 space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-orange-50 text-gray-800 border border-orange-200'
                  }`}
                >
                  <div className='text-sm'>
                    {message.type === 'ai' ? (
                      <AdvancedMarkdownRenderer
                        content={message.content}
                        className='text-gray-800'
                      />
                    ) : (
                      <div className='whitespace-pre-wrap'>
                        {message.content}
                      </div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 pt-2 border-t ${
                      message.type === 'user'
                        ? 'text-blue-200 border-blue-400'
                        : 'text-gray-500 border-orange-200'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className='flex justify-start'>
                <div className='bg-orange-50 border border-orange-200 p-3 rounded-lg'>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin'></div>
                    <span className='text-sm text-gray-600'>
                      Let Me Think...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Chat Input - Now always visible */}
      <div className='space-y-5' style={{ marginTop: 40 }}>
        <div className='flex gap-2'>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isLimitReached
                ? 'Daily limit reached. Upgrade for unlimited prompts!'
                : messages.length === 0
                ? 'Ask me anything about this problem... (Press Enter to send)'
                : 'Ask a follow-up question...'
            }
            className={`flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              isLimitReached ? 'bg-gray-100' : ''
            }`}
            rows={2}
            disabled={isProcessing || !apiKey || isLimitReached}
          />
          <button
            onClick={handleSendMessage}
            disabled={
              !userInput.trim() || isProcessing || !apiKey || isLimitReached
            }
            className='px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {isProcessing ? (
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            ) : (
              '🪷'
            )}
          </button>
        </div>

        {/* Quick Actions - Always visible */}
        <div className='flex flex-wrap gap-2'>
          {messages.length > 0 && (
            <button
              onClick={() => handleQuickAction('Can you give me another hint?')}
              disabled={!apiKey || isLimitReached}
              className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
            >
              💡 Another Hint
            </button>
          )}
          <button
            onClick={() =>
              handleQuickAction(
                "What's the time and space complexity of the approach?"
              )
            }
            disabled={!apiKey || isLimitReached}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            ⏰ Time-Space Comp
          </button>
          <button
            onClick={() =>
              handleQuickAction(
                'Is there any Optimisation to the current approach or is there an another optimised approach?'
              )
            }
            disabled={!apiKey || isLimitReached}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            🎯 Optimisation
          </button>
          <button
            onClick={() => handleQuickAction('Can you explain the solution?')}
            disabled={!apiKey || isLimitReached}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            📝 Explain solution
          </button>
          <button
            onClick={() => handleQuickAction('Show me an example')}
            disabled={!apiKey || isLimitReached}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            🔍 Example
          </button>
        </div>

        {/* Upgrade CTA when limit reached */}
        {isLimitReached && (
          <div className='text-center bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200'>
            <p className='text-orange-800 text-sm mb-2'>
              🔥 You've used all your free prompts today!
            </p>
            <button
              onClick={onShowUpgrade}
              className='px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300'
            >
              🚀 Upgrade to Premium - ₹299/month
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
