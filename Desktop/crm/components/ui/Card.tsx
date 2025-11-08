'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export default function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border-2 transition-all duration-300',
        {
          'bg-white border-gray-100 shadow-md': !gradient,
          'bg-gradient-to-br border-transparent shadow-xl': gradient,
          'hover:shadow-xl hover:scale-[1.02] hover:border-primary-200 cursor-pointer': hover,
        },
        className
      )}
    >
      {children}
    </div>
  )
}
