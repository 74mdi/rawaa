export type DiscountType = 'PERCENTAGE' | 'FIXED'

export interface DiscountResult {
  discount: number
  code: string
  type: DiscountType
  value: number
}

export function applyDiscount(
  subtotal: number,
  code?: string,
  discountInfo?: { type: DiscountType; value: number }
): { subtotal: number; discount: number; total: number } {
  if (!code || !discountInfo) {
    const shipping = subtotal >= 200 ? 0 : 25
    return { subtotal, discount: 0, total: subtotal + shipping }
  }

  let discount = 0
  if (discountInfo.type === 'PERCENTAGE') {
    discount = Math.round(subtotal * (discountInfo.value / 100))
  } else {
    discount = Math.min(discountInfo.value, subtotal)
  }

  const afterDiscount = Math.max(0, subtotal - discount)
  const shipping = afterDiscount >= 200 ? 0 : 25
  return { subtotal, discount, total: afterDiscount + shipping }
}
