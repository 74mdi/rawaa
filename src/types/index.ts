export interface Product {
  id: string
  name: string
  nameAr: string
  slug: string
  description?: string
  descriptionAr?: string
  price: number
  originalPrice?: number
  images: string[]
  category: 'PERFUME' | 'JEWELRY'
  subcategory?: string
  stock: number
  featured: boolean
  active: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  customerName: string
  phone: string
  city: string
  address: string
  items: OrderItem[]
  total: number
  notes?: string
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface AdminUser {
  id: string
  email: string
}
