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

    // Prima, assicuriamoci che il carrello abbia il billing address
    console.log('[Payment Session] Ensuring cart has billing address...')
    const cartCheckRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: { 'x-publishable-api-key': PUBLISHABLE_API_KEY },
    })
    
    if (cartCheckRes.ok) {
      const cartCheckData = await cartCheckRes.json()
      const cart = cartCheckData.cart || cartCheckData
      
      // Se non ha billing address, copialo dallo shipping address
      if (!cart.billing_address && cart.shipping_address) {
        console.log('[Payment Session] Adding billing address from shipping address...')
        await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_API_KEY,
          },
          body: JSON.stringify({
            billing_address: cart.shipping_address
          }),
        })
      }
    }

    // In Medusa v2, inizializza le sessioni di pagamento con endpoint diverso
    console.log('[Payment Session] Initializing payment collection...')
    const initRes = await fetch(`${MEDUSA_BACKEND_URL}/store/payment-collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        cart_id: cartId,
      }),
    })

    if (!initRes.ok) {
      const errorText = await initRes.text()
      console.error('[Payment Session] Init failed:', initRes.status, errorText)
      return NextResponse.json(
        { error: 'Errore nell\'inizializzazione del pagamento', details: errorText },
        { status: initRes.status }
      )
    }

    const initData = await initRes.json()
    console.log('[Payment Session] Payment collection response:', JSON.stringify(initData, null, 2))
    
    const paymentCollection = initData.payment_collection
    
    if (!paymentCollection) {
      console.error('[Payment Session] No payment_collection in response')
      return NextResponse.json(
        { error: 'Impossibile creare la payment collection', details: 'payment_collection not found in response' },
        { status: 500 }
      )
    }

    if (!paymentCollection.payment_sessions || paymentCollection.payment_sessions.length === 0) {
      console.error('[Payment Session] No payment sessions available. Payment collection:', JSON.stringify(paymentCollection, null, 2))
      
      // Verifica se il carrello ha un metodo di spedizione
      const cartCheck = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        headers: { 'x-publishable-api-key': PUBLISHABLE_API_KEY },
      })
      const cartCheckData = await cartCheck.json()
      console.error('[Payment Session] Cart state:', {
        hasShippingMethods: !!cartCheckData.cart?.shipping_methods?.length,
        shippingMethods: cartCheckData.cart?.shipping_methods,
        hasAddress: !!cartCheckData.cart?.shipping_address,
      })
      
      return NextResponse.json(
        { 
          error: 'Nessuna sessione di pagamento disponibile', 
          details: 'Assicurati che il metodo di spedizione sia selezionato',
          debug: {
            hasPaymentSessions: !!paymentCollection.payment_sessions,
            paymentSessionsCount: paymentCollection.payment_sessions?.length || 0,
          }
        },
        { status: 500 }
      )
    }

    // Trova la sessione Stripe
    const stripeSession = paymentCollection.payment_sessions.find(
      (session: any) => session.provider_id === 'pp_stripe_stripe' || session.provider_id.includes('stripe')
    )

    if (!stripeSession) {
      console.error('[Payment Session] Stripe session not found. Available:', 
        paymentCollection.payment_sessions.map((s: any) => s.provider_id))
      return NextResponse.json(
        { error: 'Stripe non configurato come metodo di pagamento' },
        { status: 500 }
      )
    }

    const clientSecret = stripeSession.data?.client_secret

    if (!clientSecret) {
      console.error('[Payment Session] Client secret not found in session:', stripeSession)
      return NextResponse.json(
        { error: 'Impossibile ottenere il client secret per il pagamento' },
        { status: 500 }
      )
    }

    console.log('[Payment Session] Success - client secret obtained')
    
    // Ottieni il carrello aggiornato
    const cartRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
    })
    
    const cartData = cartRes.ok ? await cartRes.json() : { cart: null }

    return NextResponse.json({
      cart: cartData.cart,
      payment_collection: paymentCollection,
      client_secret: clientSecret,
    })
  } catch (error) {
    console.error('[Payment Session] Error:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

