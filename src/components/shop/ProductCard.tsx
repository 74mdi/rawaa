'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn, formatPrice, calcDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useLang } from '@/lib/LanguageContext'
import type { Product } from '@/types'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const { t } = useLang()
  const discount = product.originalPrice ? calcDiscount(product.price, product.originalPrice) : 0

  return (
    <div className="group relative bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--gold)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--gold)]/5">
      <Link href={`/shop/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-primary)]">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-[var(--text-primary)] font-medium text-sm bg-[var(--bg-surface)] px-3 py-1 rounded-button">
                {t.product.outOfStock}
              </span>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success)] text-white">
              -{discount}%
            </span>
          )}
          <span className={cn(
            "absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium",
            product.category === 'PERFUME'
              ? "bg-[var(--gold)]/20 text-[var(--gold)]"
              : "bg-[var(--rose)]/20 text-[var(--rose)]"
          )}>
            {product.category === 'PERFUME' ? 'Parfum' : 'Bijou'}
          </span>
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-sm truncate hover:text-[var(--gold)] transition-colors">{product.name}</h3>
          <p className="font-arabic text-xs text-[var(--text-muted)] truncate" dir="rtl">{product.nameAr}</p>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-sm text-[var(--gold)]">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="font-mono text-xs text-[var(--text-muted)] line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        <button
          onClick={() => {
            addItem(product)
            window.dispatchEvent(new Event('open-cart-drawer'))
          }}
          disabled={product.stock === 0}
          className={cn(
            "mt-3 w-full py-2 rounded-button text-sm font-medium transition-all duration-300",
            product.stock === 0
              ? "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed"
              : "bg-[var(--gold)] text-[var(--bg-primary)] hover:opacity-90 opacity-0 group-hover:opacity-100"
          )}
        >
          {product.stock === 0 ? t.product.outOfStock : t.product.addToCart}
        </button>
      </div>
    </div>
  )
}
