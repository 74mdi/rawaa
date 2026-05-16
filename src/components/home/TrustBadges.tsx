export function TrustBadges() {
  const badges = [
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      label: 'Paiement sécurisé',
      labelAr: 'دفع آمن',
      sub: 'Paiement à la livraison',
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>,
      label: 'Produits authentiques',
      labelAr: 'منتجات أصلية',
      sub: '100% originaux garantis',
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
      label: 'Livraison rapide',
      labelAr: 'توصيل سريع',
      sub: '2 à 5 jours ouvrés',
    },
    {
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
      label: 'Service client',
      labelAr: 'خدمة العملاء',
      sub: 'Disponible 7j/7',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge, i) => (
          <div key={i} className="text-center p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--gold)]/50 transition-all group">
            <div className="text-[var(--gold)] mb-3 flex justify-center group-hover:scale-110 transition-transform">
              {badge.icon}
            </div>
            <h3 className="font-display text-sm text-[var(--text-primary)] mb-1">{badge.label}</h3>
            <p className="font-arabic text-xs text-[var(--gold-muted)]" dir="rtl">{badge.labelAr}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{badge.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
