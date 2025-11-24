import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, code } = body

    console.log('[Apply Discount] Request:', { cartId, code })

    if (!cartId || !code) {
      return NextResponse.json({ error: 'Cart ID e codice promozionale richiesti' }, { status: 400 })
    }

    const codeToApply = code.toUpperCase().trim()

    // In Medusa v2, l'endpoint per applicare i codici promozionali è /store/carts/{id}/promotions
    // con il body che contiene promo_codes (array)
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        promo_codes: [codeToApply]
      })
    })

    console.log('[Apply Discount] Response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Apply Discount] Failed:', res.status, errorText)
      
      // Se l'endpoint /promotions non esiste, prova con /discounts
      if (res.status === 404 || res.status === 405) {
        console.log('[Apply Discount] Endpoint /promotions non disponibile, provo con /discounts')
        
        const res2 = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/discounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_API_KEY,
          },
          body: JSON.stringify({
            promo_codes: [codeToApply]
          })
        })

        if (!res2.ok) {
          const errorText2 = await res2.text()
          console.error('[Apply Discount] Failed anche con /discounts:', res2.status, errorText2)
          
          let errorData
          try {
            errorData = JSON.parse(errorText2)
          } catch {
            errorData = { message: errorText2 || 'Codice promozionale non valido' }
          }
          
          let errorMessage = errorData.message || 
                             errorData.error?.message || 
                             errorData.error || 
                             (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                             (errorData.details && errorData.details.message) ||
                             'Codice promozionale non valido'
          
          // Traduci errori comuni in italiano
          const errorTranslations: { [key: string]: string } = {
            'invalid': 'non valido',
            'not found': 'non trovato',
            'expired': 'scaduto',
            'already applied': 'già applicato',
            'The promotion code': 'Il codice promozionale',
            'is invalid': 'non è valido'
          }
          
          let translatedMessage = errorMessage
          Object.keys(errorTranslations).forEach(key => {
            if (translatedMessage.toLowerCase().includes(key.toLowerCase())) {
              translatedMessage = translatedMessage.replace(
                new RegExp(key, 'gi'),
                errorTranslations[key]
              )
            }
          })
          
          if (translatedMessage.toLowerCase().includes('promotion code')) {
            translatedMessage = translatedMessage.replace(/promotion code/gi, 'codice promozionale')
          }
          
          return NextResponse.json(
            { error: translatedMessage, details: errorText2 },
            { status: res2.status }
          )
        }

        const data = await res2.json()
        console.log('[Apply Discount] Success con endpoint /discounts')
        return NextResponse.json(data)
      }
      
      // Per altri errori, traducili in italiano
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Codice promozionale non valido' }
      }
      
      let errorMessage = errorData.message || 
                         errorData.error?.message || 
                         errorData.error || 
                         (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                         (errorData.details && errorData.details.message) ||
                         'Codice promozionale non valido'
      
      // Traduci errori comuni in italiano
      const errorTranslations: { [key: string]: string } = {
        'invalid': 'non valido',
        'not found': 'non trovato',
        'expired': 'scaduto',
        'already applied': 'già applicato',
        'not applicable': 'non applicabile',
        'The promotion code': 'Il codice promozionale',
        'is invalid': 'non è valido',
        'does not exist': 'non esiste',
        'has expired': 'è scaduto',
        'cannot be applied': 'non può essere applicato'
      }
      
      // Traduci il messaggio di errore
      let translatedMessage = errorMessage
      Object.keys(errorTranslations).forEach(key => {
        if (translatedMessage.toLowerCase().includes(key.toLowerCase())) {
          translatedMessage = translatedMessage.replace(
            new RegExp(key, 'gi'),
            errorTranslations[key]
          )
        }
      })
      
      // Se contiene "promotion code" o "code", assicurati che sia in italiano
      if (translatedMessage.toLowerCase().includes('promotion code')) {
        translatedMessage = translatedMessage.replace(/promotion code/gi, 'codice promozionale')
      }
      if (translatedMessage.toLowerCase().includes('code') && !translatedMessage.toLowerCase().includes('codice')) {
        translatedMessage = translatedMessage.replace(/code/gi, 'codice')
      }
      
      return NextResponse.json(
        { error: translatedMessage, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Apply Discount] Success. Response structure:', {
      hasCart: !!data.cart,
      hasData: !!data,
      keys: Object.keys(data || {}),
      cartId: data.cart?.id || data.id,
      discounts: data.cart?.discounts || data.discounts,
      promotions: data.cart?.promotions || data.promotions,
      promo_codes: data.cart?.promo_codes || data.promo_codes,
      discountTotal: data.cart?.discount_total || data.discount_total,
      fullResponse: JSON.stringify(data, null, 2).substring(0, 1000)
    })
    
    // Assicurati che la risposta contenga il carrello
    if (!data.cart && data.id) {
      // Se la risposta è direttamente il carrello, wrappalo
      return NextResponse.json({ cart: data })
    }
    
    // Ricarica il carrello completo per verificare lo stato aggiornato
    // Questo è necessario perché alcune promozioni (es. su shipping_methods) 
    // potrebbero non apparire immediatamente nei discounts
    try {
      const cartCheckRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
      })
      
      if (cartCheckRes.ok) {
        const cartCheckData = await cartCheckRes.json()
        const fullCart = cartCheckData.cart || cartCheckData
        console.log('[Apply Discount] Full cart after application:', {
          discounts: fullCart.discounts,
          promotions: fullCart.promotions,
          promo_codes: fullCart.promo_codes,
          discountTotal: fullCart.discount_total,
          shippingDiscountTotal: fullCart.shipping_discount_total
        })
        
        // Restituisci il carrello completo
        return NextResponse.json({ cart: fullCart })
      }
    } catch (err) {
      console.error('[Apply Discount] Error fetching full cart:', err)
      // Continua comunque con la risposta originale
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore apply discount route:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

