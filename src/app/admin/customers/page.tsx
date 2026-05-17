'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/admin/Toast'

interface Customer {
  id: string
  name: string
  phone: string
  city: string
  address: string
  orderCount: number
  totalSpent: number
  lastOrder: string
  orders: { id: string; orderNumber: string; total: number; status: string; createdAt: string }[]
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'totalSpent' | 'orderCount' | 'lastOrder'>('totalSpent')
  const { toast } = useToast()

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      const orders = await res.json()

      const map = new Map<string, Customer>()
      for (const order of orders) {
        const key = order.phone || order.customerName
        const existing = map.get(key)
        if (existing) {
          existing.orderCount++
          existing.totalSpent += order.total
          existing.orders.push(order)
          if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
            existing.lastOrder = order.createdAt
          }
        } else {
          map.set(key, {
            id: order.id,
            name: order.customerName,
            phone: order.phone,
            city: order.city,
            address: order.address,
            orderCount: 1,
            totalSpent: order.total,
            lastOrder: order.createdAt,
            orders: [order],
          })
        }
      }

      setCustomers(Array.from(map.values()))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) || c.city.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent
    if (sortBy === 'orderCount') return b.orderCount - a.orderCount
    return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
  })

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const uniqueCustomers = customers.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-gradient">Clients</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{uniqueCustomers} client{uniqueCustomers !== 1 ? 's' : ''} · {formatPrice(totalRevenue)} total</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Total clients</p>
          <p className="font-mono text-lg text-[var(--gold)]">{uniqueCustomers}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Revenu total</p>
          <p className="font-mono text-lg text-[var(--gold)]">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Panier moyen</p>
          <p className="font-mono text-lg text-[var(--gold)]">
            {uniqueCustomers > 0 ? formatPrice(Math.round(totalRevenue / uniqueCustomers)) : '0 DH'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="totalSpent">Plus dépensé</option>
          <option value="orderCount">Plus de commandes</option>
          <option value="lastOrder">Dernière commande</option>
        </select>
      </div>

      {/* Mobile cards */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          ))
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--text-muted)]">Aucun client trouvé</p>
          </div>
        ) : (
          sorted.map((customer, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{customer.name}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{customer.phone}</p>
                  <p className="text-xs text-[var(--text-muted)]">{customer.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-[var(--gold)]">{formatPrice(customer.totalSpent)}</p>
                  <span className="text-xs text-[var(--text-muted)]">{customer.orderCount} cmd{customer.orderCount > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)]">Dernière: {formatDate(customer.lastOrder)}</span>
                <Link href={`/admin/orders/${customer.orders[0]?.id}`} className="text-xs text-[var(--gold)] hover:underline font-medium">
                  Voir
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-[var(--bg-surface)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]/50">
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Client</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Téléphone</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Ville</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Commandes</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Total dépensé</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Dernière commande</th>
                  <th className="text-right p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((customer, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]/30 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium">{customer.name}</p>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-xs">{customer.phone}</td>
                    <td className="p-4 text-[var(--text-secondary)]">{customer.city}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs px-2 py-1 rounded-full bg-[var(--bg-surface)]">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[var(--gold)]">{formatPrice(customer.totalSpent)}</td>
                    <td className="p-4 text-[var(--text-muted)] text-xs">{formatDate(customer.lastOrder)}</td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/orders/${customer.orders[0]?.id}`} className="text-xs text-[var(--gold)] hover:underline font-medium">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sorted.length === 0 && (
              <div className="p-16 text-center">
                <p className="text-sm text-[var(--text-muted)]">Aucun client trouvé</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
