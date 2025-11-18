'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GoogleReview {
  author_name: string
  author_url?: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

interface ReviewsData {
  reviews: GoogleReview[]
  rating: number
  totalRatings: number
  status: string
}

export function GoogleReviewsSection() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-reviews')
        if (!response.ok) {
          const errorData = await response.json()
          // Se l'API key non è configurata, mostra un messaggio informativo
          if (response.status === 503) {
            setError('config_required')
            setLoading(false)
            return
          }
          throw new Error(errorData.message || 'Errore nel caricamento delle recensioni')
        }
        const data = await response.json()
        setReviewsData(data)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(err instanceof Error ? err.message : 'Errore sconosciuto')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <section id="recensioni" className="py-12 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Cosa dicono di noi
            </h2>
            <p className="text-muted-foreground mb-8">Caricamento recensioni...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error === 'config_required') {
    return (
      <section id="recensioni" className="py-12 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Cosa dicono di noi
            </h2>
            <p className="text-muted-foreground mb-8">
              Per visualizzare le recensioni Google, configura le variabili d'ambiente:
              <br />
              <code className="text-sm bg-muted px-2 py-1 rounded mt-2 inline-block">
                GOOGLE_PLACES_API_KEY
              </code>
              {' e '}
              <code className="text-sm bg-muted px-2 py-1 rounded">
                GOOGLE_PLACE_ID
              </code>
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !reviewsData || reviewsData.reviews.length === 0) {
    return null // Non mostrare nulla se non ci sono recensioni
  }

  const { reviews, rating, totalRatings } = reviewsData
  const displayedReviews = reviews.slice(0, 6) // Mostra le prime 6 recensioni

  return (
    <section id="recensioni" className="py-12 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Cosa dicono di noi
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Le opinioni dei nostri clienti sono importanti per noi
          </p>
          
          {/* Rating complessivo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Basato su {totalRatings} recensioni
              </p>
            </div>
          </div>
        </div>

        {/* Grid delle recensioni */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedReviews.map((review, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.profile_photo_url ? (
                      <img
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {review.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{review.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.relative_time_description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  {renderStars(review.rating)}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {review.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Link a Google per vedere tutte le recensioni */}
        <div className="text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <a
              href="https://www.google.com/maps/place/Bar+Pasticceria+Europa/@41.2775,16.4156"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vedi tutte le recensioni su Google
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

