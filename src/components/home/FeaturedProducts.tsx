'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/shop/ProductCard'
import { useLang } from '@/lib/LanguageContext'
import type { Product } from '@/types'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const { t } = useLang()

  useEffect(() => {
    fetch('/api/products?featured=true&limit=4')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {})
  }, [])

  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-gradient">
            {t.home.featured}
          </h2>
          <p className="font-arabic text-[var(--text-muted)] mt-1" dir="rtl">
            اختيارات مميزة
          </p>
        </div>
        <Link
          href="/shop"
          className="text-sm text-[var(--gold)] hover:underline flex items-center gap-1"
        >
          {t.home.viewAll}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
