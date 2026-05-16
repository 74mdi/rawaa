import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  nameAr: z.string().min(1, 'Nom arabe requis').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
  category: z.enum(['PERFUME', 'JEWELRY']),
  subcategory: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  descriptionAr: z.string().nullable().optional(),
  price: z.number().positive('Prix doit être positif'),
  originalPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export const orderSchema = z.object({
  customerName: z.string().min(1, 'Nom requis'),
  phone: z.string().min(1, 'Téléphone requis'),
  city: z.string().min(1, 'Ville requise'),
  address: z.string().min(1, 'Adresse requise'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, 'Au moins un article'),
  notes: z.string().optional(),
})

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'Minimum 6 caractères'),
})

export const storeSettingsSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().max(200).optional(),
  taglineAr: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  freeShippingThreshold: z.number().positive().optional(),
  shippingFee: z.number().positive().optional(),
})
