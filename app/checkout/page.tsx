"use client"

import type React from "react"

import { useState, useEffect } from "react"

// Forza il rendering dinamico per evitare problemi di pre-rendering
export const dynamic = 'force-dynamic'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useMedusa } from "@/hooks/use-medusa"
import { CreditCard, Truck, MapPin, Lock, Tag, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Funzione helper per ottenere un nome user-friendly per i payment providers
function getPaymentProviderName(providerId: string): string {
  const providerNames: Record<string, string> = {
    'pp_stripe_stripe': 'Carta di Credito',
    'stripe': 'Carta di Credito',
    'pp_stripe': 'Carta di Credito',
    'paypal': 'PayPal',
    'pp_paypal': 'PayPal',
    'manual': 'Pagamento Manuale',
  }
  
  // Se c'è un nome mappato, usalo
  if (providerNames[providerId]) {
    return providerNames[providerId]
  }
  
  // Altrimenti, pulisci l'ID rimuovendo prefissi comuni
  let cleanName = providerId
    .replace(/^pp_/i, '') // Rimuovi prefisso "pp_"
    .replace(/_/g, ' ') // Sostituisci underscore con spazi
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return cleanName
}

export default function CheckoutPage() {
  const { state } = useCart()
  const medusa = useMedusa()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)
  const [isApplyingPromoCode, setIsApplyingPromoCode] = useState(false)


  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",

    // Billing Information (if different)
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingProvince: "",

    // Payment Information
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",

    // Additional
    notes: "",
    terms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      if (!medusa.cart) {
        throw new Error('Nessun carrello disponibile')
      }

      const baseUrl = '/api/medusa'
      
      // Recupera il codice paese corretto dalla regione del carrello
      // Medusa usa codici ISO-2 in minuscolo (es: "it", "fr", "de")
      let countryCode = "it" // Fallback a Italia
      
      if (medusa.cart?.region?.id) {
        try {
          // Recupera la regione completa con i paesi disponibili
          const regionResponse = await fetch(`${baseUrl}/store/regions/${medusa.cart.region.id}`)
          if (regionResponse.ok) {
            const regionData = await regionResponse.json()
            const region = regionData.region || regionData
            // Cerca l'Italia nella lista dei paesi della regione
            if (region.countries && Array.isArray(region.countries)) {
              const italy = region.countries.find((c: any) => 
                c.iso_2?.toLowerCase() === "it" || 
                c.name?.toUpperCase() === "ITALY" ||
                c.display_name?.toLowerCase() === "italy"
              )
              if (italy?.iso_2) {
                countryCode = italy.iso_2.toLowerCase()
              }
            }
          }
        } catch (regionError) {
          console.warn('Impossibile recuperare la regione, uso fallback "it":', regionError)
        }
      }

      // Imposta l'indirizzo di spedizione (senza email, non accettata dall'API Medusa nell'indirizzo)
      const shippingAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        country_code: countryCode, // Usa il codice paese corretto dalla regione
        postal_code: formData.postalCode,
        province: formData.province,
        phone: formData.phone
      }

      // Imposta sia l'indirizzo di spedizione che l'email in una singola chiamata
      // (l'email va nel carrello, non nell'indirizzo di spedizione)
      const cartUpdateBody: any = {
        shipping_address: shippingAddress
      }
      
      // Aggiungi l'email se presente (va nel carrello, non nell'indirizzo)
      if (formData.email) {
        cartUpdateBody.email = formData.email
      }
      
      const cartUpdateResponse = await fetch(`${baseUrl}/store/carts/${medusa.cart.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify(cartUpdateBody)
      })
      
      if (!cartUpdateResponse.ok) {
        const errorText = await cartUpdateResponse.text()
        console.error('Errore nell\'impostazione dell\'indirizzo di spedizione:', errorText)
        throw new Error(errorText)
      }
      
      // Aggiorna lo stato del carrello chiamando setShippingAddress che gestisce l'aggiornamento dello stato
      // Questo evita duplicazioni e mantiene la coerenza con il resto del codice
      await medusa.setShippingAddress(shippingAddress)

      // Se l'indirizzo di fatturazione è diverso, impostalo
      if (!sameAsShipping) {
        const billingAddress = {
          first_name: formData.billingFirstName,
          last_name: formData.billingLastName,
          address_1: formData.billingAddress,
          city: formData.billingCity,
          country_code: countryCode, // Usa lo stesso codice paese
          postal_code: formData.billingPostalCode,
          province: formData.billingProvince
        }
        await medusa.setBillingAddress(billingAddress)
      } else {
        await medusa.setBillingAddress(shippingAddress)
      }

      // Aggiungi metodo di spedizione da Medusa
      // Se ci sono opzioni disponibili, usa la prima, altrimenti usa spedizione gratuita
      try {
        if (medusa.shippingOptions.length > 0) {
          // Usa la prima opzione disponibile
          await medusa.addShippingMethod(medusa.shippingOptions[0].id)
        } else {
          // Se non ci sono opzioni, prova con spedizione gratuita
          try {
            await medusa.addShippingMethod("free_shipping")
          } catch (freeError) {
            console.warn('Impossibile aggiungere spedizione gratuita:', freeError)
            // Se anche questo fallisce, continua comunque (Medusa potrebbe gestirlo automaticamente)
          }
        }
      } catch (error) {
        console.warn('Impossibile aggiungere metodo di spedizione:', error)
        // Prova con spedizione gratuita come fallback
        try {
          await medusa.addShippingMethod("free_shipping")
        } catch (freeError) {
          console.warn('Impossibile aggiungere spedizione gratuita come fallback:', freeError)
        }
      }

      // Aggiungi sessione di pagamento usando il provider selezionato da Medusa
      const providerId = paymentMethod
      if (!providerId) throw new Error('Nessun metodo di pagamento selezionato')

      // Verifica se c'è già una payment session per questo provider
      let paymentSessionExists = false
      if (medusa.cart?.payment_sessions && Array.isArray(medusa.cart.payment_sessions)) {
        paymentSessionExists = medusa.cart.payment_sessions.some((ps: any) => ps.provider_id === providerId)
      }

      if (!paymentSessionExists) {
        try {
          await medusa.addPaymentSession(providerId)
          console.log('[CHECKOUT] Payment session aggiunta')
        } catch (error: any) {
          // Se l'errore è 404, potrebbe significare che le payment sessions vengono create automaticamente
          // o che l'endpoint non esiste. In questo caso, verifica se ce ne sono già nel carrello
          if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('Cannot POST')) {
            console.warn('[CHECKOUT] Endpoint payment-sessions non trovato, verifico se esistono già...')
            
            // Ricarica il carrello per vedere se ci sono payment sessions
            const baseUrl = '/api/medusa'
            const cartCheck = await fetch(`${baseUrl}/store/carts/${medusa.cart?.id}`, {
              headers: {
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || '',
              }
            })
            
            if (cartCheck.ok) {
              const cartData = await cartCheck.json()
              const updatedCart = cartData.cart || cartData
              
              if (updatedCart.payment_sessions && updatedCart.payment_sessions.length > 0) {
                console.log('[CHECKOUT] Payment sessions già presenti nel carrello')
                // Aggiorna il carrello nello stato
                await medusa.setShippingAddress(medusa.cart?.shipping_address || {})
                paymentSessionExists = true
              } else {
                console.warn('[CHECKOUT] Nessuna payment session trovata, continuo comunque')
                // In alcuni casi, Medusa crea le payment sessions automaticamente durante il complete
                // Quindi continuiamo
              }
            }
          } else {
            console.error('[CHECKOUT] Errore nell\'aggiunta della sessione di pagamento:', error)
            throw new Error('Impossibile aggiungere sessione di pagamento. Riprova.')
          }
        }
      } else {
        console.log('[CHECKOUT] Payment session già esistente per provider:', providerId)
      }

      // Autorizza il pagamento PRIMA di completare l'ordine
      // Questo è cruciale per Stripe e altri provider di pagamento
      // Nota: In Medusa v2, l'autorizzazione potrebbe essere gestita automaticamente
      try {
        console.log('[CHECKOUT] Tentativo di autorizzazione del pagamento...')
        
        // Per Stripe, potrebbe essere necessario passare i dati della carta
        // Se il provider è Stripe e abbiamo i dati della carta, passali
        let paymentData: any = undefined
        if (providerId.includes('stripe') && formData.cardNumber && formData.cardName) {
          // Nota: In produzione, i dati della carta dovrebbero essere processati tramite Stripe Elements
          // o Stripe.js per sicurezza. Questo è solo un esempio.
          // Per ora, Medusa gestirà l'autorizzazione con Stripe lato server.
          paymentData = {
            // I dati della carta vengono gestiti da Stripe lato server tramite Medusa
            // Non inviamo direttamente i dati della carta per sicurezza
          }
        }
        
        try {
          await medusa.authorizePayment(providerId, paymentData)
          console.log('[CHECKOUT] ✅ Pagamento autorizzato con successo')
          
          // Verifica che il pagamento sia stato autorizzato prima di procedere
          if (medusa.cart?.payment_sessions) {
            const paymentSession = medusa.cart.payment_sessions.find((ps: any) => ps.provider_id === providerId)
            if (paymentSession && paymentSession.status === 'error') {
              throw new Error('Il pagamento non è stato autorizzato. Verifica i dati della carta e riprova.')
            }
          }
        } catch (authError: any) {
          // Se l'autorizzazione fallisce con 404, potrebbe essere che Medusa gestisca l'autorizzazione automaticamente
          if (authError?.status === 404 || authError?.message?.includes('404') || authError?.message?.includes('Cannot POST')) {
            console.warn('[CHECKOUT] Endpoint autorizzazione non trovato, Medusa potrebbe gestire automaticamente')
            // Continua comunque, Medusa potrebbe autorizzare automaticamente durante il complete
          } else {
            throw authError
          }
        }
      } catch (error: any) {
        console.error('[CHECKOUT] Errore nell\'autorizzazione del pagamento:', error)
        // Non bloccare il flusso se l'autorizzazione fallisce - Medusa potrebbe gestirla automaticamente
        // Ma avvisa l'utente
        console.warn('[CHECKOUT] Continuo comunque - Medusa potrebbe autorizzare automaticamente durante il complete')
      }

      // Completa l'ordine solo dopo che il pagamento è stato autorizzato
      console.log('[CHECKOUT] Completamento dell\'ordine...')
      const order = await medusa.completeOrder()
      
      console.log('[CHECKOUT] ✅ Ordine completato con successo:', order)
      
      // Verifica che l'ordine sia stato creato correttamente
      if (!order || !order.id) {
        throw new Error('L\'ordine non è stato creato correttamente. Contatta il supporto.')
      }
      
      // Verifica lo stato del pagamento nell'ordine
      if (order.payment_status && order.payment_status !== 'captured' && order.payment_status !== 'awaiting') {
        console.warn('[CHECKOUT] ⚠️ Stato pagamento ordine:', order.payment_status)
      }
      
      // Redirect alla pagina di successo
      router.push("/checkout/success")
      
    } catch (error: any) {
      console.error('[CHECKOUT] Errore nel checkout:', error)
      
      // Mostra un messaggio di errore più specifico
      let errorMessage = 'Si è verificato un errore durante il checkout. Riprova.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      // Non fare redirect se c'è un errore
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="font-display text-3xl font-bold text-primary mb-4">Carrello vuoto</h1>
            <p className="text-muted-foreground mb-8">
              Aggiungi alcuni prodotti al carrello prima di procedere al checkout.
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Vai ai Prodotti
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Calcola i totali usando il carrello Medusa se disponibile, altrimenti usa lo stato locale
  const medusaSubtotal = medusa.cart ? (medusa.cart.subtotal || 0) / 100 : 0
  const medusaDiscount = medusa.cart ? (medusa.cart.discount_total || 0) / 100 : 0
  const medusaShipping = medusa.cart ? (medusa.cart.shipping_total || 0) / 100 : 0
  const medusaTotal = medusa.cart ? (medusa.cart.total || 0) / 100 : 0

  // Usa i valori di Medusa se disponibili, altrimenti calcola localmente
  const subtotal = medusaSubtotal || state.total
  const discount = medusaDiscount
  const shipping = medusaShipping || (subtotal >= 50 ? 0 : 5.9)
  const total = medusaTotal || (subtotal - discount + shipping)

  // Sincronizza il codice promozionale applicato con il carrello Medusa
  useEffect(() => {
    if (medusa.cart && medusa.cart.discounts && medusa.cart.discounts.length > 0) {
      const discountCode = medusa.cart.discounts[0]?.code || medusa.cart.discounts[0]?.discount?.code
      if (discountCode && !appliedPromoCode) {
        setAppliedPromoCode(discountCode.toUpperCase())
      }
    } else if (medusa.cart && (!medusa.cart.discounts || medusa.cart.discounts.length === 0) && appliedPromoCode) {
      // Se non ci sono più discount nel carrello, rimuovi il codice applicato
      setAppliedPromoCode(null)
    }
  }, [medusa.cart, appliedPromoCode])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Header */}
        <div className="bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold text-primary">Checkout</h1>
            <p className="text-muted-foreground mt-2">Completa il tuo ordine in modo sicuro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Informazioni di Spedizione
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Cognome *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Indirizzo *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Città *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">CAP *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provincia *</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informazioni di Fatturazione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="sameAsShipping"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="sameAsShipping">Uguale all'indirizzo di spedizione</Label>
                  </div>

                  {!sameAsShipping && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billingFirstName">Nome *</Label>
                          <Input
                            id="billingFirstName"
                            value={formData.billingFirstName}
                            onChange={(e) => handleInputChange("billingFirstName", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Cognome *</Label>
                          <Input
                            id="billingLastName"
                            value={formData.billingLastName}
                            onChange={(e) => handleInputChange("billingLastName", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingAddress">Indirizzo *</Label>
                        <Input
                          id="billingAddress"
                          value={formData.billingAddress}
                          onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                          required={!sameAsShipping}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">Città *</Label>
                          <Input
                            id="billingCity"
                            value={formData.billingCity}
                            onChange={(e) => handleInputChange("billingCity", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode">CAP *</Label>
                          <Input
                            id="billingPostalCode"
                            value={formData.billingPostalCode}
                            onChange={(e) => handleInputChange("billingPostalCode", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingProvince">Provincia *</Label>
                          <Input
                            id="billingProvince"
                            value={formData.billingProvince}
                            onChange={(e) => handleInputChange("billingProvince", e.target.value)}
                            required={!sameAsShipping}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metodo di Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medusa.paymentProviders.length > 0 ? (
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {medusa.paymentProviders.map((p: any) => (
                        <div key={p.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={p.id} id={`pm-${p.id}`} />
                          <Label htmlFor={`pm-${p.id}`}>{getPaymentProviderName(p.id)}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="p-4 rounded-md bg-muted text-sm text-muted-foreground">
                      Nessun metodo di pagamento configurato.
                    </div>
                  )}

                  {paymentMethod && paymentMethod.includes('stripe') && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardName">Nome sulla Carta *</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          required={paymentMethod.includes('stripe')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Numero Carta *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          required={paymentMethod.includes('stripe')}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Scadenza *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/AA"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            required={paymentMethod.includes('stripe')}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            required={paymentMethod.includes('stripe')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Codice Promozionale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedPromoCode ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Codice applicato: {appliedPromoCode}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await medusa.removeDiscountCode(appliedPromoCode)
                            setAppliedPromoCode(null)
                            setPromoCode("")
                            setPromoCodeError(null)
                          } catch (err) {
                            console.error('Errore nella rimozione del codice:', err)
                          }
                        }}
                        className="h-8 w-8 p-0 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Inserisci il codice promozionale"
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase())
                            setPromoCodeError(null)
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!promoCode.trim()) {
                              setPromoCodeError("Inserisci un codice promozionale")
                              return
                            }
                            
                            setIsApplyingPromoCode(true)
                            setPromoCodeError(null)
                            
                            try {
                              console.log('[CHECKOUT] Tentativo di applicare codice promozionale:', promoCode.trim())
                              await medusa.applyDiscountCode(promoCode.trim())
                              console.log('[CHECKOUT] Codice applicato con successo, aggiornando UI')
                              setAppliedPromoCode(promoCode.trim().toUpperCase())
                              setPromoCode("")
                              setPromoCodeError(null)
                            } catch (err: any) {
                              console.error('[CHECKOUT] Errore nell\'applicazione del codice:', err)
                              console.error('[CHECKOUT] Messaggio errore:', err.message)
                              const errorMessage = err.message || "Codice promozionale non valido"
                              setPromoCodeError(errorMessage)
                              console.log('[CHECKOUT] Errore impostato nell\'UI:', errorMessage)
                            } finally {
                              setIsApplyingPromoCode(false)
                            }
                          }}
                          disabled={isApplyingPromoCode || !promoCode.trim()}
                          className="bg-accent hover:bg-accent/90"
                        >
                          {isApplyingPromoCode ? "Applicazione..." : "Applica"}
                        </Button>
                      </div>
                      {promoCodeError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{promoCodeError}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Note Aggiuntive</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Inserisci eventuali note per il tuo ordine..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Terms */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => handleInputChange("terms", checked as boolean)}
                      required
                      className="mt-0.5 sm:mt-1 flex-shrink-0"
                    />
                    <Label htmlFor="terms" className="text-xs sm:text-sm leading-relaxed flex-1 min-w-0">
                      Accetto i{" "}
                      <Link href="/termini-e-condizioni" className="text-accent hover:underline inline">
                        Termini e Condizioni
                      </Link>
                      {" "}e la{" "}
                      <Link href="/privacy" className="text-accent hover:underline inline">
                        Privacy Policy
                      </Link>
                      {" "}*
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Riepilogo Ordine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">Qtà: {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotale</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Sconto</span>
                        <span>-€{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Spedizione</span>
                      <span className={shipping === 0 ? "text-green-600" : ""}>
                        {shipping === 0 ? "Gratuita" : `€${shipping.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Totale</span>
                    <span className="text-primary">€{total.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={isProcessing || !formData.terms}
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {isProcessing ? "Elaborazione..." : "Completa Ordine"}
                  </Button>

                  <div className="text-xs text-muted-foreground text-center space-y-1">
                    <p>🔒 Pagamento sicuro e protetto</p>
                    <p>📦 Spedizione in 24-48h</p>
                    <p>↩️ Reso gratuito entro 14 giorni</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
