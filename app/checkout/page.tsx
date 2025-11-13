"use client"

import type React from "react"
import { useEffect, useState } from "react"

export const dynamic = "force-dynamic"

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

function getPaymentProviderName(providerId: string): string {
  const providerNames: Record<string, string> = {
    pp_stripe_stripe: "Carta di Credito",
    stripe: "Carta di Credito",
    pp_stripe: "Carta di Credito",
    paypal: "PayPal",
    pp_paypal: "PayPal",
    manual: "Pagamento Manuale",
  }
  if (providerNames[providerId]) return providerNames[providerId]
  return providerId
    .replace(/^pp_/i, "")
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export default function CheckoutPage(): React.JSX.Element {
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
    // Shipping
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
    // Billing
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingProvince: "",
    // Optional
    notes: "",
    terms: false,
    // Stripe UI (placeholder – handled by provider)
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Load payment providers when cart/region is available
  useEffect(() => {
    const regionId = medusa.cart?.region?.id
    if (regionId) {
      medusa.fetchPaymentProviders(regionId, medusa.cart?.id).catch(() => undefined)
    }
  }, [medusa.cart?.region?.id])

  // Sync applied promo code when cart changes
  useEffect(() => {
    if (medusa.cart?.discounts?.length) {
      const code = medusa.cart.discounts[0]?.code || medusa.cart.discounts[0]?.discount?.code
      if (code && !appliedPromoCode) setAppliedPromoCode(code.toUpperCase())
    } else if (appliedPromoCode) {
      setAppliedPromoCode(null)
    }
  }, [medusa.cart, appliedPromoCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const cartId =
        medusa.cart?.id ||
        localStorage.getItem("medusa_cart_id") ||
        localStorage.getItem("cart_id")
      if (!cartId) throw new Error("Nessun carrello disponibile")

      const cartHasItems =
        (medusa.cart?.items?.length || 0) > 0 || (state?.items?.length || 0) > 0
      if (!cartHasItems) {
        throw new Error("Il carrello è vuoto. Aggiungi prodotti prima di procedere.")
      }

      // Step 1: Update Email (per Medusa docs)
      if (!formData.email) throw new Error("Email obbligatoria")
      {
        const res = await fetch(`/api/medusa/store/carts/${cartId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
          },
          body: JSON.stringify({ email: formData.email }),
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || "Impossibile impostare l'email")
        }
      }

      // Resolve country (default to Italy)
      let countryCode = "it"
      try {
        const regionId = medusa.cart?.region?.id
        if (regionId) {
          const r = await fetch(`/api/medusa/store/regions/${regionId}`)
          if (r.ok) {
            const data = await r.json()
            const region = data.region || data
            const italy =
              region?.countries?.find(
                (c: any) =>
                  c.iso_2?.toLowerCase() === "it" ||
                  c.name?.toUpperCase() === "ITALY" ||
                  c.display_name?.toLowerCase() === "italy"
              ) || null
            if (italy?.iso_2) countryCode = italy.iso_2.toLowerCase()
          }
        }
      } catch {
        // keep default
      }

      // Step 2: Shipping and Billing Addresses
      const shippingAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        country_code: countryCode,
        postal_code: formData.postalCode,
        province: formData.province,
        phone: formData.phone,
      }
      await medusa.setShippingAddress(shippingAddress)

      if (sameAsShipping) {
        await medusa.setBillingAddress(shippingAddress)
      } else {
        const billingAddress = {
          first_name: formData.billingFirstName,
          last_name: formData.billingLastName,
          address_1: formData.billingAddress,
          city: formData.billingCity,
          country_code: countryCode,
          postal_code: formData.billingPostalCode,
          province: formData.billingProvince,
        }
        await medusa.setBillingAddress(billingAddress)
      }

      // Step 3: Choose Shipping Method
      let chosenShippingOptionId: string | null = null
      try {
        const soRes = await fetch(
          `/api/medusa/store/shipping-options?cart_id=${encodeURIComponent(cartId)}`,
          {
            headers: {
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
            },
          }
        )
        if (soRes.ok) {
          const soData = await soRes.json()
          const options =
            soData.shipping_options || soData.options || soData || []
          if (Array.isArray(options) && options.length > 0) {
            chosenShippingOptionId = options[0].id
          }
        }
      } catch {
        // ignore
      }
      if (!chosenShippingOptionId) {
        // Fallback free shipping (manual)
        chosenShippingOptionId = "free_shipping"
      }
      await medusa.addShippingMethod(chosenShippingOptionId)

      // Step 4: Payment Provider & Session
      if (!paymentMethod) {
        if (medusa.paymentProviders.length === 1) {
          setPaymentMethod(medusa.paymentProviders[0].id)
        } else {
          throw new Error("Seleziona un metodo di pagamento")
        }
      }
      const providerId = paymentMethod || medusa.paymentProviders[0]?.id
      if (!providerId) throw new Error("Nessun provider di pagamento disponibile")

      await medusa.addPaymentSession(providerId)
      // Stripe UI would happen here (Stripe Elements), but Medusa can handle authorization server-side.

      // Step 5: Complete Cart
      const order = await medusa.completeOrder()
      if (!order?.id) throw new Error("Ordine non creato correttamente")

      router.push("/checkout/success")
    } catch (err: any) {
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Si è verificato un errore durante il checkout"
      alert(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const cartItems = medusa.cart?.items || []
  const localItems = state.items || []
  const hasItems = cartItems.length > 0 || localItems.length > 0

  if (!hasItems) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="font-display text-3xl font-bold text-primary mb-4">
              Carrello vuoto
            </h1>
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

  const medusaSubtotal = medusa.cart ? medusa.cart.subtotal || 0 : 0
  const medusaDiscount = medusa.cart ? medusa.cart.discount_total || 0 : 0
  const medusaShipping = medusa.cart ? medusa.cart.shipping_total || 0 : 0
  const medusaTotal = medusa.cart ? medusa.cart.total || 0 : 0

  const subtotal = medusaSubtotal || state.total
  const discount = medusaDiscount
  const shipping = medusaShipping || (subtotal >= 50 ? 0 : 5.9)
  const total =
    medusaSubtotal > 0
      ? medusaSubtotal - medusaDiscount + shipping
      : subtotal - discount + shipping

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="bg-muted/30 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-bold text-primary">Checkout</h1>
            <p className="text-muted-foreground mt-2">
              Completa il tuo ordine in modo sicuro
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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
                            onChange={(e) =>
                              handleInputChange("billingFirstName", e.target.value)
                            }
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingLastName">Cognome *</Label>
                          <Input
                            id="billingLastName"
                            value={formData.billingLastName}
                            onChange={(e) =>
                              handleInputChange("billingLastName", e.target.value)
                            }
                            required={!sameAsShipping}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="billingAddress">Indirizzo *</Label>
                        <Input
                          id="billingAddress"
                          value={formData.billingAddress}
                          onChange={(e) =>
                            handleInputChange("billingAddress", e.target.value)
                          }
                          required={!sameAsShipping}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="billingCity">Città *</Label>
                          <Input
                            id="billingCity"
                            value={formData.billingCity}
                            onChange={(e) =>
                              handleInputChange("billingCity", e.target.value)
                            }
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingPostalCode">CAP *</Label>
                          <Input
                            id="billingPostalCode"
                            value={formData.billingPostalCode}
                            onChange={(e) =>
                              handleInputChange("billingPostalCode", e.target.value)
                            }
                            required={!sameAsShipping}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingProvince">Provincia *</Label>
                          <Input
                            id="billingProvince"
                            value={formData.billingProvince}
                            onChange={(e) =>
                              handleInputChange("billingProvince", e.target.value)
                            }
                            required={!sameAsShipping}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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

                  {paymentMethod && paymentMethod.includes("stripe") && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardName">Nome sulla Carta *</Label>
                        <Input
                          id="cardName"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange("cardName", e.target.value)}
                          required={paymentMethod.includes("stripe")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Numero Carta *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          required={paymentMethod.includes("stripe")}
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
                            required={paymentMethod.includes("stripe")}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            required={paymentMethod.includes("stripe")}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                          } catch {
                            // ignore
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
                              await medusa.applyDiscountCode(promoCode.trim())
                              setAppliedPromoCode(promoCode.trim().toUpperCase())
                              setPromoCode("")
                              setPromoCodeError(null)
                            } catch (err: any) {
                              setPromoCodeError(
                                err?.message || "Codice promozionale non valido"
                              )
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
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {promoCodeError}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) =>
                        handleInputChange("terms", checked as boolean)
                      }
                      required
                      className="mt-0.5 sm:mt-1 flex-shrink-0"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-xs sm:text-sm leading-relaxed flex-1 min-w-0"
                    >
                      Accetto i{" "}
                      <Link href="/termini-e-condizioni" className="text-accent hover:underline inline">
                        Termini e Condizioni
                      </Link>{" "}
                      e la{" "}
                      <Link href="/privacy" className="text-accent hover:underline inline">
                        Privacy Policy
                      </Link>{" "}
                      *
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Riepilogo Ordine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {(medusa.cart?.items || []).map((item: any) => {
                      const itemPrice =
                        item.unit_price ||
                        (item.variant?.prices?.[0]?.amount
                          ? item.variant.prices[0].amount / 100
                          : 0)
                      const qty = item.quantity || 1
                      const itemTotal = itemPrice * qty
                      const image =
                        item.thumbnail ||
                        item.product?.thumbnail ||
                        item.variant?.product?.thumbnail ||
                        "/placeholder.svg"
                      const productTitle =
                        item.product_title ||
                        item.title ||
                        item.variant?.product?.title ||
                        item.product?.title ||
                        "Prodotto"
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img src={image} alt={productTitle} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{productTitle}</h4>
                            <p className="text-xs text-muted-foreground">Qtà: {qty}</p>
                            <p className="text-sm font-semibold text-primary">€{itemTotal.toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Separator />

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
                    <span className="text-primary">€{(medusaTotal || total).toFixed(2)}</span>
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


