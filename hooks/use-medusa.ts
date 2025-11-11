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
  authorizePayment: (providerId: string, data?: any) => Promise<void>
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
      // Prova sia 'cart_id' che 'medusa_cart_id' per compatibilità
      let existingCartId = localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
      
      if (existingCartId) {
        try {
          const baseUrl = '/api/medusa'
          console.log('[GET OR CREATE CART] Tentativo di recuperare carrello:', existingCartId)
          const response = await fetch(`${baseUrl}/store/carts/${existingCartId}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          if (response.ok) {
            const existingCart = await response.json()
            const cart = existingCart.cart || existingCart
            setCart(cart)
            
            // Sincronizza entrambe le chiavi nel localStorage
            localStorage.setItem('medusa_cart_id', existingCartId)
            localStorage.setItem('cart_id', existingCartId)
            
            console.log('[GET OR CREATE CART] Carrello esistente recuperato:', {
              id: cart.id,
              items: cart.items?.length || 0,
              total: cart.total
            })
            return existingCartId
          } else {
            console.warn('[GET OR CREATE CART] Carrello non trovato, rimuovo dal localStorage')
            localStorage.removeItem('medusa_cart_id')
            localStorage.removeItem('cart_id')
            existingCartId = null
          }
        } catch (err) {
          console.error('[GET OR CREATE CART] Errore nel recupero del carrello:', err)
          // Se il carrello non esiste più, rimuovilo dal localStorage
          localStorage.removeItem('medusa_cart_id')
          localStorage.removeItem('cart_id')
          existingCartId = null
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
        const cart = newCart.cart || newCart
        const cartId = cart.id
        
        // Sincronizza entrambe le chiavi nel localStorage
        localStorage.setItem('medusa_cart_id', cartId)
        localStorage.setItem('cart_id', cartId)
        
        setCart(cart)
        console.log('[GET OR CREATE CART] Nuovo carrello creato:', {
          id: cart.id,
          items: cart.items?.length || 0
        })
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
        const updatedCartData = await response.json()
        const updatedCart = updatedCartData.cart || updatedCartData
        
        // Sincronizza entrambe le chiavi nel localStorage
        localStorage.setItem('medusa_cart_id', cartId)
        localStorage.setItem('cart_id', cartId)
        
        setCart(updatedCart)
        console.log('[ADD TO CART] Prodotto aggiunto al carrello:', {
          cart_id: updatedCart.id,
          items: updatedCart.items?.length || 0,
          total: updatedCart.total
        })
      } else {
        const error = await response.text()
        console.error('[ADD TO CART] Errore nell\'aggiunta al carrello:', error)
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
      
      // Prima recupera le shipping options disponibili per questo carrello specifico
      // Questo è importante perché le opzioni possono variare in base all'indirizzo di spedizione
      let availableOptions: any[] = []
      
      try {
        const optionsResponse = await fetch(`${baseUrl}/store/shipping-options/${cart.id}`, {
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
          }
        })
        
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json()
          availableOptions = optionsData.shipping_options || optionsData.options || optionsData || []
          console.log('[SHIPPING] Opzioni disponibili per carrello:', availableOptions.length)
        }
      } catch (optionsError) {
        console.warn('[SHIPPING] Impossibile recuperare opzioni specifiche, uso quelle generali')
      }
      
      // Se abbiamo opzioni disponibili, verifica che l'ID richiesto sia valido
      if (availableOptions.length > 0) {
        const isValidOption = availableOptions.some((opt: any) => opt.id === shippingMethodId)
        if (!isValidOption) {
          // Se l'opzione non è valida, usa la prima disponibile
          console.warn('[SHIPPING] Opzione richiesta non valida, uso la prima disponibile')
          shippingMethodId = availableOptions[0].id
        }
      }
      
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
        console.error('[SHIPPING] Errore nell\'aggiunta del metodo di spedizione:', errorText)
        
        // Se l'errore è che le opzioni non sono valide, prova a recuperare le opzioni corrette
        if (errorText.includes('invalid') || errorText.includes('Shipping Options')) {
          console.log('[SHIPPING] Tentativo di recuperare opzioni corrette...')
          
          // Prova a recuperare le opzioni dal carrello aggiornato
          const cartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          if (cartResponse.ok) {
            const cartData = await cartResponse.json()
            const updatedCart = cartData.cart || cartData
            
            // Se il carrello ha già un metodo di spedizione, va bene
            if (updatedCart.shipping_methods && updatedCart.shipping_methods.length > 0) {
              console.log('[SHIPPING] Carrello ha già metodo di spedizione')
              setCart(updatedCart)
              return
            }
          }
        }
        
        throw new Error(errorText)
      }
      
      const updatedCartData = await response.json()
      const updatedCart = updatedCartData.cart || updatedCartData
      setCart(updatedCart)
      console.log('[SHIPPING] ✅ Metodo spedizione aggiunto:', updatedCart)
    } catch (err) {
      console.error('[SHIPPING] Errore nell\'aggiunta del metodo di spedizione:', err)
      setError('Errore nell\'aggiunta del metodo di spedizione')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Aggiungi sessione di pagamento usando fetch dirette
  // In Medusa v2, le payment sessions potrebbero essere create automaticamente o richiedere un endpoint diverso
  const addPaymentSession = useCallback(async (providerId: string) => {
    if (!cart) {
      console.error('Errore nell\'aggiunta della sessione di pagamento: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      
      // Prova prima a verificare se ci sono già payment sessions nel carrello
      const cartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        const currentCart = cartData.cart || cartData
        
        // Se c'è già una payment session per questo provider, usala
        if (currentCart.payment_sessions && Array.isArray(currentCart.payment_sessions)) {
          const existingSession = currentCart.payment_sessions.find((ps: any) => ps.provider_id === providerId)
          if (existingSession) {
            console.log('[PAYMENT SESSION] Sessione già esistente per provider:', providerId)
            setCart(currentCart)
            return
          }
        }
        
        // In Medusa v2, potrebbe essere necessario inizializzare la payment collection
        // Verifica se esiste una payment_collection nel carrello
        if (!currentCart.payment_collection && currentCart.shipping_address && currentCart.shipping_methods?.length > 0) {
          console.log('[PAYMENT SESSION] Tentativo di inizializzare payment collection...')
          // In Medusa v2, la payment collection viene creata automaticamente quando si imposta
          // l'indirizzo di spedizione e si aggiunge un metodo di spedizione, ma potrebbe essere necessario
          // chiamare un endpoint specifico. Prova a recuperare il carrello aggiornato dopo aver impostato
          // l'indirizzo e il metodo di spedizione.
          const updatedCartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          if (updatedCartResponse.ok) {
            const updatedCartData = await updatedCartResponse.json()
            const updatedCart = updatedCartData.cart || updatedCartData
            if (updatedCart.payment_collection || updatedCart.payment_sessions?.length > 0) {
              console.log('[PAYMENT SESSION] Payment collection inizializzata automaticamente')
              setCart(updatedCart)
              // Se c'è già una payment session per questo provider, usala
              if (updatedCart.payment_sessions && Array.isArray(updatedCart.payment_sessions)) {
                const existingSession = updatedCart.payment_sessions.find((ps: any) => ps.provider_id === providerId)
                if (existingSession) {
                  console.log('[PAYMENT SESSION] Sessione già esistente per provider:', providerId)
                  return
                }
              }
            }
          }
        }
      }
      
      // Prova diversi endpoint possibili per creare la payment session
      const endpoints = [
        `/store/carts/${cart.id}/payment-sessions`,
        `/store/carts/${cart.id}/payment-session`,
        `/store/carts/${cart.id}/payment-providers/${providerId}/sessions`
      ]
      
      let lastError: any = null
      
      for (const endpoint of endpoints) {
        try {
          console.log('[PAYMENT SESSION] Tentativo endpoint:', endpoint)
          const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: JSON.stringify({
              provider_id: providerId
            })
          })
          
          if (response.ok) {
            const updatedCartData = await response.json()
            const updatedCart = updatedCartData.cart || updatedCartData
            setCart(updatedCart)
            console.log('[PAYMENT SESSION] ✅ Sessione pagamento aggiunta con endpoint:', endpoint)
            return
          } else {
            const errorText = await response.text()
            console.log('[PAYMENT SESSION] Endpoint fallito:', endpoint, response.status)
            lastError = errorText
          }
        } catch (err) {
          console.log('[PAYMENT SESSION] Errore con endpoint:', endpoint, err)
          lastError = err
        }
      }
      
      // Se nessun endpoint ha funzionato, prova a aggiornare il carrello con il provider
      // In alcuni casi, Medusa crea automaticamente le payment sessions quando si aggiorna il carrello
      console.log('[PAYMENT SESSION] Tentativo aggiornamento carrello con provider...')
      const updateResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          payment_provider_id: providerId
        })
      })
      
      if (updateResponse.ok) {
        const updatedCartData = await updateResponse.json()
        const updatedCart = updatedCartData.cart || updatedCartData
        setCart(updatedCart)
        console.log('[PAYMENT SESSION] ✅ Carrello aggiornato con provider')
        return
      }
      
      // Se tutto fallisce, lancia l'errore
      throw new Error(lastError || 'Impossibile creare sessione di pagamento. Verifica la configurazione del provider.')
    } catch (err) {
      console.error('[PAYMENT SESSION] Errore nell\'aggiunta della sessione di pagamento:', err)
      setError('Errore nell\'aggiunta della sessione di pagamento')
      throw err
    } finally {
      setLoadingCart(false)
    }
  }, [cart])

  // Autorizza la sessione di pagamento (necessario per Stripe e altri provider)
  const authorizePayment = useCallback(async (providerId: string, data?: any) => {
    if (!cart) {
      console.error('Errore nell\'autorizzazione del pagamento: Nessun carrello disponibile')
      throw new Error('Nessun carrello disponibile')
    }
    
    setLoadingCart(true)
    
    try {
      const baseUrl = '/api/medusa'
      
      // Trova la payment session per il provider
      const paymentSessions = cart.payment_sessions || []
      const paymentSession = paymentSessions.find((ps: any) => ps.provider_id === providerId)
      
      if (!paymentSession) {
        throw new Error(`Nessuna sessione di pagamento trovata per il provider ${providerId}`)
      }
      
      console.log('[AUTHORIZE PAYMENT] Authorizing payment session:', paymentSession.id)
      
      // Per Stripe, potrebbe essere necessario autorizzare con i dati della carta
      // L'endpoint può variare a seconda della versione di Medusa
      const authorizeUrl = `${baseUrl}/store/carts/${cart.id}/payment-sessions/${paymentSession.id}/authorize`
      
      const response = await fetch(authorizeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: data ? JSON.stringify(data) : undefined
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AUTHORIZE PAYMENT] Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        })
        
        // Prova un endpoint alternativo (alcune versioni di Medusa usano un formato diverso)
        if (response.status === 404) {
          console.log('[AUTHORIZE PAYMENT] Trying alternative endpoint format...')
          const altUrl = `${baseUrl}/store/carts/${cart.id}/payment-sessions/${providerId}/authorize`
          const altResponse = await fetch(altUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: data ? JSON.stringify(data) : undefined
          })
          
          if (!altResponse.ok) {
            const altErrorText = await altResponse.text()
            console.error('[AUTHORIZE PAYMENT] Alternative endpoint also failed:', altErrorText)
            throw new Error(altErrorText || 'Errore nell\'autorizzazione del pagamento')
          }
          
          const altUpdatedCartData = await altResponse.json()
          const altUpdatedCart = altUpdatedCartData.cart || altUpdatedCartData
          setCart(altUpdatedCart)
          console.log('[AUTHORIZE PAYMENT] ✅ Pagamento autorizzato (alternative endpoint):', altUpdatedCart)
          return
        }
        
        throw new Error(errorText || 'Errore nell\'autorizzazione del pagamento')
      }
      
      const updatedCartData = await response.json()
      const updatedCart = updatedCartData.cart || updatedCartData
      setCart(updatedCart)
      console.log('[AUTHORIZE PAYMENT] ✅ Pagamento autorizzato con successo:', updatedCart)
      
      // Verifica che la payment session sia autorizzata
      const updatedPaymentSessions = updatedCart.payment_sessions || []
      const updatedPaymentSession = updatedPaymentSessions.find((ps: any) => ps.provider_id === providerId)
      
      if (updatedPaymentSession) {
        console.log('[AUTHORIZE PAYMENT] Payment session status:', updatedPaymentSession.status)
        if (updatedPaymentSession.status !== 'authorized' && updatedPaymentSession.status !== 'pending') {
          console.warn('[AUTHORIZE PAYMENT] ⚠️ Payment session status is not authorized:', updatedPaymentSession.status)
        }
      }
    } catch (err) {
      console.error('[AUTHORIZE PAYMENT] Errore nell\'autorizzazione del pagamento:', err)
      setError('Errore nell\'autorizzazione del pagamento')
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
      
      // PRIMA di completare, recupera il carrello aggiornato da Medusa per assicurarsi di avere i dati più recenti
      console.log('[COMPLETE ORDER] Recupero carrello aggiornato prima del complete...')
      const cartCheckResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (!cartCheckResponse.ok) {
        throw new Error('Impossibile recuperare il carrello prima del completamento')
      }
      
      const cartCheckData = await cartCheckResponse.json()
      let updatedCart = cartCheckData.cart || cartCheckData
      
      // Verifica che il carrello abbia items
      if (!updatedCart.items || updatedCart.items.length === 0) {
        console.error('[COMPLETE ORDER] ❌ Carrello vuoto! Items:', updatedCart.items)
        throw new Error('Il carrello è vuoto. Aggiungi prodotti prima di completare l\'ordine.')
      }
      
      // Verifica che il carrello abbia shipping methods
      if (!updatedCart.shipping_methods || updatedCart.shipping_methods.length === 0) {
        console.warn('[COMPLETE ORDER] ⚠️ Nessun metodo di spedizione nel carrello')
        // Non bloccare, ma avvisa
      }
      
      // Verifica che la payment collection sia inizializzata PRIMA di completare l'ordine
      // Questo è obbligatorio in Medusa v2
      // IMPORTANTE: Verifica sempre dal carrello aggiornato, non dallo stato locale
      console.log('[COMPLETE ORDER] Verifica payment collection dal carrello aggiornato:', {
        hasShippingAddress: !!updatedCart.shipping_address,
        hasShippingMethods: updatedCart.shipping_methods?.length > 0,
        hasPaymentCollection: !!updatedCart.payment_collection,
        hasPaymentSessions: updatedCart.payment_sessions?.length > 0
      })
      
      if (!updatedCart.payment_collection && !updatedCart.payment_sessions?.length) {
        console.error('[COMPLETE ORDER] ❌ Payment collection non inizializzata!')
        
        // Se abbiamo shipping_address e shipping_methods, la payment collection dovrebbe essere inizializzata
        // Prova a attendere e riprovare più volte
        if (updatedCart.shipping_address && updatedCart.shipping_methods?.length > 0) {
          console.log('[COMPLETE ORDER] Tentativo di attendere l\'inizializzazione della payment collection...')
          
          let paymentCollectionInitialized = false
          for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const retryCartResponse = await fetch(`${baseUrl}/store/carts/${cart.id}`, {
              headers: {
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              }
            })
            
            if (retryCartResponse.ok) {
              const retryCartData = await retryCartResponse.json()
              const retryCart = retryCartData.cart || retryCartData
              
              console.log('[COMPLETE ORDER] Retry', i + 1, ':', {
                hasPaymentCollection: !!retryCart.payment_collection,
                hasPaymentSessions: retryCart.payment_sessions?.length > 0
              })
              
              if (retryCart.payment_collection || retryCart.payment_sessions?.length > 0) {
                console.log('[COMPLETE ORDER] ✅ Payment collection inizializzata dopo', (i + 1) * 500, 'ms')
                updatedCart = retryCart
                paymentCollectionInitialized = true
                break
              }
            }
          }
          
          if (!paymentCollectionInitialized) {
            throw new Error('Payment collection non è stata inizializzata. Assicurati che l\'indirizzo di spedizione e il metodo di spedizione siano stati impostati correttamente.')
          }
        } else {
          console.error('[COMPLETE ORDER] ❌ Dati mancanti:', {
            hasShippingAddress: !!updatedCart.shipping_address,
            hasShippingMethods: updatedCart.shipping_methods?.length > 0
          })
          throw new Error('Payment collection non può essere inizializzata: mancano indirizzo di spedizione o metodo di spedizione. Assicurati di aver compilato tutti i campi obbligatori nel form di checkout.')
        }
      }
      
      // Verifica che il carrello abbia payment sessions
      if (!updatedCart.payment_sessions || updatedCart.payment_sessions.length === 0) {
        console.warn('[COMPLETE ORDER] ⚠️ Nessuna payment session nel carrello, ma payment collection è inizializzata')
      }
      
      // Verifica che il totale sia > 0
      const total = updatedCart.total || updatedCart.subtotal || 0
      if (total === 0) {
        console.error('[COMPLETE ORDER] ❌ Totale carrello è 0!')
        console.error('[COMPLETE ORDER] Cart details:', {
          items: updatedCart.items?.length || 0,
          subtotal: updatedCart.subtotal,
          total: updatedCart.total,
          shipping_total: updatedCart.shipping_total,
          discount_total: updatedCart.discount_total
        })
        throw new Error('Il totale dell\'ordine è 0. Verifica che ci siano prodotti nel carrello.')
      }
      
      console.log('[COMPLETE ORDER] Carrello verificato:', {
        items: updatedCart.items?.length || 0,
        subtotal: updatedCart.subtotal,
        total: updatedCart.total,
        shipping_methods: updatedCart.shipping_methods?.length || 0,
        payment_sessions: updatedCart.payment_sessions?.length || 0
      })
      
      // Aggiorna lo stato del carrello con i dati più recenti
      setCart(updatedCart)
      
      // Ora completa l'ordine
      const response = await fetch(`${baseUrl}/store/carts/${updatedCart.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      console.log('[COMPLETE ORDER] Request to:', `${baseUrl}/store/carts/${updatedCart.id}/complete`)
      console.log('[COMPLETE ORDER] Cart ID:', updatedCart.id)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[COMPLETE ORDER] Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        })
        
        // Prova a parsare l'errore per ottenere un messaggio più specifico
        let errorMessage = errorText
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorData.details || errorText
          console.error('[COMPLETE ORDER] Parsed error:', errorData)
        } catch {
          // Se non è JSON, usa il testo così com'è
        }
        
        throw new Error(errorMessage)
      }
      
      const orderData = await response.json()
      const order = orderData.order || orderData
      
      console.log('[COMPLETE ORDER] ✅ Ordine completato con successo:', {
        order_id: order.id,
        display_id: order.display_id,
        total: order.total,
        items: order.items?.length || 0,
        payment_status: order.payment_status,
        payment_collections: order.payment_collections?.length || 0
      })
      
      // Verifica che l'ordine abbia items
      if (!order.items || order.items.length === 0) {
        console.error('[COMPLETE ORDER] ❌ Ordine creato senza items!')
        console.error('[COMPLETE ORDER] Order details:', JSON.stringify(order, null, 2))
      }
      
      // Verifica che l'ordine abbia un totale > 0
      if (order.total === 0) {
        console.error('[COMPLETE ORDER] ❌ Ordine creato con totale 0!')
        console.error('[COMPLETE ORDER] Order details:', JSON.stringify(order, null, 2))
      }
      
      // Rimuovi il carrello dal localStorage dopo il completamento
      localStorage.removeItem('medusa_cart_id')
      localStorage.removeItem('cart_id')
      setCart(null)
      
      return order
    } catch (err) {
      console.error('[COMPLETE ORDER] Errore nel completamento dell\'ordine:', err)
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
        
        // Se la risposta non è OK, estrai il messaggio di errore specifico da Medusa
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[DISCOUNT CODE] Errore HTTP:', {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText.substring(0, 500)
          })
          
          // Prova a parsare l'errore come JSON
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            // Se non è JSON, usa il testo come messaggio
            errorData = { message: errorText || 'Codice promozionale non valido' }
          }
          
          // Estrai il messaggio di errore più specifico possibile
          // Medusa può restituire errori in diversi formati
          const errorMessage = errorData.message || 
                               errorData.error?.message || 
                               errorData.error || 
                               (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                               (errorData.details && errorData.details.message) ||
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
        // L'endpoint specifico /discounts non esiste, proviamo con l'aggiornamento del carrello
        // Usiamo POST /store/carts/{id} con il campo discounts
        if (err.message.includes('Cannot POST') || err.message.includes('404') || err.message.includes('ENDPOINT_NOT_AVAILABLE')) {
          console.log('[DISCOUNT CODE] Endpoint /discounts non disponibile, uso aggiornamento carrello con campo discounts')
          
          // Prepara i discount codes esistenti più il nuovo
          const existingDiscounts = currentCart.discounts || []
          // Evita duplicati
          const existingCodes = existingDiscounts.map((d: any) => (d.code || d.discount?.code || '').toUpperCase())
          if (!existingCodes.includes(codeToApply)) {
            const newDiscounts = [...existingDiscounts, { code: codeToApply }]
            
            const requestBody = {
              discounts: newDiscounts
            }
            
            console.log('[DISCOUNT CODE] Body richiesta aggiornamento carrello:', JSON.stringify(requestBody, null, 2))
            
            try {
              response = await fetch(`${baseUrl}/store/carts/${currentCart.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
                },
                body: JSON.stringify(requestBody)
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
                
                // Se l'errore è "Unrecognized fields: 'discounts'", significa che il backend non supporta questo campo
                const errorMessage = errorData.message || errorData.error?.message || errorData.error || ''
                if (errorMessage.includes("Unrecognized fields: 'discounts'") || 
                    errorMessage.includes("Unrecognized fields: discounts") ||
                    (errorMessage.includes("discounts") && errorMessage.includes("Unrecognized"))) {
                  console.error('[DISCOUNT CODE] Campo discounts non riconosciuto dal backend Medusa')
                  throw new Error('FORMATO_DISCOUNT_NON_SUPPORTATO')
                }
                
                const finalErrorMessage = errorMessage || 
                                         (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                                         'Codice promozionale non valido'
                
                throw new Error(finalErrorMessage)
              }
              
              const contentType = response.headers.get('content-type')
              if (!contentType || !contentType.includes('application/json')) {
                const errorText = await response.text()
                console.error('[DISCOUNT CODE] Risposta non-JSON da Medusa:', errorText.substring(0, 200))
                throw new Error('Medusa ha restituito una risposta non valida. Verifica che il codice promozionale esista.')
              }
              
              updatedCart = await response.json()
              cartData = updatedCart.cart || updatedCart
              
              console.log('[DISCOUNT CODE] ✅ Carrello aggiornato con codice promozionale:', {
                discounts: cartData.discounts,
                discountTotal: cartData.discount_total
              })
            } catch (fallbackErr: any) {
              if (fallbackErr.message === 'FORMATO_DISCOUNT_NON_SUPPORTATO') {
                // Se il formato discounts non è supportato, il backend Medusa non supporta questa funzionalità
                // oppure richiede una configurazione diversa
                console.error('[DISCOUNT CODE] Il campo discounts non è supportato da questa versione/configurazione di Medusa')
                throw new Error('Il codice promozionale non può essere applicato tramite questa interfaccia. Contatta il supporto per verificare la configurazione del backend.')
              }
              throw fallbackErr
            }
          } else {
            // Il codice è già applicato
            console.log('[DISCOUNT CODE] Codice già applicato al carrello')
            cartData = currentCart
          }
        } else {
          // Per altri errori, propaghiamo l'errore originale
          throw err
        }
      }
      
      console.log('[DISCOUNT CODE] Carrello aggiornato da Medusa:', {
        hasCart: !!cartData,
        discounts: cartData.discounts,
        discountsLength: cartData.discounts?.length || 0,
        discountTotal: cartData.discount_total || 0,
        cartDataFull: JSON.stringify(cartData, null, 2).substring(0, 1000)
      })
      
      // DEBUG: Verifica se ci sono altri campi che potrebbero contenere i discount codes
      if (!cartData.discounts || (Array.isArray(cartData.discounts) && cartData.discounts.length === 0)) {
        console.warn('[DISCOUNT CODE] ⚠️ ATTENZIONE: discounts è undefined/null/vuoto nel carrello!')
        console.warn('[DISCOUNT CODE] Cercando campi alternativi...')
        console.warn('[DISCOUNT CODE] cartData.discount_codes:', cartData.discount_codes)
        console.warn('[DISCOUNT CODE] cartData.applied_discounts:', cartData.applied_discounts)
        console.warn('[DISCOUNT CODE] cartData.promotions:', cartData.promotions)
        console.warn('[DISCOUNT CODE] cartData.discount_rules:', cartData.discount_rules)
        console.warn('[DISCOUNT CODE] Tutti i campi del carrello:', Object.keys(cartData))
        console.warn('[DISCOUNT CODE] Struttura completa del carrello (primi 2000 caratteri):', JSON.stringify(cartData, null, 2).substring(0, 2000))
      }
      
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
      
      // Usa l'endpoint specifico per rimuovere il discount code
      const response = await fetch(`${baseUrl}/store/carts/${cart.id}/discounts/${codeToRemove}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || 'Errore nella rimozione del codice' }
        }
        
        // Estrai il messaggio di errore più specifico possibile
        const errorMessage = errorData.message || 
                             errorData.error?.message || 
                             errorData.error || 
                             (errorData.errors && errorData.errors[0]?.message) ||
                             'Errore nella rimozione del codice promozionale'
        
        throw new Error(errorMessage)
      }
      
      const updatedCart = await response.json()
      setCart(updatedCart.cart || updatedCart)
      console.log('Codice promozionale rimosso:', updatedCart.cart || updatedCart)
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

  // Funzione per ricaricare il carrello da Medusa
  const reloadCart = useCallback(async (cartId: string) => {
    try {
      const baseUrl = '/api/medusa'
      const cartResponse = await fetch(`${baseUrl}/store/carts/${cartId}`, {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json()
        const cart = cartData.cart || cartData
        setCart(cart)
        
        console.log('[RELOAD CART] Carrello ricaricato:', {
          id: cart.id,
          items: cart.items?.length || 0,
          total: cart.total
        })
        return cart
      }
    } catch (error) {
      console.error('[RELOAD CART] Errore nel ricaricamento del carrello:', error)
    }
    return null
  }, [])

  // Carica il carrello esistente all'avvio
  useEffect(() => {
    const initCart = async () => {
      try {
        const cartId = await getOrCreateCart()
        console.log('[USE MEDUSA INIT] Carrello inizializzato:', cartId)
        
        // Ricarica il carrello per assicurarsi di avere i dati più recenti
        await reloadCart(cartId)
      } catch (error) {
        console.error('[USE MEDUSA INIT] Errore nell\'inizializzazione del carrello:', error)
      }
    }
    
    initCart()
    fetchRegions().catch(console.error)
  }, [getOrCreateCart, fetchRegions, reloadCart])

  // Ascolta i cambiamenti nel localStorage per sincronizzare il carrello
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Se cambia cart_id o medusa_cart_id, ricarica il carrello
      if (e.key === 'cart_id' || e.key === 'medusa_cart_id') {
        const newCartId = e.newValue
        if (newCartId && newCartId !== cart?.id) {
          console.log('[STORAGE SYNC] Carrello cambiato nel localStorage, ricarico:', newCartId)
          reloadCart(newCartId).catch(console.error)
        }
      }
    }

    // Ascolta anche i cambiamenti nello stesso tab (non solo tra tab)
    const checkCartId = () => {
      const currentCartId = localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
      if (currentCartId && currentCartId !== cart?.id) {
        console.log('[STORAGE SYNC] Carrello cambiato, ricarico:', currentCartId)
        reloadCart(currentCartId).catch(console.error)
      }
    }

    // Ascolta l'evento custom quando viene aggiunto un prodotto
    const handleCartUpdated = (e: CustomEvent) => {
      const cartId = e.detail?.cartId
      if (cartId && cartId !== cart?.id) {
        console.log('[CART UPDATED EVENT] Carrello aggiornato, ricarico:', cartId)
        reloadCart(cartId).catch(console.error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCartUpdated as EventListener)
    
    // Controlla periodicamente se il cart_id è cambiato (per sincronizzare con altri componenti)
    const interval = setInterval(checkCartId, 2000) // Controlla ogni 2 secondi
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdated as EventListener)
      clearInterval(interval)
    }
  }, [cart?.id, reloadCart])
  

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
    authorizePayment,
    completeOrder,
    applyDiscountCode,
    removeDiscountCode,
    debugFetchPromotions
  }
}
