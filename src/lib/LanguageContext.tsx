'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export type Lang = 'fr' | 'ar'

type TranslationSet = {
  nav: {
    perfumes: string
    jewelry: string
    newArrivals: string
    search: string
  }
  product: {
    addToCart: string
    orderNow: string
    outOfStock: string
    inStock: string
    remaining: string
    quantity: string
    description: string
    notFound: string
    backToShop: string
    whatsappOrder: string
  }
  home: {
    shopParfums: string
    shopBijoux: string
    featured: string
    viewAll: string
  }
  cart: {
    title: string
    empty: string
    total: string
    checkout: string
    freeShipping: string
    shippingFee: string
  }
  footer: {
    links: string
    contact: string
    shop: string
  }
  theme: {
    light: string
    dark: string
  }
  promo: {
    title: string
  }
}

const translations: Record<Lang, TranslationSet> = {
  fr: {
    nav: {
      perfumes: 'Parfums',
      jewelry: 'Bijoux',
      newArrivals: 'Nouveautés',
      search: 'Rechercher un produit...',
    },
    product: {
      addToCart: 'Ajouter au panier',
      orderNow: 'Commander maintenant',
      outOfStock: 'Rupture de stock',
      inStock: 'En stock',
      remaining: 'restants',
      quantity: 'Quantité',
      description: 'Description',
      notFound: 'Produit non trouvé',
      backToShop: 'Retour à la boutique',
      whatsappOrder: 'Commander via WhatsApp',
    },
    home: {
      shopParfums: 'Shop Parfums',
      shopBijoux: 'Shop Bijoux',
      featured: 'Sélection du moment',
      viewAll: 'Voir tout',
    },
    cart: {
      title: 'Panier',
      empty: 'Votre panier est vide',
      total: 'Total',
      checkout: 'Commander',
      freeShipping: 'Livraison offerte',
      shippingFee: 'Frais de livraison',
    },
    footer: {
      links: 'Liens',
      contact: 'Contact',
      shop: 'Boutique',
    },
    theme: {
      light: 'Mode clair',
      dark: 'Mode sombre',
    },
    promo: {
      title: 'Livraison offerte dès 200 MAD · التوصيل مجاني',
    },
  },
  ar: {
    nav: {
      perfumes: 'عطور',
      jewelry: 'مجوهرات',
      newArrivals: 'وصل حديثاً',
      search: 'ابحث عن منتج...',
    },
    product: {
      addToCart: 'أضف إلى السلة',
      orderNow: 'اطلب الآن',
      outOfStock: 'نفد من المخزون',
      inStock: 'متوفر',
      remaining: 'متبقي',
      quantity: 'الكمية',
      description: 'الوصف',
      notFound: 'المنتج غير موجود',
      backToShop: 'العودة إلى المتجر',
      whatsappOrder: 'اطلب عبر واتساب',
    },
    home: {
      shopParfums: 'تسوق العطور',
      shopBijoux: 'تسوق المجوهرات',
      featured: 'اختيارات مميزة',
      viewAll: 'عرض الكل',
    },
    cart: {
      title: 'السلة',
      empty: 'سلة التسوق فارغة',
      total: 'المجموع',
      checkout: 'إتمام الطلب',
      freeShipping: 'التوصيل مجاني',
      shippingFee: 'رسوم التوصيل',
    },
    footer: {
      links: 'روابط',
      contact: 'اتصل بنا',
      shop: 'المتجر',
    },
    theme: {
      light: 'الوضع النهاري',
      dark: 'الوضع الليلي',
    },
    promo: {
      title: 'التوصيل مجاني للطلبات فوق 200 درهم',
    },
  },
}

const LangContext = createContext<{
  lang: Lang
  t: TranslationSet
  setLang: (l: Lang) => void
  toggleLang: () => void
}>({ lang: 'fr', t: translations.fr, setLang: () => {}, toggleLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggleLang = useCallback(() => {
    setLangState(prev => prev === 'fr' ? 'ar' : 'fr')
  }, [])

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], setLang, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
