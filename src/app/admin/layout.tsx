'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ToastProvider } from '@/components/admin/Toast'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const ICONS = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  products: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

const SIDEBAR_ITEMS = [
  { href: '/admin/dashboard', icon: ICONS.dashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: ICONS.products, label: 'Produits' },
  { href: '/admin/orders', icon: ICONS.orders, label: 'Commandes' },
  { href: '/admin/settings', icon: ICONS.settings, label: 'Paramètres' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/admin/login')
  }

  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--bg-surface)] rounded-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <Link href="/admin/dashboard" className="font-display text-lg text-gradient">
              Rawaa Admin
            </Link>
            <ThemeToggle />
          </div>

          <nav className="p-4 space-y-1">
            {SIDEBAR_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-button text-sm transition-colors",
                  pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                    ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                )}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] space-y-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-button text-sm text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--bg-surface)] transition-all text-left"
            >
              <span className="flex items-center gap-3">{ICONS.logout}Déconnexion</span>
            </button>
          </div>
        </aside>

        <div className="lg:pl-64">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
