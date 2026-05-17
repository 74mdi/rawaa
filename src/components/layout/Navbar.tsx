'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useLang } from '@/lib/LanguageContext'
import { ThemeToggle } from './ThemeToggle'
import { LangToggle } from './LangToggle'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const itemCount = useCartStore(s => s.itemCount())
  const { t, lang, toggleLang } = useLang()

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          className="lg:hidden text-[var(--text-primary)]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl md:text-3xl font-display text-gradient font-bold tracking-wide">
            Rawaa
          </span>
          <span className="font-arabic text-lg text-[var(--gold-muted)] hidden sm:inline transition-colors group-hover:text-[var(--gold)]" dir="rtl">
            روعة
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/shop?category=PERFUME" className="relative text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors after:absolute after:bottom-[-18px] after:left-0 after:w-0 after:h-0.5 after:bg-[var(--gold)] after:transition-all hover:after:w-full">
            {t.nav.perfumes}
          </Link>
          <Link href="/shop?category=JEWELRY" className="relative text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors after:absolute after:bottom-[-18px] after:left-0 after:w-0 after:h-0.5 after:bg-[var(--gold)] after:transition-all hover:after:w-full">
            {t.nav.jewelry}
          </Link>
          <Link href="/shop" className="relative text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors after:absolute after:bottom-[-18px] after:left-0 after:w-0 after:h-0.5 after:bg-[var(--gold)] after:transition-all hover:after:w-full">
            {t.nav.newArrivals}
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <LangToggle />

          <button
            onClick={() => {
              setSearchOpen(!searchOpen)
              setSearchQuery('')
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-surface)]"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-cart-drawer'))}
            className="relative text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-surface)]"
            aria-label="Cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="21" r="1" /><circle cx="21" cy="21" r="1" />
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--gold)] text-[var(--bg-primary)] text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
              }
            }}
            placeholder={t.nav.search}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors"
            autoFocus
          />
        </div>
      )}

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[var(--bg-primary)] z-40 flex flex-col animate-fade-in">
          <nav className="flex-1 flex flex-col items-center gap-8 pt-16" onClick={() => setMenuOpen(false)}>
            <Link href="/shop?category=PERFUME" className="text-lg text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              {t.nav.perfumes}
            </Link>
            <Link href="/shop?category=JEWELRY" className="text-lg text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              {t.nav.jewelry}
            </Link>
            <Link href="/shop" className="text-lg text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              {t.nav.newArrivals}
            </Link>
          </nav>

          <div className="border-t border-[var(--border)] p-6 flex items-center justify-center gap-6">
            <button
              onClick={() => { toggleLang?.(); setMenuOpen(false) }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
            >
              <span className="text-base">{lang === 'fr' ? '🇲🇦' : '🇫🇷'}</span>
              {lang === 'fr' ? 'العربية' : 'Français'}
            </button>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
