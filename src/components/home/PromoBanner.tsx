'use client'

import { useEffect, useState } from 'react'

export function PromoBanner() {
  const [text, setText] = useState('Livraison gratuite dès 200 DH · التوصيل المجاني من 200 درهم')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.promoText) setText(data.promoText)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="bg-[var(--gold)] py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        {[0, 1, 2].map(i => (
          <span key={i} className="text-[var(--bg-primary)] font-medium mx-4 flex items-center gap-2 inline-flex">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {text}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
        ))}
      </div>
    </div>
  )
}
