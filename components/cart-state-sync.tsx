'use client'

import { useEffect } from 'react'
import { useCart } from '@/contexts/cart-context'
import { useSearchParams } from 'next/navigation'

interface CartStateSyncProps {
  serverCartItemCount: number
}

/**
 * Component to sync local cart state with server cart state
 * This ensures the badge count matches the actual cart contents
 */
export function CartStateSync({ serverCartItemCount }: CartStateSyncProps) {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const cleared = searchParams.get('cleared')

  useEffect(() => {
    // If cart was cleared on server, clear local cart too
    if (cleared === 'true') {
      console.log('Cart was cleared, syncing local state')
      clearCart()
      
      // Remove the query param by replacing the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('cleared')
      window.history.replaceState({}, '', url.toString())
    }
    
    // If server cart is empty but local cart isn't, clear local cart
    if (serverCartItemCount === 0 && cleared !== 'true') {
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        const cart = JSON.parse(localCart)
        if (cart.itemCount > 0) {
          console.log('Server cart empty but local cart has items, clearing local cart')
          clearCart()
        }
      }
    }
  }, [serverCartItemCount, cleared, clearCart])

  return null
}












