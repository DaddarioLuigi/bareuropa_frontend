import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use production domain, not preview deployments
  // Priority: NEXT_PUBLIC_SITE_URL > production domain > localhost
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  
  if (!siteUrl) {
    // Always use the verified production domain
    // Don't use VERCEL_URL as it might be a preview deployment URL
    // This ensures Google Search Console always sees the correct domain
    if (process.env.VERCEL) {
      // On Vercel (production or preview), use the verified domain
      siteUrl = 'https://bareuropa.vercel.app'
    } else {
      // Local development
      siteUrl = 'http://localhost:3000'
    }
  }
  
  // Static pages
  const staticPages = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/la-nostra-storia`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contatti`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = []
  
  try {
    const backend =
      process.env.MEDUSA_BACKEND_URL
      || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      || 'https://backend-production-d71e9.up.railway.app'
    const pubKey =
      process.env.MEDUSA_PUBLISHABLE_API_KEY
      || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY
      || ''

    const productsRes = await fetch(`${backend}/store/products?limit=1000`, {
      headers: pubKey ? { 'x-publishable-api-key': pubKey } : {},
      cache: 'no-store',
      next: { revalidate: 300 },
    })
    
    if (productsRes.ok) {
      const data = await productsRes.json()
      const products = data.products ?? data
      
      productPages = products.map((product: any) => ({
        url: `${siteUrl}/products/${product.handle}`,
        lastModified: new Date(product.updated_at || product.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  return [...staticPages, ...productPages]
}
