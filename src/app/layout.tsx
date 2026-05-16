import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, Tajawal } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { Providers } from '@/components/layout/Providers'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Rawaa روعة — Parfums & Bijoux', template: '%s | Rawaa' },
  description: 'Parfums et bijoux de qualité à prix abordables au Maroc. توصيل سريع في المغرب.',
  keywords: ['parfum maroc', 'bijoux maroc', 'عطور', 'مجوهرات', 'rawaa'],
  openGraph: {
    siteName: 'Rawaa روعة',
    locale: 'fr_MA',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${tajawal.variable}`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
