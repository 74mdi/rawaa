'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { MOROCCAN_CITIES } from '@/lib/constants'
import { useLang } from '@/lib/LanguageContext'
import { calcShipping, calcTotal } from '@/lib/shipping'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const { t, lang } = useLang()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const subtotal = total()
  const shipping = calcShipping(subtotal)
  const grandTotal = calcTotal(subtotal)

  const errors: Record<string, string> = {}
  if (!form.customerName.trim()) errors.customerName = lang === 'fr' ? 'Nom requis' : 'الاسم مطلوب'
  if (!form.phone.trim()) errors.phone = lang === 'fr' ? 'Téléphone requis' : 'رقم الهاتف مطلوب'
  else if (!/^[+\d\s-]{7,}$/.test(form.phone)) errors.phone = lang === 'fr' ? 'Numéro invalide' : 'رقم غير صالح'
  if (!form.city) errors.city = lang === 'fr' ? 'Ville requise' : 'المدينة مطلوبة'
  if (!form.address.trim()) errors.address = lang === 'fr' ? 'Adresse requise' : 'العنوان مطلوب'

  const isValid = Object.keys(errors).length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ customerName: true, phone: true, city: true, address: true })
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      clearCart()
      router.push(`/order-success?order=${data.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <svg className="mx-auto mb-6 text-[var(--text-muted)]" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="8" cy="21" r="1" /><circle cx="21" cy="21" r="1" />
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
        </svg>
        <h1 className="font-display text-2xl mb-4">{t.cart.empty}</h1>
        <Link href="/shop" className="text-[var(--gold)] hover:underline">{t.product.backToShop}</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl mb-8 text-gradient">Commander · طلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6" noValidate>
          {error && (
            <div className="px-4 py-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-sm text-[var(--error)] flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
            <h2 className="font-display text-lg">{lang === 'fr' ? 'Informations de livraison' : 'معلومات التوصيل'}</h2>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                {lang === 'fr' ? 'Nom complet' : 'الاسم الكامل'} <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                onBlur={() => setTouched(t => ({ ...t, customerName: true }))}
                className={`w-full bg-[var(--bg-surface)] border rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors ${touched.customerName && errors.customerName ? 'border-[var(--error)]' : 'border-[var(--border)]'}`}
                placeholder={lang === 'fr' ? 'Votre nom' : 'اسمك'}
              />
              {touched.customerName && errors.customerName && <p className="text-xs text-[var(--error)] mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                {lang === 'fr' ? 'Numéro de téléphone' : 'رقم الهاتف'} <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                className={`w-full bg-[var(--bg-surface)] border rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors ${touched.phone && errors.phone ? 'border-[var(--error)]' : 'border-[var(--border)]'}`}
                placeholder="+212 6XX XXX XXX"
              />
              {touched.phone && errors.phone && <p className="text-xs text-[var(--error)] mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                {lang === 'fr' ? 'Ville' : 'المدينة'} <span className="text-[var(--error)]">*</span>
              </label>
              <select
                required
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                onBlur={() => setTouched(t => ({ ...t, city: true }))}
                className={`w-full bg-[var(--bg-surface)] border rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] transition-colors ${touched.city && errors.city ? 'border-[var(--error)]' : 'border-[var(--border)]'}`}
              >
                <option value="">{lang === 'fr' ? 'Sélectionnez votre ville' : 'اختر مدينتك'}</option>
                {MOROCCAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {touched.city && errors.city && <p className="text-xs text-[var(--error)] mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                {lang === 'fr' ? 'Adresse complète' : 'العنوان الكامل'} <span className="text-[var(--error)]">*</span>
              </label>
              <textarea
                required
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                onBlur={() => setTouched(t => ({ ...t, address: true }))}
                rows={3}
                className={`w-full bg-[var(--bg-surface)] border rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors resize-none ${touched.address && errors.address ? 'border-[var(--error)]' : 'border-[var(--border)]'}`}
                placeholder={lang === 'fr' ? 'Numéro, rue, quartier, etc.' : 'رقم، شارع، حي، إلخ'}
              />
              {touched.address && errors.address && <p className="text-xs text-[var(--error)] mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                {lang === 'fr' ? 'Notes (optionnel)' : 'ملاحظات (اختياري)'}
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
                placeholder={lang === 'fr' ? 'Instructions particulières...' : 'تعليمات خاصة...'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {lang === 'fr' ? 'Traitement en cours...' : 'جاري المعالجة...'}
              </span>
            ) : (
              `${lang === 'fr' ? 'Confirmer la commande' : 'تأكيد الطلب'} — ${formatPrice(grandTotal)}`
            )}
          </button>

          <p className="text-xs text-center text-[var(--text-muted)]">
            <svg className="inline-block -mt-0.5 mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {t.product.description === 'Description' ? 'Paiement à la livraison uniquement · الدفع عند الاستلام فقط' : 'الدفع عند الاستلام فقط'}
          </p>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 sticky top-24 border border-[var(--border)]">
            <h3 className="font-display text-lg mb-4">{lang === 'fr' ? 'Votre commande' : 'طلبك'}</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-primary)]">
                    <Image src={item.product.images[0] || '/images/placeholder.svg'} alt={item.product.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">x{item.quantity}</p>
                    <p className="font-mono text-sm text-[var(--gold)]">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
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
                <p className="text-xs text-[var(--gold-muted)]">
                  {lang === 'fr' ? `Livraison offerte dès ${formatPrice(200)}` : `التوصيل مجاني للطلبات فوق ${formatPrice(200)}`}
                </p>
              )}
              <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                <span className="font-display">{lang === 'fr' ? 'Total' : 'المجموع'}</span>
                <span className="font-mono text-lg text-[var(--gold)]">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
