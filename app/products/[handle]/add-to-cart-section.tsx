'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { VariantSelector } from './variant-selector'

interface Variant {
  id: string
  title: string
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  prices?: Array<{
    id: string
    amount: number
    currency_code: string
  }>
  options?: Array<{
    id: string
    value: string
  }>
}

interface Product {
  id: string
  title: string
  description?: string
  handle: string
  thumbnail?: string
  images?: Array<{
    id: string
    url: string
  }>
  variants?: Variant[]
}

interface AddToCartSectionProps {
  product: Product
  price: number
  weight: string
  image: string
  hasMultipleVariants: boolean
}

export function AddToCartSection({ product, price, weight, image, hasMultipleVariants }: AddToCartSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants?.[0] || null)

  // Listen for variant changes from VariantSelector
  useEffect(() => {
    const handleVariantChange = () => {
      const select = document.getElementById('variant-select') as HTMLSelectElement
      if (select) {
        const selectedId = select.value
        const variant = product.variants?.find(v => v.id === selectedId)
        setSelectedVariant(variant || product.variants?.[0] || null)
      }
    }

    const select = document.getElementById('variant-select')
    select?.addEventListener('change', handleVariantChange)
    
    return () => {
      select?.removeEventListener('change', handleVariantChange)
    }
  }, [product.variants])

  if (!product.variants || product.variants.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Prodotto non disponibile</p>
      </div>
    )
  }

  const currentVariant = selectedVariant || product.variants[0]
  const currentPrice = currentVariant?.calculated_price?.calculated_amount ?? 
    (currentVariant?.prices?.[0]?.amount ? currentVariant.prices[0].amount / 100 : price)
  const currentWeight = currentVariant?.options?.[0]?.value || currentVariant?.title || weight

  return (
    <div className="flex gap-4">
      <AddToCartButton
        productId={product.id}
        variantId={currentVariant.id}
        productTitle={product.title}
        price={currentPrice}
        image={image}
        weight={currentWeight}
        className="flex-1 bg-accent hover:bg-accent/90"
        size="lg"
      />
    </div>
  )
}



