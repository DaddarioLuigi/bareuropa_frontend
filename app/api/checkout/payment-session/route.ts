import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, providerId } = body

    console.log('[Payment Session] Request:', { cartId, providerId })

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID mancante' }, { status: 400 })
    }

    if (!PUBLISHABLE_API_KEY) {
      console.error('[Payment Session] Missing MEDUSA_PUBLISHABLE_API_KEY')
      return NextResponse.json({ error: 'Configurazione API mancante' }, { status: 500 })
    }

    // Inizializza le sessioni di pagamento
    console.log('[Payment Session] Initializing payment sessions...')
    const initRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/payment-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })

    if (!initRes.ok) {
      const errorText = await initRes.text()
      console.error('[Payment Session] Init failed:', initRes.status, errorText)
      return NextResponse.json(
        { error: 'Errore nell\'inizializzazione delle sessioni di pagamento', details: errorText },
        { status: initRes.status }
      )
    }

    const initData = await initRes.json()
    console.log('[Payment Session] Init success')
    
    // Seleziona il provider di pagamento (Stripe)
    console.log('[Payment Session] Selecting provider:', providerId || 'stripe')
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
      console.error('[Payment Session] Select failed:', selectRes.status, errorText)
      return NextResponse.json(
        { error: 'Errore nella selezione del provider di pagamento', details: errorText },
        { status: selectRes.status }
      )
    }

    const selectData = await selectRes.json()
    console.log('[Payment Session] Select success')
    
    // Estrai il client secret da Stripe
    const paymentSession = selectData.cart?.payment_session
    const clientSecret = paymentSession?.data?.client_secret

    if (!clientSecret) {
      console.error('[Payment Session] Client secret not found:', JSON.stringify(selectData, null, 2))
      return NextResponse.json(
        { error: 'Impossibile ottenere il client secret per il pagamento' },
        { status: 500 }
      )
    }

    console.log('[Payment Session] Success - client secret obtained')
    return NextResponse.json({
      ...selectData,
      client_secret: clientSecret
    })
  } catch (error) {
    console.error('[Payment Session] Error:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

