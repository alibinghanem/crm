'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export default function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold rounded-full border',
        {
          'bg-blue-100 text-blue-800 border-blue-200': variant === 'default',
          'bg-green-100 text-green-800 border-green-200': variant === 'success',
          'bg-yellow-100 text-yellow-800 border-yellow-200': variant === 'warning',
          'bg-red-100 text-red-800 border-red-200': variant === 'danger',
          'bg-purple-100 text-purple-800 border-purple-200': variant === 'info',
        },
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-xs': size === 'md',
        }
      )}
    >
      {children}
    </span>
  )
}
