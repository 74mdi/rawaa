'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/utils'
import { ImageUploader } from './ImageUploader'
import type { Product } from '@/types'

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: product?.name || '',
    nameAr: product?.nameAr || '',
    slug: product?.slug || '',
    category: product?.category || 'PERFUME',
    subcategory: product?.subcategory || '',
    description: product?.description || '',
    descriptionAr: product?.descriptionAr || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    stock: product?.stock?.toString() || '0',
    featured: product?.featured || false,
    active: product?.active ?? true,
    tags: product?.tags?.join(', ') || '',
  })
  const [images, setImages] = useState<string[]>(product?.images || [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'name' && !isEdit) {
        updated.slug = generateSlug(value)
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = {
      name: form.name,
      nameAr: form.nameAr,
      slug: form.slug,
      category: form.category,
      subcategory: form.subcategory || null,
      description: form.description || null,
      descriptionAr: form.descriptionAr || null,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      active: form.active,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images,
    }

    try {
      const res = await fetch(
        isEdit ? `/api/products/${product.id}` : '/api/products',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      )

      if (!res.ok) throw new Error('Failed to save')

      router.push('/admin/products')
      router.refresh()
    } catch {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
        <h2 className="font-display text-lg">Informations</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Name (FR)</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Name (AR)</label>
            <input
              type="text"
              name="nameAr"
              required
              value={form.nameAr}
              onChange={handleChange}
              dir="rtl"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] rtl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            required
            value={form.slug}
            onChange={handleChange}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Catégorie</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]"
            >
              <option value="PERFUME">Parfum</option>
              <option value="JEWELRY">Bijou</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Sous-catégorie</label>
            <input
              type="text"
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              placeholder="Eau de Parfum, Bracelet..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
        <h2 className="font-display text-lg">Prix & Stock</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Prix (DH)</label>
            <input
              type="number"
              name="price"
              required
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Prix original (DH)</label>
            <input
              type="number"
              name="originalPrice"
              step="0.01"
              value={form.originalPrice}
              onChange={handleChange}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            required
            value={form.stock}
            onChange={handleChange}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
        <h2 className="font-display text-lg">Description</h2>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Description (FR)</label>
          <textarea
            name="description"
            value={form.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Description (AR)</label>
          <textarea
            name="descriptionAr"
            value={form.descriptionAr || ''}
            onChange={handleChange}
            rows={4}
            dir="rtl"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] resize-none rtl"
          />
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
        <h2 className="font-display text-lg">Images</h2>
        <ImageUploader images={images} onImagesChange={setImages} />
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
        <h2 className="font-display text-lg">Tags</h2>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Tags (séparés par des virgules)</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="rose, floral, musc"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
              className="accent-[var(--gold)]"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="accent-[var(--gold)]"
            />
            Actif
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-button border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
