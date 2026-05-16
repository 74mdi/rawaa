'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  message: string
  type: ToastType
}

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void
}>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-slide-up max-w-xs",
              t.type === 'success' && "bg-[var(--success)] text-white",
              t.type === 'error' && "bg-[var(--error)] text-white",
              t.type === 'info' && "bg-[var(--gold)] text-[var(--bg-primary)]"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
