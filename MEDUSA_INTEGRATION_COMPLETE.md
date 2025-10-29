# Bar Europa Frontend - Medusa Integration

A complete Next.js storefront integrated with Medusa e-commerce backend, featuring server-side rendering, ISR, and modern UI components.

## Features

- ✅ **Complete Medusa Integration** - Store API with server-side rendering
- ✅ **Product List Page (PLP)** - `/products` with ISR and search
- ✅ **Product Detail Page (PDP)** - `/products/[handle]` with SSG+ISR
- ✅ **Cart Management** - Server-side cart with API routes
- ✅ **Authentication** - Minimal login/register pages
- ✅ **SEO Optimized** - Sitemap, robots.txt, metadata
- ✅ **On-demand Revalidation** - API route for cache invalidation
- ✅ **Loading States** - Skeleton components for better UX
- ✅ **TypeScript** - Fully typed with proper interfaces

## Environment Setup

Create a `.env.local` file with the following variables:

```bash
# Medusa Backend Configuration
MEDUSA_BACKEND_URL=https://your-medusa-backend.railway.app

# Optional: Publishable API Key (if needed)
MEDUSA_PUBLISHABLE_API_KEY=your_publishable_key_here

# Revalidation Secret (for on-demand revalidation)
REVALIDATE_SECRET=your_secret_key_here

# Next.js Configuration
NEXT_PUBLIC_MEDUSA_URL=https://your-medusa-backend.railway.app
```

## Vercel Deployment

1. Set the same environment variables in your Vercel project settings
2. Ensure your Medusa backend CORS settings include:
   - `http://localhost:3000` (for development)
   - `https://*.vercel.app` (for Vercel deployments)
   - Your custom domain (if applicable)

## API Endpoints Used

### Store API
- `GET /store/products` - List products with pagination and search
- `GET /store/products/{handle}` - Get product details with variants/images
- `POST /store/carts` - Create new cart
- `POST /store/carts/{id}/line-items` - Add item to cart
- `POST /store/carts/{id}/line-items/{lineId}` - Update item quantity
- `DELETE /store/carts/{id}/line-items/{lineId}` - Remove item from cart
- `POST /store/customers` - Register new customer
- `POST /store/auth` - Customer login

### Next.js API Routes
- `POST /api/cart/create` - Create cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove cart item
- `POST /api/cart/clear` - Clear entire cart
- `POST /api/revalidate` - On-demand revalidation

## File Structure

```
app/
├── products/
│   ├── page.tsx              # Product list page (PLP)
│   ├── loading.tsx           # Loading skeleton
│   └── [handle]/
│       ├── page.tsx          # Product detail page (PDP)
│       └── loading.tsx       # Loading skeleton
├── cart/
│   └── page.tsx              # Cart page
├── login/
│   └── page.tsx              # Login page
├── register/
│   └── page.tsx              # Register page
├── api/
│   ├── cart/                 # Cart API routes
│   └── revalidate/            # Revalidation API
├── sitemap.ts                # Dynamic sitemap
├── robots.txt                # SEO robots file
└── layout.tsx               # Root layout with metadata

lib/
└── medusa.ts                 # Server-side API client + types

components/
└── navigation.tsx           # Updated navigation
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Testing

1. Visit `/products` to see the product list
2. Click on a product to view details
3. Add items to cart and visit `/cart`
4. Test login/register at `/login` and `/register`
5. Verify sitemap at `/sitemap.xml`
6. Check robots.txt at `/robots.txt`

## CORS Configuration

Ensure your Medusa backend has the following CORS settings:

```javascript
// In your Medusa backend configuration
store_cors: [
  "http://localhost:3000",
  "https://*.vercel.app",
  "https://yourdomain.com"
]
```

## Performance Features

- **ISR (Incremental Static Regeneration)** - Products list revalidates every 60s
- **SSG + ISR** - Product pages are statically generated with 300s revalidation
- **Server Components** - Cart and product pages use server-side rendering
- **Loading States** - Skeleton components for better perceived performance
- **Image Optimization** - Next.js automatic image optimization

## SEO Features

- **Dynamic Sitemap** - Automatically includes all product pages
- **Metadata API** - Dynamic metadata for each product page
- **Open Graph** - Social media sharing optimization
- **Canonical URLs** - Proper URL structure
- **Robots.txt** - Search engine directives

## Error Handling

- Graceful fallbacks for API failures
- Loading states for better UX
- Error boundaries for component failures
- Proper HTTP status codes in API routes


