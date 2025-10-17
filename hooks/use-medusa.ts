"use client"

import { useState, useEffect, useCallback } from "react"
import { medusaClient, MedusaProduct, MedusaCart, convertMedusaProductToCartItem, convertMedusaCartToLocalCart } from "@/lib/medusa"

export interface UseMedusaReturn {
  // Prodotti
  products: MedusaProduct[]
  loadingProducts: boolean
  error: string | null
  
  // Carrello
  cart: MedusaCart | null
  loadingCart: boolean
  
  // Funzioni
  fetchProducts: () => Promise<void>
  addToCart: (productId: string, variantId: string, quantity?: number) => Promise<void>
  updateCartItem: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  createCart: () => Promise<string>
  setShippingAddress: (address: any) => Promise<void>
  setBillingAddress: (address: any) => Promise<void>
  addShippingMethod: (shippingMethodId: string) => Promise<void>
  addPaymentSession: (providerId: string) => Promise<void>
  completeOrder: () => Promise<any>
}

export function useMedusa(): UseMedusaReturn {
  const [products, setProducts] = useState<MedusaProduct[]>([])
  const [cart, setCart] = useState<MedusaCart | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCart, setLoadingCart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ottieni o crea un carrello
  const getOrCreateCart = useCallback(async (): Promise<string> => {
    try {
      // Prima prova a recuperare un carrello esistente dal localStorage
      const existingCartId = localStorage.getItem('medusa_cart_id')
      
      if (existingCartId) {
        try {
          const existingCart = await medusaClient.carts.retrieve(existingCartId)
          setCart(existingCart.cart)
          return existingCartId
        } catch (err) {
          // Se il carrello non esiste più, rimuovilo dal localStorage
          localStorage.removeItem('medusa_cart_id')
        }
      }

      // Crea un nuovo carrello
      const response = await medusaClient.carts.create()
      const cartId = response.cart.id
      localStorage.setItem('medusa_cart_id', cartId)
      setCart(response.cart)
      return cartId
    } catch (err) {
      console.error('Errore nel recupero/creazione del carrello:', err)
      throw err
    }
  }, [])

  // Carica i prodotti
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    setError(null)
    
    try {
      const response = await medusaClient.products.list({
        limit: 100,
        expand: ["variants", "variants.prices", "images", "options"]
      })
      
      setProducts(response.products)
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err)
      setError('Errore nel caricamento dei prodotti')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // Aggiungi prodotto al carrello
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1) => {
    setLoadingCart(true)
    
    try {
      const cartId = await getOrCreateCart()
      
      const response = await medusaClient.carts.lineItems.create(cartId, {
        variant_id: variantId,
        quantity
      })
      
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nell\'aggiunta al carrello:', err)
      setError('Errore nell\'aggiunta al carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [getOrCreateCart])

  // Aggiorna quantità di un item nel carrello
  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.lineItems.update(cart.id, itemId, {
        quantity
      })
      
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nell\'aggiornamento del carrello:', err)
      setError('Errore nell\'aggiornamento del carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Rimuovi item dal carrello
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.lineItems.delete(cart.id, itemId)
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nella rimozione dal carrello:', err)
      setError('Errore nella rimozione dal carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Svuota carrello
  const clearCart = useCallback(async () => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      // Rimuovi tutti gli item dal carrello
      for (const item of cart.items) {
        await medusaClient.carts.lineItems.delete(cart.id, item.id)
      }
      
      // Ricarica il carrello
      const response = await medusaClient.carts.retrieve(cart.id)
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nello svuotamento del carrello:', err)
      setError('Errore nello svuotamento del carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Crea nuovo carrello
  const createCart = useCallback(async (): Promise<string> => {
    return await getOrCreateCart()
  }, [getOrCreateCart])

  // Imposta indirizzo di spedizione
  const setShippingAddress = useCallback(async (address: any) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.update(cart.id, {
        shipping_address: address
      })
      
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nell\'impostazione dell\'indirizzo di spedizione:', err)
      setError('Errore nell\'impostazione dell\'indirizzo di spedizione')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Imposta indirizzo di fatturazione
  const setBillingAddress = useCallback(async (address: any) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.update(cart.id, {
        billing_address: address
      })
      
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nell\'impostazione dell\'indirizzo di fatturazione:', err)
      setError('Errore nell\'impostazione dell\'indirizzo di fatturazione')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi metodo di spedizione
  const addShippingMethod = useCallback(async (shippingMethodId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.addShippingMethod(cart.id, {
        option_id: shippingMethodId
      })
      
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nell\'aggiunta del metodo di spedizione:', err)
      setError('Errore nell\'aggiunta del metodo di spedizione')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi sessione di pagamento
  const addPaymentSession = useCallback(async (providerId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.addPaymentSession(cart.id, {
        provider_id: providerId
      })
      
      setCart(response.cart)
    } catch (err) {
      console.error('Errore nell\'aggiunta della sessione di pagamento:', err)
      setError('Errore nell\'aggiunta della sessione di pagamento')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Completa l'ordine
  const completeOrder = useCallback(async () => {
    if (!cart) throw new Error('Nessun carrello disponibile')
    
    setLoadingCart(true)
    
    try {
      const response = await medusaClient.carts.complete(cart.id)
      
      // Rimuovi il carrello dal localStorage dopo il completamento
      localStorage.removeItem('medusa_cart_id')
      setCart(null)
      
      return response.order
    } catch (err) {
      console.error('Errore nel completamento dell\'ordine:', err)
      setError('Errore nel completamento dell\'ordine')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Carica il carrello esistente all'avvio
  useEffect(() => {
    getOrCreateCart().catch(console.error)
  }, [getOrCreateCart])

  return {
    products,
    loadingProducts,
    error,
    cart,
    loadingCart,
    fetchProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    createCart,
    setShippingAddress,
    setBillingAddress,
    addShippingMethod,
    addPaymentSession,
    completeOrder
  }
}
