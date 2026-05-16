'use client'

import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Nouveau produit</h1>
      <ProductForm />
    </div>
  )
}
