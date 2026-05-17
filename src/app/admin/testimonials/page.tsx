'use client'

import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/admin/Toast'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: string
  name: string
  text: string
  textAr: string
  rating: number
  active: boolean
}

const DEFAULTS: Testimonial[] = [
  { id: '1', name: 'Fatima Z.', text: 'Parfum magnifique et livraison très rapide. Je recommande!', textAr: 'عطر رائع وتوصيل سريع جداً. أنصح به!', rating: 5, active: true },
  { id: '2', name: 'Youssef M.', text: 'La qualité des bijoux est exceptionnelle. Rapport qualité-prix imbattable.', textAr: 'جودة المجوهرات استثنائية. قيمة ممتازة مقابل السعر.', rating: 5, active: true },
  { id: '3', name: 'Amina K.', text: 'Service client au top! Ils m\'ont aidée à choisir le parfum parfait.', textAr: 'خدمة العملاء ممتازة! ساعدوني في اختيار العطر المثالي.', rating: 5, active: true },
]

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState({ name: '', text: '', textAr: '', rating: 5, active: true })
  const { toast } = useToast()

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/testimonials')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) setTestimonials(data)
    } catch { /* use defaults */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTestimonials() }, [fetchTestimonials])

  const openEdit = (t?: Testimonial) => {
    if (t) {
      setEditing(t)
      setForm({ name: t.name, text: t.text, textAr: t.textAr, rating: t.rating, active: t.active })
    } else {
      setEditing(null)
      setForm({ name: '', text: '', textAr: '', rating: 5, active: true })
    }
  }

  const save = async () => {
    if (!form.name.trim() || !form.text.trim()) {
      toast('Nom et texte requis', 'error')
      return
    }

    try {
      const url = editing ? `/api/testimonials?id=${editing.id}` : '/api/testimonials'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editing?.id }),
      })
      if (!res.ok) throw new Error('Failed')
      toast(editing ? 'Témoignage modifié' : 'Témoignage créé', 'success')
      setEditing(null)
      fetchTestimonials()
    } catch {
      toast('Erreur lors de la sauvegarde', 'error')
    }
  }

  const toggleActive = async (t: Testimonial) => {
    try {
      await fetch(`/api/testimonials?id=${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !t.active }),
      })
      fetchTestimonials()
    } catch { /* silent */ }
  }

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce témoignage ?')) return
    try {
      await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' })
      toast('Témoignage supprimé', 'error')
      fetchTestimonials()
    } catch { /* silent */ }
  }

  if (loading) return <div className="animate-pulse h-96 bg-[var(--bg-surface)] rounded-xl" />

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl text-gradient">Témoignages</h1>
        <button
          onClick={() => openEdit()}
          className="px-4 py-2 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau témoignage
        </button>
      </div>

      {editing !== null && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--gold)] mb-6 space-y-4">
          <h2 className="font-display text-lg">{editing ? 'Modifier' : 'Nouveau'} témoignage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]"
                placeholder="Fatima Z."
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Note</label>
              <select
                value={form.rating}
                onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]"
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoiles</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Texte (FR)</label>
            <textarea
              value={form.text}
              onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              rows={2}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] resize-none"
              placeholder="Parfum magnifique..."
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Texte (AR)</label>
            <textarea
              value={form.textAr}
              onChange={e => setForm(f => ({ ...f, textAr: e.target.value }))}
              rows={2}
              dir="rtl"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] resize-none rtl"
              placeholder="عطر رائع..."
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                className="accent-[var(--gold)]"
              />
              Actif
            </label>
            <div className="flex gap-2">
              <button onClick={save} className="px-4 py-2 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm">
                {editing ? 'Modifier' : 'Créer'}
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-button border border-[var(--border)] text-sm text-[var(--text-secondary)]">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {testimonials.map(t => (
          <div key={t.id} className={cn(
            "bg-[var(--bg-secondary)] rounded-xl p-6 border transition-all",
            t.active ? "border-[var(--border)]" : "border-[var(--border)] opacity-60"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-sm">{t.name}</h3>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    t.active ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--text-muted)]/10 text-[var(--text-muted)]"
                  )}>
                    {t.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{t.text}</p>
                <p className="text-sm text-[var(--text-muted)] font-arabic mt-1" dir="rtl">{t.textAr}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => toggleActive(t)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    t.active ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    t.active ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => remove(t.id)} className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--error)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
