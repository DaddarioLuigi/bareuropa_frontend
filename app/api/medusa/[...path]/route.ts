import { NextRequest, NextResponse } from 'next/server'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL
  || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  || 'https://backend-production-d71e9.up.railway.app'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/medusa', '')
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}${path}${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY
          || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY
          || '',
      },
    })
    
    // Controlla se la risposta è JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response:', text.substring(0, 200))
      return NextResponse.json({ error: 'Non-JSON response from backend' }, { status: 500 })
    }
    
    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/medusa', '')
  
  try {
    let body = null
    try {
      body = await request.json()
    } catch (e) {
      // Se non c'è body, va bene (alcune richieste POST non hanno body)
      console.log('[PROXY] POST senza body per:', path)
    }
    
    const requestUrl = `${MEDUSA_BACKEND_URL}${path}${url.search}`
    console.log('[PROXY] POST request to:', requestUrl)
    if (body) {
      console.log('[PROXY] Request body:', JSON.stringify(body, null, 2).substring(0, 500))
    }
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY
          || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY
          || '',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    
    console.log('[PROXY] Response status:', response.status, response.statusText)
    console.log('[PROXY] Response headers:', Object.fromEntries(response.headers.entries()))
    
    // Se la risposta non è OK, prova a leggere il testo dell'errore
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[PROXY] Error response from Medusa:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 1000),
        path
      })
      
      // Prova a parsare come JSON se possibile
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json({ 
          error: errorData.message || errorData.error || 'Errore da Medusa',
          details: errorData,
          status: response.status
        }, { status: response.status })
      } catch {
        // Se non è JSON, restituisci il testo
        return NextResponse.json({ 
          error: errorText || 'Errore da Medusa',
          status: response.status
        }, { status: response.status })
      }
    }
    
    // Controlla se la risposta è JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('[PROXY] Non-JSON response:', {
        contentType,
        text: text.substring(0, 500),
        path
      })
      return NextResponse.json({ 
        error: 'Non-JSON response from backend',
        contentType,
        text: text.substring(0, 200)
      }, { status: 500 })
    }
    
    const data = await response.json()
    console.log('[PROXY] Success response for:', path)
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error: any) {
    console.error('[PROXY] Proxy error:', {
      message: error.message,
      stack: error.stack,
      path,
      url: request.url
    })
    return NextResponse.json({ 
      error: 'Proxy failed',
      details: error.message || 'Errore sconosciuto',
      path
    }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
