'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { useLang } from '@/lib/LanguageContext'
import Image from 'next/image'
import { calcTotal } from '@/lib/shipping'

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const { items, total, removeItem, updateQuantity, itemCount } = useCartStore()
  const { t, lang } = useLang()
  const subtotal = total()

  useEffect(() => {
    const handleToggle = () => setOpen(true)
    window.addEventListener('open-cart-drawer', handleToggle)
    return () => window.removeEventListener('open-cart-drawer', handleToggle)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--bg-secondary)] border-l border-[var(--border)] animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-display text-lg">{lang === 'fr' ? 'Panier' : 'السلة'} ({itemCount()})</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center mt-12">
              <svg className="mx-auto mb-4 text-[var(--text-muted)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
              </svg>
              <p className="text-sm text-[var(--text-muted)]">{t.cart.empty}</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-4 bg-[var(--bg-surface)] rounded-xl p-3 group">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-primary)]">
                  <Image src={item.product.images[0] || '/images/placeholder.svg'} alt={item.product.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm truncate">{item.product.name}</h3>
                  <p className="font-arabic text-xs text-[var(--text-muted)] truncate" dir="rtl">{item.product.nameAr}</p>
                  <p className="text-sm text-[var(--gold)] font-mono mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) removeItem(item.product.id)
                        else updateQuantity(item.product.id, item.quantity - 1)
                      }}
                      className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:border-[var(--gold)] transition-colors"
                      aria-label="−"
                    >−</button>
                    <span className="text-sm font-mono w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:border-[var(--gold)] transition-colors"
                      aria-label="+"
                    >+</button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-[var(--text-muted)] hover:text-[var(--error)] self-start transition-colors"
                  aria-label={lang === 'fr' ? 'Supprimer' : 'حذف'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--border)] p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">{t.cart.total}</span>
              <span className="font-mono text-lg text-[var(--gold)]">{formatPrice(calcTotal(subtotal))}</span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 rounded-button border border-[var(--gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-all"
              >
                {lang === 'fr' ? 'Voir le panier' : 'عرض السلة'}
              </Link>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="flex-1 text-center py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm hover:opacity-90 transition-all"
              >
                {t.cart.checkout}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
