'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/admin/Toast'

interface DiscountCode {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  active: boolean
  expiresAt: string | null
  createdAt: string
}

export default function AdminDiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DiscountCode | null>(null)
  const [form, setForm] = useState({
    code: '', type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED', value: '', minOrder: '', maxUses: '', active: true, expiresAt: '',
  })
  const { toast } = useToast()

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/discount-codes')
      if (res.ok) setCodes(await res.json())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  const openNew = () => {
    setEditing(null)
    setShowForm(true)
    setForm({ code: '', type: 'PERCENTAGE', value: '', minOrder: '', maxUses: '', active: true, expiresAt: '' })
  }

  const openEdit = (c: DiscountCode) => {
    setEditing(c)
    setShowForm(true)
    setForm({
      code: c.code, type: c.type as 'PERCENTAGE' | 'FIXED', value: c.value.toString(),
      minOrder: c.minOrder?.toString() || '', maxUses: c.maxUses?.toString() || '',
      active: c.active, expiresAt: c.expiresAt?.slice(0, 16) || '',
    })
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const save = async () => {
    if (!form.code.trim() || !form.value) {
      toast('Code et valeur requis', 'error')
      return
    }

    const data = {
      code: form.code.toUpperCase().replace(/\s/g, '-'),
      type: form.type,
      value: parseFloat(form.value),
      minOrder: form.minOrder ? parseFloat(form.minOrder) : null,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      active: form.active,
      expiresAt: form.expiresAt || null,
    }

    try {
      const res = await fetch('/api/discount-codes', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, id: editing?.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed')
      }
      toast(editing ? 'Code modifié' : 'Code créé', 'success')
      closeForm()
      fetchCodes()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erreur', 'error')
    }
  }

  const toggleActive = async (c: DiscountCode) => {
    try {
      await fetch('/api/discount-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      })
      fetchCodes()
    } catch { /* silent */ }
  }

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return
    try {
      await fetch(`/api/discount-codes?id=${id}`, { method: 'DELETE' })
      toast('Code supprimé', 'success')
      fetchCodes()
    } catch { /* silent */ }
  }

  if (loading) return <div className="animate-pulse h-96 bg-[var(--bg-surface)] rounded-xl" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-gradient">Codes promo</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{codes.length} code{codes.length !== 1 ? 's' : ''} créé{codes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all inline-flex items-center gap-2 self-start"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau code
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeForm}>
          <div className="w-full max-w-lg bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="font-display text-lg">{editing ? 'Modifier' : 'Nouveau'} code promo</h2>
              <button onClick={closeForm} className="p-1 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-muted)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-[var(--gold)]"
                    placeholder="SOLDE20"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Montant fixe (DH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Valeur ({form.type === 'PERCENTAGE' ? '%' : 'DH'})</label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Commande min (DH)</label>
                  <input
                    type="number"
                    value={form.minOrder}
                    onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Utilisations max</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--gold)]"
                    placeholder="Illimité"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Expiration (optionnel)</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="accent-[var(--gold)] w-4 h-4"
                />
                Code actif
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)]">
              <button onClick={closeForm} className="px-4 py-2.5 rounded-button border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--gold)] transition-all">
                Annuler
              </button>
              <button onClick={save} className="px-4 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all">
                {editing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards for mobile */}
      <div className="block lg:hidden space-y-3">
        {codes.map(c => (
          <div key={c.id} className={cn(
            "bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-4 transition-all",
            !c.active && "opacity-60"
          )}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-sm font-medium">{c.code}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {c.type === 'PERCENTAGE' ? `${c.value}%` : `${c.value} DH`} de réduction
                  {c.minOrder ? ` (min ${c.minOrder} DH)` : ''}
                </p>
              </div>
              <button
                onClick={() => toggleActive(c)}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative flex-shrink-0",
                  c.active ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  c.active ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="flex gap-3">
                <span>{c.usedCount} util.</span>
                {c.maxUses && <span>/ {c.maxUses}</span>}
                {c.expiresAt && <span>Exp: {formatDate(c.expiresAt)}</span>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--error)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table for desktop */}
      <div className="hidden lg:block bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]/50">
              <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Code</th>
              <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Type</th>
              <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Valeur</th>
              <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Utilisé</th>
              <th className="text-left p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Expire</th>
              <th className="text-center p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Statut</th>
              <th className="text-right p-4 text-[var(--text-muted)] font-normal text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id} className={cn(
                "border-b border-[var(--border)] last:border-0 transition-colors",
                !c.active ? "opacity-50" : "hover:bg-[var(--bg-surface)]/30"
              )}>
                <td className="p-4 font-mono text-sm font-medium">{c.code}</td>
                <td className="p-4">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    c.type === 'PERCENTAGE' ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "bg-[var(--rose)]/10 text-[var(--rose)]"
                  )}>
                    {c.type === 'PERCENTAGE' ? 'Pourcentage' : 'Fixe'}
                  </span>
                </td>
                <td className="p-4 font-mono">{c.value}{c.type === 'PERCENTAGE' ? '%' : ' DH'}</td>
                <td className="p-4 text-[var(--text-secondary)]">
                  {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                </td>
                <td className="p-4 text-[var(--text-muted)] text-xs">
                  {c.expiresAt ? formatDate(c.expiresAt) : '—'}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleActive(c)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative inline-block",
                      c.active ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                      c.active ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => remove(c.id)} className="p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="p-16 text-center">
            <svg className="mx-auto mb-4 text-[var(--text-muted)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            <p className="text-sm text-[var(--text-muted)] mb-2">Aucun code promo</p>
            <p className="text-xs text-[var(--text-muted)]">Créez votre premier code pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}
