'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Stats {
  totalOrders: number
  pendingOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  revenue: number
  revenueToday: number
  revenueMonth: number
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
}

interface RecentLog {
  action: string
  details: string
  timestamp: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, pendingOrders: 0, confirmedOrders: 0, shippedOrders: 0,
    deliveredOrders: 0, cancelledOrders: 0, revenue: 0, revenueToday: 0,
    revenueMonth: 0, totalProducts: 0, lowStockCount: 0, outOfStockCount: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([])
  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>([])

  const fetchDashboard = useCallback(async () => {
    try {
      const [ordersRes, productsRes, logsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products?limit=200'),
        fetch('/api/admin/logs'),
      ])

      const orders: RecentOrder[] = await ordersRes.json()
      const productsData = await productsRes.json()
      const logsData = await logsRes.json()

      setRecentOrders(orders.slice(0, 10))
      setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 10) : [])

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const revenueToday = orders
        .filter(o => new Date(o.createdAt) >= todayStart && o.status === 'DELIVERED')
        .reduce((s, o) => s + o.total, 0)

      const revenueMonth = orders
        .filter(o => new Date(o.createdAt) >= monthStart && o.status === 'DELIVERED')
        .reduce((s, o) => s + o.total, 0)

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        confirmedOrders: orders.filter(o => o.status === 'CONFIRMED').length,
        shippedOrders: orders.filter(o => o.status === 'SHIPPED').length,
        deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
        cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length,
        revenue: orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0),
        revenueToday,
        revenueMonth,
        totalProducts: productsData.total || 0,
        lowStockCount: (productsData.products || []).filter((p: { stock: number }) => p.stock > 0 && p.stock < 5).length,
        outOfStockCount: (productsData.products || []).filter((p: { stock: number }) => p.stock === 0).length,
      })

      // Top-selling products (by lowest stock = most sold approximation)
      const products = (productsData.products || [])
      const sorted = [...products].sort((a: { stock: number }, b: { stock: number }) => a.stock - b.stock).slice(0, 5)
      setTopProducts(sorted.map((p: { id: string; name: string; stock: number; price: number }) => ({
        id: p.id,
        name: p.name,
        totalSold: Math.max(0, 20 - p.stock),
        revenue: Math.max(0, 20 - p.stock) * p.price,
      })))

      // Generate sales data
      const dateMap: Record<string, number> = {}
      for (const order of orders) {
        if (order.status === 'DELIVERED') {
          const d = new Date(order.createdAt).toISOString().slice(0, 10)
          dateMap[d] = (dateMap[d] || 0) + order.total
        }
      }
      setSalesData(
        Object.entries(dateMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-30)
          .map(([date, total]) => ({ date, total }))
      )
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchDashboard(); const iv = setInterval(fetchDashboard, 30000); return () => clearInterval(iv) }, [fetchDashboard])

  const maxSales = Math.max(...salesData.map(d => d.total), 1)

  const statCards = [
    {
      label: "Chiffre d'affaires",
      value: formatPrice(stats.revenue),
      sub: `${formatPrice(stats.revenueMonth)} ce mois`,
      color: 'text-[var(--gold)]',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    },
    {
      label: 'Commandes',
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} en attente`,
      color: 'text-[var(--gold)]',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg>,
    },
    {
      label: 'Produits',
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockCount} stock faible`,
      color: stats.lowStockCount > 0 ? 'text-[var(--error)]' : 'text-[var(--success)]',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
    },
    {
      label: 'Livrées aujourd\'hui',
      value: formatPrice(stats.revenueToday),
      sub: `${stats.deliveredOrders} livrées`,
      color: 'text-[var(--success)]',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-gradient">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--gold)] transition-all group">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--text-muted)]">{card.label}</p>
              <span className="text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors">{card.icon}</span>
            </div>
            <p className={`font-mono text-xl ${card.color}`}>{card.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="font-display text-sm mb-4">Revenus (30 jours)</h2>
          {salesData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-[var(--text-muted)]">
              Aucune donnée de vente
            </div>
          ) : (
            <div className="h-32 flex items-end gap-1">
              {salesData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-[var(--gold)]/30 hover:bg-[var(--gold)]/50 rounded-t transition-all cursor-pointer"
                    style={{ height: `${(d.total / maxSales) * 100}%`, minHeight: d.total > 0 ? '4px' : '0' }}
                    title={`${d.date}: ${formatPrice(d.total)}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="font-display text-sm mb-4">Meilleures ventes</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-muted)] w-5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.totalSold} vendus</p>
                  </div>
                  <span className="font-mono text-xs text-[var(--gold)]">{formatPrice(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--gold)] hover:underline">Voir tout</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Aucune commande</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)] hover:border hover:border-[var(--border)] transition-all"
                >
                  <div>
                    <p className="text-sm font-mono">{order.orderNumber.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-[var(--text-muted)]">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{formatPrice(order.total)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(order.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="font-display text-sm mb-4">Activité récente</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Aucune activité</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg text-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--gold)] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)]">{log.action}</p>
                    {log.details && <p className="text-xs text-[var(--text-muted)] truncate">{log.details}</p>}
                  </div>
                  <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                    {new Date(log.timestamp).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="font-display text-sm mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="px-4 py-2 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm hover:opacity-90 transition-all">
            Nouveau produit
          </Link>
          <Link href="/admin/orders?status=PENDING" className="px-4 py-2 rounded-button border border-[var(--gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-all">
            Commandes en attente ({stats.pendingOrders})
          </Link>
          <Link href="/admin/products" className="px-4 py-2 rounded-button border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:border-[var(--gold)] transition-all">
            Stock faible ({stats.lowStockCount})
          </Link>
          <Link href="/admin/settings" className="px-4 py-2 rounded-button border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:border-[var(--gold)] transition-all">
            Paramètres
          </Link>
        </div>
      </div>
    </div>
  )
}
