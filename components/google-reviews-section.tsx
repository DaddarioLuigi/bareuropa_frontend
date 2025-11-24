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

// Recensioni statiche reali del Bar Europa di Trani
const staticReviews: GoogleReview[] = [
  {
    author_name: 'Pavlina Kushnir',
    rating: 5,
    relative_time_description: '2 mesi fa',
    text: 'Davvero complimenti. Raramente capita di rimanere soddisfatti, soprattutto la prima mattina. Personale molto gentile. Chiedo un cornetto vegano con crema e amarena e un cappuccino senza lattosio. Mi accomodo e aspetto la colazione. Rimango sorpresa quando mi arriva cappuccino. Davvero OTTIMO (ve lo dico da ex Barista con anni di esperienza) nonostante latte e senza lattosio. Cremoso al massimo (niente schiuma che capita raramente). MA SOLO CREMA DI LATTE. Di solito nei bar cornetto vegano non è che granché. Invece qui davvero buonissimo. La crema ottima. Amarena al punto giusto. Barista e titolare molto gentili. CONSIGLIO ASSOLUTAMENTE c\'è anche tanta scelta di dolci esclusivi.',
    time: Date.now() - 60 * 24 * 60 * 60 * 1000, // 2 mesi fa
  },
  {
    author_name: 'Dottoressa Sama T.',
    rating: 5,
    relative_time_description: '3 mesi fa',
    text: 'Ho ordinato una torta di anniversario la mattina presto per il giorno stesso e, prima dell\'ora di pranzo, il pasticcere mi ha contattata direttamente dicendo che fosse già pronta! Che dire: velocità e perfezione! Inoltre, ho inviato una foto trovata in rete ed è stata replicata perfettamente uguale a come la desideravo. Ultima nota: è senza lattosio e la professionalità in questo non è scontata considerata che non è da tutti!! Ultra consigliato!',
    time: Date.now() - 90 * 24 * 60 * 60 * 1000, // 3 mesi fa
  },
  {
    author_name: 'Giovanna Martinelli',
    rating: 5,
    relative_time_description: '6 mesi fa',
    text: 'Posto eccezionale... gentili disponibili e di grande professionalità... prodotti sempre freschi e di ottima qualità... per ogni compleanno e feste faccio realizzare torte ringrazio Francesco Farucci... il mio pasticcere preferito... grazie...',
    time: Date.now() - 180 * 24 * 60 * 60 * 1000, // 6 mesi fa
  },
  {
    author_name: 'Julien L.',
    rating: 5,
    relative_time_description: '4 mesi fa',
    text: 'Probabilmente i migliori cornetti di Trani.',
    time: Date.now() - 120 * 24 * 60 * 60 * 1000, // 4 mesi fa
  },
  {
    author_name: 'Anna Campana',
    rating: 5,
    relative_time_description: '1 mese fa',
    text: 'Bellissimo bar. Eravamo alla ricerca di un bar in cui trovare le famose tette delle monache e su Google mi è uscito subito "bar Europa". Sono contentissima di averle trovate.',
    time: Date.now() - 30 * 24 * 60 * 60 * 1000, // 1 mese fa
  },
  {
    author_name: 'Marco R.',
    rating: 5,
    relative_time_description: '2 settimane fa',
    text: 'Bar storico di Trani, sempre un piacere fermarsi qui. I dolci sono eccellenti, il caffè perfetto e il personale molto cortese. Ambiente accogliente e pulito. Consigliatissimo!',
    time: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 settimane fa
  },
]

// Calcola rating medio e totale dalle recensioni statiche
const staticRating = staticReviews.reduce((sum, review) => sum + review.rating, 0) / staticReviews.length
const staticTotalRatings = staticReviews.length

export function GoogleReviewsSection() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-reviews')
        if (response.ok) {
          const data = await response.json()
          // Se l'API restituisce recensioni, usale, altrimenti usa quelle statiche
          if (data.reviews && data.reviews.length > 0) {
            setReviewsData(data)
            setLoading(false)
            return
          }
        }
      } catch (err) {
        // In caso di errore, usa le recensioni statiche
        console.log('Usando recensioni statiche:', err)
      }
      
      // Usa le recensioni statiche come fallback
      setReviewsData({
        reviews: staticReviews,
        rating: staticRating,
        totalRatings: staticTotalRatings,
        status: 'success',
      })
      setLoading(false)
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
      <section id="recensioni" className="pt-6 sm:pt-12 pb-12 sm:pb-24 bg-background">
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

  // Usa le recensioni statiche se non ci sono dati dall'API
  const reviews = reviewsData?.reviews || staticReviews
  const rating = reviewsData?.rating || staticRating
  const totalRatings = reviewsData?.totalRatings || staticTotalRatings

  if (reviews.length === 0) {
    return null
  }

  const displayedReviews = reviews.slice(0, 6) // Mostra le prime 6 recensioni

  return (
    <section id="recensioni" className="pt-6 sm:pt-12 pb-12 sm:pb-24 bg-background">
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
                Basato su +450 recensioni
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
              href="https://www.google.com/maps/search/Bar+Pasticceria+Europa+Trani"
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

