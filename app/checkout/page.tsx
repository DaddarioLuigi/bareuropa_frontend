"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Forza il rendering dinamico per evitare problemi di pre-rendering
export const dynamic = 'force-dynamic'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useMedusa } from "@/hooks/use-medusa"
import { CreditCard, Truck, MapPin, Lock, Tag, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Funzione helper per ottenere un nome user-friendly per i payment providers
function getPaymentProviderName(providerId: string): string {
  const providerNames: Record<string, string> = {
    'pp_stripe_stripe': 'Carta di Credito',
    'stripe': 'Carta di Credito',
    'pp_stripe': 'Carta di Credito',
    'paypal': 'PayPal',
    'pp_paypal': 'PayPal',
    'manual': 'Pagamento Manuale',
  }
  
  // Se c'è un nome mappato, usalo
  if (providerNames[providerId]) {
    return providerNames[providerId]
  }
  
  // Altrimenti, pulisci l'ID rimuovendo prefissi comuni
  let cleanName = providerId
    .replace(/^pp_/i, '') // Rimuovi prefisso "pp_"
    .replace(/_/g, ' ') // Sostituisci underscore con spazi
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return cleanName
}

export default function CheckoutPage() {
  const { state } = useCart()
  const medusa = useMedusa()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)
  const [isApplyingPromoCode, setIsApplyingPromoCode] = useState(false)
  const [fallbackCartItems, setFallbackCartItems] = useState<any[]>([])
  const [fallbackFetched, setFallbackFetched] = useState(false)
  // Stato stabile per il riepilogo nel checkout (non soggetto ai reload di useMedusa)
  const [summaryItems, setSummaryItems] = useState<any[]>([])
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false)
  const [summaryCartId, setSummaryCartId] = useState<string | null>(null)

  // Sincronizza il cart_id dal cookie (usato nelle pagine server) al localStorage (usato nel client)
  useEffect(() => {
    const syncCartIdFromCookie = async () => {
      try {
        const res = await fetch('/api/cart/id', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const cookieCartId = data?.cart_id
          if (cookieCartId) {
            const lsId = localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
            if (lsId !== cookieCartId) {
              localStorage.setItem('medusa_cart_id', cookieCartId)
              localStorage.setItem('cart_id', cookieCartId)
              setSummaryCartId(cookieCartId)
              window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartId: cookieCartId } }))
              console.log('[CHECKOUT] cart_id sincronizzato dal cookie:', cookieCartId)
            }
          }
        }
      } catch (err) {
        console.warn('[CHECKOUT] Impossibile sincronizzare cart_id dal cookie:', err)
      }
    }
    syncCartIdFromCookie()
  }, [])

  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",

    // Billing Information (if different)
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingProvince: "",

    // Payment Information
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Additional
    notes: "",
    terms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Risolvi l'ID carrello in modo robusto
      const resolvedCartId = medusa.cart?.id || summaryCartId || localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
      console.log('[CHECKOUT][SUBMIT] Resolved cartId:', resolvedCartId, {
        medusaCartId: medusa.cart?.id,
        summaryCartId,
        ls_medusa_cart_id: localStorage.getItem('medusa_cart_id'),
        ls_cart_id: localStorage.getItem('cart_id'),
      })
      // Log dello stato UI/Medusa
      const dbgUiItems = (Array.isArray(summaryItems) && summaryItems.length > 0 ? summaryItems : (Array.isArray(fallbackCartItems) ? fallbackCartItems : [])) || []
      console.log('[CHECKOUT][SUBMIT] UI items snapshot:', dbgUiItems.map((it: any) => ({
        id: it.id, variant_id: it.variant_id, quantity: it.quantity, unit_price: it.unit_price, title: it.product_title || it.title
      })))
      console.log('[CHECKOUT][SUBMIT] medusa.cart snapshot:', medusa.cart ? {
        id: medusa.cart.id,
        items: medusa.cart.items?.map((it: any) => ({ id: it.id, variant_id: it.variant_id, quantity: it.quantity, unit_price: it.unit_price })) || [],
        subtotal: medusa.cart.subtotal, total: medusa.cart.total
      } : null)
      if (!resolvedCartId) {
        throw new Error('Nessun carrello disponibile')
      }
      
      // IMPORTANTE: Usa summaryItems come fonte primaria se disponibile
      // summaryItems è la fonte più affidabile perché viene caricata direttamente dal server
      const primaryUiItems = Array.isArray(summaryItems) && summaryItems.length > 0 
        ? summaryItems 
        : (Array.isArray(medusa.cart?.items) && medusa.cart.items.length > 0 
          ? medusa.cart.items 
          : (Array.isArray(fallbackCartItems) && fallbackCartItems.length > 0 
            ? fallbackCartItems 
            : []))
      
      console.log('[CHECKOUT][SUBMIT] Primary UI items source:', {
        hasSummaryItems: Array.isArray(summaryItems) && summaryItems.length > 0,
        summaryItemsCount: summaryItems.length,
        hasMedusaItems: Array.isArray(medusa.cart?.items) && medusa.cart.items.length > 0,
        medusaItemsCount: medusa.cart?.items?.length || 0,
        hasFallbackItems: Array.isArray(fallbackCartItems) && fallbackCartItems.length > 0,
        fallbackItemsCount: fallbackCartItems.length,
        primaryUiItemsCount: primaryUiItems.length,
        primaryUiItems: primaryUiItems.map((it: any) => ({ 
          variant_id: it.variant_id, 
          quantity: it.quantity, 
          title: it.product_title || it.title 
        }))
      })
      
      const baseUrl = '/api/medusa'
      // Recupera SEMPRE il carrello più recente dal server
      const fetchCart = async (cartId: string) => {
        // Espandi per assicurare che items siano inclusi
        const url = `${baseUrl}/store/carts/${cartId}?expand=items,items.variant,items.variant.product,items.product,region,shipping_address,billing_address,payment_sessions,shipping_methods,discounts`
        console.log('[CHECKOUT][FETCH CART] GET', url)
        const res = await fetch(url, {
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
          }
        })
        console.log('[CHECKOUT][FETCH CART] Response:', res.status, res.statusText)
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(errorText || 'Impossibile recuperare il carrello')
        }
        const data = await res.json()
        
        // Gestisci diversi formati di risposta
        let cart: any = null
        
        // Se data è un array, non è un formato valido per un carrello
        if (Array.isArray(data)) {
          console.warn('[CHECKOUT] Risposta è un array invece di un oggetto carrello:', data.length, 'elementi')
          return { id: resolvedCartId, items: [] }
        }
        
        // Prova a estrarre il carrello dalla risposta
        if (data.cart && typeof data.cart === 'object' && !Array.isArray(data.cart)) {
          cart = data.cart
        } else if (data.id || data.items) {
          // Se data ha già id o items, è già il carrello
          cart = data
        } else {
          console.warn('[CHECKOUT] Risposta carrello non valida (struttura):', {
            hasCart: !!data.cart,
            hasId: !!data.id,
            hasItems: !!data.items,
            keys: Object.keys(data || {})
          })
          return { id: resolvedCartId, items: [] }
        }
        
        // Valida struttura minima del carrello
        if (!cart || typeof cart !== 'object' || Array.isArray(cart)) {
          console.warn('[CHECKOUT] Risposta carrello non valida (tipo):', typeof cart, Array.isArray(cart))
          return { id: resolvedCartId, items: [] }
        }
        
        // Normalizza il carrello assicurandosi che items sia sempre un array
        const normalized = {
          id: cart.id || resolvedCartId,
          ...cart,
          items: Array.isArray(cart.items) ? cart.items : []
        }
        
        console.log('[CHECKOUT][FETCH CART] Normalized cart:', {
          id: normalized.id,
          itemsCount: normalized.items?.length || 0,
          items: normalized.items?.map((it: any) => ({ id: it.id, variant_id: it.variant_id, quantity: it.quantity, unit_price: it.unit_price })) || [],
          subtotal: normalized.subtotal, total: normalized.total
        })
        return normalized
      }
      // Se il carrello sul server è vuoto ma la UI ha items, reintegra gli items sul server
      const ensureServerCartHasItems = async (cartId: string, uiItemsToUse: any[]) => {
        // Usa gli items passati come parametro (già risolti con priorità summaryItems)
        const uiItems = uiItemsToUse || []
        console.log('[CHECKOUT][HYDRATE] Using UI items for hydration:', {
          count: uiItems.length,
          items: uiItems.map((it: any) => ({ variant_id: it.variant_id, quantity: it.quantity, title: it.product_title || it.title }))
        })
        if (!uiItems || uiItems.length === 0) {
          console.warn('[CHECKOUT][HYDRATE] Nessun item UI disponibile per idratazione')
          return null
        }
        // Recupera lo stato attuale del carrello
        let serverCart = await fetchCart(cartId)
        const serverItems = Array.isArray(serverCart.items) ? serverCart.items : []
        // Crea una mappa server: variant_id -> { id, quantity }
        const serverByVariant: Record<string, { id: string, quantity: number }> = {}
        for (const it of serverItems) {
          if (it?.variant_id) {
            serverByVariant[it.variant_id] = { id: it.id, quantity: it.quantity || 0 }
          }
        }
        // Per ogni item UI, se assente su server lo aggiunge, se quantità diversa la aggiorna
        for (const ui of uiItems) {
          const variantId: string | undefined = ui?.variant_id
          const qty: number = Number(ui?.quantity || 1)
          if (!variantId || qty <= 0) continue
          const serverLine = serverByVariant[variantId]
          if (!serverLine) {
            // Aggiungi line item
            console.log('[CHECKOUT][HYDRATE] Adding line item:', { cartId, variantId, quantity: qty })
            const addRes = await fetch(`${baseUrl}/store/carts/${cartId}/line-items`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              },
              body: JSON.stringify({ variant_id: variantId, quantity: qty })
            })
            console.log('[CHECKOUT][HYDRATE] Add line item response:', addRes.status, addRes.statusText)
            if (!addRes.ok) {
              const txt = await addRes.text()
              console.warn('[CHECKOUT] Impossibile aggiungere item al carrello server:', txt)
            }
          } else if (serverLine.quantity !== qty) {
            // Aggiorna quantità
            console.log('[CHECKOUT][HYDRATE] Updating line item qty:', { cartId, lineId: serverLine.id, quantity: qty })
            const updRes = await fetch(`${baseUrl}/store/carts/${cartId}/line-items/${serverLine.id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              },
              body: JSON.stringify({ quantity: qty })
            })
            console.log('[CHECKOUT][HYDRATE] Update line item response:', updRes.status, updRes.statusText)
            if (!updRes.ok) {
              const txt = await updRes.text()
              console.warn('[CHECKOUT] Impossibile aggiornare quantità item:', txt)
            }
          }
        }
        // Attendi un momento per permettere al server di aggiornare il carrello
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Ricarica carrello dal server con retry
        let retries = 3
        while (retries > 0) {
          serverCart = await fetchCart(cartId)
          if (serverCart.items && serverCart.items.length > 0) {
            break
          }
          retries--
          if (retries > 0) {
            console.log('[CHECKOUT][HYDRATE] Carrello ancora vuoto, retry in 500ms...')
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
        
        console.log('[CHECKOUT][HYDRATE] Server cart after hydrate:', {
          id: serverCart?.id, 
          itemsCount: serverCart?.items?.length || 0,
          items: serverCart?.items?.map((it: any) => ({ variant_id: it.variant_id, quantity: it.quantity })) || [],
          subtotal: serverCart?.subtotal, total: serverCart?.total
        })
        return serverCart
      }
      // IMPORTANTE: Se abbiamo items UI (soprattutto summaryItems), idrata PRIMA il carrello sul server
      // Questo assicura che il carrello sul server sia sempre sincronizzato con quello mostrato in UI
      let currentCart = await fetchCart(resolvedCartId)
      
      // Se abbiamo items UI ma il server non li ha, idrata immediatamente
      if (primaryUiItems.length > 0) {
        const serverItemsCount = Array.isArray(currentCart.items) ? currentCart.items.length : 0
        const serverTotalQty = Array.isArray(currentCart.items) 
          ? currentCart.items.reduce((sum, it) => sum + (it.quantity || 1), 0) 
          : 0
        const uiTotalQty = primaryUiItems.reduce((sum, it) => sum + (it.quantity || 1), 0)
        
        console.log('[CHECKOUT] Verifica sincronizzazione carrello:', {
          serverItemsCount,
          serverTotalQty,
          uiItemsCount: primaryUiItems.length,
          uiTotalQty,
          needsHydration: serverItemsCount === 0 || serverTotalQty !== uiTotalQty
        })
        
        // Se il server ha 0 items o quantità diverse, idrata
        if (serverItemsCount === 0 || serverTotalQty !== uiTotalQty) {
          console.warn('[CHECKOUT] Server cart non sincronizzato con UI: reintegro items sul server')
          const hydrated = await ensureServerCartHasItems(resolvedCartId, primaryUiItems)
          if (hydrated && Array.isArray(hydrated.items) && hydrated.items.length > 0) {
            currentCart = hydrated
            console.log('[CHECKOUT] ✅ Carrello idratato con successo:', {
              itemsCount: hydrated.items.length,
              totalQty: hydrated.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0)
            })
          } else {
            // Se ancora vuoto, attendi e riprova
            await new Promise(r => setTimeout(r, 500))
            const retried = await fetchCart(resolvedCartId)
            if (retried?.items?.length > 0) {
              currentCart = retried
            } else {
              // Ultimo tentativo di idratazione
              console.warn('[CHECKOUT] Ultimo tentativo di idratazione...')
              const finalHydrated = await ensureServerCartHasItems(resolvedCartId, primaryUiItems)
              if (finalHydrated && Array.isArray(finalHydrated.items) && finalHydrated.items.length > 0) {
                currentCart = finalHydrated
              }
            }
          }
        }
      }
      // Considera valido anche se il totale/subtotale è > 0
      const hasMonetaryTotal = (Number(currentCart.total) > 0) || (Number(currentCart.subtotal) > 0)
      if ((!currentCart.items || currentCart.items.length === 0) && !hasMonetaryTotal) {
        console.error('[CHECKOUT] Carrello vuoto! Items:', currentCart.items)
        throw new Error('Il carrello è vuoto. Aggiungi prodotti prima di procedere al checkout.')
      }
      const currentTotal = currentCart.total ?? currentCart.subtotal ?? 0
      if (currentTotal === 0) {
        console.error('[CHECKOUT] Totale carrello è 0!', {
          items: currentCart.items?.length || 0,
          subtotal: currentCart.subtotal,
          total: currentCart.total
        })
        throw new Error('Il totale dell\'ordine è 0. Verifica che ci siano prodotti nel carrello.')
      }
      console.log('[CHECKOUT] Carrello verificato (server):', {
        items: currentCart.items?.length || 0,
        subtotal: currentCart.subtotal,
        total: currentCart.total
      })

      // Recupera il codice paese corretto dalla regione del carrello
      // Medusa usa codici ISO-2 in minuscolo (es: "it", "fr", "de")
      let countryCode = "it" // Fallback a Italia
      
      if (currentCart?.region?.id) {
        try {
          // Recupera la regione completa con i paesi disponibili
          const regionResponse = await fetch(`${baseUrl}/store/regions/${currentCart.region.id}`)
          if (regionResponse.ok) {
            const regionData = await regionResponse.json()
            const region = regionData.region || regionData
            // Cerca l'Italia nella lista dei paesi della regione
            if (region.countries && Array.isArray(region.countries)) {
              const italy = region.countries.find((c: any) => 
                c.iso_2?.toLowerCase() === "it" || 
                c.name?.toUpperCase() === "ITALY" ||
                c.display_name?.toLowerCase() === "italy"
              )
              if (italy?.iso_2) {
                countryCode = italy.iso_2.toLowerCase()
              }
            }
          }
        } catch (regionError) {
          console.warn('Impossibile recuperare la regione, uso fallback "it":', regionError)
        }
      }

      // Imposta l'indirizzo di spedizione (senza email, non accettata dall'API Medusa nell'indirizzo)
      const shippingAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        country_code: countryCode, // Usa il codice paese corretto dalla regione
        postal_code: formData.postalCode,
        province: formData.province,
        phone: formData.phone
      }

      // Imposta sia l'indirizzo di spedizione che l'email in una singola chiamata
      // (l'email va nel carrello, non nell'indirizzo di spedizione)
      const cartUpdateBody: any = {
        shipping_address: shippingAddress
      }
      
      // Aggiungi l'email se presente (va nel carrello, non nell'indirizzo)
      if (formData.email) {
        cartUpdateBody.email = formData.email
      }
      
      const cartUpdateResponse = await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify(cartUpdateBody)
      })
      console.log('[CHECKOUT][SET SHIPPING+EMAIL] Response:', cartUpdateResponse.status, cartUpdateResponse.statusText)
      
      if (!cartUpdateResponse.ok) {
        const errorText = await cartUpdateResponse.text()
        console.error('Errore nell\'impostazione dell\'indirizzo di spedizione:', errorText)
        throw new Error(errorText)
      }
      
      // Aggiorna lo stato del carrello chiamando setShippingAddress che gestisce l'aggiornamento dello stato
      // Questo evita duplicazioni e mantiene la coerenza con il resto del codice
      try {
        await medusa.setShippingAddress(shippingAddress)
      } catch {
        // Non bloccare, proseguiamo con il cart aggiornato dal server
      }

      // Se l'indirizzo di fatturazione è diverso, impostalo
      if (!sameAsShipping) {
        const billingAddress = {
          first_name: formData.billingFirstName,
          last_name: formData.billingLastName,
          address_1: formData.billingAddress,
          city: formData.billingCity,
          country_code: countryCode, // Usa lo stesso codice paese
          postal_code: formData.billingPostalCode,
          province: formData.billingProvince
        }
        try {
          await medusa.setBillingAddress(billingAddress)
        } catch {
          // Ignora errori non bloccanti
        }
      } else {
        try {
          await medusa.setBillingAddress(shippingAddress)
        } catch {
          // Ignora errori non bloccanti
        }
      }

      // Aggiungi metodo di spedizione da Medusa
      // Se ci sono opzioni disponibili, usa la prima, altrimenti usa spedizione gratuita
      try {
        // Prova a recuperare opzioni specifiche per il carrello corrente
        let optionId: string | null = null
        try {
          const optRes = await fetch(`${baseUrl}/store/shipping-options?cart_id=${encodeURIComponent(resolvedCartId)}`, {
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          if (optRes.ok) {
            const optData = await optRes.json()
            const options = optData.shipping_options || optData.options || []
            if (Array.isArray(options) && options.length > 0) {
              optionId = options[0].id
            }
          }
        } catch {}
        if (optionId) {
          console.log('[CHECKOUT][ADD SHIPPING METHOD] Using option:', optionId)
          await fetch(`${baseUrl}/store/carts/${resolvedCartId}/shipping-methods`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: JSON.stringify({ option_id: optionId })
          })
        }
      } catch (error) {
        console.warn('Impossibile aggiungere metodo di spedizione:', error)
        // Prova con spedizione gratuita come fallback
        try {
          console.log('[CHECKOUT][ADD SHIPPING METHOD] Trying free_shipping fallback')
          await fetch(`${baseUrl}/store/carts/${resolvedCartId}/shipping-methods`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: JSON.stringify({ option_id: "free_shipping" })
          })
        } catch (freeError) {
          console.warn('Impossibile aggiungere spedizione gratuita come fallback:', freeError)
        }
      }

      // In Medusa v2, la payment collection deve essere inizializzata prima di aggiungere payment sessions
      // Verifica e inizializza la payment collection se necessario
      // IMPORTANTE: Ricarica sempre il carrello da Medusa per avere lo stato più recente
      console.log('[CHECKOUT] Verifico se la payment collection è inizializzata...')
      
      const cartCheckResponse = await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
        headers: {
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      
      if (cartCheckResponse.ok) {
        const cartCheckData = await cartCheckResponse.json()
        const currentCart = cartCheckData.cart || cartCheckData
        
        console.log('[CHECKOUT] Stato carrello da Medusa:', {
          hasShippingAddress: !!currentCart.shipping_address,
          hasShippingMethods: currentCart.shipping_methods?.length > 0,
          hasPaymentCollection: !!currentCart.payment_collection,
          hasPaymentSessions: currentCart.payment_sessions?.length > 0
        })
        
        // Se non c'è payment_collection, prova a inizializzarla
        if (!currentCart.payment_collection && !currentCart.payment_sessions?.length) {
          // Verifica che shipping_address e shipping_methods siano presenti
          if (currentCart.shipping_address && currentCart.shipping_methods?.length > 0) {
            console.log('[CHECKOUT] Payment collection non trovata, attendo l\'inizializzazione automatica...')
            
            // Attendi più tempo per permettere a Medusa di inizializzare la payment collection
            // La payment collection viene creata automaticamente quando shipping_address e shipping_methods sono impostati
            for (let i = 0; i < 5; i++) {
              await new Promise(resolve => setTimeout(resolve, 500))
              
              const retryResponse = await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
                headers: {
                  'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
                }
              })
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json()
                const retryCart = retryData.cart || retryData
                
                if (retryCart.payment_collection || retryCart.payment_sessions?.length > 0) {
                  console.log('[CHECKOUT] ✅ Payment collection inizializzata dopo', (i + 1) * 500, 'ms')
                  // Aggiorna il carrello nello stato con il carrello aggiornato
                  await medusa.setShippingAddress(currentCart.shipping_address || {})
                  break
                }
              }
            }
          } else {
            console.error('[CHECKOUT] ❌ Payment collection non può essere inizializzata:', {
              hasShippingAddress: !!currentCart.shipping_address,
              hasShippingMethods: currentCart.shipping_methods?.length > 0
            })
            throw new Error('Payment collection non può essere inizializzata: mancano indirizzo di spedizione o metodo di spedizione. Assicurati di aver compilato tutti i campi obbligatori.')
          }
        } else {
          console.log('[CHECKOUT] ✅ Payment collection già inizializzata')
        }
      }

      // Aggiungi sessione di pagamento usando il provider selezionato da Medusa
      const providerId = paymentMethod
      if (!providerId) throw new Error('Nessun metodo di pagamento selezionato')

      // Verifica se c'è già una payment session per questo provider
      let paymentSessionExists = false
      {
        const psCheck = await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
          headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '' }
        })
        if (psCheck.ok) {
          const psData = await psCheck.json()
          const tmpCart = psData.cart || psData
          paymentSessionExists = Array.isArray(tmpCart.payment_sessions) && tmpCart.payment_sessions.some((ps: any) => ps.provider_id === providerId)
        }
      }

      if (!paymentSessionExists) {
        try {
          // Prova endpoint standard
          console.log('[CHECKOUT][PAYMENT SESSION] Creating for provider:', providerId)
          const psRes = await fetch(`${baseUrl}/store/carts/${resolvedCartId}/payment-sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: JSON.stringify({ provider_id: providerId })
          })
          if (!psRes.ok) {
            // Prova endpoint alternativo
            console.log('[CHECKOUT][PAYMENT SESSION] Fallback via cart update payment_provider_id')
            await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              },
              body: JSON.stringify({ payment_provider_id: providerId })
            })
          }
          console.log('[CHECKOUT] Payment session aggiunta (direct API)')
        } catch (error: any) {
          // Se l'errore è 404, potrebbe significare che le payment sessions vengono create automaticamente
          // o che l'endpoint non esiste. In questo caso, verifica se ce ne sono già nel carrello
          if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('Cannot POST')) {
            console.warn('[CHECKOUT] Endpoint payment-sessions non trovato, verifico se esistono già...')
            
            // Ricarica il carrello per vedere se ci sono payment sessions
            const cartCheck = await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
              headers: {
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              }
            })
            
            if (cartCheck.ok) {
              const cartData = await cartCheck.json()
              const updatedCart = cartData.cart || cartData
              
              if (updatedCart.payment_sessions && updatedCart.payment_sessions.length > 0) {
                console.log('[CHECKOUT] Payment sessions già presenti nel carrello')
                // Aggiorna il carrello nello stato
                // no-op
                paymentSessionExists = true
              } else {
                console.warn('[CHECKOUT] Nessuna payment session trovata, continuo comunque')
                // In alcuni casi, Medusa crea le payment sessions automaticamente durante il complete
                // Quindi continuiamo
              }
            }
          } else {
            console.error('[CHECKOUT] Errore nell\'aggiunta della sessione di pagamento:', error)
            throw new Error('Impossibile aggiungere sessione di pagamento. Riprova.')
          }
        }
      } else {
        console.log('[CHECKOUT] Payment session già esistente per provider:', providerId)
      }

      // Autorizza il pagamento PRIMA di completare l'ordine
      // Questo è cruciale per Stripe e altri provider di pagamento
      // Nota: In Medusa v2, l'autorizzazione potrebbe essere gestita automaticamente
      try {
        console.log('[CHECKOUT] Tentativo di autorizzazione del pagamento...')
        
        // Per Stripe, potrebbe essere necessario passare i dati della carta
        // Se il provider è Stripe e abbiamo i dati della carta, passali
        let paymentData: any = undefined
        if (providerId.includes('stripe') && formData.cardNumber && formData.cardName) {
          // Nota: In produzione, i dati della carta dovrebbero essere processati tramite Stripe Elements
          // o Stripe.js per sicurezza. Questo è solo un esempio.
          // Per ora, Medusa gestirà l'autorizzazione con Stripe lato server.
          paymentData = {
            // I dati della carta vengono gestiti da Stripe lato server tramite Medusa
            // Non inviamo direttamente i dati della carta per sicurezza
          }
        }
        
        // Autorizza via endpoint diretto
        // Recupera la lista aggiornata di payment sessions
        const psListRes = await fetch(`${baseUrl}/store/carts/${resolvedCartId}`, {
          headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '' }
        })
        let targetSessionId: string | null = null
        if (psListRes.ok) {
          const data = await psListRes.json()
          const c = data.cart || data
          const sess = Array.isArray(c.payment_sessions) ? c.payment_sessions.find((ps: any) => ps.provider_id === providerId) : null
          targetSessionId = sess?.id || null
        }
        if (targetSessionId) {
          console.log('[CHECKOUT][AUTHORIZE] POST authorize for session:', targetSessionId)
          const authRes = await fetch(`${baseUrl}/store/carts/${resolvedCartId}/payment-sessions/${targetSessionId}/authorize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            },
            body: paymentData ? JSON.stringify(paymentData) : undefined
          })
          if (!authRes.ok) {
            const errText = await authRes.text()
            throw new Error(errText || 'Autorizzazione pagamento fallita')
          }
          console.log('[CHECKOUT] ✅ Pagamento autorizzato con successo')
        } else {
          // Se non troviamo la sessione, proseguiamo: alcuni setup autorizzano in complete
          console.warn('[CHECKOUT] Nessuna payment session trovata per autorizzare; il provider potrebbe autorizzare in complete')
        }
      } catch (error: any) {
        // Se l'autorizzazione fallisce con 404, potrebbe essere che Medusa gestisca l'autorizzazione automaticamente
        if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('Cannot POST')) {
          console.warn('[CHECKOUT] Endpoint autorizzazione non trovato, Medusa potrebbe gestire automaticamente')
          // Continua comunque, Medusa potrebbe autorizzare automaticamente durante il complete
        } else {
          console.error('[CHECKOUT] Errore nell\'autorizzazione del pagamento:', error)
        }
        // Non bloccare il flusso se l'autorizzazione fallisce - Medusa potrebbe gestirla automaticamente
        console.warn('[CHECKOUT] Continuo comunque - Medusa potrebbe autorizzare automaticamente durante il complete')
      }

      // Completa l'ordine solo dopo che il pagamento è stato autorizzato
      console.log('[CHECKOUT] Completamento dell\'ordine...')
      // Recupera carrello aggiornato e completa
      currentCart = await fetchCart(resolvedCartId)
      // Ultimo tentativo di idratazione se necessario usando primaryUiItems
      if (!currentCart.items || currentCart.items.length === 0) {
        if (primaryUiItems.length > 0) {
          console.warn('[CHECKOUT] Carrello vuoto prima del complete, idratazione con primaryUiItems...')
          const hydrated = await ensureServerCartHasItems(resolvedCartId, primaryUiItems)
          if (hydrated && hydrated.items?.length > 0) {
            currentCart = hydrated
          }
        }
      }
      // Ulteriori retry se la UI indica items
      if (!currentCart.items || currentCart.items.length === 0) {
        if (primaryUiItems.length > 0) {
          console.warn('[CHECKOUT] Carrello ancora vuoto, retry con primaryUiItems...')
          for (let i = 0; i < 3; i++) {
            await new Promise(r => setTimeout(r, 500))
            const retried = await ensureServerCartHasItems(resolvedCartId, primaryUiItems)
            if (retried?.items?.length > 0) {
              currentCart = retried
              break
            }
          }
        }
      }
      // Considera valido anche se il totale/subtotale è > 0
      const hasMonetaryTotalAtComplete = (Number(currentCart.total) > 0) || (Number(currentCart.subtotal) > 0)
      
      // Se il carrello è ancora vuoto ma la UI ha items, prova un ultimo tentativo di idratazione
      if ((!currentCart.items || currentCart.items.length === 0) && !hasMonetaryTotalAtComplete) {
        if (primaryUiItems.length > 0) {
          console.warn('[CHECKOUT] Carrello ancora vuoto dopo tutti i retry, ultimo tentativo di idratazione con primaryUiItems...')
          // Attendi un po' di più e riprova
          await new Promise(r => setTimeout(r, 1000))
          const finalHydrated = await ensureServerCartHasItems(resolvedCartId, primaryUiItems)
          if (finalHydrated && finalHydrated.items?.length > 0) {
            currentCart = finalHydrated
            console.log('[CHECKOUT] ✅ Carrello idratato con successo dopo ultimo tentativo')
          } else {
            // Se anche questo fallisce, verifica se almeno il totale è > 0
            const finalCheck = await fetchCart(resolvedCartId)
            if (finalCheck && ((Number(finalCheck.total) > 0) || (Number(finalCheck.subtotal) > 0))) {
              currentCart = finalCheck
              console.log('[CHECKOUT] ✅ Carrello ha totale > 0 anche senza items visibili')
            } else {
              console.error('[CHECKOUT] ❌ Carrello vuoto dopo tutti i tentativi! Items UI:', finalUiCount)
              throw new Error('Il carrello è vuoto. Aggiungi prodotti prima di completare l\'ordine.')
            }
          }
        } else {
          throw new Error('Il carrello è vuoto. Aggiungi prodotti prima di completare l\'ordine.')
        }
      }
      console.log('[CHECKOUT][BEFORE COMPLETE] Cart snapshot:', {
        id: currentCart.id,
        items: currentCart.items?.map((it: any) => ({ id: it.id, variant_id: it.variant_id, quantity: it.quantity, unit_price: it.unit_price })) || [],
        subtotal: currentCart.subtotal, total: currentCart.total
      })
      const completeRes = await fetch(`${baseUrl}/store/carts/${resolvedCartId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      if (!completeRes.ok) {
        const errorText = await completeRes.text()
        throw new Error(errorText || 'Completamento ordine fallito')
      }
      const orderData = await completeRes.json()
      const order = orderData.order || orderData
      
      console.log('[CHECKOUT] ✅ Ordine completato con successo:', order)
      
      // Verifica che l'ordine sia stato creato correttamente
      if (!order || !order.id) {
        throw new Error('L\'ordine non è stato creato correttamente. Contatta il supporto.')
      }
      
      // Verifica lo stato del pagamento nell'ordine
      if (order.payment_status && order.payment_status !== 'captured' && order.payment_status !== 'awaiting') {
        console.warn('[CHECKOUT] ⚠️ Stato pagamento ordine:', order.payment_status)
      }
      
      // Redirect alla pagina di successo
      router.push("/checkout/success")
      
    } catch (error: any) {
      console.error('[CHECKOUT] Errore nel checkout:', error)
      
      // Mostra un messaggio di errore più specifico
      let errorMessage = 'Si è verificato un errore durante il checkout. Riprova.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Non fare redirect se c'è un errore
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Controlla se il carrello è vuoto usando sia il carrello Medusa che lo stato locale
  const cartItems = medusa.cart?.items || []
  const localItems = state.items || []
  const hasItems = (cartItems.length > 0) || (localItems.length > 0)
  
  if (!hasItems) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="font-display text-3xl font-bold text-primary mb-4">Carrello vuoto</h1>
            <p className="text-muted-foreground mb-8">
              Aggiungi alcuni prodotti al carrello prima di procedere al checkout.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Vai ai Prodotti
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Calcola i totali usando il carrello Medusa se disponibile, altrimenti usa lo stato locale
  // Medusa v2 restituisce i prezzi già in euro, non in centesimi (vedi app/cart/page.tsx riga 218)
  // Nota: l'IVA è già inclusa nei prezzi, quindi non viene mostrata separatamente
  const medusaSubtotal = medusa.cart ? (medusa.cart.subtotal || 0) : 0
  const medusaDiscount = medusa.cart ? (medusa.cart.discount_total || 0) : 0
  const medusaShipping = medusa.cart ? (medusa.cart.shipping_total || 0) : 0
  const medusaTax = medusa.cart ? (medusa.cart.tax_total || 0) : 0
  const medusaTotal = medusa.cart ? (medusa.cart.total || 0) : 0

  // Log per debug: verifica le quantità nel carrello Medusa
  useEffect(() => {
    if (medusa.cart?.items) {
      console.log('[CHECKOUT] Carrello Medusa - Quantità items:', medusa.cart.items.map((item: any) => ({
        id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal_item: (item.unit_price || 0) * (item.quantity || 1)
      })))
      console.log('[CHECKOUT] Carrello Medusa - Subtotal:', medusaSubtotal)
      console.log('[CHECKOUT] Carrello Medusa - Total:', medusaTotal)
    }
  }, [medusa.cart, medusaSubtotal, medusaTotal])

  // Usa i valori di Medusa se disponibili, altrimenti calcola localmente
  // IMPORTANTE: L'IVA è già inclusa nei prezzi di Medusa
  // Il subtotale è già il totale prodotti con IVA inclusa
  // IMPORTANTE: Usa sempre medusaSubtotal se disponibile, perché include le quantità corrette
  const subtotal = medusaSubtotal || state.total
  const discount = medusaDiscount
  // Se non c'è shipping_total da Medusa, calcola in base al subtotale
  const shipping = medusaShipping || (subtotal >= 50 ? 0 : 5.9)
  
  // Il totale deve essere: Totale prodotti (con IVA inclusa) + spedizione - sconto
  // Non aggiungiamo tax_total perché l'IVA è già inclusa nel subtotale
  // IMPORTANTE: Usa sempre medusaSubtotal se disponibile, perché include le quantità corrette
  const total = medusaSubtotal > 0
    ? (medusaSubtotal - medusaDiscount + shipping) // Totale prodotti (con IVA inclusa) + spedizione - sconto
    : (subtotal - discount + shipping)

  // Ricarica il carrello Medusa quando si apre il checkout per assicurarsi di avere le quantità corrette
  // Usa un evento custom per forzare il ricaricamento del carrello in useMedusa
  useEffect(() => {
    const reloadCart = async () => {
      try {
        const cartId = localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
        if (cartId) {
          // Emetti un evento custom per notificare useMedusa di ricaricare il carrello
          window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cartId } }))
          
          console.log('[CHECKOUT] Evento cartUpdated emesso per ricaricare il carrello:', cartId)
          
          // Recupera anche direttamente il carrello come fallback immediato
          try {
            const response = await fetch(`/api/medusa/store/carts/${cartId}`, {
              method: 'GET',
              headers: {
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              }
            })
            
            if (response.ok) {
              const cartData = await response.json()
              const cart = cartData.cart || cartData
              
              if (cart.items && cart.items.length > 0) {
                console.log('[CHECKOUT] Items recuperati all\'avvio:', cart.items.length)
                setFallbackCartItems(cart.items)
                setFallbackFetched(true)
              }
            }
          } catch (error) {
            console.error('[CHECKOUT] Errore nel recupero iniziale del carrello:', error)
          }
        }
      } catch (error) {
        console.error('[CHECKOUT] Errore nel ricaricamento del carrello:', error)
      }
    }
    
    // Ricarica il carrello quando si apre il checkout
    reloadCart()
    
    // Ascolta anche i cambiamenti nel localStorage per ricaricare il carrello
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart_id' || e.key === 'medusa_cart_id') {
        reloadCart()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Fetch stabile del carrello per il riepilogo (evita sfarfallii quando useMedusa ricarica vuoto)
  useEffect(() => {
    let isMounted = true
    const resolveCartId = (): string | null => {
      return medusa.cart?.id || localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
    }
    const fetchSummaryCart = async (cartId: string) => {
      try {
        setSummaryLoading(true)
        const res = await fetch(`/api/medusa/store/carts/${cartId}`, {
          method: 'GET',
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
          }
        })
        if (!isMounted) return
        if (res.ok) {
          const data = await res.json()
          const cart = data.cart || data
          const items = Array.isArray(cart?.items) ? cart.items : []
          // Se il server restituisce 0 items ma abbiamo già un fallback consistente, non sovrascrivere
          if (items.length > 0) {
            setSummaryItems(items)
          } else if (fallbackCartItems.length > 0) {
            // mantieni i fallback esistenti
            setSummaryItems(fallbackCartItems)
          } else {
            setSummaryItems([])
          }
        } else {
          // In caso di errore, non azzerare se abbiamo già items
          if (summaryItems.length === 0 && fallbackCartItems.length === 0) {
            setSummaryItems([])
          }
        }
      } catch {
        // Silenzia ma non azzerare per non creare sfarfallii
      } finally {
        if (isMounted) setSummaryLoading(false)
      }
    }
    const cartId = resolveCartId()
    if (cartId) {
      setSummaryCartId(cartId)
      fetchSummaryCart(cartId)
    }
    // Ascolta aggiornamenti carrello per ricaricare solo il riepilogo
    const onCartUpdated = (e: CustomEvent) => {
      const cid = e.detail?.cartId || resolveCartId()
      if (cid) {
        setSummaryCartId(cid)
        fetchSummaryCart(cid)
      }
    }
    window.addEventListener('cartUpdated', onCartUpdated as EventListener)
    return () => {
      isMounted = false
      window.removeEventListener('cartUpdated', onCartUpdated as EventListener)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medusa.cart?.id])

  // Fallback: recupera il carrello direttamente dal server se medusa.cart non ha items
  useEffect(() => {
    let isMounted = true
    
    const fetchCartItemsFallback = async () => {
      // Se medusa.cart ha items, non serve il fallback
      if (medusa.cart?.items && medusa.cart.items.length > 0) {
        console.log('[CHECKOUT FALLBACK] medusa.cart ha items, non serve fallback')
        if (isMounted) {
          setFallbackCartItems([])
        }
        return
      }

      // Se abbiamo già items nel fallback e medusa.cart non ha items,
      // mantieni il fallback invece di azzerarlo (anche se subtotale è 0 o undefined)
      // perché potrebbe essere un problema temporaneo di caricamento
      if (fallbackCartItems.length > 0 && medusa.cart && (!medusa.cart.items || medusa.cart.items.length === 0)) {
        console.log('[CHECKOUT FALLBACK] Mantengo items esistenti nel fallback (medusa.cart senza items)')
        return
      }

      // Se medusa.cart esiste ma non ha items, recupera dal server
      // Controlla anche se c'è un subtotale > 0 come indicatore che ci sono prodotti
      const hasSubtotal = medusa.cart && (medusa.cart.subtotal > 0 || medusa.cart.total > 0)
      const cartId = medusa.cart?.id || localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id')
      
      console.log('[CHECKOUT FALLBACK] Stato:', {
        hasMedusaCart: !!medusa.cart,
        hasItems: !!(medusa.cart?.items && medusa.cart.items.length > 0),
        itemsLength: medusa.cart?.items?.length || 0,
        hasSubtotal,
        subtotal: medusa.cart?.subtotal,
        total: medusa.cart?.total,
        cartId,
        loadingCart: medusa.loadingCart
      })
      
      // Chiama il fallback se:
      // 1. medusa.cart esiste ma non ha items (undefined, null, o array vuoto), OPPURE
      // 2. c'è un subtotale > 0 ma non ci sono items
      const hasNoItems = !medusa.cart?.items || medusa.cart.items.length === 0
      const shouldFetch = (medusa.cart && hasNoItems) || (hasSubtotal && cartId && hasNoItems)
      
      if (shouldFetch && cartId && !medusa.loadingCart) {
        try {
          console.log('[CHECKOUT FALLBACK] Recupero items dal server, cartId:', cartId)
          const response = await fetch(`/api/medusa/store/carts/${cartId}`, {
            method: 'GET',
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
            }
          })
          
          console.log('[CHECKOUT FALLBACK] Response status:', response.status)
          
          if (response.ok && isMounted) {
            const cartData = await response.json()
            const cart = cartData.cart || cartData
            
            console.log('[CHECKOUT FALLBACK] Cart data:', {
              hasCart: !!cart,
              itemsLength: cart?.items?.length || 0,
              items: cart?.items?.map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                product_title: item.product_title || item.title
              })) || []
            })
            
            if (cart.items && cart.items.length > 0) {
              console.log('[CHECKOUT FALLBACK] ✅ Items recuperati dal server:', cart.items.length)
              if (isMounted) {
                setFallbackCartItems(cart.items)
                setFallbackFetched(true)
              }
            } else {
              console.log('[CHECKOUT FALLBACK] ⚠️ Nessun item nel carrello dal server')
              // Non azzerare il fallback se abbiamo già items salvati
              if (isMounted && fallbackCartItems.length === 0) {
                setFallbackCartItems([])
              }
            }
          } else if (isMounted) {
            const errorText = await response.text().catch(() => 'Unknown error')
            console.error('[CHECKOUT FALLBACK] ❌ Errore nella risposta:', response.status, errorText)
            setFallbackCartItems([])
          }
        } catch (error) {
          console.error('[CHECKOUT FALLBACK] ❌ Errore nel recupero fallback del carrello:', error)
          if (isMounted) {
            setFallbackCartItems([])
          }
        }
      } else {
        console.log('[CHECKOUT FALLBACK] ⏭️ Condizioni non soddisfatte per il fallback')
        // Non azzerare il fallback se abbiamo già items salvati e c'è un subtotale
        if (isMounted) {
          const hasSubtotal = medusa.cart && (medusa.cart.subtotal > 0 || medusa.cart.total > 0)
          if (!hasSubtotal || fallbackCartItems.length === 0) {
            setFallbackCartItems([])
          }
        }
      }
    }

    // Chiama immediatamente se medusa.cart è già caricato, altrimenti aspetta
    // Ma solo se non abbiamo già recuperato il fallback
    if (!fallbackFetched && fallbackCartItems.length === 0) {
      if (medusa.cart && !medusa.loadingCart) {
        fetchCartItemsFallback()
      } else {
        // Aggiungi un delay per aspettare che medusa.cart si carichi
        const timeoutId = setTimeout(() => {
          fetchCartItemsFallback()
        }, 1000)

        return () => {
          isMounted = false
          clearTimeout(timeoutId)
        }
      }
    } else if (fallbackCartItems.length > 0) {
      // Se abbiamo già items nel fallback, verifica solo se medusa.cart ha items
      // Se medusa.cart ha items, azzera il fallback
      if (medusa.cart?.items && medusa.cart.items.length > 0) {
        if (isMounted) {
          setFallbackCartItems([])
          setFallbackFetched(false)
        }
      }
    }

    return () => {
      isMounted = false
    }
  }, [medusa.cart?.id, medusa.cart?.items?.length, medusa.cart?.subtotal, medusa.cart?.total, medusa.loadingCart])

  // Sincronizza il codice promozionale applicato con il carrello Medusa
  useEffect(() => {
    if (medusa.cart && medusa.cart.discounts && medusa.cart.discounts.length > 0) {
      const discountCode = medusa.cart.discounts[0]?.code || medusa.cart.discounts[0]?.discount?.code
      if (discountCode && !appliedPromoCode) {
        setAppliedPromoCode(discountCode.toUpperCase())
      }
    } else if (medusa.cart && (!medusa.cart.discounts || medusa.cart.discounts.length === 0) && appliedPromoCode) {
      // Se non ci sono più discount nel carrello, rimuovi il codice applicato
      setAppliedPromoCode(null)
    }
  }, [medusa.cart, appliedPromoCode])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Header */}
        <div className="bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold text-primary">Checkout</h1>
            <p className="text-muted-foreground mt-2">Completa il tuo ordine in modo sicuro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Informazioni di Spedizione
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Cognome *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Indirizzo *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Città *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">CAP *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provincia *</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informazioni di Fatturazione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="sameAsShipping">Uguale all'indirizzo di spedizione</Label>
                  </div>

                  {!sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">Nome *</Label>
                          <Input
                            id="billingFirstName"
                            value={formData.billingFirstName}
                            onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Cognome *</Label>
                          <Input
                            id="billingLastName"
                            value={formData.billingLastName}
                            onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingAddress">Indirizzo *</Label>
                        <Input
                          id="billingAddress"
                          value={formData.billingAddress}
                          onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                          required={!sameAsShipping}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">Città *</Label>
                          <Input
                            id="billingCity"
                            value={formData.billingCity}
                            onChange={(e) => handleInputChange("billingCity", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode">CAP *</Label>
                          <Input
                            id="billingPostalCode"
                            value={formData.billingPostalCode}
                            onChange={(e) => handleInputChange("billingPostalCode", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingProvince">Provincia *</Label>
                          <Input
                            id="billingProvince"
                            value={formData.billingProvince}
                            onChange={(e) => handleInputChange("billingProvince", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metodo di Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medusa.paymentProviders.length > 0 ? (
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {medusa.paymentProviders.map((p: any) => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={p.id} id={`pm-${p.id}`} />
                          <Label htmlFor={`pm-${p.id}`}>{getPaymentProviderName(p.id)}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="p-4 rounded-md bg-muted text-sm text-muted-foreground">
                      Nessun metodo di pagamento configurato.
                    </div>
                  )}

                  {paymentMethod && paymentMethod.includes('stripe') && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardName">Nome sulla Carta *</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          required={paymentMethod.includes('stripe')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Numero Carta *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          required={paymentMethod.includes('stripe')}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Scadenza *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/AA"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            required={paymentMethod.includes('stripe')}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            required={paymentMethod.includes('stripe')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Codice Promozionale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedPromoCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Codice applicato: {appliedPromoCode}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await medusa.removeDiscountCode(appliedPromoCode)
                            setAppliedPromoCode(null)
                            setPromoCode("")
                            setPromoCodeError(null)
                          } catch (err) {
                            console.error('Errore nella rimozione del codice:', err)
                          }
                        }}
                        className="h-8 w-8 p-0 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Inserisci il codice promozionale"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase())
                            setPromoCodeError(null)
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!promoCode.trim()) {
                              setPromoCodeError("Inserisci un codice promozionale")
                              return
                            }
                            
                            setIsApplyingPromoCode(true)
                            setPromoCodeError(null)
                            
                            try {
                              console.log('[CHECKOUT] Tentativo di applicare codice promozionale:', promoCode.trim())
                              await medusa.applyDiscountCode(promoCode.trim())
                              console.log('[CHECKOUT] Codice applicato con successo, aggiornando UI')
                              setAppliedPromoCode(promoCode.trim().toUpperCase())
                              setPromoCode("")
                              setPromoCodeError(null)
                            } catch (err: any) {
                              console.error('[CHECKOUT] Errore nell\'applicazione del codice:', err)
                              console.error('[CHECKOUT] Messaggio errore:', err.message)
                              const errorMessage = err.message || "Codice promozionale non valido"
                              setPromoCodeError(errorMessage)
                              console.log('[CHECKOUT] Errore impostato nell\'UI:', errorMessage)
                            } finally {
                              setIsApplyingPromoCode(false)
                            }
                          }}
                          disabled={isApplyingPromoCode || !promoCode.trim()}
                          className="bg-accent hover:bg-accent/90"
                        >
                          {isApplyingPromoCode ? "Applicazione..." : "Applica"}
                        </Button>
                      </div>
                      {promoCodeError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{promoCodeError}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Note Aggiuntive</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Inserisci eventuali note per il tuo ordine..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Terms */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => handleInputChange("terms", checked as boolean)}
                      required
                      className="mt-0.5 sm:mt-1 flex-shrink-0"
                    />
                    <Label htmlFor="terms" className="text-xs sm:text-sm leading-relaxed flex-1 min-w-0">
                      Accetto i{" "}
                      <Link href="/termini-e-condizioni" className="text-accent hover:underline inline">
                        Termini e Condizioni
                      </Link>
                      {" "}e la{" "}
                      <Link href="/privacy" className="text-accent hover:underline inline">
                        Privacy Policy
                      </Link>
                      {" "}*
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Riepilogo Ordine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {/* Usa SEMPRE gli items dal carrello Medusa se disponibile per avere le quantità corrette */}
                    {/* IMPORTANTE: Non usare mai state.items perché ha sempre quantità 1 */}
                    {(() => {
                      // Usa per primi gli items stabili del riepilogo, poi medusa.cart, poi il fallback
                      const summaryStableItems = Array.isArray(summaryItems) && summaryItems.length > 0
                        ? summaryItems
                        : []
                      const medusaItems = medusa.cart?.items && medusa.cart.items.length > 0 
                        ? medusa.cart.items 
                        : []
                      
                      // Se non ci sono items nel riepilogo stabile o in medusa.cart ma c'è un fallback, usalo
                      const itemsToDisplay = summaryStableItems.length > 0
                        ? summaryStableItems
                        : (medusaItems.length > 0 
                          ? medusaItems 
                          : (fallbackCartItems.length > 0 ? fallbackCartItems : []))
                      
                      // Log per debug dettagliato
                      console.log('[CHECKOUT RENDER] Stato items:', {
                        hasMedusaCart: !!medusa.cart,
                        medusaItemsLength: medusaItems.length,
                        summaryItemsLength: summaryStableItems.length,
                        fallbackItemsLength: fallbackCartItems.length,
                        itemsToDisplayLength: itemsToDisplay.length,
                        medusaCartItems: medusa.cart?.items?.length || 0,
                        subtotal: medusa.cart?.subtotal,
                        total: medusa.cart?.total
                      })
                      
                      if (itemsToDisplay.length > 0) {
                        console.log('[CHECKOUT RENDER] ✅ Items da visualizzare:', itemsToDisplay.map((item: any) => ({
                          id: item.id,
                          variant_id: item.variant_id,
                          quantity: item.quantity,
                          unit_price: item.unit_price,
                          product_title: item.product_title || item.title,
                          source: summaryStableItems.length > 0 ? 'summary' : (medusaItems.length > 0 ? 'medusa.cart' : 'fallback')
                        })))
                      } else {
                        console.log('[CHECKOUT RENDER] ⚠️ Nessun item da visualizzare')
                      }
                      
                      if (itemsToDisplay.length === 0) {
                        // Se non ci sono items nel carrello Medusa né nel fallback, mostra un messaggio
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            {summaryLoading ? 'Caricamento prodotti...' : 'Nessun prodotto nel carrello'}
                          </div>
                        )
                      }
                      
                      return itemsToDisplay.map((item: any) => {
                        // Medusa v2: unit_price è già in euro (vedi app/cart/page.tsx riga 256)
                        // Usa unit_price se disponibile, altrimenti calcola da variant.prices
                        const itemPrice = item.unit_price || (item.variant?.prices?.[0]?.amount ? item.variant.prices[0].amount / 100 : 0)
                        // IMPORTANTE: Usa sempre item.quantity dal carrello Medusa, non dal carrello locale
                        const itemQuantity = item.quantity || 1
                        const itemTotal = itemPrice * itemQuantity
                        
                        // Usa thumbnail come nella pagina cart: item.thumbnail || item.product?.thumbnail || item.variant?.product?.thumbnail
                        const image = item.thumbnail || item.product?.thumbnail || item.variant?.product?.thumbnail || "/placeholder.svg"
                        const productTitle = item.product_title || item.title || item.variant?.product?.title || item.product?.title || "Prodotto"
                        
                        return (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={image}
                                alt={productTitle}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {productTitle}
                              </h4>
                              <p className="text-xs text-muted-foreground">Qtà: {itemQuantity}</p>
                              <p className="text-sm font-semibold text-primary">
                                €{itemTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotale</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Sconto</span>
                        <span>-€{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Spedizione</span>
                      <span className={shipping === 0 ? "text-green-600" : ""}>
                        {shipping === 0 ? "Gratuita" : `€${shipping.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Totale</span>
                    <span className="text-primary">€{total.toFixed(2)}</span>
                  </div>

                  {/* Debug Info */}
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      🔍 DEBUG - Carrello Utilizzato
                    </p>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 font-mono">
                      {(() => {
                        const resolvedCartId = medusa.cart?.id || summaryCartId || localStorage.getItem('medusa_cart_id') || localStorage.getItem('cart_id') || 'N/A'
                        const summaryStableItems = Array.isArray(summaryItems) && summaryItems.length > 0 ? summaryItems : []
                        const medusaItems = medusa.cart?.items && medusa.cart.items.length > 0 ? medusa.cart.items : []
                        const fallbackItems = Array.isArray(fallbackCartItems) && fallbackCartItems.length > 0 ? fallbackCartItems : []
                        
                        // Calcola totali per ogni fonte
                        const calcTotal = (items: any[]) => {
                          return items.reduce((sum, item) => {
                            const price = item.unit_price || (item.variant?.prices?.[0]?.amount ? item.variant.prices[0].amount / 100 : 0)
                            const qty = item.quantity || 1
                            return sum + (price * qty)
                          }, 0)
                        }
                        
                        const summaryTotal = calcTotal(summaryStableItems)
                        const medusaTotalCalc = calcTotal(medusaItems)
                        const fallbackTotal = calcTotal(fallbackItems)
                        
                        return (
                          <>
                            <div className="font-bold mb-1">📦 ID Carrelli:</div>
                            <div className="ml-2">
                              <div>medusa.cart.id: {medusa.cart?.id || 'N/A'}</div>
                              <div>summaryCartId: {summaryCartId || 'N/A'}</div>
                              <div>localStorage (medusa_cart_id): {localStorage.getItem('medusa_cart_id') || 'N/A'}</div>
                              <div>localStorage (cart_id): {localStorage.getItem('cart_id') || 'N/A'}</div>
                              <div className="font-bold mt-1">→ Risolto: {resolvedCartId}</div>
                            </div>
                            
                            <div className="font-bold mt-2 mb-1">📊 medusa.cart:</div>
                            <div className="ml-2">
                              <div>Items: {medusaItems.length} | Qty totale: {medusaItems.reduce((sum, it) => sum + (it.quantity || 1), 0)}</div>
                              <div>Subtotale: €{medusaSubtotal.toFixed(2)} | Totale: €{medusaTotal.toFixed(2)}</div>
                              <div>Totale calcolato da items: €{medusaTotalCalc.toFixed(2)}</div>
                              {medusaItems.length > 0 && medusaItems.map((it: any, idx: number) => (
                                <div key={idx} className="ml-2 text-[10px]">
                                  - {it.product_title || it.title || 'N/A'}: qty={it.quantity || 1}, price=€{it.unit_price?.toFixed(2) || '0.00'}
                                </div>
                              ))}
                            </div>
                            
                            <div className="font-bold mt-2 mb-1">📋 summaryItems:</div>
                            <div className="ml-2">
                              <div>Items: {summaryStableItems.length} | Qty totale: {summaryStableItems.reduce((sum, it) => sum + (it.quantity || 1), 0)}</div>
                              <div>Totale calcolato: €{summaryTotal.toFixed(2)}</div>
                              {summaryStableItems.length > 0 && summaryStableItems.map((it: any, idx: number) => (
                                <div key={idx} className="ml-2 text-[10px]">
                                  - {it.product_title || it.title || 'N/A'}: qty={it.quantity || 1}, price=€{it.unit_price?.toFixed(2) || '0.00'}
                                </div>
                              ))}
                            </div>
                            
                            <div className="font-bold mt-2 mb-1">🔄 fallbackCartItems:</div>
                            <div className="ml-2">
                              <div>Items: {fallbackItems.length} | Qty totale: {fallbackItems.reduce((sum, it) => sum + (it.quantity || 1), 0)}</div>
                              <div>Totale calcolato: €{fallbackTotal.toFixed(2)}</div>
                              {fallbackItems.length > 0 && fallbackItems.map((it: any, idx: number) => (
                                <div key={idx} className="ml-2 text-[10px]">
                                  - {it.product_title || it.title || 'N/A'}: qty={it.quantity || 1}, price=€{it.unit_price?.toFixed(2) || '0.00'}
                                </div>
                              ))}
                            </div>
                            
                            <div className="font-bold mt-2 mb-1">🎯 UI Display (usato nel riepilogo):</div>
                            <div className="ml-2">
                              {(() => {
                                const itemsToDisplay = summaryStableItems.length > 0 ? summaryStableItems : (medusaItems.length > 0 ? medusaItems : fallbackItems)
                                const displayTotal = calcTotal(itemsToDisplay)
                                const displayQty = itemsToDisplay.reduce((sum, it) => sum + (it.quantity || 1), 0)
                                return (
                                  <>
                                    <div>Source: {summaryStableItems.length > 0 ? 'summaryItems' : (medusaItems.length > 0 ? 'medusa.cart.items' : 'fallbackCartItems')}</div>
                                    <div>Items: {itemsToDisplay.length} | Qty totale: {displayQty}</div>
                                    <div>Totale calcolato: €{displayTotal.toFixed(2)}</div>
                                    <div>Subtotale mostrato: €{subtotal.toFixed(2)}</div>
                                    <div>Totale mostrato: €{total.toFixed(2)}</div>
                                  </>
                                )
                              })()}
                            </div>
                            
                            <div className="font-bold mt-2 mb-1">💳 Payment:</div>
                            <div className="ml-2">
                              <div>Sessions: {medusa.cart?.payment_sessions?.length || 0}</div>
                              <div>Provider selezionato: {paymentMethod || 'Nessuno'}</div>
                            </div>
                            
                            {(() => {
                              const allCartIds = [
                                medusa.cart?.id,
                                summaryCartId,
                                localStorage.getItem('medusa_cart_id'),
                                localStorage.getItem('cart_id')
                              ].filter(Boolean)
                              const uniqueIds = [...new Set(allCartIds)]
                              if (uniqueIds.length > 1) {
                                return (
                                  <div className="font-bold mt-2 text-red-600 dark:text-red-400">
                                    ⚠️ ATTENZIONE: Trovati {uniqueIds.length} ID carrelli diversi! {uniqueIds.join(', ')}
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={isProcessing || !formData.terms}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {isProcessing ? "Elaborazione..." : "Completa Ordine"}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>🔒 Pagamento sicuro e protetto</p>
                    <p>📦 Spedizione in 24-48h</p>
                    <p>↩️ Reso gratuito entro 14 giorni</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
