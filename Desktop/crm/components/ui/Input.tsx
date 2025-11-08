'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              icon ? 'pr-12' : '',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200 bg-white hover:border-gray-300',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
