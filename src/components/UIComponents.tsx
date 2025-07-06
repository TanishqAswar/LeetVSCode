// src/components/UIComponents.tsx
import React from 'react'

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => {
  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    ghost:
      'text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}

export const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  className = '',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  className?: string
}) => (
  <div className={className}>
    {label && (
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
    />
  </div>
)

export const Select = ({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  className?: string
}) => (
  <div className={className}>
    {label && (
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)

export const Textarea = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  readOnly = false,
  className = '',
}: {
  label?: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  rows?: number
  readOnly?: boolean
  className?: string
}) => (
  <div className={className}>
    {label && (
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono resize-none ${
        readOnly ? 'bg-gray-50' : ''
      }`}
    />
  </div>
)

export const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`}
  >
    {children}
  </div>
)

export const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

export const LoadingSpinner = () => (
  <div className='flex items-center justify-center'>
    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
  </div>
)
