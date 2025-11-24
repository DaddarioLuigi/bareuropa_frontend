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

    // Prova prima con l'endpoint specifico per i discount codes
    let res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/discounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        code: codeToApply
      })
    })

    console.log('[Apply Discount] Response status:', res.status)

    // Se l'endpoint /discounts non esiste, prova con l'aggiornamento del carrello
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      console.log('[Apply Discount] Endpoint /discounts non disponibile, uso aggiornamento carrello')
      
      // Recupera il carrello corrente per ottenere i discount esistenti
      const cartRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
      })

      if (!cartRes.ok) {
        const errorText = await cartRes.text()
        console.error('[Apply Discount] Failed to fetch cart:', errorText)
        return NextResponse.json(
          { error: 'Errore nel recupero del carrello', details: errorText },
          { status: cartRes.status }
        )
      }

      const cartData = await cartRes.json()
      const cart = cartData.cart || cartData
      
      // Prepara i discount codes esistenti più il nuovo
      const existingDiscounts = cart.discounts || []
      const existingCodes = existingDiscounts.map((d: any) => (d.code || d.discount?.code || '').toUpperCase())
      
      if (existingCodes.includes(codeToApply)) {
        return NextResponse.json(
          { error: 'Codice promozionale già applicato' },
          { status: 400 }
        )
      }

      const newDiscounts = [...existingDiscounts, { code: codeToApply }]
      
      // Aggiorna il carrello con il nuovo codice
      res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
        body: JSON.stringify({
          discounts: newDiscounts
        })
      })
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Apply Discount] Failed:', res.status, errorText)
      
      // Prova a parsare l'errore come JSON
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Codice promozionale non valido' }
      }
      
      const errorMessage = errorData.message || 
                           errorData.error?.message || 
                           errorData.error || 
                           (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                           (errorData.details && errorData.details.message) ||
                           'Codice promozionale non valido'
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Apply Discount] Success. Cart updated:', !!data.cart)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore apply discount route:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

