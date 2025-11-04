'use client'

import { useEffect } from 'react'
import { useCart } from '@/contexts/cart-context'

/**
 * Component to sync local cart after server actions
 * Checks if cart was modified and triggers a refresh
 */
export function SyncCartOnAction() {
  const { clearCart } = useCart()

  useEffect(() => {
    // Listen for cart sync events
    const handleCartSync = (e: CustomEvent) => {
      const { action, itemCount } = e.detail
      
      console.log('Cart sync event:', action, 'itemCount:', itemCount)
      
      if (action === 'clear' || itemCount === 0) {
        clearCart()
      }
    }

    window.addEventListener('cart:sync' as any, handleCartSync as any)
    
    return () => {
      window.removeEventListener('cart:sync' as any, handleCartSync as any)
    }
  }, [clearCart])

  return null
}






