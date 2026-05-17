'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const [settings, setSettings] = useState({
    heroTitle: 'Rawaa',
    heroTitleAr: 'روعة',
    heroSubtitle: 'Parfums & Bijoux',
    heroSubtitleAr: 'عطور ومجوهرات',
    heroCta1: 'Shop Parfums',
    heroCta2: 'Shop Bijoux',
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setSettings({
          heroTitle: data.heroTitle || 'Rawaa',
          heroTitleAr: data.heroTitleAr || 'روعة',
          heroSubtitle: data.heroSubtitle || 'Parfums & Bijoux',
          heroSubtitleAr: data.heroSubtitleAr || 'عطور ومجوهرات',
          heroCta1: data.heroCta1 || 'Shop Parfums',
          heroCta2: data.heroCta2 || 'Shop Bijoux',
        })
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]"
        style={{ backgroundImage: 'url(/noise.png)', backgroundSize: '200px' }}
      />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-[var(--rose)]/10 blur-3xl" />
      </div>
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-6">
            <span className="text-gradient">{settings.heroTitle}</span>{' '}
            <span className="font-arabic text-[var(--gold)]" dir="rtl">{settings.heroTitleAr}</span>
          </h1>
        </div>
        <p className="font-body text-lg md:text-xl text-[var(--text-secondary)] mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <span lang="fr">{settings.heroSubtitle}</span>
          <span className="mx-3 text-[var(--gold-muted)]">·</span>
          <span lang="ar" dir="rtl" className="font-arabic">{settings.heroSubtitleAr}</span>
        </p>
        <p className="font-arabic text-base text-[var(--gold-muted)] mb-10 animate-slide-up" dir="rtl" style={{ animationDelay: '0.3s' }}>
          الفخامة للجميع
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/shop?category=PERFUME"
            className="px-8 py-3.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] font-medium text-sm hover:opacity-90 transition-all hover:scale-105 active:scale-95"
          >
            <span lang="fr">{settings.heroCta1}</span>
          </Link>
          <Link
            href="/shop?category=JEWELRY"
            className="px-8 py-3.5 rounded-button border border-[var(--gold)] text-[var(--gold)] font-medium text-sm hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-all hover:scale-105 active:scale-95"
          >
            <span lang="fr">{settings.heroCta2}</span>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-muted)" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  )
}
