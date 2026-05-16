import { HeroSection } from '@/components/home/HeroSection'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { PromoBanner } from '@/components/home/PromoBanner'
import { Testimonials } from '@/components/home/Testimonials'
import { TrustBadges } from '@/components/home/TrustBadges'
import { SITE_CONFIG } from '@/lib/constants'

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: SITE_CONFIG.name,
            description: SITE_CONFIG.description,
            url: SITE_CONFIG.url,
            image: `${SITE_CONFIG.url}/logo.svg`,
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'MA',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: SITE_CONFIG.whatsapp,
              contactType: 'customer service',
            },
            sameAs: [
              `https://www.instagram.com/${SITE_CONFIG.instagram.replace('@', '')}`,
            ],
          }),
        }}
      />
      <HeroSection />
      <TrustBadges />
      <CategoryShowcase />
      <FeaturedProducts />
      <Testimonials />
      <PromoBanner />
    </>
  )
}
