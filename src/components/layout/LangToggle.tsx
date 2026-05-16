'use client'

import { useLang } from '@/lib/LanguageContext'
import { useState, useRef, useEffect } from 'react'

export function LangToggle() {
  const { lang, toggleLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border)] transition-all"
        aria-label="Toggle language"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
        <span className="hidden sm:inline uppercase tracking-wider">{lang}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
          <button
            onClick={() => { toggleLang(); setOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              lang === 'fr'
                ? 'text-[var(--gold)] bg-[var(--gold)]/5'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span className="text-base">🇫🇷</span>
            <div className="text-left">
              <p className="font-medium">Français</p>
              <p className="text-xs text-[var(--text-muted)]">French</p>
            </div>
            {lang === 'fr' && (
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
          <div className="h-px bg-[var(--border)]" />
          <button
            onClick={() => { toggleLang(); setOpen(false) }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              lang === 'ar'
                ? 'text-[var(--gold)] bg-[var(--gold)]/5'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <span className="text-base">🇲🇦</span>
            <div className="text-left">
              <p className="font-medium font-arabic">العربية</p>
              <p className="text-xs text-[var(--text-muted)]">Arabic</p>
            </div>
            {lang === 'ar' && (
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
