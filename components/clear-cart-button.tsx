'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'

export function ClearCartButton() {
  const { clearCart } = useCart()
  
  const handleClear = () => {
    // Clear cart_id from both cookie and localStorage
    document.cookie = 'cart_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('cart_id')
    
    // Clear local cart context
    clearCart()
    
    // Reload the page
    window.location.reload()
  }

  return (
    <Button variant="outline" onClick={handleClear}>
      Svuota e Riprova
    </Button>
  )
}

