'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { addToCartAPI } from '@/lib/cart-api'
import { useCart } from '@/contexts/cart-context'

interface AddToCartButtonProps {
  productId: string
  variantId: string
  productTitle: string
  price: number
  image: string
  weight?: string
  className?: string
  size?: 'sm' | 'lg' | 'default'
}

export function AddToCartButton({ 
  productId, 
  variantId, 
  productTitle, 
  price, 
  image,
  weight = 'N/A',
  className,
  size = 'default'
}: AddToCartButtonProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsAdding(true)

    try {
      // Add to Medusa cart via API
      const response = await addToCartAPI({
        productId,
        variantId,
        productTitle,
        price,
        image,
        weight,
      })

      console.log('Add to cart API response:', response)

      // Store cartId in localStorage as backup - sincronizza entrambe le chiavi
      const cartId = response.cartId || response.cart?.id
      if (cartId) {
        // Sincronizza entrambe le chiavi per compatibilità con useMedusa
        localStorage.setItem('cart_id', cartId)
        localStorage.setItem('medusa_cart_id', cartId)
        console.log('[ADD TO CART] Stored cart_id in localStorage (both keys):', cartId)
        
        // Emetti un evento custom per notificare altri componenti del cambio carrello
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartId } }))
      }

      // Add to local cart for UI (to show badge count)
      addItem({
        id: parseInt(variantId.replace(/\D/g, '')) || Date.now(),
        name: productTitle,
        price,
        image,
        weight,
      })

      // Show notification
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
      
      // Note: Non chiamiamo router.refresh() qui perché:
      // 1. L'aggiunta al carrello non modifica i dati della pagina prodotto
      // 2. router.refresh() può causare problemi con params dinamici in Next.js
      // 3. Il carrello viene aggiornato tramite localStorage e eventi custom
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Errore nell\'aggiunta del prodotto al carrello')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <Button 
        onClick={handleAddToCart}
        disabled={isAdding}
        className={className}
        size={size}
      >
        {isAdding ? (
          <>Aggiunta in corso...</>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Aggiungi
          </>
        )}
      </Button>

      {/* Simple notification */}
      {showNotification && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in slide-in-from-top">
          ✓ Prodotto aggiunto al carrello!
        </div>
      )}
    </>
  )
}

