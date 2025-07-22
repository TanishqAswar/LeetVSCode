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
}

export function AISuggestionStep({
  language,
  problemInfo,
  apiKey,
  isLoading,
  onBack,
  onGetSuggestion,
}: AISuggestionStepProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    setIsProcessing(true)
    try {
      const suggestion = await onGetSuggestion()
      addMessage('ai', suggestion)
    } catch (error) {
      addMessage(
        'ai',
        `🙏 Forgive me, dear devotee! Something went wrong. Please try again. ${error}` 
      )
      console.log(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return

    const query = userInput.trim()
    setUserInput('')
    addMessage('user', query)

    setIsProcessing(true)
    try {
      const response = await onGetSuggestion(query)
      addMessage('ai', response)
    } catch (error) {
      addMessage(
        'ai',
        `🙏 Forgive me, dear devotee! Something went wrong. Krishna willing, please try again. ${error}`
      )
    } finally {
      setIsProcessing(false)
    }
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
        <div className='text-center py-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200' style={{padding: '2px'}}>
          <div className='mb-3'>
            <span className='text-4xl'>🧘‍♂️</span>
          </div>
          <h3 className='text-lg font-medium text-gray-800 mb-2'>
            Seek Guidance
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            Ask me anything about this problem - hints, approaches,
            explanations, or specific questions
          </p>

          {/* Quick Start Buttons */}
          <div className='flex flex-wrap justify-center gap-2 mb-4'>
            <button
              onClick={handleInitialSuggestion}
              disabled={!apiKey || isProcessing}
              className='px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              💡 Get a hint
            </button>
            <button
              onClick={() =>
                setUserInput("What's the best approach for this problem?")
              }
              className='px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-300'
            >
              🎯 Ask about approach
            </button>
          </div>

          {!apiKey && (
            <p className='text-red-500 text-xs'>
              Please set your Gemini API key in settings first
            </p>
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
                      // Use Advanced Markdown Renderer for AI messages
                      <AdvancedMarkdownRenderer
                        content={message.content}
                        className='text-gray-800'
                      />
                    ) : (
                      // Keep user messages as plain text with whitespace preservation
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
      <div className='space-y-3'>
        <div className='flex gap-2'>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              messages.length === 0
                ? 'Ask me anything about this problem... (Press Enter to send)'
                : 'Ask a follow-up question...'
            }
            className='flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500'
            rows={2}
            disabled={isProcessing || !apiKey}
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isProcessing || !apiKey}
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
          <button
            onClick={() => setUserInput('Can you give me a hint?')}
            disabled={!apiKey}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            💡 Hint
          </button>
          <button
            onClick={() => setUserInput("What's the time complexity?")}
            disabled={!apiKey}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            ⏰ Time complexity
          </button>
          <button
            onClick={() => setUserInput('What approach should I use?')}
            disabled={!apiKey}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            🎯 Approach
          </button>
          <button
            onClick={() => setUserInput('Can you explain the solution?')}
            disabled={!apiKey}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            📝 Explain solution
          </button>
          <button
            onClick={() => setUserInput('Show me an example')}
            disabled={!apiKey}
            className='px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50'
          >
            🔍 Example
          </button>
        </div>
      </div>
    </div>
  )
}
