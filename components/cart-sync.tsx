'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Component to sync cart_id between localStorage and cookies
 * This ensures the server-side cart page can access the cart_id
 */
export function CartSync() {
  const pathname = usePathname()

  useEffect(() => {
    // Get cart_id from localStorage
    const localCartId = localStorage.getItem('cart_id')
    
    // Get cart_id from cookie
    const cookieCartId = document.cookie
      .split('; ')
      .find(row => row.startsWith('cart_id='))
      ?.split('=')[1]

    console.log('CartSync - localStorage cart_id:', localCartId)
    console.log('CartSync - cookie cart_id:', cookieCartId)

    // If we have a cart_id in localStorage but not in cookie, try to set it
    if (localCartId && !cookieCartId) {
      console.log('Setting cart_id cookie from localStorage:', localCartId)
      document.cookie = `cart_id=${localCartId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }
    
    // If we have a cart_id in cookie but not in localStorage, save it
    if (cookieCartId && !localCartId) {
      console.log('Setting cart_id localStorage from cookie:', cookieCartId)
      localStorage.setItem('cart_id', cookieCartId)
    }
  }, [pathname]) // Run on every route change

  return null
}














