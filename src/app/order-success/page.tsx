'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

function OrderContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-[var(--success)]/20 flex items-center justify-center mx-auto mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="font-display text-3xl text-[var(--text-primary)] mb-2">
        Commande reçue!
      </h1>
      <p className="font-arabic text-lg text-[var(--gold)] mb-6" dir="rtl">
        شكراً لك
      </p>

      {orderNumber && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 inline-block border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] mb-1">N° de commande</p>
          <p className="font-mono text-lg text-[var(--gold)]">{orderNumber.slice(0, 8).toUpperCase()}</p>
        </div>
      )}

      <div className="text-sm text-[var(--text-secondary)] space-y-2 mb-8">
        <p>Notre équipe vous contactera pour confirmer la commande.</p>
        <p className="text-xs text-[var(--text-muted)]">
          Délai de livraison estimé : <strong>2 à 5 jours ouvrés</strong>
        </p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-8 border border-[var(--border)] text-left text-sm space-y-2">
        <h3 className="font-display text-sm text-center mb-3">Prochaines étapes</h3>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
          <p className="text-[var(--text-secondary)]">Vous recevrez un appel de confirmation dans les prochaines minutes</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
          <p className="text-[var(--text-secondary)]">Votre commande sera préparée avec soin</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-[var(--gold)]/20 text-[var(--gold)] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
          <p className="text-[var(--text-secondary)]">Livraison à votre adresse sous 2 à 5 jours ouvrés</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
            `Bonjour! Je viens de passer une commande chez Rawaa روعة.\nN° de commande: ${(orderNumber || '').slice(0, 8).toUpperCase()}\n\nPouvez-vous confirmer ma commande?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-button bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Confirmer via WhatsApp
        </a>
        <Link
          href="/shop"
          className="px-6 py-3 rounded-button border border-[var(--gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-all"
        >
          Continuer les achats
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-20 text-center">Loading...</div>}>
      <OrderContent />
    </Suspense>
  )
}
