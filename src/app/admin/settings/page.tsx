'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/admin/Toast'

type Settings = {
  name: string
  tagline: string
  taglineAr: string
  description: string
  whatsapp: string
  instagram: string
  tiktok: string
  facebook: string
  freeShippingThreshold: number
  shippingFee: number
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  heroTitle: string
  heroTitleAr: string
  heroSubtitle: string
  heroSubtitleAr: string
  heroCta1: string
  heroCta2: string
  promoText: string
}

const DEFAULT: Settings = {
  name: 'Rawaa روعة',
  tagline: 'Luxury for everyone',
  taglineAr: 'الفخامة للجميع',
  description: 'Parfums et bijoux de qualité à prix abordables au Maroc',
  whatsapp: '+212600000000',
  instagram: '@rawaa.ma',
  tiktok: '',
  facebook: '',
  freeShippingThreshold: 200,
  shippingFee: 25,
  seoTitle: 'Rawaa روعة — Parfums & Bijoux',
  seoDescription: 'Parfums et bijoux de qualité à prix abordables au Maroc',
  seoKeywords: 'parfum maroc, bijoux maroc, عطور, مجوهرات, rawaa',
  heroTitle: 'Rawaa',
  heroTitleAr: 'روعة',
  heroSubtitle: 'Parfums & Bijoux',
  heroSubtitleAr: 'عطور ومجوهرات',
  heroCta1: 'Shop Parfums',
  heroCta2: 'Shop Bijoux',
  promoText: 'Livraison gratuite dès 200 DH · التوصيل المجاني من 200 درهم',
}

type Tab = 'store' | 'hero' | 'seo' | 'social' | 'password'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('store')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => setSettings({ ...DEFAULT, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          freeShippingThreshold: Number(settings.freeShippingThreshold),
          shippingFee: Number(settings.shippingFee),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      toast('Paramètres sauvegardés', 'success')
    } catch {
      toast('Erreur lors de la sauvegarde', 'error')
    }
    setSaving(false)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Minimum 6 caractères')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }
    setPasswordSaving(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      toast('Mot de passe changé avec succès', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erreur')
    }
    setPasswordSaving(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'store', label: 'Boutique' },
    { key: 'hero', label: 'Hero' },
    { key: 'seo', label: 'SEO' },
    { key: 'social', label: 'Réseaux' },
    { key: 'password', label: 'Mot de passe' },
  ]

  if (loading) return <div className="animate-pulse h-96 bg-[var(--bg-surface)] rounded-xl" />

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-gradient mb-6">Paramètres</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-[var(--gold)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'store' && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)] space-y-4">
          <h2 className="font-display text-lg">Boutique</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Nom</label>
              <input type="text" value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">WhatsApp</label>
              <input type="text" value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Tagline (FR)</label>
              <input type="text" value={settings.tagline} onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Tagline (AR)</label>
              <input type="text" value={settings.taglineAr} onChange={e => setSettings(s => ({ ...s, taglineAr: e.target.value }))} dir="rtl" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] rtl" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Livraison offerte dès (DH)</label>
              <input type="number" value={settings.freeShippingThreshold} onChange={e => setSettings(s => ({ ...s, freeShippingThreshold: Number(e.target.value) }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Frais de livraison (DH)</label>
              <input type="number" value={settings.shippingFee} onChange={e => setSettings(s => ({ ...s, shippingFee: Number(e.target.value) }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
            <textarea value={settings.description} onChange={e => setSettings(s => ({ ...s, description: e.target.value }))} rows={3} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] resize-none" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Texte promo (bandeau)</label>
            <input type="text" value={settings.promoText} onChange={e => setSettings(s => ({ ...s, promoText: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <button onClick={saveSettings} disabled={saving} className="px-6 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)] space-y-4">
          <h2 className="font-display text-lg">Section Hero</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Titre principal</label>
              <input type="text" value={settings.heroTitle} onChange={e => setSettings(s => ({ ...s, heroTitle: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Titre (AR)</label>
              <input type="text" value={settings.heroTitleAr} onChange={e => setSettings(s => ({ ...s, heroTitleAr: e.target.value }))} dir="rtl" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] rtl" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Sous-titre (FR)</label>
              <input type="text" value={settings.heroSubtitle} onChange={e => setSettings(s => ({ ...s, heroSubtitle: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Sous-titre (AR)</label>
              <input type="text" value={settings.heroSubtitleAr} onChange={e => setSettings(s => ({ ...s, heroSubtitleAr: e.target.value }))} dir="rtl" className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] rtl" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Bouton 1</label>
              <input type="text" value={settings.heroCta1} onChange={e => setSettings(s => ({ ...s, heroCta1: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Bouton 2</label>
              <input type="text" value={settings.heroCta2} onChange={e => setSettings(s => ({ ...s, heroCta2: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="px-6 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)] space-y-4">
          <h2 className="font-display text-lg">SEO & Meta</h2>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Titre de la page</label>
            <input type="text" value={settings.seoTitle} onChange={e => setSettings(s => ({ ...s, seoTitle: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Description meta</label>
            <textarea value={settings.seoDescription} onChange={e => setSettings(s => ({ ...s, seoDescription: e.target.value }))} rows={3} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] resize-none" />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Mots-clés</label>
            <input type="text" value={settings.seoKeywords} onChange={e => setSettings(s => ({ ...s, seoKeywords: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
          </div>
          <button onClick={saveSettings} disabled={saving} className="px-6 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)] space-y-4">
          <h2 className="font-display text-lg">Réseaux sociaux</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">WhatsApp</label>
              <input type="text" value={settings.whatsapp} onChange={e => setSettings(s => ({ ...s, whatsapp: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Instagram</label>
              <input type="text" value={settings.instagram} onChange={e => setSettings(s => ({ ...s, instagram: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">TikTok</label>
              <input type="text" value={settings.tiktok} onChange={e => setSettings(s => ({ ...s, tiktok: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="@rawaa.ma" />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Facebook</label>
              <input type="text" value={settings.facebook} onChange={e => setSettings(s => ({ ...s, facebook: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" placeholder="facebook.com/rawaa" />
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="px-6 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)] space-y-4">
          <h2 className="font-display text-lg">Changer le mot de passe</h2>
          <form onSubmit={changePassword} className="space-y-4">
            {passwordError && (
              <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 rounded-button px-3 py-2">{passwordError}</div>
            )}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Mot de passe actuel</label>
              <input type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Nouveau mot de passe</label>
                <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Confirmer</label>
                <input type="password" required value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)]" />
              </div>
            </div>
            <button type="submit" disabled={passwordSaving} className="px-6 py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
              {passwordSaving ? 'Changement...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
