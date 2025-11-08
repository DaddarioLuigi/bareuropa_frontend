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
  applyDiscountCode: (code: string) => Promise<void>
  removeDiscountCode: (code: string) => Promise<void>
  debugFetchPromotions: () => Promise<void>
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
      setError(`Errore nel caricamento dei prodotti: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`)
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

  // Aggiorna quantità di un item nel carrello usando fetch dirette
  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}/line-items/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          quantity
        })
      })
      
      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart.cart)
        console.log('Item aggiornato nel carrello:', updatedCart.cart)
      } else {
        const error = await response.text()
        console.error('Errore nell\'aggiornamento del carrello:', error)
        throw new Error(error)
      }
    } catch (err) {
      console.error('Errore nell\'aggiornamento del carrello:', err)
      setError('Errore nell\'aggiornamento del carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Rimuovi item dal carrello usando fetch dirette
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}/line-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart.cart)
        console.log('Item rimosso dal carrello:', updatedCart.cart)
      } else {
        const error = await response.text()
        console.error('Errore nella rimozione dal carrello:', error)
        throw new Error(error)
      }
    } catch (err) {
      console.error('Errore nella rimozione dal carrello:', err)
      setError('Errore nella rimozione dal carrello')
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Svuota carrello usando fetch dirette
  const clearCart = useCallback(async () => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      // Rimuovi tutti gli item dal carrello
      for (const item of cart.items) {
        await fetch(`${baseUrl}/store/carts/${cart.id}/line-items/${item.id}`, {
          method: 'DELETE',
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
          }
        })
      }
      
      // Ricarica il carrello
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (response.ok) {
        const cartData = await response.json()
        setCart(cartData.cart)
        console.log('Carrello svuotato:', cartData.cart)
      }
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

  // Imposta indirizzo di spedizione usando fetch dirette
  const setShippingAddress = useCallback(async (address: any) => {
    if (!cart) {
      console.error('Errore nell\'impostazione dell\'indirizzo di spedizione: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          shipping_address: address
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Errore nell\'impostazione dell\'indirizzo di spedizione:', errorText)
        throw new Error(errorText)
      }
      
      const updatedCartData = await response.json()
      const updatedCart = updatedCartData.cart || updatedCartData
      setCart(updatedCart)
      console.log('Indirizzo spedizione impostato:', updatedCart)
      
      // Dopo aver impostato l'indirizzo, recupera i payment providers per la regione del carrello
      if (updatedCart.region?.id) {
        // Usa una chiamata diretta per evitare problemi di riferimento circolare
        try {
          const url = `${baseUrl}/store/payment-providers?region_id=${updatedCart.region.id}`
          const providersResponse = await fetch(url)
          if (providersResponse.ok) {
            const data = await providersResponse.json()
            const providers = data.payment_providers || []
            if (providers.length > 0) {
              setPaymentProviders(providers)
              console.log('Provider pagamento caricati per regione:', providers.length)
            }
          }
        } catch (err) {
          console.error('Errore nel caricamento payment providers:', err)
        }
      }
      
      // Recupera anche le opzioni di spedizione per la regione
      if (updatedCart.region?.id) {
        // Usa una chiamata diretta per evitare problemi di riferimento circolare
        try {
          const shippingResponse = await fetch(`${baseUrl}/store/shipping-options?region_id=${updatedCart.region.id}`)
          if (shippingResponse.ok) {
            const data = await shippingResponse.json()
            const options = data.shipping_options || []
            if (options.length === 0) {
              const freeShipping = {
                id: 'free_shipping',
                name: 'Spedizione Gratuita',
                amount: 0,
                data: {},
                provider_id: 'manual',
                region_id: updatedCart.region.id
              }
              setShippingOptions([freeShipping])
            } else {
              setShippingOptions(options)
            }
          }
        } catch (error) {
          const freeShipping = {
            id: 'free_shipping',
            name: 'Spedizione Gratuita',
            amount: 0,
            data: {},
            provider_id: 'manual',
            region_id: updatedCart.region.id
          }
          setShippingOptions([freeShipping])
        }
      }
    } catch (err) {
      console.error('Errore nell\'impostazione dell\'indirizzo di spedizione:', err)
      setError('Errore nell\'impostazione dell\'indirizzo di spedizione')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Imposta indirizzo di fatturazione usando fetch dirette
  const setBillingAddress = useCallback(async (address: any) => {
    if (!cart) {
      console.error('Errore nell\'impostazione dell\'indirizzo di fatturazione: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          billing_address: address
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Errore nell\'impostazione dell\'indirizzo di fatturazione:', errorText)
        throw new Error(errorText)
      }
      
      const updatedCartData = await response.json()
      const updatedCart = updatedCartData.cart || updatedCartData
      setCart(updatedCart)
      console.log('Indirizzo fatturazione impostato:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'impostazione dell\'indirizzo di fatturazione:', err)
      setError('Errore nell\'impostazione dell\'indirizzo di fatturazione')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi metodo di spedizione usando fetch dirette
  const addShippingMethod = useCallback(async (shippingMethodId: string) => {
    if (!cart) {
      console.error('Errore nell\'aggiunta del metodo di spedizione: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}/shipping-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          option_id: shippingMethodId
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Errore nell\'aggiunta del metodo di spedizione:', errorText)
        throw new Error(errorText)
      }
      
      const updatedCartData = await response.json()
      const updatedCart = updatedCartData.cart || updatedCartData
      setCart(updatedCart)
      console.log('Metodo spedizione aggiunto:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'aggiunta del metodo di spedizione:', err)
      setError('Errore nell\'aggiunta del metodo di spedizione')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi sessione di pagamento usando fetch dirette
  const addPaymentSession = useCallback(async (providerId: string) => {
    if (!cart) {
      console.error('Errore nell\'aggiunta della sessione di pagamento: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}/payment-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          provider_id: providerId
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Errore nell\'aggiunta della sessione di pagamento:', errorText)
        throw new Error(errorText)
      }
      
      const updatedCartData = await response.json()
      const updatedCart = updatedCartData.cart || updatedCartData
      setCart(updatedCart)
      console.log('Sessione pagamento aggiunta:', updatedCart)
    } catch (err) {
      console.error('Errore nell\'aggiunta della sessione di pagamento:', err)
      setError('Errore nell\'aggiunta della sessione di pagamento')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Completa l'ordine usando fetch dirette
  const completeOrder = useCallback(async () => {
    if (!cart) {
      console.error('Errore nel completamento dell\'ordine: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Errore nel completamento dell\'ordine:', errorText)
        throw new Error(errorText)
      }
      
      const orderData = await response.json()
      const order = orderData.order || orderData
      console.log('Ordine completato:', order)
      
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

  // Funzione di debug per recuperare tutte le promozioni da Medusa
  const debugFetchPromotions = useCallback(async () => {
    try {
      const baseUrl = '/api/medusa'
      console.log('[DEBUG PROMOZIONI] Recupero tutte le promozioni da Medusa...')
      
      // Prova diversi endpoint possibili per le promozioni
      const endpoints = [
        '/store/promotions',
        '/admin/promotions',
        '/store/discounts',
        '/admin/discounts'
      ]
      
      for (const endpoint of endpoints) {
        try {
          console.log(`[DEBUG PROMOZIONI] Tentativo endpoint: ${endpoint}`)
          const response = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log(`[DEBUG PROMOZIONI] ✅ Endpoint ${endpoint} funziona!`)
            console.log(`[DEBUG PROMOZIONI] Dati ricevuti:`, JSON.stringify(data, null, 2))
            
            // Cerca promozioni in diverse strutture possibili
            const promotions = data.promotions || data.discounts || data.data || data
            if (Array.isArray(promotions)) {
              console.log(`[DEBUG PROMOZIONI] 📋 Trovate ${promotions.length} promozioni:`)
              promotions.forEach((promo: any, index: number) => {
                console.log(`[DEBUG PROMOZIONI] Promozione ${index + 1}:`, {
                  id: promo.id,
                  code: promo.code,
                  type: promo.type,
                  value: promo.value,
                  is_active: promo.is_active,
                  starts_at: promo.starts_at,
                  ends_at: promo.ends_at,
                  usage_limit: promo.usage_limit,
                  usage_count: promo.usage_count,
                  full: promo
                })
              })
            } else if (promotions) {
              console.log(`[DEBUG PROMOZIONI] 📋 Dati promozioni (non array):`, promotions)
            }
            return data
          } else {
            console.log(`[DEBUG PROMOZIONI] ❌ Endpoint ${endpoint} non disponibile (${response.status})`)
          }
        } catch (err) {
          console.log(`[DEBUG PROMOZIONI] ❌ Errore su endpoint ${endpoint}:`, err)
        }
      }
      
      // Se nessun endpoint funziona, prova a recuperare le promozioni dal carrello se disponibile
      if (cart) {
        console.log('[DEBUG PROMOZIONI] Tentativo di recuperare promozioni dal carrello...')
        try {
          const cartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          if (cartResponse.ok) {
            const cartData = await cartResponse.json()
            const cartObj = cartData.cart || cartData
            console.log('[DEBUG PROMOZIONI] Carrello completo:', JSON.stringify(cartObj, null, 2))
            if (cartObj.discounts && cartObj.discounts.length > 0) {
              console.log('[DEBUG PROMOZIONI] Discount codes nel carrello:', cartObj.discounts)
            }
          }
        } catch (err) {
          console.log('[DEBUG PROMOZIONI] Errore nel recupero del carrello:', err)
        }
      }
      
      console.log('[DEBUG PROMOZIONI] ⚠️ Nessun endpoint per le promozioni trovato')
    } catch (err) {
      console.error('[DEBUG PROMOZIONI] Errore generale:', err)
    }
  }, [cart])

  // Applica codice promozionale usando chiamate fetch dirette
  const applyDiscountCode = useCallback(async (code: string) => {
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const codeToApply = code.toUpperCase().trim()
      
      // DEBUG: Recupera tutte le promozioni prima di applicare il codice
      console.log('[DISCOUNT CODE] 🔍 DEBUG: Recupero tutte le promozioni disponibili...')
      await debugFetchPromotions()
      
      // Se il carrello non è disponibile nello stato, prova a recuperarlo
      let currentCart = cart
      let cartId: string | null = null
      
      if (!currentCart) {
        console.log('[DISCOUNT CODE] Carrello non disponibile nello stato, recupero da cookie/localStorage...')
        
        // Prova a recuperare il cart_id dal cookie
        const cookieCartId = typeof document !== 'undefined' 
          ? document.cookie
              .split('; ')
              .find(row => row.startsWith('cart_id='))
              ?.split('=')[1]
          : null
        
        // Prova anche da localStorage
        const localCartId = typeof window !== 'undefined' 
          ? localStorage.getItem('cart_id') || localStorage.getItem('medusa_cart_id')
          : null
        
        cartId = cookieCartId || localCartId || null
        
        if (cartId) {
          console.log('[DISCOUNT CODE] Cart ID trovato:', cartId)
          // Recupera il carrello da Medusa
          try {
            const response = await fetch(`${baseUrl}/store/carts/${cartId}`, {
              headers: {
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              }
            })
            
            if (response.ok) {
              const cartData = await response.json()
              currentCart = cartData.cart || cartData
              if (currentCart) {
                setCart(currentCart)
                console.log('[DISCOUNT CODE] Carrello recuperato da Medusa:', currentCart.id)
              } else {
                throw new Error('Carrello non valido ricevuto da Medusa')
              }
            } else {
              console.error('[DISCOUNT CODE] Impossibile recuperare il carrello da Medusa')
              throw new Error('Impossibile recuperare il carrello. Riprova più tardi.')
            }
          } catch (err) {
            console.error('[DISCOUNT CODE] Errore nel recupero del carrello:', err)
            throw new Error('Impossibile recuperare il carrello. Riprova più tardi.')
          }
        } else {
          console.error('[DISCOUNT CODE] Nessun cart_id trovato in cookie o localStorage')
          throw new Error('Nessun carrello disponibile. Aggiungi prodotti al carrello prima di applicare un codice promozionale.')
        }
      }
      
      if (!currentCart || !currentCart.id) {
        console.error('[DISCOUNT CODE] Carrello non valido:', currentCart)
        throw new Error('Carrello non valido. Riprova più tardi.')
      }
      
      console.log('[DISCOUNT CODE] Tentativo di applicare codice:', {
        code: codeToApply,
        cartId: currentCart.id,
        url: `${baseUrl}/store/carts/${currentCart.id}/discounts`
      })
      
      // Salva il discount_total prima dell'applicazione per confrontarlo dopo
      const previousDiscountTotal = currentCart.discount_total || 0
      const previousDiscounts = currentCart.discounts || []
      
      console.log('[DISCOUNT CODE] Stato carrello prima:', {
        previousDiscountTotal,
        previousDiscounts: previousDiscounts.length,
        previousDiscountCodes: previousDiscounts.map((d: any) => d.code || d.discount?.code)
      })
      
      // Prova prima con l'endpoint specifico per i discount codes (se esiste)
      // Altrimenti usa l'endpoint di aggiornamento del carrello
      let response: Response
      let updatedCart: any
      let cartData: any
      
      try {
        // Prova prima con l'endpoint specifico per i discount codes
        response = await fetch(`${baseUrl}/store/carts/${currentCart.id}/discounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
          },
          body: JSON.stringify({
            code: codeToApply
          })
        })
        
        console.log('[DISCOUNT CODE] Risposta HTTP (endpoint discounts):', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        })
        
        // Se la risposta non è OK, prova a estrarre il messaggio di errore specifico da Medusa
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[DISCOUNT CODE] Errore HTTP:', {
            status: response.status,
            errorText: errorText.substring(0, 500)
          })
          
          // Se è un errore 500 con "Non-JSON response", significa che l'endpoint non esiste
          // o Medusa sta restituendo HTML invece di JSON
          if (response.status === 500 || response.status === 404) {
            // Prova a parsare l'errore per vedere se contiene informazioni utili
            let errorData
            try {
              errorData = JSON.parse(errorText)
              // Se contiene un messaggio di errore specifico, usalo
              if (errorData.error && errorData.error.includes('Non-JSON')) {
                console.log('[DISCOUNT CODE] Endpoint discounts non disponibile, uso aggiornamento carrello')
                throw new Error('ENDPOINT_NOT_AVAILABLE')
              }
              // Altrimenti usa il messaggio di errore di Medusa
              const errorMessage = errorData.message || errorData.error?.message || errorData.error || 'Codice promozionale non valido'
              throw new Error(errorMessage)
            } catch (parseErr) {
              // Se non riesce a parsare, l'endpoint non è disponibile
              console.log('[DISCOUNT CODE] Endpoint discounts non disponibile, uso aggiornamento carrello')
              throw new Error('ENDPOINT_NOT_AVAILABLE')
            }
          }
          
          // Per altri errori (400, 422, ecc.), Medusa potrebbe restituire un messaggio specifico
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText || 'Codice promozionale non valido' }
          }
          
          // Estrai il messaggio di errore più specifico possibile
          const errorMessage = errorData.message || 
                               errorData.error?.message || 
                               errorData.error || 
                               (errorData.errors && errorData.errors[0]?.message) ||
                               'Codice promozionale non valido'
          
          console.error('[DISCOUNT CODE] Messaggio errore da Medusa:', errorMessage)
          throw new Error(errorMessage)
        }
        
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            updatedCart = await response.json()
            cartData = updatedCart.cart || updatedCart
          } else {
            // Se la risposta non è JSON, l'endpoint non è disponibile
            throw new Error('ENDPOINT_NOT_AVAILABLE')
          }
        } else {
          throw new Error('ENDPOINT_NOT_AVAILABLE')
        }
      } catch (err: any) {
        // Se l'endpoint specifico non è disponibile, usa l'aggiornamento del carrello
        if (err.message === 'ENDPOINT_NOT_AVAILABLE' || err.message.includes('Non-JSON')) {
          console.log('[DISCOUNT CODE] Uso endpoint di aggiornamento carrello con campo discounts')
          
          // Prepara i discount codes esistenti più il nuovo
          const existingDiscounts = currentCart.discounts || []
          const newDiscounts = [...existingDiscounts, { code: codeToApply }]
          
          response = await fetch(`${baseUrl}/store/carts/${currentCart.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: JSON.stringify({
              discounts: newDiscounts
            })
          })
          
          console.log('[DISCOUNT CODE] Risposta HTTP (aggiornamento carrello):', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('[DISCOUNT CODE] Errore HTTP (aggiornamento carrello):', {
              status: response.status,
              errorText: errorText.substring(0, 500)
            })
            
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { message: errorText || 'Codice promozionale non valido' }
            }
            
            // Estrai il messaggio di errore più specifico possibile
            const errorMessage = errorData.message || 
                                 errorData.error?.message || 
                                 errorData.error || 
                                 (errorData.errors && errorData.errors[0]?.message) ||
                                 'Codice promozionale non valido'
            
            console.error('[DISCOUNT CODE] Messaggio errore da Medusa (aggiornamento carrello):', errorMessage)
            throw new Error(errorMessage)
          }
          
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text()
            console.error('[DISCOUNT CODE] Risposta non-JSON da Medusa:', errorText.substring(0, 200))
            throw new Error('Medusa ha restituito una risposta non valida. Verifica che il codice promozionale esista.')
          }
          
          updatedCart = await response.json()
          cartData = updatedCart.cart || updatedCart
        } else {
          throw err
        }
      }
      
      console.log('[DISCOUNT CODE] Carrello aggiornato da Medusa:', {
        hasCart: !!cartData,
        discounts: cartData.discounts,
        discountsLength: cartData.discounts?.length || 0,
        discountTotal: cartData.discount_total || 0
      })
      
      // Verifica che il codice sia stato effettivamente applicato da Medusa
      // Controlla se ci sono discount codes nel carrello
      const hasDiscountCodes = cartData.discounts && cartData.discounts.length > 0
      
      console.log('[DISCOUNT CODE] Validazione:', {
        hasDiscountCodes,
        discountsArray: cartData.discounts,
        discountsLength: cartData.discounts?.length || 0
      })
      
      // Verifica che il codice applicato corrisponda a quello richiesto
      let appliedCode = null
      if (hasDiscountCodes) {
        appliedCode = cartData.discounts[0]?.code || cartData.discounts[0]?.discount?.code
        console.log('[DISCOUNT CODE] Codice trovato nell\'array discounts:', {
          appliedCode,
          codeToApply,
          match: appliedCode?.toUpperCase() === codeToApply
        })
      } else {
        console.warn('[DISCOUNT CODE] Nessun codice trovato nell\'array discounts!')
      }
      
      // Validazione rigorosa: 
      // 1. Il codice DEVE essere presente nell'array discounts (Medusa lo aggiunge solo se valido ed esistente)
      // 2. Il codice DEVE corrispondere esattamente a quello richiesto
      // Medusa aggiunge il codice all'array discounts solo se esiste nel database, è valido e attivo
      if (!hasDiscountCodes) {
        // Il codice non è stato aggiunto all'array discounts
        // Questo può significare:
        // - Il codice non esiste
        // - Il codice non è ancora attivo (data di inizio nel futuro)
        // - Il codice è scaduto (data di fine nel passato)
        // - Il codice non è applicabile ai prodotti nel carrello
        // - Il codice ha raggiunto il limite di utilizzo
        console.error('[DISCOUNT CODE] VALIDAZIONE FALLITA: Il codice non è stato aggiunto all\'array discounts')
        console.error('[DISCOUNT CODE] Dettagli:', {
          codeToApply,
          cartDataDiscounts: cartData.discounts,
          cartDataKeys: Object.keys(cartData),
          cartDataFull: JSON.stringify(cartData, null, 2).substring(0, 500)
        })
        
        // Verifica se ci sono errori o warning nel carrello che potrebbero spiegare perché il codice non è stato applicato
        const possibleReasons = [
          'Il codice promozionale potrebbe non essere ancora attivo (verifica la data di inizio)',
          'Il codice promozionale potrebbe essere scaduto (verifica la data di fine)',
          'Il codice potrebbe non essere applicabile ai prodotti nel carrello',
          'Il codice potrebbe aver raggiunto il limite di utilizzo'
        ]
        
        throw new Error('Codice promozionale non valido. Verifica che il codice sia attivo e applicabile ai prodotti nel carrello.')
      }
      
      if (!appliedCode || appliedCode.toUpperCase() !== codeToApply) {
        // Il codice non corrisponde a quello richiesto
        console.error('[DISCOUNT CODE] VALIDAZIONE FALLITA: Il codice non corrisponde')
        console.error('[DISCOUNT CODE] Dettagli:', {
          codeToApply,
          appliedCode,
          match: appliedCode?.toUpperCase() === codeToApply
        })
        throw new Error('Codice promozionale non valido')
      }
      
      // Verifica che il codice sia effettivamente presente e valido
      // Se Medusa ha aggiunto il codice all'array discounts, significa che esiste ed è valido
      // Nota: Il codice potrebbe essere valido ma non applicabile ai prodotti nel carrello
      // (ad esempio, se è per una categoria specifica), ma questo è gestito da Medusa
      
      // Se arriviamo qui, il codice è valido e applicato
      const newDiscountTotal = cartData.discount_total || 0
      console.log('[DISCOUNT CODE] ✅ Codice promozionale applicato con successo:', {
        code: codeToApply,
        appliedCode,
        previousDiscountTotal,
        newDiscountTotal,
        discountTotal: cartData.discount_total || 0,
        discounts: cartData.discounts
      })
      
      setCart(cartData)
    } catch (err: any) {
      console.error('[DISCOUNT CODE] ❌ Errore nell\'applicazione del codice promozionale:', err)
      console.error('[DISCOUNT CODE] Stack trace:', err.stack)
      setError(err.message || 'Errore nell\'applicazione del codice promozionale')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Rimuovi codice promozionale usando chiamate fetch dirette
  const removeDiscountCode = useCallback(async (code: string) => {
    if (!cart) return
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      const codeToRemove = code.toUpperCase().trim()
      
      // Prova prima con l'endpoint specifico per rimuovere il discount code
      let response = await fetch(`${baseUrl}/store/carts/${cart.id}/discounts/${codeToRemove}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      // Se l'endpoint specifico non funziona, aggiorna il carrello con un array vuoto di discount codes
      if (!response.ok) {
        response = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
          },
          body: JSON.stringify({
            discounts: []
          })
        })
      }
      
      if (response.ok) {
        const updatedCart = await response.json()
        setCart(updatedCart.cart)
        console.log('Codice promozionale rimosso:', updatedCart.cart)
      } else {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || 'Errore nella rimozione del codice' }
        }
        throw new Error(errorData.message || 'Errore nella rimozione del codice')
      }
    } catch (err: any) {
      console.error('Errore nella rimozione del codice promozionale:', err)
      setError(err.message || 'Errore nella rimozione del codice promozionale')
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
        const regionsData = data.regions || []
        setRegions(regionsData)
        console.log('Regioni caricate:', regionsData.length)
        
        // Se ci sono regioni, prova a caricare i payment providers dalla prima regione
        // o da tutte le regioni disponibili
        if (regionsData.length > 0) {
          // Prova a recuperare i payment providers dalla prima regione
          const firstRegion = regionsData[0]
          if (firstRegion?.id) {
            try {
              // Prova prima con l'endpoint payment-providers
              const providersResponse = await fetch(`${baseUrl}/store/payment-providers?region_id=${firstRegion.id}`)
              if (providersResponse.ok) {
                const providersData = await providersResponse.json()
                const providers = providersData.payment_providers || []
                if (providers.length > 0) {
                  setPaymentProviders(providers)
                  console.log('Provider pagamento caricati dalla prima regione:', providers.length)
                } else {
                  // Se non ci sono provider, prova a recuperarli dalla regione stessa
                  // Alcune versioni di Medusa includono i payment providers nella risposta della regione
                  if (firstRegion.payment_providers && firstRegion.payment_providers.length > 0) {
                    setPaymentProviders(firstRegion.payment_providers)
                    console.log('Provider pagamento recuperati dalla regione stessa:', firstRegion.payment_providers.length)
                  }
                }
              } else {
                // Se l'endpoint non funziona, prova a recuperare i payment providers dalla regione stessa
                if (firstRegion.payment_providers && firstRegion.payment_providers.length > 0) {
                  setPaymentProviders(firstRegion.payment_providers)
                  console.log('Provider pagamento recuperati dalla regione stessa (fallback):', firstRegion.payment_providers.length)
                }
              }
            } catch (err) {
              console.error('Errore nel caricamento payment providers dalla regione:', err)
              // Fallback: prova a recuperare i payment providers dalla regione stessa
              if (firstRegion.payment_providers && firstRegion.payment_providers.length > 0) {
                setPaymentProviders(firstRegion.payment_providers)
                console.log('Provider pagamento recuperati dalla regione stessa (errore fallback):', firstRegion.payment_providers.length)
              }
            }
          }
        }
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
  const fetchPaymentProviders = useCallback(async (regionId?: string, cartId?: string) => {
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
        if (providers.length > 0) {
          setPaymentProviders(providers)
          console.log('Provider pagamento caricati per regione', regionId || 'tutte', ':', providers.length)
          return
        }
      }
      
      // Se la richiesta fallisce o non ci sono provider, prova a recuperare i payment providers dal carrello
      if (cartId) {
        try {
          const cartResponse = await fetch(`${baseUrl}/store/carts/${cartId}`, {
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
              return
            }
          }
        } catch (err) {
          console.error('Errore nel recupero payment providers dal carrello:', err)
        }
      }
      
      // Se ancora non abbiamo provider, prova senza region_id
      if (regionId) {
        try {
          const fallbackResponse = await fetch(`${baseUrl}/store/payment-providers`)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            const fallbackProviders = fallbackData.payment_providers || []
            if (fallbackProviders.length > 0) {
              setPaymentProviders(fallbackProviders)
              console.log('Provider pagamento caricati senza regione:', fallbackProviders.length)
            }
          }
        } catch (err) {
          console.error('Errore nel caricamento payment providers senza regione:', err)
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento provider pagamento:', error)
    }
  }, [])

  // Carica il carrello esistente all'avvio
  useEffect(() => {
    getOrCreateCart().catch(console.error)
    fetchRegions().catch(console.error)
  }, [getOrCreateCart, fetchRegions])
  

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
    completeOrder,
    applyDiscountCode,
    removeDiscountCode,
    debugFetchPromotions
  }
}
