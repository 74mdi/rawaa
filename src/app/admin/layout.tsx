'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ToastProvider } from '@/components/admin/Toast'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const ICONS = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  products: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  orders: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="21" cy="21" r="1"/><path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/></svg>,
  customers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  discount: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  testimonials: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  close: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
}

const SIDEBAR_ITEMS = [
  { href: '/admin/dashboard', icon: ICONS.dashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: ICONS.products, label: 'Produits' },
  { href: '/admin/orders', icon: ICONS.orders, label: 'Commandes' },
  { href: '/admin/customers', icon: ICONS.customers, label: 'Clients' },
  { href: '/admin/discount-codes', icon: ICONS.discount, label: 'Codes promo' },
  { href: '/admin/testimonials', icon: ICONS.testimonials, label: 'Témoignages' },
  { href: '/admin/settings', icon: ICONS.settings, label: 'Paramètres' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gold)] to-[var(--gold-muted)] flex items-center justify-center">
                  <span className="text-[var(--bg-primary)] font-display font-bold text-sm">R</span>
                </div>
                <span className="font-display text-lg text-gradient">Rawaa</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-muted)]"
              >
                {ICONS.close}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {SIDEBAR_ITEMS.map(item => {
                const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      isActive
                        ? "bg-[var(--gold)]/10 text-[var(--gold)] font-medium"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    )}
                  >
                    <span className={cn("flex-shrink-0", isActive && "text-[var(--gold)]")}>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom actions */}
            <div className="p-3 border-t border-[var(--border)] space-y-0.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-all"
              >
                {ICONS.logout}
                Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className={cn(
            "sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-transparent transition-all",
            scrolled && "border-[var(--border)]"
          )}>
            <div className="flex items-center justify-between h-14 px-4 lg:px-6">
              <button
                className="lg:hidden p-2 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                onClick={() => setSidebarOpen(true)}
              >
                {ICONS.menu}
              </button>

              <div className="hidden lg:block">
                <h2 className="text-sm font-medium text-[var(--text-primary)]">
                  {SIDEBAR_ITEMS.find(item => pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)))?.label || 'Administration'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link
                  href="/"
                  target="_blank"
                  className="p-2 rounded-button hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
                  title="Voir le site"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </Link>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 lg:p-6 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
