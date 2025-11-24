import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartId, code } = body

    console.log('[Apply Discount] Request:', { cartId, code })

    if (!cartId || !code) {
      return NextResponse.json({ error: 'Cart ID e codice promozionale richiesti' }, { status: 400 })
    }

    const codeToApply = code.toUpperCase().trim()

    // In Medusa v2, l'endpoint per applicare i codici promozionali è /store/carts/{id}/promotions
    // con il body che contiene il codice promozionale
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        code: codeToApply
      })
    })

    console.log('[Apply Discount] Response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Apply Discount] Failed:', res.status, errorText)
      
      // Se l'endpoint /promotions non esiste, prova con /discounts
      if (res.status === 404 || res.status === 405) {
        console.log('[Apply Discount] Endpoint /promotions non disponibile, provo con /discounts')
        
        const res2 = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/discounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_API_KEY,
          },
          body: JSON.stringify({
            code: codeToApply
          })
        })

        if (!res2.ok) {
          const errorText2 = await res2.text()
          console.error('[Apply Discount] Failed anche con /discounts:', res2.status, errorText2)
          
          let errorData
          try {
            errorData = JSON.parse(errorText2)
          } catch {
            errorData = { message: errorText2 || 'Codice promozionale non valido' }
          }
          
          const errorMessage = errorData.message || 
                               errorData.error?.message || 
                               errorData.error || 
                               (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                               (errorData.details && errorData.details.message) ||
                               'Codice promozionale non valido'
          
          return NextResponse.json(
            { error: errorMessage, details: errorText2 },
            { status: res2.status }
          )
        }

        const data = await res2.json()
        console.log('[Apply Discount] Success con endpoint /discounts')
        return NextResponse.json(data)
      }
      
      // Per altri errori, restituisci l'errore originale
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Codice promozionale non valido' }
      }
      
      const errorMessage = errorData.message || 
                           errorData.error?.message || 
                           errorData.error || 
                           (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                           (errorData.details && errorData.details.message) ||
                           'Codice promozionale non valido'
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Apply Discount] Success. Cart updated:', !!data.cart)
    return NextResponse.json(data)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Apply Discount] Failed:', res.status, errorText)
      
      // Prova a parsare l'errore come JSON
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || 'Codice promozionale non valido' }
      }
      
      const errorMessage = errorData.message || 
                           errorData.error?.message || 
                           errorData.error || 
                           (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
                           (errorData.details && errorData.details.message) ||
                           'Codice promozionale non valido'
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()
    console.log('[Apply Discount] Success. Cart updated:', !!data.cart)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore apply discount route:', error)
    return NextResponse.json(
      { error: 'Errore del server', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

