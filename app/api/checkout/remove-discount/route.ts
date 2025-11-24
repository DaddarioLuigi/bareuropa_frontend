import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, code } = body

    console.log('[Remove Discount] Request:', { cartId, code })

    if (!cartId || !code) {
      return NextResponse.json({ error: 'Cart ID e codice promozionale richiesti' }, { status: 400 })
    }

    // Recupera il carrello corrente
    const cartRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!cartRes.ok) {
      const errorText = await cartRes.text()
      console.error('[Remove Discount] Failed to fetch cart:', errorText)
      return NextResponse.json(
        { error: 'Errore nel recupero del carrello', details: errorText },
        { status: cartRes.status }
      )
    }

    const cartData = await cartRes.json()
    const cart = cartData.cart || cartData
    
    // Rimuovi il codice promozionale usando DELETE
    const codeToRemove = code.toUpperCase().trim()
    
    // Prova prima con DELETE /store/carts/{id}/promotions/{code}
    let res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/promotions/${codeToRemove}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      }
    })

    console.log('[Remove Discount] DELETE /promotions/{code} status:', res.status)

    // Se l'endpoint non esiste, prova con DELETE /store/carts/{id}/discounts/{code}
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      console.log('[Remove Discount] Endpoint /promotions/{code} non disponibile, provo con /discounts/{code}')
      
      res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/discounts/${codeToRemove}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        }
      })

      console.log('[Remove Discount] DELETE /discounts/{code} status:', res.status)
    }

    // Se anche questo non funziona, prova con POST e promo_codes vuoto o senza il codice
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      console.log('[Remove Discount] Endpoint DELETE non disponibile, provo con POST e promo_codes')
      
      // Recupera i codici promozionali attuali e rimuovi quello specificato
      const existingDiscounts = cart.discounts || []
      const updatedPromoCodes = existingDiscounts
        .map((d: any) => d.code || d.discount?.code)
        .filter((c: string) => c && c.toUpperCase() !== codeToRemove)
        .map((c: string) => c.toUpperCase())
      
      res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
        body: JSON.stringify({
          promo_codes: updatedPromoCodes
        })
      })

      console.log('[Remove Discount] POST /promotions con promo_codes aggiornati status:', res.status)
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Remove Discount] Failed:', res.status, errorText)
      return NextResponse.json(
        { error: 'Errore nella rimozione del codice promozionale', details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Remove Discount] Success. Cart updated:', !!data.cart)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore remove discount route:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

