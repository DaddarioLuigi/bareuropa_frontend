'use client'

import { useState } from 'react'

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
  variants?: Variant[]
}

interface VariantSelectorProps {
  product: Product
}

export function VariantSelector({ product }: VariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id || '')
  
  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId)
  const price = selectedVariant?.calculated_price?.calculated_amount ?? 
    (selectedVariant?.prices?.[0]?.amount ? selectedVariant.prices[0].amount / 100 : 0)
  const weight = selectedVariant?.options?.[0]?.value || selectedVariant?.title || "N/A"
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="variant-select" className="block text-sm font-medium mb-2">
          Taglia/Misura
        </label>
        <select
          id="variant-select"
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {product.variants?.map((variant) => {
            const variantPrice = variant.calculated_price?.calculated_amount ?? 
              (variant.prices?.[0]?.amount ? variant.prices[0].amount / 100 : 0)
            return (
              <option key={variant.id} value={variant.id}>
                {variant.title} - €{variantPrice.toFixed(2)}
              </option>
            )
          })}
        </select>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-primary">€{price.toFixed(2)}</span>
        <span className="text-sm text-muted-foreground">({weight})</span>
      </div>
      
      <input type="hidden" name="variant_id" id="variant-input" value={selectedVariantId} />
    </div>
  )
}

