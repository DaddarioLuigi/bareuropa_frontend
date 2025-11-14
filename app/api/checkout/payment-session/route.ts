import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, providerId } = body

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID mancante' }, { status: 400 })
    }

    // Inizializza le sessioni di pagamento
    const initRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/payment-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!initRes.ok) {
      const errorText = await initRes.text()
      console.error('Errore Medusa init payment sessions:', errorText)
      return NextResponse.json(
        { error: 'Errore nell\'inizializzazione delle sessioni di pagamento' },
        { status: initRes.status }
      )
    }

    const initData = await initRes.json()
    
    // Seleziona il provider di pagamento (Stripe)
    const selectRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        provider_id: providerId || 'stripe',
      }),
    })

    if (!selectRes.ok) {
      const errorText = await selectRes.text()
      console.error('Errore Medusa select payment session:', errorText)
      return NextResponse.json(
        { error: 'Errore nella selezione del provider di pagamento' },
        { status: selectRes.status }
      )
    }

    const selectData = await selectRes.json()
    
    // Estrai il client secret da Stripe
    const paymentSession = selectData.cart?.payment_session
    const clientSecret = paymentSession?.data?.client_secret

    if (!clientSecret) {
      console.error('Client secret non trovato nella risposta:', selectData)
      return NextResponse.json(
        { error: 'Impossibile ottenere il client secret per il pagamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...selectData,
      client_secret: clientSecret
    })
  } catch (error) {
    console.error('Errore payment session route:', error)
    return NextResponse.json(
      { error: 'Errore del server' },
      { status: 500 }
    )
  }
}

