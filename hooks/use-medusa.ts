"use client"

import { useState, useEffect, useCallback } from "react"
import { medusaClient, MedusaProduct, MedusaCart, convertMedusaProductToCartItem, convertMedusaCartToLocalCart } from "@/lib/medusa"
import { sdk } from "@/lib/sdk"

export interface UseMedusaReturn {
  // Prodotti
  products: MedusaProduct[]
  loadingProducts: boolean
  error: string | null
  
  // Carrello
  cart: MedusaCart | null
  loadingCart: boolean
  
  // Regioni e spedizione
  regions: any[]
  shippingOptions: any[]
  paymentProviders: any[]
  
  // Funzioni
  fetchProducts: () => Promise<void>
  fetchRegions: () => Promise<void>
  fetchShippingOptions: (regionId: string) => Promise<void>
  fetchPaymentProviders: (regionId?: string) => Promise<void>
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
  
  // Stati per regioni, spedizione e pagamenti
  const [regions, setRegions] = useState<any[]>([])
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [paymentProviders, setPaymentProviders] = useState<any[]>([])

  // Ottieni o crea un carrello usando chiamate fetch dirette
  const getOrCreateCart = useCallback(async (): Promise<string> => {
    try {
      // Prima prova a recuperare un carrello esistente dal localStorage
      const existingCartId = localStorage.getItem('medusa_cart_id')
      
      if (existingCartId) {
        try {
          const baseUrl = '/api/medusa'
          const response = await fetch(`${baseUrl}/store/carts/${existingCartId}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          if (response.ok) {
            const existingCart = await response.json()
            setCart(existingCart.cart)
            console.log('Carrello esistente recuperato:', existingCart.cart)
            return existingCartId
          }
        } catch (err) {
          // Se il carrello non esiste più, rimuovilo dal localStorage
          localStorage.removeItem('medusa_cart_id')
        }
      }

      // Crea un nuovo carrello
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (response.ok) {
        const newCart = await response.json()
        const cartId = newCart.cart.id
        localStorage.setItem('medusa_cart_id', cartId)
        setCart(newCart.cart)
        console.log('Nuovo carrello creato:', newCart.cart)
        return cartId
      } else {
        throw new Error('Errore nella creazione del carrello')
      }
    } catch (err) {
      console.error('Errore nel recupero/creazione del carrello:', err)
      throw err
    }
  }, [])

  // Carica i prodotti usando chiamate fetch dirette
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    setError(null)
    
    try {
      const baseUrl = '/api/medusa'
      console.log('Fetching products from:', baseUrl)
      
      // Carica i prodotti con le relazioni espanse
      const productsResponse = await fetch(`${baseUrl}/store/products?limit=100&expand=variants,variants.prices,images,options`)
      
      if (!productsResponse.ok) {
        const errorText = await productsResponse.text()
        console.error('Response error:', errorText)
        throw new Error(`HTTP error! status: ${productsResponse.status}, message: ${errorText}`)
      }
      
      const productsData = await productsResponse.json()
      console.log('Prodotti caricati da Medusa:', productsData.products?.length || 0)
      console.log('Primo prodotto:', productsData.products?.[0])
      
      // I prodotti dovrebbero già avere i prezzi nelle varianti
      setProducts(productsData.products || [])
      
    } catch (err) {
      console.error('Errore nel caricamento dei prodotti:', err)
      setError(`Errore nel caricamento dei prodotti: ${err.message}`)
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  // Aggiungi prodotto al carrello usando chiamate fetch dirette
  const addToCart = useCallback(async (productId: string, variantId: string, quantity: number = 1) => {
    setLoadingCart(true)
    
    try {
      const cartId = await getOrCreateCart()
      const baseUrl = '/api/medusa'
      
      const response = await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          variant_id: variantId,
          quantity: quantity
        })
      })
      
      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart.cart)
        console.log('Prodotto aggiunto al carrello:', updatedCart.cart)
      } else {
        const error = await response.text()
        console.error('Errore nell\'aggiunta al carrello:', error)
        throw new Error(error)
      }
    } catch (err) {
      console.error('Errore nell\'aggiunta al carrello:', err)
      setError('Errore nell\'aggiunta al carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [getOrCreateCart])

  // Aggiorna quantità di un item nel carrello usando JS SDK
  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.lineItem.update(cart.id, itemId, {
        quantity
      })
      
      setCart(updatedCart)
      console.log('Item aggiornato nel carrello con JS SDK:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'aggiornamento del carrello:', err)
      setError('Errore nell\'aggiornamento del carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Rimuovi item dal carrello usando JS SDK
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.lineItem.delete(cart.id, itemId)
      
      setCart(updatedCart)
      console.log('Item rimosso dal carrello con JS SDK:', updatedCart)
    } catch (err) {
      console.error('Errore nella rimozione dal carrello:', err)
      setError('Errore nella rimozione dal carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Svuota carrello usando JS SDK
  const clearCart = useCallback(async () => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      // Rimuovi tutti gli item dal carrello
      for (const item of cart.items) {
        await sdk.store.cart.lineItem.delete(cart.id, item.id)
      }
      
      // Ricarica il carrello
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id)
      setCart(updatedCart)
      console.log('Carrello svuotato con JS SDK:', updatedCart)
    } catch (err) {
      console.error('Errore nello svuotamento del carrello:', err)
      setError('Errore nello svuotamento del carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Crea nuovo carrello usando JS SDK
  const createCart = useCallback(async (): Promise<string> => {
    return await getOrCreateCart()
  }, [getOrCreateCart])

  // Imposta indirizzo di spedizione usando JS SDK
  const setShippingAddress = useCallback(async (address: any) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.update(cart.id, {
        shipping_address: address
      })
      
      setCart(updatedCart)
      console.log('Indirizzo spedizione impostato con JS SDK:', updatedCart)
      
      // Dopo aver impostato l'indirizzo, recupera i payment providers per la regione del carrello
      if (updatedCart.region?.id) {
        // Usa una chiamata diretta per evitare problemi di dipendenze
        try {
          const baseUrl = '/api/medusa'
          const url = `${baseUrl}/store/payment-providers?region_id=${updatedCart.region.id}`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            const providers = data.payment_providers || []
            setPaymentProviders(providers)
            console.log('Provider pagamento caricati per regione:', providers.length)
          }
        } catch (err) {
          console.error('Errore nel caricamento payment providers:', err)
        }
      }
      
      // Recupera anche le opzioni di spedizione per la regione
      if (updatedCart.region?.id) {
        await fetchShippingOptions(updatedCart.region.id)
      }
    } catch (err) {
      console.error('Errore nell\'impostazione dell\'indirizzo di spedizione:', err)
      setError('Errore nell\'impostazione dell\'indirizzo di spedizione')
    } finally {
      setLoadingCart(false)
    }
  }, [cart, fetchShippingOptions])

  // Imposta indirizzo di fatturazione usando JS SDK
  const setBillingAddress = useCallback(async (address: any) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.update(cart.id, {
        billing_address: address
      })
      
      setCart(updatedCart)
      console.log('Indirizzo fatturazione impostato con JS SDK:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'impostazione dell\'indirizzo di fatturazione:', err)
      setError('Errore nell\'impostazione dell\'indirizzo di fatturazione')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi metodo di spedizione usando JS SDK
  const addShippingMethod = useCallback(async (shippingMethodId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.addShippingMethod(cart.id, {
        option_id: shippingMethodId
      })
      
      setCart(updatedCart)
      console.log('Metodo spedizione aggiunto con JS SDK:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'aggiunta del metodo di spedizione:', err)
      setError('Errore nell\'aggiunta del metodo di spedizione')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi sessione di pagamento usando JS SDK
  const addPaymentSession = useCallback(async (providerId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const { cart: updatedCart } = await sdk.store.cart.addPaymentSession(cart.id, {
        provider_id: providerId
      })
      
      setCart(updatedCart)
      console.log('Sessione pagamento aggiunta con JS SDK:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'aggiunta della sessione di pagamento:', err)
      setError('Errore nell\'aggiunta della sessione di pagamento')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Completa l'ordine usando JS SDK
  const completeOrder = useCallback(async () => {
    if (!cart) throw new Error('Nessun carrello disponibile')
    
    setLoadingCart(true)
    
    try {
      const { order } = await sdk.store.cart.complete(cart.id)
      console.log('Ordine completato con JS SDK:', order)
      
      // Rimuovi il carrello dal localStorage dopo il completamento
      localStorage.removeItem('medusa_cart_id')
      setCart(null)
      
      return order
    } catch (err) {
      console.error('Errore nel completamento dell\'ordine:', err)
      setError('Errore nel completamento dell\'ordine')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Carica regioni usando chiamate fetch dirette
  const fetchRegions = useCallback(async () => {
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/regions`)
      if (response.ok) {
        const data = await response.json()
        setRegions(data.regions || [])
        console.log('Regioni caricate:', data.regions?.length || 0)
      }
    } catch (error) {
      console.error('Errore nel caricamento regioni:', error)
    }
  }, [])

  // Carica opzioni di spedizione usando chiamate fetch dirette
  const fetchShippingOptions = useCallback(async (regionId: string) => {
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/shipping-options?region_id=${regionId}`)
      if (response.ok) {
        const data = await response.json()
        const options = data.shipping_options || []
        
        // Se non ci sono opzioni disponibili, aggiungi una spedizione gratuita come fallback
        if (options.length === 0) {
          const freeShipping = {
            id: 'free_shipping',
            name: 'Spedizione Gratuita',
            amount: 0,
            data: {},
            provider_id: 'manual',
            region_id: regionId
          }
          setShippingOptions([freeShipping])
          console.log('Nessuna opzione spedizione da Medusa, usando spedizione gratuita come fallback')
        } else {
          setShippingOptions(options)
          console.log('Opzioni spedizione caricate:', options.length)
        }
      } else {
        // Se la richiesta fallisce, usa spedizione gratuita come fallback
        const freeShipping = {
          id: 'free_shipping',
          name: 'Spedizione Gratuita',
          amount: 0,
          data: {},
          provider_id: 'manual',
          region_id: regionId
        }
        setShippingOptions([freeShipping])
        console.log('Errore nel caricamento opzioni spedizione, usando spedizione gratuita come fallback')
      }
    } catch (error) {
      console.error('Errore nel caricamento opzioni spedizione:', error)
      // In caso di errore, usa spedizione gratuita come fallback
      const freeShipping = {
        id: 'free_shipping',
        name: 'Spedizione Gratuita',
        amount: 0,
        data: {},
        provider_id: 'manual',
        region_id: regionId
      }
      setShippingOptions([freeShipping])
    }
  }, [])

  // Carica provider di pagamento usando chiamate fetch dirette
  const fetchPaymentProviders = useCallback(async (regionId?: string) => {
    try {
      const baseUrl = '/api/medusa'
      // Se abbiamo una regionId, recupera i payment providers per quella regione
      // In Medusa, i payment providers sono disponibili per regione
      let url = `${baseUrl}/store/payment-providers`
      if (regionId) {
        url += `?region_id=${regionId}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const providers = data.payment_providers || []
        setPaymentProviders(providers)
        console.log('Provider pagamento caricati per regione', regionId || 'tutte', ':', providers.length)
      } else {
        // Se la richiesta fallisce, prova a recuperare i payment providers dal carrello
        if (cart?.region?.id) {
          try {
            const cartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
              headers: {
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              }
            })
            if (cartResponse.ok) {
              const cartData = await cartResponse.json()
              // I payment providers potrebbero essere disponibili come payment_sessions nel carrello
              if (cartData.cart?.payment_sessions && cartData.cart.payment_sessions.length > 0) {
                const providers = cartData.cart.payment_sessions.map((ps: any) => ({
                  id: ps.provider_id,
                  is_enabled: true
                }))
                setPaymentProviders(providers)
                console.log('Provider pagamento recuperati dal carrello:', providers.length)
              }
            }
          } catch (err) {
            console.error('Errore nel recupero payment providers dal carrello:', err)
          }
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento provider pagamento:', error)
    }
  }, [cart])

  // Carica il carrello esistente all'avvio
  useEffect(() => {
    getOrCreateCart().catch(console.error)
    fetchRegions().catch(console.error)
  }, [getOrCreateCart, fetchRegions])
  
  // Quando il carrello cambia e ha una regione, carica i payment providers per quella regione
  useEffect(() => {
    if (cart?.region?.id) {
      const loadProviders = async () => {
        try {
          const baseUrl = '/api/medusa'
          const url = `${baseUrl}/store/payment-providers?region_id=${cart.region.id}`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            const providers = data.payment_providers || []
            setPaymentProviders(providers)
            console.log('Provider pagamento caricati per regione:', providers.length)
          } else {
            // Se la richiesta fallisce, prova a recuperare i payment providers dal carrello
            try {
              const cartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
                headers: {
                  'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
                }
              })
              if (cartResponse.ok) {
                const cartData = await cartResponse.json()
                if (cartData.cart?.payment_sessions && cartData.cart.payment_sessions.length > 0) {
                  const providers = cartData.cart.payment_sessions.map((ps: any) => ({
                    id: ps.provider_id,
                    is_enabled: true
                  }))
                  setPaymentProviders(providers)
                  console.log('Provider pagamento recuperati dal carrello:', providers.length)
                }
              }
            } catch (err) {
              console.error('Errore nel recupero payment providers dal carrello:', err)
            }
          }
        } catch (error) {
          console.error('Errore nel caricamento provider pagamento:', error)
        }
      }
      loadProviders()
    }
  }, [cart?.region?.id, cart?.id])

  return {
    products,
    loadingProducts,
    error,
    cart,
    loadingCart,
    regions,
    shippingOptions,
    paymentProviders,
    fetchProducts,
    fetchRegions,
    fetchShippingOptions,
    fetchPaymentProviders,
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
