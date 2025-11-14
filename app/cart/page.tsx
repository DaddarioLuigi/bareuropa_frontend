import { cookies } from 'next/headers'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ClearCartButton } from "@/components/clear-cart-button"
import { CartStateSync } from "@/components/cart-state-sync"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import { redirect } from 'next/navigation'

// Server Actions for cart operations
async function updateCartItem(formData: FormData) {
  'use server'
  
  const lineItemId = formData.get('lineItemId') as string
  const quantity = Number(formData.get('quantity'))
  
  if (!lineItemId || quantity === undefined) {
    throw new Error('Missing lineItemId or quantity')
  }
  
  const cartId = cookies().get('cart_id')?.value
  if (!cartId) {
    throw new Error('No cart found')
  }
  
  try {
    const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      },
      body: JSON.stringify({ quantity }),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to update item: ${errorText}`)
    }
    
    redirect('/cart')
  } catch (error) {
    console.error('Error updating cart item:', error)
    throw error
  }
}

async function removeCartItem(formData: FormData) {
  'use server'
  
  const lineItemId = formData.get('lineItemId') as string
  
  if (!lineItemId) {
    throw new Error('Missing lineItemId')
  }
  
  const cartId = cookies().get('cart_id')?.value
  if (!cartId) {
    throw new Error('No cart found')
  }
  
  try {
    const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
      method: 'DELETE',
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      }
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to remove item: ${errorText}`)
    }
    
    redirect('/cart')
  } catch (error) {
    console.error('Error removing cart item:', error)
    throw error
  }
}

async function clearCart() {
  'use server'
  
  const cartId = cookies().get('cart_id')?.value
  if (!cartId) {
    throw new Error('No cart found')
  }
  
  try {
    const cartRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      }
    })
    
    if (!cartRes.ok) {
      throw new Error('Failed to fetch cart')
    }
    
    const cart = await cartRes.json()
    
    // Remove all items from Medusa backend
    for (const item of cart.cart?.items || []) {
      await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
    }
    
    // Note: Local cart context will be cleared by the client-side component
    redirect('/cart?cleared=true')
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}

interface CartItem {
  id: string
  variant_id: string
  quantity: number
  thumbnail?: string
  title?: string
  product_title?: string
  variant_title?: string
  unit_price: number
  product?: {
    id: string
    title?: string
    thumbnail?: string
  }
}

interface Cart {
  id: string
  items: CartItem[]
  total: number
  subtotal: number
  tax_total: number
  shipping_total: number
  discount_total: number
  currency_code: string
}

async function CartContent() {
  let cartId = cookies().get('cart_id')?.value
  console.log('Cart page - cartId from cookie:', cartId)

  if (!cartId) {
    return (
      <div className="text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h1 className="font-display text-3xl font-bold text-primary mb-4">Il tuo carrello è vuoto</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Scopri i nostri deliziosi prodotti artigianali e aggiungi qualcosa al tuo carrello.
        </p>
        <Link href="/products">
          <Button size="lg" className="bg-accent hover:bg-accent/90">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Vai ai Prodotti
          </Button>
        </Link>
      </div>
    )
  }

  try {
    // Fetch cart directly from Medusa backend
    // Note: Medusa v2 doesn't use 'expand' parameter - data is returned by default
    const cartRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      },
      cache: 'no-store'
    })
    
    console.log('Cart fetch response status:', cartRes.status, cartRes.statusText)
    
    if (!cartRes.ok) {
      const errorText = await cartRes.text()
      console.error('Failed to fetch cart:', cartRes.status, cartRes.statusText, errorText)
      throw new Error(`Failed to fetch cart: ${cartRes.status} ${errorText}`)
    }
    
    const cartData = await cartRes.json()
    
    console.log('Cart data received:', JSON.stringify(cartData, null, 2))
    
    const cart: Cart = cartData.cart ?? cartData
    console.log('Cart after extraction:', cart)
    console.log('Cart items:', cart.items)

    if (!cart.items || cart.items.length === 0) {
      return (
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-display text-3xl font-bold text-primary mb-4">Il tuo carrello è vuoto</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Scopri i nostri deliziosi prodotti artigianali e aggiungi qualcosa al tuo carrello.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Vai ai Prodotti
            </Button>
          </Link>
        </div>
      )
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    // Medusa v2: subtotal is already in euros (no conversion needed)
    const subtotal = cart.subtotal || 0
    const shippingCost = subtotal >= 50 ? 0 : 5.9
    const total = subtotal + shippingCost

    return (
      <>
        {/* Header */}
        <div className="bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold text-primary">
              Carrello ({itemCount} {itemCount === 1 ? "articolo" : "articoli"})
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">I tuoi prodotti</h2>
                    <form action={clearCart}>
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent min-h-[44px]"
                        aria-label="Svuota tutto il carrello"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Svuota carrello
                      </Button>
                    </form>
              </div>

              {cart.items.map((item) => {
                // Medusa v2 structure: unit_price is already in euros (no conversion needed)
                const price = item.unit_price || 0
                const image = item.thumbnail || item.product?.thumbnail || "/placeholder.svg"
                const productTitle = item.product_title || item.title || item.product?.title || "Prodotto"
                const variantTitle = item.variant_title || "Standard"
                
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={image}
                            alt={productTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg mb-1 break-words">{productTitle}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 break-words">
                            Variante: {variantTitle}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <form action={updateCartItem} className="flex items-center border rounded-lg">
                                <input type="hidden" name="lineItemId" value={item.id} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  name="quantity"
                                  value={item.quantity - 1}
                                  disabled={item.quantity <= 1}
                                  aria-label={`Riduci quantità di ${productTitle}`}
                                  className="min-h-[44px] min-w-[44px]"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="px-2 sm:px-3 py-1 font-medium min-w-[3ch] text-center" aria-label={`Quantità: ${item.quantity}`}>{item.quantity}</span>
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  name="quantity"
                                  value={item.quantity + 1}
                                  aria-label={`Aumenta quantità di ${productTitle}`}
                                  className="min-h-[44px] min-w-[44px]"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </form>

                              <form action={removeCartItem}>
                                <input type="hidden" name="lineItemId" value={item.id} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
                                  aria-label={`Rimuovi ${productTitle} dal carrello`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </form>
                            </div>

                            <div className="text-left sm:text-right flex-shrink-0">
                              <p className="text-base sm:text-lg font-bold text-primary whitespace-nowrap">€{(price * item.quantity).toFixed(2)}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">€{price.toFixed(2)} cad.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Riepilogo Ordine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotale</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spedizione</span>
                      <span className="text-green-600">
                        {shippingCost === 0 ? "Gratuita" : `€${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <p className="text-sm text-muted-foreground break-words whitespace-normal">Spedizione gratuita per ordini sopra €50</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Totale</span>
                    <span className="text-primary">€{total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link href="/checkout" className="block">
                      <Button size="lg" className="w-full">
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Procedi al Checkout
                      </Button>
                    </Link>
                    <Link href="/products" className="block">
                      <Button variant="outline" size="lg" className="w-full bg-transparent">
                        Continua lo Shopping
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Spedizione in 24-48h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Pagamento sicuro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Reso entro 14 giorni</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching cart:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return (
      <div className="text-center py-16 max-w-2xl mx-auto px-4">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h2 className="text-xl font-semibold mb-4">Errore nel caricamento del carrello</h2>
        <p className="text-muted-foreground mb-6">
          Si è verificato un errore durante il caricamento del carrello dal server.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-red-500">{errorMessage}</p>
            <p className="text-xs text-muted-foreground mt-2">Cart ID: {cartId}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Link href="/products">
            <Button>Torna ai Prodotti</Button>
          </Link>
          <ClearCartButton />
        </div>
      </div>
    )
  }
}

export default async function CartPage() {
  // Get cart item count for sync
  const cartId = cookies().get('cart_id')?.value
  let itemCount = 0
  
  if (cartId) {
    try {
      const cartRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        cache: 'no-store'
      })
      
      if (cartRes.ok) {
        const cartData = await cartRes.json()
        const cart = cartData.cart ?? cartData
        itemCount = cart.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
      }
    } catch (error) {
      console.error('Error fetching cart for sync:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CartStateSync serverCartItemCount={itemCount} />

      <main id="main-content" className="pt-16">
        <CartContent />
      </main>

      <Footer />
    </div>
  )
}
