import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID mancante' }, { status: 400 })
    }

    // Ottieni le opzioni di spedizione disponibili per il carrello
    console.log(`[Shipping Options] Fetching for cart: ${cartId}`)
    console.log(`[Shipping Options] URL: ${MEDUSA_BACKEND_URL}/store/shipping-options/${cartId}`)
    
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/shipping-options/${cartId}`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Shipping Options] Errore Medusa:', res.status, errorText)
      return NextResponse.json(
        { error: 'Errore nel caricamento delle opzioni di spedizione', details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Shipping Options] Response:', JSON.stringify(data, null, 2))
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore shipping options route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

