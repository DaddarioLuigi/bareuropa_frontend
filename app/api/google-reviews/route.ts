import { NextRequest, NextResponse } from 'next/server'

// Interfaccia per le recensioni Google
export interface GoogleReview {
  author_name: string
  author_url?: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

interface GooglePlacesResponse {
  result?: {
    reviews?: GoogleReview[]
    rating?: number
    user_ratings_total?: number
  }
  status: string
  error_message?: string
}

export async function GET(request: NextRequest) {
  const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
  const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJ...' // Place ID di Bar Europa

  // Se non c'è la chiave API, restituisci un errore o dati mock
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API Key non configurata')
    return NextResponse.json(
      { 
        error: 'Google Places API Key non configurata',
        message: 'Configura GOOGLE_PLACES_API_KEY e GOOGLE_PLACE_ID nelle variabili d\'ambiente'
      },
      { status: 503 }
    )
  }

  try {
    // Chiamata all'API di Google Places per ottenere i dettagli del luogo
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${GOOGLE_PLACE_ID}&fields=reviews,rating,user_ratings_total&key=${GOOGLE_PLACES_API_KEY}&language=it`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data: GooglePlacesResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message)
      return NextResponse.json(
        { 
          error: 'Errore nel recupero delle recensioni',
          status: data.status,
          message: data.error_message
        },
        { status: 500 }
      )
    }

    // Estrai le recensioni
    const reviews = data.result?.reviews || []
    const rating = data.result?.rating || 0
    const totalRatings = data.result?.user_ratings_total || 0

    return NextResponse.json({
      reviews,
      rating,
      totalRatings,
      status: 'success'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache per 1 ora
      },
    })
  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return NextResponse.json(
      { 
        error: 'Errore nel recupero delle recensioni',
        message: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
}

