import { api, MEDUSA_REGION_ID } from '@/lib/medusa'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import Link from "next/link"
import { Suspense } from "react"
import { Metadata } from 'next'

export const revalidate = 60 // ISR

export const metadata: Metadata = {
  title: 'Prodotti - Bar Europa',
  description: 'Scopri la nostra selezione di dolci tradizionali italiani, preparati con ingredienti di prima qualità',
  openGraph: {
    title: 'Prodotti - Bar Europa',
    description: 'Scopri la nostra selezione di dolci tradizionali italiani, preparati con ingredienti di prima qualità',
  },
}

interface Product {
  id: string
  title: string
  description?: string
  handle: string
  thumbnail?: string
  images?: Array<{
    id: string
    url: string
  }>
  variants: Array<{
    id: string
    title: string
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
    prices?: Array<{
      id: string
      amount: number
      currency_code: string
    }>
    options: Array<{
      id: string
      value: string
    }>
  }>
  categories?: Array<{
    id: string
    name: string
  }>
  collection?: {
    id: string
    title: string
  }
  type?: {
    id: string
    value: string
  }
  tags?: Array<{
    id: string
    value: string
  }>
}

interface ProductsPageProps {
  searchParams: { 
    q?: string
    page?: string 
  }
}

async function ProductsGrid({ searchParams }: ProductsPageProps) {
  const limit = 24
  const page = Number(searchParams?.page || 0)
  const q = searchParams?.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''
  
  try {
    const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : ''
    // Ensure we get prices and media by expanding the right relations
    const expand = '&expand=variants,variants.prices,images,options'
    const data = await api(`/store/products?limit=${limit}&offset=${page*limit}${regionParam}${q}${expand}`,
      {
        next: { revalidate: 60 },
      }
    )

    const products: Product[] = data.products ?? data

    if (products.length === 0) {
      return (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-4">Nessun prodotto trovato</h2>
          <p className="text-muted-foreground mb-6">
            {searchParams.q ? `Nessun risultato per "${searchParams.q}"` : 'Non ci sono prodotti disponibili al momento.'}
          </p>
          <Link href="/products">
            <Button variant="outline">Visualizza tutti i prodotti</Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => {
          // Get price from calculated_price (already in euros) or from prices (in cents)
          const variant = product.variants?.[0]
          const price = variant?.calculated_price?.calculated_amount ?? 
            (variant?.prices?.[0]?.amount ? variant.prices[0].amount / 100 : 0)
          const weight = variant?.options?.[0]?.value || "N/A"
          const category = product.collection?.title || "Generale"
          const image = product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"
          
          return (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={image}
                    alt={product.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link href={`/products/${product.handle}`}>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {category}
                  </Badge>
                </div>

                <CardTitle className="text-lg mb-2 line-clamp-1">{product.title}</CardTitle>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">
                    €{price.toFixed(2)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex gap-2">
                <Link href={`/products/${product.handle}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    Dettagli
                  </Button>
                </Link>
                {product.variants?.[0] && (
                  <div className="flex-1">
                    <AddToCartButton
                      productId={product.id}
                      variantId={product.variants[0].id}
                      productTitle={product.title}
                      price={price}
                      image={image}
                      weight={weight}
                      className="w-full bg-accent hover:bg-accent/90"
                      size="default"
                    />
                  </div>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Errore nel caricamento</h2>
        <p className="text-muted-foreground mb-6">
          Si è verificato un errore durante il caricamento dei prodotti.
        </p>
        <Link href="/products">
          <Button>
            Riprova
          </Button>
        </Link>
      </div>
    )
  }
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="p-0">
            <div className="w-full h-64 bg-muted animate-pulse rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-4 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 bg-muted animate-pulse rounded mb-4 w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Prodotti
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Scopri la nostra selezione di dolci tradizionali italiani, preparati con ingredienti di prima qualità
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <ProductsGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl font-bold text-primary mb-4">
              Tradizione e Qualità dal 1966
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Ogni prodotto è preparato artigianalmente nel nostro laboratorio, seguendo le ricette tradizionali
              tramandate di generazione in generazione.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/la-nostra-storia">
                <Button variant="outline" size="lg">
                  Scopri la Nostra Storia
                </Button>
              </Link>
              <Link href="/contatti">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  Contattaci
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
