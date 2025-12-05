import { api, MEDUSA_REGION_ID } from '@/lib/medusa'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { LikeButton } from "@/components/like-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Truck, Shield, RotateCcw, Flag, Star, Heart } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Metadata } from 'next'
import { addToCart } from './actions'
import { VariantSelector } from './variant-selector'
import { AddToCartSection } from './add-to-cart-section'
import { ProductImageGallery } from '@/components/product-image-gallery'
import { MarkdownContent } from '@/components/markdown-content'

export const revalidate = 300
export const dynamicParams = true // Permette il rendering dinamico di prodotti non pre-generati

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  // Validazione params per metadata
  if (!params || !params.handle || typeof params.handle !== 'string' || params.handle.trim() === '') {
    return {
      title: 'Prodotto non trovato - Bar Europa',
    }
  }

  const handle = params.handle.trim()

  try {
    const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : ''
    const queryString = `handle=${encodeURIComponent(handle)}&limit=1${regionParam}`
    const data = await api(
      `/store/products?${queryString}`,
      { next: { revalidate: 300 } }
    )
    
    // Handle different response structures
    let products: any[] = []
    if (Array.isArray(data)) {
      products = data
    } else if (data?.products && Array.isArray(data.products)) {
      products = data.products
    } else if (data?.product) {
      products = [data.product]
    }
    
    const product = products[0]
    
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
    console.error('Error in generateMetadata:', error)
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
  // Validazione robusta dei params
  if (!params || !params.handle || typeof params.handle !== 'string' || params.handle.trim() === '') {
    console.error('[ProductPage] Invalid params:', params)
    notFound()
  }

  const handle = params.handle.trim()
  
  try {
    const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : ''
    const queryString = `handle=${encodeURIComponent(handle)}&limit=1${regionParam}`
    
    console.log('[ProductPage] Fetching product with handle:', handle)
    console.log('[ProductPage] Query string:', queryString)
    
    let data
    try {
      data = await api(
        `/store/products?${queryString}`,
        { next: { revalidate: 300 } }
      )
    } catch (apiError) {
      console.error('[ProductPage] API error:', apiError)
      // Se l'API restituisce un errore, prova il fallback
      throw apiError
    }
    
    console.log('[ProductPage] API response structure:', {
      isArray: Array.isArray(data),
      hasProducts: !!data?.products,
      hasProduct: !!data?.product,
      keys: Object.keys(data || {}),
      dataType: typeof data,
      dataPreview: JSON.stringify(data).substring(0, 200)
    })
    
    // Handle different response structures
    let products: any[] = []
    if (Array.isArray(data)) {
      products = data
    } else if (data?.products && Array.isArray(data.products)) {
      products = data.products
    } else if (data?.product) {
      products = [data.product]
    } else if (data && typeof data === 'object') {
      // Se data è un oggetto ma non ha products/product, potrebbe essere un singolo prodotto
      if (data.id && data.title) {
        products = [data]
      }
    }
    
    console.log('[ProductPage] Products extracted:', {
      count: products.length,
      firstProductId: products[0]?.id,
      firstProductHandle: products[0]?.handle,
      firstProductTitle: products[0]?.title
    })
    
    const product: Product | undefined = products[0]
    let enrichedProduct: any | undefined

    if (!product) {
      console.error('[ProductPage] Product not found for handle:', handle)
      console.error('[ProductPage] Available products count:', products.length)
      // Non chiamare notFound() qui, lascia che il fallback ci provi
      throw new Error(`Product not found for handle: ${handle}`)
    }
    
    console.log('[ProductPage] Product found:', product.id, product.title)

    // Enrich categories/collection if missing
    if (product && (!product.categories || product.categories.length === 0) && !product.collection) {
      try {
        const enriched = await api(`/store/products/${product.id}`, { next: { revalidate: 300 } })
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

        <main id="main-content" className="pt-16">
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

                    <MarkdownContent 
                      content={product.description} 
                      className="mb-6"
                      fallback=""
                    />
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">Descrizione</h3>
                    <MarkdownContent 
                      content={product.description}
                      fallback="Descrizione dettagliata non disponibile."
                    />
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
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <Flag className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">Prodotto artigianale italiano</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">Ingredienti di prima qualità</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">Preparato secondo tradizione</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    )
  } catch (error) {
    console.error('[ProductPage] Error fetching product:', error)
    // Se l'errore è un 404 o simile, restituisci notFound
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
      notFound()
    }
    
    // Try alternative approach: fetch all products and filter by handle
    try {
      console.log('[ProductPage] Trying fallback: fetch all products and filter by handle')
      const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : ''
      const allProductsData = await api(
        `/store/products?limit=1000${regionParam}`,
        { next: { revalidate: 300 } }
      )
      
      let allProducts: any[] = []
      if (Array.isArray(allProductsData)) {
        allProducts = allProductsData
      } else if (allProductsData?.products && Array.isArray(allProductsData.products)) {
        allProducts = allProductsData.products
      }
      
      const foundProduct = allProducts.find((p: any) => p.handle === handle)
      
      if (foundProduct) {
        console.log('[ProductPage] Product found via fallback:', foundProduct.id, foundProduct.title)
        // Use the found product and continue with normal rendering
        // We'll process it the same way as the normal flow
        const product: Product = foundProduct
        
        // Enrich categories/collection if missing
        if (product && (!product.categories || product.categories.length === 0) && !product.collection) {
          try {
            const enriched = await api(`/store/products/${product.id}`, { next: { revalidate: 300 } })
            if (enriched && enriched.product) {
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

          const productWeightOption = product.options?.find(o => /peso|weight/i.test(o.title))
          if (productWeightOption) {
            const vo = variant.options?.find(o => o.option_id === productWeightOption.id)
            if (vo && !isDefaultOptionValue(vo.value)) return vo.value
          }

          const guess = variant.options?.map(o => o.value).find(v => v && /(\d+\s?(g|kg))$/i.test(v))
          if (guess) return guess

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
        
        const hasMultipleVariants = !!(product.variants && product.variants.length > 1)

        // Render the product page (same as normal flow)
        return (
          <div className="min-h-screen bg-background">
            <Navigation />

            <main id="main-content" className="pt-16">
              <div className="bg-muted/30 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary">Prodotti</Link>
                    <span>/</span>
                    <span className="text-foreground">{product.title}</span>
                  </div>
                </div>
              </div>

              <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Torna ai Prodotti
                  </Link>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ProductImageGallery main={mainImage} images={images} alt={product.title} />

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
                          <div className="mb-6">
                            <VariantSelector product={product} />
                          </div>
                        ) : (
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

                        <MarkdownContent 
                          content={product.description} 
                          className="mb-6"
                          fallback=""
                        />
                      </div>

                      <AddToCartSection 
                        product={product}
                        price={price}
                        weight={weight}
                        image={mainImage}
                        hasMultipleVariants={hasMultipleVariants}
                      />

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

              <section className="py-12 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-display text-xl font-semibold mb-4">Descrizione</h3>
                        <MarkdownContent 
                          content={product.description}
                          fallback="Descrizione dettagliata non disponibile."
                        />
                      </CardContent>
                    </Card>

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

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-display text-xl font-semibold mb-4">Dettagli</h3>
                        <div className="space-y-4 text-sm">
                          <div className="flex items-start gap-3">
                            <Flag className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">Prodotto artigianale italiano</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Star className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">Ingredienti di prima qualità</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <Heart className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">Preparato secondo tradizione</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>
            </main>

            <Footer />
          </div>
        )
      }
    } catch (fallbackError) {
      console.error('[ProductPage] Fallback also failed:', fallbackError)
      // Se anche il fallback fallisce, prova un ultimo tentativo con retry
      try {
        console.log('[ProductPage] Attempting final retry with handle:', handle)
        const retryRegionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : ''
        // Retry con un breve delay simulato (Next.js gestisce automaticamente)
        const retryData = await api(
          `/store/products?handle=${encodeURIComponent(handle)}&limit=1${retryRegionParam}`,
          { next: { revalidate: 0 } } // Forza un fetch fresco
        )
        
        let retryProducts: any[] = []
        if (Array.isArray(retryData)) {
          retryProducts = retryData
        } else if (retryData?.products && Array.isArray(retryData.products)) {
          retryProducts = retryData.products
        } else if (retryData?.product) {
          retryProducts = [retryData.product]
        }
        
        if (retryProducts.length > 0 && retryProducts[0]) {
          console.log('[ProductPage] Product found via retry')
          // Se trovato, ricarica la pagina con il prodotto trovato
          // In Next.js App Router, possiamo semplicemente continuare con il rendering
          // ma per sicurezza chiamiamo notFound se non c'è prodotto
          if (!retryProducts[0].id) {
            notFound()
          }
        } else {
          notFound()
        }
      } catch (retryError) {
        console.error('[ProductPage] Final retry also failed:', retryError)
        notFound()
      }
    }
    
    // Se arriviamo qui senza aver trovato il prodotto, mostra 404
    notFound()
  }
}

export async function generateStaticParams() {
  try {
    const regionParam = MEDUSA_REGION_ID ? `&region_id=${MEDUSA_REGION_ID}` : ''
    const data = await api(`/store/products?limit=1000${regionParam}`, { next: { revalidate: 300 } })
    
    // Handle different response structures (same as in ProductDetails)
    let products: any[] = []
    if (Array.isArray(data)) {
      products = data
    } else if (data?.products && Array.isArray(data.products)) {
      products = data.products
    } else if (data?.product) {
      products = [data.product]
    }
    
    // Filter out products without handles
    const validProducts = products.filter((product: any) => product?.handle)
    
    return validProducts.map((product: any) => ({ 
      handle: product.handle 
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Return empty array to allow dynamic rendering
    return []
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  // Validazione params anche nel componente principale per sicurezza
  if (!params || !params.handle || typeof params.handle !== 'string' || params.handle.trim() === '') {
    notFound()
  }

  // Assicurati che params sia sempre un oggetto valido
  const safeParams = {
    handle: params.handle.trim()
  }

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
      <ProductDetails params={safeParams} />
    </Suspense>
  )
}
