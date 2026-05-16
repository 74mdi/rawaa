export const SHIPPING = {
  freeThreshold: 200,
  fee: 25,
}

export function calcShipping(subtotal: number): number {
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.fee
}

export function calcTotal(subtotal: number): number {
  return subtotal + calcShipping(subtotal)
}
