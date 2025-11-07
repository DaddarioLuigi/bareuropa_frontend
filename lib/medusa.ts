// Server-side Medusa API client
const BASE = process.env.MEDUSA_BACKEND_URL
  || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  || 'https://backend-production-d71e9.up.railway.app'

// Region ID for pricing: use env if provided; otherwise undefined (omit from queries)
export const MEDUSA_REGION_ID = process.env.MEDUSA_REGION_ID

export async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 
      'content-type': 'application/json',
      // Support either server or public env for publishable key
      'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY
        || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY
        || '',
      ...(init?.headers || {}) 
    },
  })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Medusa ${res.status}: ${errorText}`)
  }
  
  return res.json()
}

// Tipi per i prodotti Medusa
export interface MedusaProduct {
  id: string
  title: string
  description?: string
  handle: string
  thumbnail?: string
  images?: Array<{
    id: string
    url: string
  }>
  variants: Array<{
    id: string
    title: string
    prices: Array<{
      id: string
      amount: number
      currency_code: string
    }>
    options: Array<{
      id: string
      value: string
    }>
  }>
  options: Array<{
    id: string
    title: string
    values: Array<{
      id: string
      value: string
    }>
  }>
  tags?: Array<{
    id: string
    value: string
  }>
  created_at: string
  updated_at: string
}

export interface MedusaCart {
  id: string
  items: Array<{
    id: string
    variant_id: string
    quantity: number
    variant: {
      id: string
      title: string
      product: {
        id: string
        title: string
        thumbnail?: string
      }
      prices: Array<{
        amount: number
        currency_code: string
      }>
    }
  }>
  total: number
  subtotal: number
  tax_total: number
  shipping_total: number
  discount_total: number
  currency_code: string
  region: {
    id: string
    name: string
    currency_code: string
  }
  shipping_address?: {
    id: string
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    country_code: string
    province?: string
    postal_code: string
    phone?: string
  }
  billing_address?: {
    id: string
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    country_code: string
    province?: string
    postal_code: string
    phone?: string
  }
  payment_sessions?: Array<{
    id: string
    provider_id: string
    amount: number
    status: string
  }>
  shipping_methods?: Array<{
    id: string
    name: string
    amount: number
  }>
}

// Client-side Medusa SDK for browser usage
import Medusa from "@medusajs/medusa-js"

const MEDUSA_BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? "/api/medusa" // Proxy locale per sviluppo
  : process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://backend-production-d71e9.up.railway.app"

export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  maxRetries: 3,
})

// Funzioni helper per convertire i dati Medusa nel formato del tuo carrello esistente
export function convertMedusaProductToCartItem(product: MedusaProduct, variantId: string): {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  weight: string
} {
  const variant = product.variants.find(v => v.id === variantId)
  console.log('Converting product:', product.title, 'variant:', variant)
  console.log('Variant prices:', variant?.prices)
  
  // Estrai il prezzo dalla struttura Medusa v2 con JS SDK
  let price = 0
  if (variant?.prices && variant.prices.length > 0) {
    // Medusa v2 con JS SDK: il prezzo è in variant.prices[0].amount
    price = variant.prices[0].amount || 0
    console.log(`Prezzo trovato per ${product.title}: ${price} centesimi`)
  } else {
    // Fallback: usa un prezzo di default
    price = 2599 // €25.99 in centesimi
    console.warn(`Nessun prezzo trovato per ${product.title}, usando prezzo di default`)
  }
  
  const priceInEuros = price / 100 // Medusa salva i prezzi in centesimi
  console.log(`Prezzo finale per ${product.title}: €${priceInEuros}`)
  
  return {
    id: parseInt(variantId.replace(/\D/g, '')) || Math.random() * 1000, // Converti ID in number
    name: product.title,
    price: priceInEuros,
    image: product.thumbnail || product.images?.[0]?.url || "/placeholder.svg",
    quantity: 1,
    weight: variant?.options?.[0]?.value || variant?.title || "N/A"
  }
}

export function convertMedusaCartToLocalCart(medusaCart: MedusaCart): {
  items: Array<{
    id: number
    name: string
    price: number
    image: string
    quantity: number
    weight: string
  }>
  total: number
  itemCount: number
} {
  const items = medusaCart.items.map(item => ({
    id: parseInt(item.variant_id),
    name: item.variant.product.title,
    price: item.variant.prices[0]?.amount ? item.variant.prices[0].amount / 100 : 0,
    image: item.variant.product.thumbnail || "/placeholder.svg",
    quantity: item.quantity,
    weight: item.variant.title || "N/A"
  }))

  const total = medusaCart.subtotal ? medusaCart.subtotal / 100 : 0
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { items, total, itemCount }
}
