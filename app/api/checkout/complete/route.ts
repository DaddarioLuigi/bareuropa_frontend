import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId } = body

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID mancante' }, { status: 400 })
    }

    // Completa il carrello e crea l'ordine su Medusa
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Errore Medusa complete cart:', errorText)
      return NextResponse.json(
        { error: 'Errore nel completamento dell\'ordine' },
        { status: res.status }
      )
    }

    const data = await res.json()
    
    // Pulisci il cookie del carrello dopo il completamento
    cookies().delete('cart_id')

    return NextResponse.json({
      orderId: data.order?.id || data.id,
      order: data.order || data
    })
  } catch (error) {
    console.error('Errore complete cart route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

