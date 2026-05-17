'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/shop/ProductCard'
import { useLang } from '@/lib/LanguageContext'
import type { Product } from '@/types'

const CATEGORIES = [
  { value: '', labelFr: 'Tous', labelAr: 'الكل' },
  { value: 'PERFUME', labelFr: 'Parfums', labelAr: 'عطور' },
  { value: 'JEWELRY', labelFr: 'Bijoux', labelAr: 'مجوهرات' },
]

const SORTS = [
  { value: '', labelFr: 'Nouveautés', labelAr: 'الأحدث' },
  { value: 'price_asc', labelFr: 'Prix ↑', labelAr: 'السعر ↑' },
  { value: 'price_desc', labelFr: 'Prix ↓', labelAr: 'السعر ↓' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('')
  const [inStock, setInStock] = useState(false)
  const { lang } = useLang()
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    setPage(1)
  }, [category, sort, inStock, search])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    if (inStock) params.set('active', 'true')
    if (search) params.set('search', search)
    params.set('page', page.toString())
    params.set('limit', '12')

    fetch(`/api/products?${params}`)
      .then(res => res.json())
      .then(data => {
        setProducts(prev => page === 1 ? data.products : [...prev, ...data.products])
        setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, sort, inStock, page, search])

  const pageTitle = search
    ? `Résultats pour "${search}"`
    : category === 'PERFUME'
      ? 'Parfums'
      : category === 'JEWELRY'
        ? 'Bijoux'
        : 'Tous les produits'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-display text-sm text-[var(--text-primary)] mb-3">
                {lang === 'fr' ? 'Catégorie' : 'الفئة'}
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <a
                    key={cat.value}
                    href={cat.value ? `/shop?category=${cat.value}` : '/shop'}
                    className={`block text-sm px-3 py-2 rounded-button transition-colors ${
                      category === cat.value
                        ? 'bg-[var(--gold)]/10 text-[var(--gold)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {lang === 'fr' ? cat.labelFr : cat.labelAr}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-sm text-[var(--text-primary)] mb-3">
                {lang === 'fr' ? 'Trier par' : 'ترتيب حسب'}
              </h3>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1) }}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
              >
                {SORTS.map(s => (
                  <option key={s.value} value={s.value}>
                    {lang === 'fr' ? s.labelFr : s.labelAr}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={e => { setInStock(e.target.checked); setPage(1) }}
                className="accent-[var(--gold)]"
              />
              {lang === 'fr' ? 'En stock seulement' : 'متوفر فقط'}
            </label>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl text-gradient">{pageTitle}</h1>
            <span className="text-sm text-[var(--text-muted)] font-mono">{total} produits</span>
          </div>

          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-[var(--bg-surface)]" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-[var(--bg-surface)] rounded w-3/4" />
                    <div className="h-4 bg-[var(--bg-surface)] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--text-muted)]">
                {lang === 'fr' ? 'Aucun produit trouvé' : 'لا توجد منتجات'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, i) => (
                  <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${(i % 12) * 0.05}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {products.length < total && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-8 py-3 rounded-button border border-[var(--gold)] text-[var(--gold)] text-sm hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] transition-all hover:scale-105 active:scale-95"
                  >
                    {lang === 'fr' ? 'Charger plus' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  )
}
