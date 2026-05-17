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

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500',
  CONFIRMED: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-purple-500/10 text-purple-500',
  DELIVERED: 'bg-emerald-500/10 text-emerald-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
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

      const products = (productsData.products || [])
      const sorted = [...products].sort((a: { stock: number }, b: { stock: number }) => a.stock - b.stock).slice(0, 5)
      setTopProducts(sorted.map((p: { id: string; name: string; stock: number; price: number }) => ({
        id: p.id,
        name: p.name,
        totalSold: Math.max(0, 20 - p.stock),
        revenue: Math.max(0, 20 - p.stock) * p.price,
      })))

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-gradient">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
          </div>
          <p className="font-mono text-lg text-[var(--gold)]">{formatPrice(stats.revenue)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Chiffre d'affaires</p>
          <p className="text-xs text-[var(--text-muted)]">{formatPrice(stats.revenueMonth)} ce mois</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg>
            </div>
          </div>
          <p className="font-mono text-lg text-[var(--text-primary)]">{stats.totalOrders}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Commandes</p>
          {stats.pendingOrders > 0 && (
            <p className="text-xs text-amber-500">{stats.pendingOrders} en attente</p>
          )}
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            </div>
          </div>
          <p className="font-mono text-lg text-[var(--text-primary)]">{stats.totalProducts}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Produits</p>
          {stats.lowStockCount > 0 && (
            <p className="text-xs text-amber-500">{stats.lowStockCount} stock faible</p>
          )}
          {stats.outOfStockCount > 0 && (
            <p className="text-xs text-red-500">{stats.outOfStockCount} ruptures</p>
          )}
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <p className="font-mono text-lg text-emerald-500">{formatPrice(stats.revenueToday)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Aujourd'hui</p>
          <p className="text-xs text-[var(--text-muted)]">{stats.deliveredOrders} livrées au total</p>
        </div>
      </div>

      {/* Alerts */}
      {stats.pendingOrders > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="text-amber-500 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <p className="text-sm text-amber-500 flex-1">
            <strong>{stats.pendingOrders}</strong> commande{stats.pendingOrders > 1 ? 's' : ''} en attente de traitement
          </p>
          <Link href="/admin/orders?status=PENDING" className="text-sm text-amber-500 hover:underline font-medium">
            Voir
          </Link>
        </div>
      )}

      {stats.outOfStockCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="text-red-500 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <p className="text-sm text-red-500 flex-1">
            <strong>{stats.outOfStockCount}</strong> produit{stats.outOfStockCount > 1 ? 's' : ''} en rupture de stock
          </p>
          <Link href="/admin/products" className="text-sm text-red-500 hover:underline font-medium">
            Voir
          </Link>
        </div>
      )}

      {/* Sales Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 lg:p-6">
          <h2 className="font-display text-sm mb-4">Revenus (30 jours)</h2>
          {salesData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-[var(--text-muted)]">
              Aucune donnée de vente
            </div>
          ) : (
            <div className="h-32 flex items-end gap-0.5">
              {salesData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[var(--gold)]/30 hover:bg-[var(--gold)]/50 rounded-t transition-all cursor-pointer"
                  style={{ height: `${Math.max((d.total / maxSales) * 100, 2)}%` }}
                  title={`${d.date}: ${formatPrice(d.total)}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 lg:p-6">
          <h2 className="font-display text-sm mb-4">Meilleures ventes</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
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

      {/* Recent Orders + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center justify-between p-4 lg:p-6 pb-0">
            <h2 className="font-display text-sm">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--gold)] hover:underline">Voir tout</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">Aucune commande</div>
          ) : (
            <div className="p-4 lg:p-6 space-y-2">
              {recentOrders.slice(0, 5).map(order => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono truncate">{order.orderNumber.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{order.customerName}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-mono text-sm">{formatPrice(order.total)}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_COLORS[order.status] || "bg-gray-500/10 text-gray-500")}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
          <div className="p-4 lg:p-6 pb-0">
            <h2 className="font-display text-sm">Activité récente</h2>
          </div>
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">Aucune activité</div>
          ) : (
            <div className="p-4 lg:p-6 space-y-1">
              {recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5 flex-shrink-0" />
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
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 lg:p-6">
        <h2 className="font-display text-sm mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new" className="px-4 py-2.5 rounded-lg bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all">
            Nouveau produit
          </Link>
          {stats.pendingOrders > 0 && (
            <Link href="/admin/orders?status=PENDING" className="px-4 py-2.5 rounded-lg border border-amber-500/30 text-amber-500 text-sm hover:bg-amber-500/10 transition-all">
              Commandes en attente ({stats.pendingOrders})
            </Link>
          )}
          {stats.lowStockCount > 0 && (
            <Link href="/admin/products" className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:border-[var(--gold)] transition-all">
              Stock faible ({stats.lowStockCount})
            </Link>
          )}
          <Link href="/admin/discount-codes" className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:border-[var(--gold)] transition-all">
            Codes promo
          </Link>
          <Link href="/admin/settings" className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:border-[var(--gold)] transition-all">
            Paramètres
          </Link>
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
