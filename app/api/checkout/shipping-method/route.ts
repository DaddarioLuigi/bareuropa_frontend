import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, optionId } = body

    console.log('[Shipping Method] Request:', { cartId, optionId })

    if (!cartId || !optionId) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    // Aggiungi il metodo di spedizione al carrello
    console.log('[Shipping Method] Adding to cart...')
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/shipping-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        option_id: optionId,
      }),
    })

    console.log('[Shipping Method] Response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Shipping Method] Failed:', res.status, errorText)
      return NextResponse.json(
        { error: 'Errore nella selezione del metodo di spedizione', details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Shipping Method] Success. Cart has shipping methods:', !!data.cart?.shipping_methods?.length)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore shipping method route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

