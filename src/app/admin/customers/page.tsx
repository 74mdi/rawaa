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
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-gradient">Clients</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{uniqueCustomers} clients · {formatPrice(totalRevenue)} total</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Total clients</p>
          <p className="font-mono text-xl text-[var(--gold)]">{uniqueCustomers}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Revenu total</p>
          <p className="font-mono text-xl text-[var(--gold)]">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Panier moyen</p>
          <p className="font-mono text-xl text-[var(--gold)]">
            {uniqueCustomers > 0 ? formatPrice(Math.round(totalRevenue / uniqueCustomers)) : '0 DH'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ville..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="totalSpent">Plus dépensé</option>
          <option value="orderCount">Plus de commandes</option>
          <option value="lastOrder">Dernière commande</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal">Client</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal hidden md:table-cell">Téléphone</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal hidden md:table-cell">Ville</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal">Commandes</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal">Total dépensé</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal hidden lg:table-cell">Dernière commande</th>
                  <th className="text-right p-4 text-[var(--text-muted)] font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((customer, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-[var(--text-muted)] md:hidden">{customer.phone} · {customer.city}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-[var(--text-secondary)] font-mono text-xs">{customer.phone}</td>
                    <td className="p-4 hidden md:table-cell text-[var(--text-secondary)]">{customer.city}</td>
                    <td className="p-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface)]">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[var(--gold)]">{formatPrice(customer.totalSpent)}</td>
                    <td className="p-4 hidden lg:table-cell text-[var(--text-muted)] text-xs">{formatDate(customer.lastOrder)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${customer.orders[0]?.id}`}
                        className="text-xs text-[var(--gold)] hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">Aucun client trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
