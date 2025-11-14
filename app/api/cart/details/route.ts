import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function GET() {
  try {
    const cartId = cookies().get('cart_id')?.value

    if (!cartId) {
      return NextResponse.json(
        { error: 'Nessun carrello trovato' },
        { status: 404 }
      )
    }

    // Ottieni i dettagli completi del carrello da Medusa
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Errore Medusa get cart:', errorText)
      return NextResponse.json(
        { error: 'Impossibile recuperare il carrello' },
        { status: res.status }
      )
    }

    const data = await res.json()
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    })
  } catch (error) {
    console.error('Errore get cart details route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

