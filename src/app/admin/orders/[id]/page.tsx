'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES, SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/admin/Toast'
import type { Order } from '@/types'

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
const CANCEL = 'CANCELLED'

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(o => { setOrder(o); setNotes(o.notes || '') })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      setOrder(prev => prev ? { ...prev, status: status as Order['status'] } : null)
      toast(`Commande ${order?.orderNumber?.slice(0, 8).toUpperCase()} → ${ORDER_STATUSES.find(s => s.value === status)?.label}`, 'success')
    } catch {
      toast('Erreur lors de la mise à jour', 'error')
    }
    setUpdating(false)
  }

  const saveNotes = async () => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    toast('Notes sauvegardées', 'success')
  }

  const printOrder = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) return
    const itemsHtml = order?.items.map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd">${item.product.name}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center">x${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${formatPrice(item.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('')

    printWin.document.write(`
      <html><head><title>Commande #${order?.orderNumber?.slice(0, 8).toUpperCase()}</title>
      <style>body{font-family:monospace;padding:40px;max-width:600px;margin:auto}
      h1{font-size:20px;margin-bottom:4px}
      .meta{color:#666;font-size:12px;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th{text-align:left;padding:8px;border-bottom:2px solid #000;font-size:12px}
      .total{font-size:18px;text-align:right;margin-top:20px}
      .footer{margin-top:40px;font-size:11px;color:#999;text-align:center}
</style></head><body>
<h1>Rawaa روعة</h1>
<p class="meta">Commande #${order?.orderNumber?.slice(0, 8).toUpperCase()}<br>
${order ? formatDate(order.createdAt) : ''}</p>
<p><strong>Client:</strong> ${order?.customerName}<br>
<strong>Tél:</strong> ${order?.phone}<br>
<strong>Adresse:</strong> ${order?.city}, ${order?.address}</p>
<table><tr><th>Article</th><th>Qté</th><th>Prix</th><th>Total</th></tr>
${itemsHtml}</table>
<p class="total">Total: <strong>${order ? formatPrice(order.total) : ''}</strong></p>
<p class="footer">Rawaa روعة · ${SITE_CONFIG.whatsapp}</p>
<script>window.print()</script></body></html>`)
    printWin.document.close()
  }

  if (loading) return <div className="animate-pulse h-96 bg-[var(--bg-surface)] rounded-xl" />
  if (!order) return <div className="text-center py-20 text-[var(--text-muted)]">Commande non trouvée</div>

  const statusColor = (s: string) => ORDER_STATUSES.find(os => os.value === s)?.color || ''
  const currentIndex = STATUS_FLOW.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Retour
        </button>
        <button onClick={printOrder} className="text-sm text-[var(--text-secondary)] hover:text-[var(--gold)] flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
          Imprimer
        </button>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl">Commande #{order.orderNumber.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <span className={cn("text-sm font-mono px-3 py-1 rounded-full bg-[var(--bg-surface)]", statusColor(order.status))}>
          {ORDER_STATUSES.find(s => s.value === order.status)?.label}
        </span>
      </div>

      {/* Status Timeline */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)] mb-8">
        <h2 className="font-display text-sm mb-4">Suivi de commande</h2>
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => updateStatus(s)}
                disabled={updating || (i <= currentIndex && !isCancelled) || (i > currentIndex + 1)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-medium",
                  i === currentIndex && !isCancelled
                    ? `${statusColor(s)} bg-[var(--bg-surface)] border border-current`
                    : i < currentIndex
                      ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30"
                      : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--gold)] disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {i < currentIndex && !isCancelled ? '✓ ' : ''}{ORDER_STATUSES.find(os => os.value === s)?.label}
              </button>
              {i < STATUS_FLOW.length - 1 && (
                <div className={cn(
                  "w-6 h-px",
                  i < currentIndex && !isCancelled ? "bg-[var(--success)]" : "bg-[var(--border)]"
                )} />
              )}
            </div>
          ))}
          <button
            onClick={() => updateStatus(CANCEL)}
            disabled={updating || isCancelled}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-medium",
              isCancelled
                ? "bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30"
                : "bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--error)] hover:text-[var(--error)] disabled:opacity-40"
            )}
          >
            {isCancelled ? '✓ Annulée' : 'Annuler'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Cliquez sur un statut pour avancer la commande. Les commandes annulées ne peuvent pas être reprises.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="font-display text-sm mb-4">Client</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-[var(--text-muted)]">Nom:</span> {order.customerName}</p>
            <p><span className="text-[var(--text-muted)]">Téléphone:</span> {order.phone}</p>
            <p><span className="text-[var(--text-muted)]">Ville:</span> {order.city}</p>
            <p><span className="text-[var(--text-muted)]">Adresse:</span> {order.address}</p>
          </div>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
              `Bonjour ${order.customerName}! Votre commande #${order.orderNumber.slice(0, 8).toUpperCase()} chez Rawaa روعة est ${ORDER_STATUSES.find(s => s.value === order.status)?.label.toLowerCase()}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-[#25D366] hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="font-display text-sm mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Ajouter une note interne..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] resize-none"
          />
          <button
            onClick={saveNotes}
            className="mt-2 px-4 py-1.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-xs hover:opacity-90"
          >
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="font-display text-sm mb-4">Articles</h2>
        <div className="divide-y divide-[var(--border)]">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-primary)] flex-shrink-0">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/admin/products/${item.product.id}`} className="text-sm hover:text-[var(--gold)] transition-colors">
                  {item.product.name}
                </Link>
                <p className="text-xs text-[var(--text-muted)]">{formatPrice(item.price)} x {item.quantity}</p>
              </div>
              <p className="font-mono text-sm">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between items-center">
          <div>
            <span className="font-display">Total</span>
            <p className="text-xs text-[var(--text-muted)]">Paiement à la livraison</p>
          </div>
          <span className="font-mono text-xl text-[var(--gold)]">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
