import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, email, first_name, last_name, address_1, address_2, city, province, postal_code, country_code, phone } = body

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID mancante' }, { status: 400 })
    }

    // Aggiorna l'indirizzo di spedizione sul carrello Medusa
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        email,
        shipping_address: {
          first_name,
          last_name,
          address_1,
          address_2: address_2 || '',
          city,
          province,
          postal_code,
          country_code: country_code || 'it',
          phone: phone || '',
        }
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Errore Medusa shipping address:', errorText)
      return NextResponse.json(
        { error: 'Errore nell\'aggiornamento dell\'indirizzo' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore shipping address route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

