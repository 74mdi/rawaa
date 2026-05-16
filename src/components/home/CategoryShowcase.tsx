import Link from 'next/link'

export function CategoryShowcase() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/shop?category=PERFUME"
          className="group relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#0d1b2a] to-[#1b2838] border border-[var(--border)] hover:border-[var(--gold)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[var(--gold)]/10"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg className="mb-4 w-16 h-16 md:w-20 md:h-20 text-[var(--gold)] opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l-2 4h4l-2-4z"/><path d="M7 7l-1 5 6 10 6-10-1-5H7z"/><path d="M7 7h10"/><path d="M12 12v5"/><path d="M10 14h4"/>
            </svg>
            <h3 className="font-display text-3xl md:text-4xl text-[var(--gold)] mb-2">Parfums</h3>
            <p className="font-arabic text-[var(--gold-muted)]" dir="rtl">عطور</p>
          </div>
        </Link>

        <Link
          href="/shop?category=JEWELRY"
          className="group relative h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#1a0d0d] to-[#2a1a1a] border border-[var(--border)] hover:border-[var(--rose)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[var(--rose)]/10"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <svg className="mb-4 w-16 h-16 md:w-20 md:h-20 text-[var(--rose)] opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3h12l4 6-10 13L2 9l4-6z"/><path d="M2 9h20"/><path d="M12 22L9 9h6l-3 13z"/>
            </svg>
            <h3 className="font-display text-3xl md:text-4xl text-[var(--rose)] mb-2">Bijoux</h3>
            <p className="font-arabic text-[var(--rose-light)]" dir="rtl">مجوهرات</p>
          </div>
        </Link>
      </div>
    </section>
  )
}
