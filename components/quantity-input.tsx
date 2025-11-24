'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface QuantityInputProps {
  lineItemId: string
  currentQuantity: number
  productTitle: string
  updateCartItem: (formData: FormData) => void
}

export function QuantityInput({ 
  lineItemId, 
  currentQuantity, 
  productTitle,
  updateCartItem 
}: QuantityInputProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(currentQuantity.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with prop changes (e.g., after server update)
  useEffect(() => {
    setQuantity(currentQuantity.toString())
  }, [currentQuantity])

  const handleSubmit = async (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity('1')
      return
    }

    if (newQuantity === currentQuantity) {
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('lineItemId', lineItemId)
    formData.set('quantity', newQuantity.toString())
    
    try {
      await updateCartItem(formData)
      // Refresh the page to show updated cart
      router.refresh()
    } catch (error) {
      console.error('Error updating quantity:', error)
      // Reset to current quantity on error
      setQuantity(currentQuantity.toString())
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string for better UX while typing
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value)
    }
  }

  const handleInputBlur = () => {
    const numValue = parseInt(quantity) || 1
    setQuantity(numValue.toString())
    if (numValue !== currentQuantity) {
      handleSubmit(numValue)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    }
  }

  const handleDecrease = () => {
    const newQuantity = Math.max(1, currentQuantity - 1)
    if (newQuantity !== currentQuantity) {
      setQuantity(newQuantity.toString())
      handleSubmit(newQuantity)
    }
  }

  const handleIncrease = () => {
    const newQuantity = currentQuantity + 1
    setQuantity(newQuantity.toString())
    handleSubmit(newQuantity)
  }

  return (
    <form ref={formRef} className="flex items-center border rounded-lg">
      <input type="hidden" name="lineItemId" value={lineItemId} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDecrease}
        disabled={currentQuantity <= 1 || isSubmitting}
        aria-label={`Riduci quantità di ${productTitle}`}
        className="min-h-[44px] min-w-[44px]"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        ref={inputRef}
        type="number"
        min="1"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        disabled={isSubmitting}
        aria-label={`Quantità di ${productTitle}`}
        className="w-16 text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1 font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleIncrease}
        disabled={isSubmitting}
        aria-label={`Aumenta quantità di ${productTitle}`}
        className="min-h-[44px] min-w-[44px]"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}

