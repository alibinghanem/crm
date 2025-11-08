'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={onClose}
        />
        <div className={`inline-block align-bottom bg-white rounded-3xl shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} animate-scale-in border-2 border-gray-100`}>
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 rounded-t-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between px-6 py-5 text-white">
              <h3 className="text-2xl font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="px-6 py-6 bg-gradient-to-b from-white to-gray-50">{children}</div>
        </div>
      </div>
    </div>
  )
}
