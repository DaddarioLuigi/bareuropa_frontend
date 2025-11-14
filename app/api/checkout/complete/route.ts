import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, paymentIntent } = body

    console.log('[Complete Order] Request:', { cartId, paymentIntent })

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID mancante' }, { status: 400 })
    }

    // In Medusa v2, completa il carrello e crea l'ordine
    // Il pagamento è già stato processato da Stripe
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Complete Order] Medusa error:', res.status, errorText)
      return NextResponse.json(
        { error: 'Errore nel completamento dell\'ordine', details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Complete Order] Response:', JSON.stringify(data, null, 2))
    
    const order = data.order || data
    
    // Pulisci il cookie del carrello dopo il completamento
    cookies().delete('cart_id')

    return NextResponse.json({
      orderId: order.id || order.display_id,
      order: order
    })
  } catch (error) {
    console.error('[Complete Order] Error:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

