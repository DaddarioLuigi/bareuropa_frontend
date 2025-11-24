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
    
    // Rimuovi il codice specifico dai discount
    const codeToRemove = code.toUpperCase().trim()
    const existingDiscounts = cart.discounts || []
    const updatedDiscounts = existingDiscounts.filter((d: any) => {
      const discountCode = (d.code || d.discount?.code || '').toUpperCase()
      return discountCode !== codeToRemove
    })
    
    // Aggiorna il carrello senza il codice promozionale
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        discounts: updatedDiscounts
      })
    })

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

