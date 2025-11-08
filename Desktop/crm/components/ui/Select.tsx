'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, className, children, ...props }, ref) => {
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={clsx(
              'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white',
              icon ? 'pr-12' : '',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200 hover:border-gray-300',
              className
            )}
            {...props}
          >
            {children}
          </select>
          {!icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
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

Select.displayName = 'Select'

export default Select
