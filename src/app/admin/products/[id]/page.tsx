'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Product } from '@/types'

export default function EditProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="animate-pulse h-96 bg-[var(--bg-surface)] rounded-xl" />

  if (!product) return <div>Produit non trouvé</div>

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Modifier le produit</h1>
      <ProductForm product={product} />
    </div>
  )
}
