'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Package, CreditCard, MapPin } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Schema di validazione per l'indirizzo di spedizione
const shippingSchema = z.object({
  email: z.string().min(1, 'Email richiesta').email('Email non valida'),
  first_name: z.string().min(2, 'Il nome deve avere almeno 2 caratteri'),
  last_name: z.string().min(2, 'Il cognome deve avere almeno 2 caratteri'),
  address_1: z.string().min(5, 'Indirizzo non valido'),
  address_2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'Città non valida'),
  province: z.string().min(2, 'Provincia non valida'),
  postal_code: z.string().min(5, 'CAP non valido'),
  country_code: z.string(),
  phone: z.string().min(10, 'Numero di telefono non valido')
})

type ShippingFormData = z.infer<typeof shippingSchema>

interface CartItem {
  id: string
  title: string
  quantity: number
  unit_price: number // Medusa v2: già in euro, non in centesimi
  thumbnail?: string
  variant: {
    title?: string
  }
}

interface Cart {
  id: string
  items: CartItem[]
  subtotal: number // Medusa v2: già in euro, non in centesimi
  shipping_total: number // Medusa v2: già in euro, non in centesimi
  tax_total: number // Medusa v2: già in euro, non in centesimi
  total: number // Medusa v2: già in euro, non in centesimi
  currency_code: string
  shipping_address?: any
  payment_session?: {
    provider_id: string
    data: {
      client_secret?: string
    }
  }
}

interface ShippingOption {
  id: string
  name: string
  amount: number
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

// Componente per il form di pagamento con Stripe
function CheckoutForm({ cart, onSuccess }: { cart: Cart, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(undefined)

    try {
      // In Medusa v2, confermiamo prima il pagamento, poi completiamo l'ordine nella pagina success
      // Passiamo il cart_id nell'URL così possiamo completare l'ordine dopo il pagamento
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?cart_id=${cart.id}`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setIsProcessing(false)
      } else {
        // Il redirect viene gestito da Stripe
        onSuccess()
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Errore nel pagamento')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Elaborazione in corso...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Paga €{cart.total.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'shipping' | 'shipping-method' | 'payment'>('shipping')
  const [cart, setCart] = useState<Cart | null>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country_code: 'it'
    }
  })

  // Carica il carrello
  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const res = await fetch('/api/cart/details')
      if (!res.ok) {
        if (res.status === 404) {
          // Nessun carrello trovato, reindirizza al carrello
          router.push('/cart')
          return
        }
        throw new Error('Errore nel caricamento del carrello')
      }

      const data = await res.json()
      const cartData = data.cart || data
      
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        router.push('/cart')
        return
      }

      setCart(cartData)
    } catch (error) {
      console.error('Errore nel caricamento del carrello:', error)
      router.push('/cart')
    } finally {
      setLoading(false)
    }
  }

  // Gestione invio indirizzo di spedizione
  const onShippingSubmit = async (data: ShippingFormData) => {
    if (!cart) return

    console.log('Form data submitted:', data)
    setSubmitting(true)
    try {
      // Aggiorna l'indirizzo di spedizione
      const res = await fetch('/api/checkout/shipping-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          ...data
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Errore nell\'aggiornamento dell\'indirizzo')
      }

      const updatedCart = await res.json()
      setCart(updatedCart.cart || updatedCart)

      // Carica le opzioni di spedizione disponibili
      const shippingRes = await fetch(`/api/checkout/shipping-options?cartId=${cart.id}`)
      if (shippingRes.ok) {
        const options = await shippingRes.json()
        console.log('[Checkout] Shipping options received:', options)
        setShippingOptions(options.shipping_options || [])
      } else {
        const error = await shippingRes.json().catch(() => ({}))
        console.error('[Checkout] Failed to load shipping options:', error)
      }

      setCurrentStep('shipping-method')
    } catch (error) {
      console.error('Errore:', error)
      alert(error instanceof Error ? error.message : 'Errore nell\'aggiornamento dell\'indirizzo')
    } finally {
      setSubmitting(false)
    }
  }

  // Gestione selezione metodo di spedizione
  const handleShippingMethodSubmit = async () => {
    if (!cart || !selectedShippingOption) return

    setSubmitting(true)
    try {
      // Aggiorna il metodo di spedizione
      const res = await fetch('/api/checkout/shipping-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          optionId: selectedShippingOption
        })
      })

      if (!res.ok) {
        throw new Error('Errore nella selezione della spedizione')
      }

      const updatedCart = await res.json()
      setCart(updatedCart.cart)

      // Inizializza la sessione di pagamento
      const paymentRes = await fetch('/api/checkout/payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          providerId: 'stripe'
        })
      })

      if (!paymentRes.ok) {
        throw new Error('Errore nell\'inizializzazione del pagamento')
      }

      const paymentData = await paymentRes.json()
      setClientSecret(paymentData.client_secret)
      setCart(paymentData.cart)
      setCurrentStep('payment')
    } catch (error) {
      console.error('Errore:', error)
      alert('Errore nella selezione della spedizione')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!cart) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-primary mb-8">Checkout</h1>

          {/* Indicatore di progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className={`flex items-center ${currentStep === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Indirizzo</span>
              </div>
              
              <div className="flex-1 h-1 mx-4 bg-muted">
                <div className={`h-full transition-all ${
                  currentStep !== 'shipping' ? 'bg-primary w-full' : 'bg-muted w-0'
                }`} />
              </div>

              <div className={`flex items-center ${currentStep === 'shipping-method' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 'shipping-method' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <Package className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Spedizione</span>
              </div>

              <div className="flex-1 h-1 mx-4 bg-muted">
                <div className={`h-full transition-all ${
                  currentStep === 'payment' ? 'bg-primary w-full' : 'bg-muted w-0'
                }`} />
              </div>

              <div className={`flex items-center ${currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Pagamento</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonna principale con i form */}
            <div className="lg:col-span-2">
              {/* Step 1: Indirizzo di spedizione */}
              {currentStep === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Indirizzo di Spedizione
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onShippingSubmit, (errors) => {
                      console.log('Validation errors:', errors)
                    })} className="space-y-4">
                      {Object.keys(errors).length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                          Alcuni campi sono incompleti o non validi. Controlla i campi evidenziati.
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="mario.rossi@esempio.it"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">Nome *</Label>
                          <Input
                            id="first_name"
                            {...register('first_name')}
                            placeholder="Mario"
                          />
                          {errors.first_name && (
                            <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="last_name">Cognome *</Label>
                          <Input
                            id="last_name"
                            {...register('last_name')}
                            placeholder="Rossi"
                          />
                          {errors.last_name && (
                            <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefono *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          placeholder="+39 123 456 7890"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address_1">Indirizzo *</Label>
                        <Input
                          id="address_1"
                          {...register('address_1')}
                          placeholder="Via Roma, 123"
                        />
                        {errors.address_1 && (
                          <p className="text-sm text-red-500 mt-1">{errors.address_1.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address_2">Appartamento, scala, ecc. (opzionale)</Label>
                        <Input
                          id="address_2"
                          {...register('address_2')}
                          placeholder="Scala A, Interno 5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">Città *</Label>
                          <Input
                            id="city"
                            {...register('city')}
                            placeholder="Milano"
                          />
                          {errors.city && (
                            <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="province">Provincia *</Label>
                          <Input
                            id="province"
                            {...register('province')}
                            placeholder="MI"
                          />
                          {errors.province && (
                            <p className="text-sm text-red-500 mt-1">{errors.province.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="postal_code">CAP *</Label>
                        <Input
                          id="postal_code"
                          {...register('postal_code')}
                          placeholder="20100"
                        />
                        {errors.postal_code && (
                          <p className="text-sm text-red-500 mt-1">{errors.postal_code.message}</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full"
                        size="lg"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Salvataggio...
                          </>
                        ) : (
                          'Continua con la spedizione'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Metodo di spedizione */}
              {currentStep === 'shipping-method' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Metodo di Spedizione
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup 
                      value={selectedShippingOption} 
                      onValueChange={setSelectedShippingOption}
                    >
                      {shippingOptions.map((option) => (
                        <div 
                          key={option.id}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary cursor-pointer"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label 
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-medium">{option.name}</span>
                            <span className="text-primary font-semibold">
                              €{option.amount.toFixed(2)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {shippingOptions.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        Nessun metodo di spedizione disponibile per questo indirizzo
                      </p>
                    )}

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('shipping')}
                        className="flex-1"
                      >
                        Indietro
                      </Button>
                      <Button
                        onClick={handleShippingMethodSubmit}
                        disabled={!selectedShippingOption || submitting}
                        className="flex-1"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Caricamento...
                          </>
                        ) : (
                          'Continua al pagamento'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Pagamento */}
              {currentStep === 'payment' && clientSecret && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        appearance: {
                          theme: 'stripe'
                        }
                      }}
                    >
                      <CheckoutForm 
                        cart={cart}
                        onSuccess={() => {
                          // Il redirect viene gestito da Stripe
                        }}
                      />
                    </Elements>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('shipping-method')}
                      className="w-full mt-4"
                    >
                      Indietro
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Colonna laterale con riepilogo ordine */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Riepilogo Ordine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Articoli */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.thumbnail && (
                          <img 
                            src={item.thumbnail} 
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          {item.variant?.title && (
                            <p className="text-xs text-muted-foreground">{item.variant.title}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Quantità: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            €{(item.unit_price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totali */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotale</span>
                      <span>€{cart.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {cart.shipping_total > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spedizione</span>
                        <span>€{cart.shipping_total.toFixed(2)}</span>
                      </div>
                    )}

                    {cart.tax_total > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">IVA</span>
                        <span>€{cart.tax_total.toFixed(2)}</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Totale</span>
                      <span className="text-primary">€{cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

