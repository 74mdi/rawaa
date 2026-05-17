'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/admin/Toast'

interface AdminOrder {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  city: string
  total: number
  status: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    if (!autoRefresh) return
    const iv = setInterval(fetchOrders, 15000)
    return () => clearInterval(iv)
  }, [fetchOrders, autoRefresh])

  const statusColor = (status: string) => ORDER_STATUSES.find(os => os.value === status)?.color || ''
  const statusLabel = (status: string) => ORDER_STATUSES.find(os => os.value === status)?.label || status

  const filteredOrders = orders.filter(o =>
    !search || o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search) || o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const header = 'N°,Client,Téléphone,Ville,Total,Statut,Date\n'
    const rows = filteredOrders.map(o =>
      `${o.orderNumber.slice(0, 8).toUpperCase()},"${o.customerName}","${o.phone}","${o.city}",${o.total},"${statusLabel(o.status)}","${formatDate(o.createdAt)}"`
    ).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV exporté', 'success')
  }

  const pendingCount = orders.filter(o => o.status === 'PENDING').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-gradient">Commandes</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="accent-[var(--gold)] w-4 h-4"
            />
            Auto-refresh
          </label>
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-[var(--gold)] transition-all flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, N° commande..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
        />
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setStatusFilter('')}
          className={cn(
            "px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1",
            !statusFilter ? "bg-[var(--gold)] text-[var(--bg-primary)] font-medium" : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Tous <span className="opacity-60">({orders.length})</span>
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1",
              statusFilter === s.value ? "bg-[var(--gold)] text-[var(--bg-primary)] font-medium" : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {s.label}
            <span className="opacity-60">({orders.filter(o => o.status === s.value).length})</span>
          </button>
        ))}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="px-4 py-3 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-sm text-amber-500 flex-1">{pendingCount} commande{pendingCount > 1 ? 's' : ''} en attente</span>
          <Link href="/admin/orders?status=PENDING" className="text-sm text-amber-500 hover:underline font-medium">
            Voir
          </Link>
        </div>
      )}

      {/* Mobile cards */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--text-muted)]">{search ? 'Aucune commande trouvée' : 'Aucune commande'}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="block bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--gold)]/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-mono text-sm font-medium">{order.orderNumber.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{order.customerName}</p>
                </div>
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusColor(order.status))}>
                  {statusLabel(order.status)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <div className="flex gap-3">
                  <span>{order.phone}</span>
                  <span>{order.city}</span>
                </div>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <p className="font-mono text-sm text-[var(--gold)] mt-2">{formatPrice(order.total)}</p>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-[var(--bg-surface)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]/50">
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">#</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Client</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Téléphone</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Ville</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Statut</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Date</th>
                  <th className="text-right p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]/30 transition-colors">
                    <td className="p-4 font-mono text-xs">{order.orderNumber.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{order.customerName}</p>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-xs">{order.phone}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{order.city}</td>
                    <td className="p-4 font-mono text-[var(--gold)]">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusColor(order.status))}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-muted)] text-xs">
                      <span title={new Date(order.createdAt).toLocaleString('fr-FR')}>
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-[var(--gold)] hover:underline font-medium">
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-16 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  {search ? 'Aucune commande trouvée' : 'Aucune commande'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
