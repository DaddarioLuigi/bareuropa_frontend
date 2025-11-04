import { api, MEDUSA_REGION_ID } from '@/lib/medusa'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/like-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Metadata } from 'next'
import { addToCart } from './actions'
import { VariantSelector } from './variant-selector'
import { AddToCartSection } from './add-to-cart-section'
import { ProductImageGallery } from '@/components/product-image-gallery'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  try {
    const data = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products?region_id=${MEDUSA_REGION_ID}&handle=${encodeURIComponent(params.handle)}&limit=1`,
      {
        next: { revalidate: 300 },
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        },
      }
    ).then(r => r.json())
    const products = data.products ?? data
    const product = Array.isArray(products) ? products[0] : undefined
    
    if (!product) {
      return {
        title: 'Prodotto non trovato - Bar Europa',
      }
    }

    return {
      title: `${product.title} - Bar Europa`,
      description: product.description || `Scopri ${product.title}, un prodotto artigianale della tradizione italiana`,
      openGraph: {
        title: `${product.title} - Bar Europa`,
        description: product.description || `Scopri ${product.title}, un prodotto artigianale della tradizione italiana`,
        images: product.images && product.images.length > 0 ? [product.images[0].url] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Prodotto - Bar Europa',
    }
  }
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
  variants?: Array<{
    id: string
    title: string
    weight?: number
    length?: number
    height?: number
    width?: number
    calculated_price?: {
      calculated_amount: number
      currency_code: string
    }
    prices?: Array<{
      id: string
      amount: number
      currency_code: string
    }>
    options?: Array<{
      id: string
      option_id?: string
      value: string
    }>
  }>
  options?: Array<{
    id: string
    title: string
  }>
  categories?: Array<{
    id: string
    name: string
    handle?: string
  }>
  collection?: {
    id: string
    title: string
  }
  weight?: number | string
  length?: number | string
  height?: number | string
  width?: number | string
  type?: {
    id: string
    value: string
  }
  tags?: Array<{
    id: string
    value: string
  }>
}

interface ProductPageProps {
  params: { handle: string }
}

async function ProductDetails({ params }: ProductPageProps) {
  try {
    const data = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products?region_id=${MEDUSA_REGION_ID}&handle=${encodeURIComponent(params.handle)}&limit=1`,
      {
        next: { revalidate: 300 },
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        },
      }
    ).then(r => r.json())
    const products = data.products ?? data
    const product: Product | undefined = Array.isArray(products) ? products[0] : undefined
    let enrichedProduct: any | undefined

    if (!product) {
      notFound()
    }

    // Enrich categories/collection if missing
    if (product && (!product.categories || product.categories.length === 0) && !product.collection) {
      try {
        const enriched = await fetch(
          `${process.env.MEDUSA_BACKEND_URL}/store/products/${product.id}`,
          {
            next: { revalidate: 300 },
            headers: {
              'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
            },
          }
        ).then(r => r.json())
        if (enriched && enriched.product) {
          enrichedProduct = enriched.product
          product.categories = enriched.product.categories || product.categories
          product.collection = enriched.product.collection || product.collection
        }
      } catch {}
    }

    // Get price from the first variant
    const firstVariant = product.variants?.[0]
    const price = firstVariant?.calculated_price?.calculated_amount ?? 
      (firstVariant?.prices?.[0]?.amount ? firstVariant.prices[0].amount / 100 : 0)
    
    const isDefaultOptionValue = (value?: string) => {
      if (!value) return false
      const v = value.toLowerCase()
      return v === 'default option value' || v === 'default' || v === 'default option'
    }

    const toNumber = (v: unknown): number | undefined => {
      if (v == null) return undefined
      if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
      if (typeof v === 'string') {
        const n = parseFloat(v.replace(',', '.'))
        return Number.isNaN(n) ? undefined : n
      }
      return undefined
    }

    const formatWeight = (w?: number) => {
      if (typeof w === 'number' && w > 0) {
        if (w >= 1000) return `${(w / 1000).toFixed(2)} kg`
        if (w <= 10) return `${w} kg`
        return `${w} g`
      }
      return undefined
    }

    const formatDimensions = (l?: number, h?: number, w?: number) => {
      const parts: string[] = []
      if (typeof l === 'number' && l > 0) parts.push(`${l}`)
      if (typeof h === 'number' && h > 0) parts.push(`${h}`)
      if (typeof w === 'number' && w > 0) parts.push(`${w}`)
      if (parts.length === 0) return undefined
      return parts.join(' × ')
    }

    const getWeightLabel = (product: Product, variant?: Product['variants'][number]) => {
      if (!variant) return 'N/A'
      const byNumeric = formatWeight(variant.weight ?? toNumber(product.weight))
      if (byNumeric) return byNumeric

      // Try to find an option titled Peso/Weight
      const productWeightOption = product.options?.find(o => /peso|weight/i.test(o.title))
      if (productWeightOption) {
        const vo = variant.options?.find(o => o.option_id === productWeightOption.id)
        if (vo && !isDefaultOptionValue(vo.value)) return vo.value
      }

      // Fallback: pick a variant option that looks like a weight (e.g., 500g, 1kg)
      const guess = variant.options?.map(o => o.value).find(v => v && /(\d+\s?(g|kg))$/i.test(v))
      if (guess) return guess

      // Final fallback: ignore default-looking values
      const firstNonDefault = variant.options?.map(o => o.value).find(v => v && !isDefaultOptionValue(v))
      return firstNonDefault || 'N/A'
    }

    const weight = getWeightLabel(product, firstVariant)
    const dims = formatDimensions(
      firstVariant?.length ?? toNumber(product.length),
      firstVariant?.height ?? toNumber(product.height),
      firstVariant?.width ?? toNumber(product.width)
    )
    const category = product.collection?.title || "Generale"
    const images = product.images || []
    const mainImage = images.length > 0 ? images[0].url : (product.thumbnail || "/placeholder.svg")
    
    // Check if product has multiple variants
    const hasMultipleVariants = !!(product.variants && product.variants.length > 1)

    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-16">
          {/* Breadcrumb */}
          <div className="bg-muted/30 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
                <span>/</span>
                <Link href="/products" className="hover:text-primary">
                  Prodotti
                </Link>
                <span>/</span>
                <span className="text-foreground">{product.title}</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
                <ArrowLeft className="h-4 w-4" />
                Torna ai Prodotti
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <ProductImageGallery main={mainImage} images={images} alt={product.title} />

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{category}</Badge>
                    </div>

                    <h1 className="font-display text-3xl font-bold text-primary mb-4">{product.title}</h1>

                    <div className="mb-4 flex items-center gap-2">
                      <LikeButton productId={product.id} />
                    </div>

                    {hasMultipleVariants ? (
                      // Multiple variants - show dropdown
                      <div className="mb-6">
                        <VariantSelector product={product} />
                      </div>
                    ) : (
                      // Single variant - show price
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl font-bold text-primary">€{price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">({weight})</span>
                        </div>
                        {dims && (
                          <div className="text-xs text-muted-foreground">Dimensioni: {dims}</div>
                        )}
                      </div>
                    )}

                    <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
                  </div>

                  {/* Add to Cart */}
                  <AddToCartSection 
                    product={product}
                    price={price}
                    weight={weight}
                    image={mainImage}
                    hasMultipleVariants={hasMultipleVariants}
                  />

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center">
                      <Truck className="h-6 w-6 mx-auto mb-2 text-accent" />
                      <p className="text-sm font-medium">Spedizione Gratuita</p>
                      <p className="text-xs text-muted-foreground">Ordini sopra €50</p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                      <p className="text-sm font-medium">Qualità Garantita</p>
                      <p className="text-xs text-muted-foreground">Prodotti artigianali</p>
                    </div>
                    <div className="text-center">
                      <RotateCcw className="h-6 w-6 mx-auto mb-2 text-accent" />
                      <p className="text-sm font-medium">Reso Facile</p>
                      <p className="text-xs text-muted-foreground">Entro 14 giorni</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Details Tabs */}
          <section className="py-12 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">Descrizione</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description || "Descrizione dettagliata non disponibile."}
                    </p>
                  </CardContent>
                </Card>

                {/* Ingredients */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">Informazioni</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Peso:</span>
                        <span className="font-medium">{weight}</span>
                      </div>
                      {dims && (
                        <div className="flex justify-between">
                          <span>Dimensioni:</span>
                          <span className="font-medium">{dims}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Categoria:</span>
                        <span className="font-medium">{category}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">Dettagli</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Prodotto artigianale italiano</p>
                      <p>Ingredienti di prima qualità</p>
                      <p>Preparato secondo tradizione</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Debug: raw product data */}
          <section className="py-6">
            <Card>
              <CardContent className="p-6">
                <details>
                  <summary className="cursor-pointer select-none text-sm text-muted-foreground">Vedi dati grezzi prodotto (debug)</summary>
                  <pre className="mt-4 text-xs overflow-x-auto whitespace-pre-wrap break-words">
{JSON.stringify({ product, enrichedProduct }, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}

export async function generateStaticParams() {
  try {
    const data = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/products?limit=1000&region_id=${MEDUSA_REGION_ID}`, {
      next: { revalidate: 300 },
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      },
    }).then(r => r.json())
    
    const products = data.products ?? data
    
    // Ensure products is an array
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products)
      return []
    }
    
    return products.map((product: Product) => ({ 
      handle: product.handle 
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductDetails params={params} />
    </Suspense>
  )
}
