'use client'

import { useState, useEffect } from 'react'

const testimonials = [
  {
    name: 'Fatima Z.',
    text: 'Parfum magnifique et livraison très rapide. Je recommande!',
    textAr: 'عطر رائع وتوصيل سريع جداً. أنصح به!',
    rating: 5,
  },
  {
    name: 'Youssef M.',
    text: 'La qualité des bijoux est exceptionnelle. Rapport qualité-prix imbattable.',
    textAr: 'جودة المجوهرات استثنائية. قيمة ممتازة مقابل السعر.',
    rating: 5,
  },
  {
    name: 'Amina K.',
    text: 'Service client au top! Ils m\'ont aidée à choisir le parfum parfait.',
    textAr: 'خدمة العملاء ممتازة! ساعدوني في اختيار العطر المثالي.',
    rating: 5,
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 5000)
    return () => clearInterval(iv)
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl md:text-3xl text-gradient">
          Ce que disent nos clients
        </h2>
        <p className="font-arabic text-[var(--text-muted)] mt-1" dir="rtl">ماذا يقول عملاؤنا</p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="w-full flex-shrink-0 px-4">
                <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 border border-[var(--border)] text-center">
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <p className="font-arabic text-sm text-[var(--gold-muted)]" dir="rtl">&ldquo;{t.textAr}&rdquo;</p>
                  <p className="text-xs text-[var(--text-muted)] mt-4">— {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-[var(--gold)] w-6' : 'bg-[var(--border)]'
              }`}
              aria-label={`Témoignage ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
