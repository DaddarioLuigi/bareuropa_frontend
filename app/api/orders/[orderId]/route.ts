import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID mancante' }, { status: 400 })
    }

    // Ottieni i dettagli dell'ordine da Medusa
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Errore Medusa get order:', errorText)
      return NextResponse.json(
        { error: 'Ordine non trovato' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore get order route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

