'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { useLang } from '@/lib/LanguageContext'
import { SITE_CONFIG } from '@/lib/constants'
import { calcShipping, calcTotal } from '@/lib/shipping'

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, itemCount } = useCartStore()
  const { t, lang } = useLang()
  const subtotal = total()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <svg className="mx-auto mb-6 text-[var(--text-muted)]" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="8" cy="21" r="1" /><circle cx="21" cy="21" r="1" />
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
        </svg>
        <h1 className="font-display text-2xl mb-4">{t.cart.empty}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{lang === 'fr' ? 'Découvrez nos parfums et bijoux' : 'اكتشف عطورنا ومجوهراتنا'}</p>
        <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all">
          {t.home.viewAll}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    )
  }

  const shipping = calcShipping(subtotal)
  const grandTotal = calcTotal(subtotal)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl mb-8 text-gradient">
        {lang === 'fr' ? 'Panier' : 'السلة'} ({itemCount()})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-4 bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)] group hover:border-[var(--gold)]/50 transition-all">
              <Link href={`/shop/${item.product.slug}`} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-primary)]">
                <Image src={item.product.images[0] || '/images/placeholder.svg'} alt={item.product.name} fill className="object-cover" sizes="96px" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.product.slug}`}>
                  <h3 className="font-display text-base truncate hover:text-[var(--gold)] transition-colors">{item.product.name}</h3>
                </Link>
                <p className="font-arabic text-xs text-[var(--text-muted)] truncate" dir="rtl">{item.product.nameAr}</p>
                <p className="font-mono text-sm text-[var(--gold)] mt-1">{formatPrice(item.product.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      if (item.quantity <= 1) removeItem(item.product.id)
                      else updateQuantity(item.product.id, item.quantity - 1)
                    }}
                    className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:border-[var(--gold)] hover:bg-[var(--bg-surface)] transition-all"
                    aria-label={lang === 'fr' ? 'Diminuer' : 'إنقاص'}
                  >
                    −
                  </button>
                  <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:border-[var(--gold)] hover:bg-[var(--bg-surface)] transition-all"
                    aria-label={lang === 'fr' ? 'Augmenter' : 'زيادة'}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right flex flex-col items-end justify-between">
                <p className="font-mono text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors flex items-center gap-1"
                  aria-label={lang === 'fr' ? 'Supprimer' : 'حذف'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  {lang === 'fr' ? 'Supprimer' : 'حذف'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 h-fit sticky top-24 border border-[var(--border)]">
          <h3 className="font-display text-lg mb-4">{lang === 'fr' ? 'Résumé' : 'الملخص'}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">{lang === 'fr' ? 'Sous-total' : 'المجموع الفرعي'}</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">{lang === 'fr' ? 'Livraison' : 'التوصيل'}</span>
              <span className={`font-mono ${shipping === 0 ? 'text-[var(--success)]' : ''}`}>
                {shipping === 0 ? (lang === 'fr' ? 'Gratuite' : 'مجاني') : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && subtotal < 200 && (
              <div className="bg-[var(--gold)]/10 rounded-button px-3 py-2">
                <p className="text-xs text-[var(--gold)]">
                  {lang === 'fr'
                    ? `Ajoutez ${formatPrice(200 - subtotal)} pour la livraison offerte`
                    : `أضف ${formatPrice(200 - subtotal)} للتوصيل المجاني`}
                </p>
              </div>
            )}
            <div className="border-t border-[var(--border)] pt-3 flex justify-between">
              <span className="font-display">{t.cart.total}</span>
              <span className="font-mono text-lg text-[var(--gold)]">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block text-center mt-6 py-3 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] font-medium text-sm hover:opacity-90 transition-all active:scale-[0.98]"
          >
            {t.cart.checkout}
          </Link>

          <p className="mt-3 text-xs text-center text-[var(--text-muted)]">
            <svg className="inline-block -mt-0.5 mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {lang === 'fr' ? 'Paiement à la livraison uniquement' : 'الدفع عند الاستلام فقط'}
          </p>

          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
              `${lang === 'fr' ? 'Bonjour! Je souhaite commander' : 'مرحباً! أريد أن أطلب'}:\n\n${items.map(i => `• ${i.product.name} x${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`).join('\n')}\n\n${lang === 'fr' ? 'Total' : 'المجموع'}: ${formatPrice(grandTotal)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-3 py-3 rounded-button border border-[#25D366] text-[#25D366] text-sm font-medium hover:bg-[#25D366] hover:text-white transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {lang === 'fr' ? 'Commander via WhatsApp' : 'اطلب عبر واتساب'}
          </a>
        </div>
      </div>
    </div>
  )
}
