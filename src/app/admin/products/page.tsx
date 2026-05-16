'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { useToast } from '@/components/admin/Toast'
import { cn } from '@/lib/utils'

interface AdminProduct {
  id: string
  name: string
  nameAr: string
  images: string[]
  category: string
  price: number
  stock: number
  active: boolean
  featured: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created'>('created')
  const { toast } = useToast()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (categoryFilter) params.set('category', categoryFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [search, categoryFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    const iv = setInterval(fetchProducts, 30000)
    return () => clearInterval(iv)
  }, [fetchProducts])

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p))
    toast(current ? 'Produit désactivé' : 'Produit activé', 'success')
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
    toast('Produit supprimé', 'error')
  }

  const duplicateProduct = async (product: AdminProduct) => {
    const res = await fetch(`/api/products/${product.id}`)
    const original = await res.json()
    const data = {
      ...original,
      name: `${original.name} (copie)`,
      nameAr: `${original.nameAr} (نسخة)`,
      slug: `${original.slug}-copie-${Date.now()}`,
      featured: false,
    }
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      toast('Produit dupliqué', 'success')
      fetchProducts()
    } catch { toast('Erreur lors de la duplication', 'error') }
  }

  const batchToggle = async () => {
    for (const id of selectedIds) {
      const p = products.find(p => p.id === id)
      if (p) await toggleActive(id, p.active)
    }
    setSelectedIds(new Set())
    toast(`${selectedIds.size} produits mis à jour`, 'success')
  }

  const batchDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.size} produits définitivement ?`)) return
    for (const id of selectedIds) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
    }
    setProducts(prev => prev.filter(p => !selectedIds.has(p.id)))
    setSelectedIds(new Set())
    toast(`${selectedIds.size} produits supprimés`, 'error')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map(p => p.id)))
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'stock') return a.stock - b.stock
    return 0
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl text-gradient">Produits</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau produit
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="">Toutes catégories</option>
          <option value="PERFUME">Parfums</option>
          <option value="JEWELRY">Bijoux</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'name' | 'price' | 'stock' | 'created')}
          className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
        >
          <option value="created">Plus récents</option>
          <option value="name">Nom A-Z</option>
          <option value="price">Prix</option>
          <option value="stock">Stock</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-[var(--gold)]/10 rounded-xl border border-[var(--gold)]/20">
          <span className="text-sm text-[var(--gold)] font-medium">{selectedIds.size} sélectionné(s)</span>
          <button onClick={batchToggle} className="px-3 py-1 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-xs">
            Activer/Désactiver
          </button>
          <button onClick={batchDelete} className="px-3 py-1 rounded-button bg-[var(--error)] text-white text-xs">
            Supprimer
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            Annuler
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-[var(--gold)]"
                    />
                  </th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal">Produit</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal hidden md:table-cell">Catégorie</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal">Prix</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal">Stock</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal hidden lg:table-cell">Featured</th>
                  <th className="text-left p-4 text-[var(--text-muted)] font-normal hidden md:table-cell">Actif</th>
                  <th className="text-right p-4 text-[var(--text-muted)] font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map(product => (
                  <tr key={product.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]/50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="accent-[var(--gold)]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-primary)] flex-shrink-0">
                          {product.images[0] && (
                            <Image src={product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${product.id}`} className="text-sm hover:text-[var(--gold)] transition-colors truncate block">
                            {product.name}
                          </Link>
                          <span className="text-xs text-[var(--text-muted)] font-arabic" dir="rtl">{product.nameAr}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        product.category === 'PERFUME' ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "bg-[var(--rose)]/10 text-[var(--rose)]"
                      )}>
                        {product.category === 'PERFUME' ? 'Parfum' : 'Bijou'}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <span className={cn(
                        "font-mono text-xs px-2 py-0.5 rounded-full",
                        product.stock === 0 ? "bg-[var(--error)]/10 text-[var(--error)]" :
                        product.stock < 5 ? "bg-[var(--gold)]/10 text-[var(--gold)]" :
                        "text-[var(--text-secondary)]"
                      )}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {product.featured && <span className="text-xs text-[var(--gold)]">★</span>}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <button
                        onClick={() => toggleActive(product.id, product.active)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          product.active ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                          product.active ? 'translate-x-5' : 'translate-x-0.5'
                        )} />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/shop/${product.slug || product.id}`}
                          target="_blank"
                          className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)]"
                          title="Voir sur le site"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)]"
                          title="Modifier"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </Link>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)]"
                          title="Dupliquer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--error)]"
                          title="Supprimer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedProducts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-[var(--text-muted)] mb-4">Aucun produit trouvé</p>
              <Link href="/admin/products/new" className="text-sm text-[var(--gold)] hover:underline">Créer un produit</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
