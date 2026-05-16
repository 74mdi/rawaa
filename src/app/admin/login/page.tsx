'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password, rememberMe }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-gradient">Rawaa</h1>
          <p className="font-arabic text-lg text-[var(--gold-muted)]" dir="rtl">روعة</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-secondary)] rounded-xl p-6 space-y-4 border border-[var(--border)]">
          {error && (
            <div className="text-sm text-[var(--error)] bg-[var(--error)]/10 rounded-button px-3 py-2 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
              placeholder="admin@rawaa.ma"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-button px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="accent-[var(--gold)]"
            />
            Se souvenir de moi (7 jours)
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-button bg-[var(--gold)] text-[var(--bg-primary)] font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>

          <p className="text-xs text-center text-[var(--text-muted)]">
            admin@rawaa.ma / admin123
          </p>
        </form>
      </div>
    </div>
  )
}
