'use client'

import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'
import { useLang } from '@/lib/LanguageContext'

export function Footer() {
  const { t } = useLang()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="font-display text-2xl text-gradient">
              Rawaa روعة
            </Link>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {SITE_CONFIG.tagline} · {SITE_CONFIG.taglineAr}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm text-[var(--text-primary)] mb-4">{t.footer.links}</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/shop" className="hover:text-[var(--gold)] transition-colors">{t.footer.shop}</Link>
              <Link href="/shop?category=PERFUME" className="hover:text-[var(--gold)] transition-colors">{t.nav.perfumes}</Link>
              <Link href="/shop?category=JEWELRY" className="hover:text-[var(--gold)] transition-colors">{t.nav.jewelry}</Link>
              <Link href="/admin" className="hover:text-[var(--gold)] transition-colors">Admin</Link>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm text-[var(--text-primary)] mb-4">{t.footer.contact}</h3>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--gold)] transition-colors"
              >
                WhatsApp
              </a>
              <span>Instagram: {SITE_CONFIG.instagram}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} Rawaa روعة · المغرب
        </div>
      </div>
    </footer>
  )
}
