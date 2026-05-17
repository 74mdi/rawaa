'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatPrice, cn, calcDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useLang } from '@/lib/LanguageContext'
import { SITE_CONFIG } from '@/lib/constants'
import { ProductCard } from '@/components/shop/ProductCard'
import type { Product } from '@/types'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'fr' | 'ar'>('fr')
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const { t } = useLang()

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data)
        setSelectedImage(0)
        setQuantity(1)
        setAddedToCart(false)
        if (data?.category) {
          fetch(`/api/products?category=${data.category}&limit=4&active=true`)
            .then(r => r.json())
            .then(rel => {
              const filtered = (rel.products || []).filter(
                (p: Product) => p.id !== data.id
              )
              setRelated(filtered.slice(0, 4))
            })
            .catch(() => {})
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-[var(--bg-surface)] rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-[var(--bg-surface)] rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-[var(--bg-surface)] rounded w-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl mb-4">{t.product.notFound}</h1>
        <Link href="/shop" className="text-[var(--gold)] hover:underline">{t.product.backToShop}</Link>
      </div>
    )
  }

  const discount = product.originalPrice ? calcDiscount(product.price, product.originalPrice) : 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    window.dispatchEvent(new Event('open-cart-drawer'))
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] mb-6 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.product.backToShop}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[var(--bg-secondary)] group cursor-zoom-in">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.svg'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {discount > 0 && (
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-[var(--success)] text-white shadow-lg">
                  -{discount}%
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200",
                      selectedImage === i
                        ? "border-[var(--gold)] ring-1 ring-[var(--gold)]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <span className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium",
              product.category === 'PERFUME'
                ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                : "bg-[var(--rose)]/20 text-[var(--rose)]"
            )}>
              {product.category === 'PERFUME' ? 'Parfum' : 'Bijou'}
            </span>

            <div>
              <h1 className="font-display text-3xl md:text-4xl text-[var(--text-primary)]">
                {product.name}
              </h1>
              <p className="font-arabic text-lg text-[var(--text-secondary)] mt-1" dir="rtl">
                {product.nameAr}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl text-[var(--gold)] font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="font-mono text-lg text-[var(--text-muted)] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm font-medium text-[var(--success)]">-{discount}%</span>
                </>
              )}
            </div>

            <div className={cn(
              "inline-flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-full",
              product.stock > 0
                ? "bg-[var(--success)]/10 text-[var(--success)]"
                : "bg-[var(--error)]/10 text-[var(--error)]"
            )}>
              <span className={cn("w-2 h-2 rounded-full", product.stock > 0 ? "bg-[var(--success)]" : "bg-[var(--error)]")} />
              {product.stock > 0
                ? `${t.product.inStock} (${product.stock} ${t.product.remaining})`
                : t.product.outOfStock}
            </div>

            <div className="border-b border-[var(--border)]">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('fr')}
                  className={cn(
                    "pb-2 text-sm border-b-2 transition-colors",
                    activeTab === 'fr' ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-[var(--text-muted)]"
                  )}
                >
                  {t.product.description}
                </button>
                <button
                  onClick={() => setActiveTab('ar')}
                  className={cn(
                    "pb-2 text-sm border-b-2 transition-colors",
                    activeTab === 'ar' ? "border-[var(--gold)] text-[var(--gold)]" : "border-transparent text-[var(--text-muted)]"
                  )}
                >
                  {t.product.description === 'Description' ? 'الوصف' : 'Description'}
                </button>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {activeTab === 'fr' ? product.description : product.descriptionAr}
            </p>

            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--text-secondary)]">{t.product.quantity}</span>
              <div className="flex items-center gap-3 bg-[var(--bg-surface)] rounded-full border border-[var(--border)] px-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  −
                </button>
                <span className="font-mono w-8 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  "flex-1 py-3.5 rounded-button font-medium text-sm transition-all duration-200",
                  product.stock === 0
                    ? "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed"
                    : addedToCart
                      ? "bg-[var(--success)] text-white scale-95"
                      : "bg-[var(--gold)] text-[var(--bg-primary)] hover:opacity-90 active:scale-95"
                )}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Ajouté ✓
                  </span>
                ) : t.product.addToCart}
              </button>
              <Link
                href={product.stock > 0 ? `/checkout?add=${product.id}` : '#'}
                className={cn(
                  "flex-1 py-3.5 rounded-button font-medium text-sm text-center transition-all duration-200",
                  product.stock === 0
                    ? "border border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed pointer-events-none"
                    : "border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--bg-primary)] active:scale-95"
                )}
              >
                {t.product.orderNow}
              </Link>
            </div>

            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
                `Bonjour! Je suis intéressé(e) par "${product.name}" — ${product.nameAr}\n\nPrix: ${formatPrice(product.price)}\nLien: ${typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_SITE_URL}/shop/${product.slug}`}\n\nPouvez-vous me donner plus d'informations?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-button border border-[#25D366] text-[#25D366] text-sm font-medium hover:bg-[#25D366] hover:text-white transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t.product.whatsappOrder}
            </a>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/shop?search=${tag}`}
                    className="px-3 py-1 rounded-full bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20 animate-slide-up">
          <div className="border-t border-[var(--border)] pt-12 mb-8">
            <h2 className="font-display text-2xl text-gradient">
              Vous aimerez aussi
            </h2>
            <p className="font-arabic text-sm text-[var(--text-muted)] mt-1" dir="rtl">
              قد يعجبك أيضاً
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p, i) => (
              <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
