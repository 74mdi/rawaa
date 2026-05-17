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
  manifest: '/manifest.json',
  themeColor: '#0a0a0f',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rawaa',
  },
  openGraph: {
    siteName: 'Rawaa روعة',
    locale: 'fr_MA',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rawaa روعة — Parfums & Bijoux',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rawaa روعة — Parfums & Bijoux',
    description: 'Parfums et bijoux de qualité à prix abordables au Maroc',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var l=localStorage.getItem('rawaa_lang');if(l==='ar'){document.documentElement.dir='rtl';document.documentElement.lang='ar'}})();`
        }} />
      </head>
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
