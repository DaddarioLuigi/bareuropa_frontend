'use client'

import { useState } from 'react'

interface Variant {
  id: string
  title: string
  weight?: number
  length?: number
  height?: number
  width?: number
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
    option_id?: string
    value: string
  }>
}

interface Product {
  id: string
  title: string
  weight?: number | string
  length?: number | string
  height?: number | string
  width?: number | string
  options?: Array<{
    id: string
    title: string
  }>
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
  const isDefaultOptionValue = (value?: string) => {
    if (!value) return false
    const v = value.toLowerCase()
    return v === 'default option value' || v === 'default' || v === 'default option'
  }
  const toNumber = (v: unknown): number | undefined => {
    if (v == null) return undefined
    if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(',', '.'))
      return Number.isNaN(n) ? undefined : n
    }
    return undefined
  }
  const formatWeight = (w?: number) => {
    if (typeof w === 'number' && w > 0) {
      if (w >= 1000) return `${(w / 1000).toFixed(2)} kg`
      if (w <= 10) return `${w} kg`
      return `${w} g`
    }
    return undefined
  }
  const formatDimensions = (l?: number, h?: number, w?: number) => {
    const parts: string[] = []
    if (typeof l === 'number' && l > 0) parts.push(`${l}`)
    if (typeof h === 'number' && h > 0) parts.push(`${h}`)
    if (typeof w === 'number' && w > 0) parts.push(`${w}`)
    if (parts.length === 0) return undefined
    return parts.join(' × ')
  }
  const getWeightLabel = (product: Product, variant?: Variant) => {
    if (!variant) return 'N/A'
    const byNumeric = formatWeight(variant.weight ?? toNumber(product.weight))
    if (byNumeric) return byNumeric
    const productWeightOption = product.options?.find(o => /peso|weight/i.test(o.title))
    if (productWeightOption) {
      const vo = variant.options?.find(o => o.option_id === productWeightOption.id)
      if (vo && !isDefaultOptionValue(vo.value)) return vo.value
    }
    const guess = variant.options?.map(o => o.value).find(v => v && /(\d+\s?(g|kg))$/i.test(v))
    if (guess) return guess
    const firstNonDefault = variant.options?.map(o => o.value).find(v => v && !isDefaultOptionValue(v))
    return firstNonDefault || 'N/A'
  }
  const weight = getWeightLabel(product, selectedVariant)
  const dims = formatDimensions(
    selectedVariant?.length ?? toNumber(product.length),
    selectedVariant?.height ?? toNumber(product.height),
    selectedVariant?.width ?? toNumber(product.width)
  )
  
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
      {dims && (
        <div className="text-xs text-muted-foreground">Dimensioni: {dims}</div>
      )}
      
      <input type="hidden" name="variant_id" id="variant-input" value={selectedVariantId} />
    </div>
  )
}

