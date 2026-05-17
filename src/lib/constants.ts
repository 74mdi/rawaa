export const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir',
  'Tanger', 'Meknès', 'Oujda', 'Tétouan', 'Kenitra',
  'Safi', 'El Jadida', 'Béni Mellal', 'Nador', 'Laâyoune',
  'Settat', 'Khouribga', 'Mohammedia', 'Khémisset', 'Taza',
  'Autre',
]

export const CATEGORIES = [
  { value: 'PERFUME', labelFr: 'Parfums', labelAr: 'عطور' },
  { value: 'JEWELRY', labelFr: 'Bijoux', labelAr: 'مجوهرات' },
]

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'En attente', color: 'text-yellow-400' },
  { value: 'CONFIRMED', label: 'Confirmée', color: 'text-blue-400' },
  { value: 'SHIPPED', label: 'Expédiée', color: 'text-purple-400' },
  { value: 'DELIVERED', label: 'Livrée', color: 'text-green-400' },
  { value: 'CANCELLED', label: 'Annulée', color: 'text-red-400' },
]

export const SITE_CONFIG = {
  name: 'Rawaa روعة',
  tagline: 'Luxury for everyone',
  taglineAr: 'الفخامة للجميع',
  description: 'Parfums et bijoux de qualité à prix abordables au Maroc',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  whatsapp: '+212600000000',
  instagram: '@rawaa.ma',
  tiktok: '',
  facebook: '',
}
