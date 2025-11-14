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
  const [cookieCartId, setCookieCartId] = useState<string | null>(null)

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

  // Ensure cart_id is synced from cookie to localStorage (robust cart resolution)
  useEffect(() => {
    const syncCartId = async () => {
      try {
        const res = await fetch("/api/cart/id", { cache: "no-store" })
        if (res.ok) {
        const data = await res.json()
          const cookieCartId = data?.cart_id
          if (cookieCartId) {
            setCookieCartId(cookieCartId)
            const lsMedusa = localStorage.getItem("medusa_cart_id")
            const lsCart = localStorage.getItem("cart_id")
            if (lsMedusa !== cookieCartId || lsCart !== cookieCartId) {
              localStorage.setItem("medusa_cart_id", cookieCartId)
              localStorage.setItem("cart_id", cookieCartId)
              // hint other hooks to reload
              window.dispatchEvent(
                new CustomEvent("cartUpdated", { detail: { cartId: cookieCartId } })
              )
            }
          }
        }
      } catch {
        // ignore
      }
    }
    syncCartId()
  }, [])

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
      // Resolve cart id STRICTLY from the cookie (same source as cart page)
      let cartId: string | null = null
      try {
        const idRes = await fetch("/api/cart/id", { cache: "no-store" })
        if (idRes.ok) {
          const idData = await idRes.json()
          cartId = idData?.cart_id || null
        }
      } catch {}
      if (!cartId) {
        throw new Error("Carrello non trovato. Torna alla pagina Carrello per inizializzarlo e riprova.")
      }
      // Keep localStorage in sync for any consumers
      localStorage.setItem("medusa_cart_id", cartId)
      localStorage.setItem("cart_id", cartId)

      // Always fetch latest cart snapshot from Medusa to derive region and current state
      let latestCart: any = null
      {
        const cRes = await fetch(`/api/medusa/store/carts/${cartId}`, {
                headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
                },
          cache: "no-store",
        })
        if (!cRes.ok) {
          const txt = await cRes.text().catch(() => "")
          throw new Error(txt || "Impossibile recuperare il carrello")
        }
        const cData = await cRes.json()
        latestCart = cData.cart || cData
      }

      const cartHasItems =
        (latestCart?.items?.length || 0) > 0 ||
        (medusa.cart?.items?.length || 0) > 0 ||
        (state?.items?.length || 0) > 0
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
        const regionId = latestCart?.region?.id || medusa.cart?.region?.id
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
      {
        const res = await fetch(`/api/medusa/store/carts/${cartId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
          },
          body: JSON.stringify({ shipping_address: shippingAddress }),
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || "Impossibile impostare l'indirizzo di spedizione")
        }
      }

      if (sameAsShipping) {
        const res = await fetch(`/api/medusa/store/carts/${cartId}`, {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
        },
          body: JSON.stringify({ billing_address: shippingAddress }),
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || "Impossibile impostare l'indirizzo di fatturazione")
        }
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
        const res = await fetch(`/api/medusa/store/carts/${cartId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
          },
          body: JSON.stringify({ billing_address: billingAddress }),
        })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || "Impossibile impostare l'indirizzo di fatturazione")
        }
      }

      // Step 3: Choose Shipping Method
      let chosenShippingOptionId: string | null = null
      let shippingOptionsFound: any[] = []

      // Try cart-scoped options first
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
        console.log('[CHECKOUT] Shipping options request (cart-scoped):', {
          url: `/api/medusa/store/shipping-options?cart_id=${cartId}`,
          status: soRes.status,
          statusText: soRes.statusText
        })
        if (soRes.ok) {
          const soData = await soRes.json()
          console.log('[CHECKOUT] Shipping options response (cart-scoped):', JSON.stringify(soData, null, 2))
          const options = soData.shipping_options || soData.options || soData || []
          if (Array.isArray(options) && options.length > 0) {
            shippingOptionsFound = options
            chosenShippingOptionId = options[0].id
            console.log('[CHECKOUT] ✅ Shipping options found (cart-scoped):', options.length, options.map((o: any) => ({ 
              id: o.id, 
              name: o.name || o.label,
              amount: o.amount,
              provider_id: o.provider_id,
              region_id: o.region_id
            })))
          } else {
            console.warn('[CHECKOUT] ⚠️ No shipping options in response (cart-scoped):', {
              responseKeys: Object.keys(soData),
              isArray: Array.isArray(soData),
              rawResponse: JSON.stringify(soData, null, 2).substring(0, 500)
            })
          }
        } else {
          const errorText = await soRes.text()
          console.error('[CHECKOUT] ❌ Shipping options request failed (cart-scoped):', {
            status: soRes.status,
            statusText: soRes.statusText,
            error: errorText.substring(0, 500)
          })
        }
      } catch (err: any) {
        console.error('[CHECKOUT] ❌ Exception fetching cart-scoped shipping options:', err.message, err.stack)
      }

      // If cart-scoped options failed, try region-scoped options as fallback
      if (!chosenShippingOptionId) {
        const regionId = latestCart?.region?.id || medusa.cart?.region?.id
        console.log('[CHECKOUT] Trying region-scoped options, regionId:', regionId)
        if (regionId) {
          try {
            const soRes = await fetch(
              `/api/medusa/store/shipping-options?region_id=${encodeURIComponent(regionId)}`,
              {
                headers: {
                  "x-publishable-api-key":
                    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
                },
              }
            )
            console.log('[CHECKOUT] Shipping options request (region-scoped):', {
              url: `/api/medusa/store/shipping-options?region_id=${regionId}`,
              status: soRes.status,
              statusText: soRes.statusText
            })
            if (soRes.ok) {
              const soData = await soRes.json()
              console.log('[CHECKOUT] Shipping options response (region-scoped):', JSON.stringify(soData, null, 2))
              const options = soData.shipping_options || soData.options || []
              if (Array.isArray(options) && options.length > 0) {
                shippingOptionsFound = options
                chosenShippingOptionId = options[0].id
                console.log('[CHECKOUT] ✅ Shipping options found (region-scoped):', options.length, options.map((o: any) => ({ 
                  id: o.id, 
                  name: o.name || o.label,
                  amount: o.amount,
                  provider_id: o.provider_id,
                  region_id: o.region_id
                })))
              } else {
                console.warn('[CHECKOUT] ⚠️ No shipping options in response (region-scoped):', {
                  responseKeys: Object.keys(soData),
                  isArray: Array.isArray(soData),
                  rawResponse: JSON.stringify(soData, null, 2).substring(0, 500)
                })
              }
            } else {
              const errorText = await soRes.text()
              console.error('[CHECKOUT] ❌ Shipping options request failed (region-scoped):', {
                status: soRes.status,
                statusText: soRes.statusText,
                error: errorText.substring(0, 500)
              })
            }
          } catch (err: any) {
            console.error('[CHECKOUT] ❌ Exception fetching region-scoped shipping options:', err.message, err.stack)
          }
        } else {
          console.warn('[CHECKOUT] ⚠️ No region ID available for region-scoped query')
        }
      }

      // Try cartId path variant some backends expose: /shipping-options/{cartId}
      if (!chosenShippingOptionId) {
        try {
          const soRes = await fetch(
            `/api/medusa/store/shipping-options/${encodeURIComponent(cartId)}`,
            {
              headers: {
                "x-publishable-api-key":
                  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
              },
            }
          )
          console.log('[CHECKOUT] Shipping options request (path variant):', {
            url: `/api/medusa/store/shipping-options/${cartId}`,
            status: soRes.status,
            statusText: soRes.statusText
          })
          if (soRes.ok) {
            const soData = await soRes.json()
            console.log('[CHECKOUT] Shipping options response (path variant):', JSON.stringify(soData, null, 2))
            const options = soData.shipping_options || soData.options || soData || []
            if (Array.isArray(options) && options.length > 0) {
              shippingOptionsFound = options
              chosenShippingOptionId = options[0].id
              console.log('[CHECKOUT] ✅ Shipping options found (path variant):', options.length, options.map((o: any) => ({ 
                id: o.id, 
                name: o.name || o.label,
                amount: o.amount,
                provider_id: o.provider_id,
                region_id: o.region_id
              })))
            } else {
              console.warn('[CHECKOUT] ⚠️ No shipping options in response (path variant):', {
                responseKeys: Object.keys(soData),
                isArray: Array.isArray(soData),
                rawResponse: JSON.stringify(soData, null, 2).substring(0, 500)
              })
            }
          } else {
            const errorText = await soRes.text()
            console.error('[CHECKOUT] ❌ Shipping options request failed (path variant):', {
              status: soRes.status,
              statusText: soRes.statusText,
              error: errorText.substring(0, 500)
            })
          }
        } catch (err: any) {
          console.error('[CHECKOUT] ❌ Exception fetching path-variant shipping options:', err.message, err.stack)
        }
      }

      // CRITICAL: If no shipping option found, STOP and show clear error
      if (!chosenShippingOptionId) {
        const regionId = latestCart?.region?.id || medusa.cart?.region?.id
        console.error('[CHECKOUT] ❌ NO SHIPPING OPTIONS FOUND!')
        console.error('[CHECKOUT] Cart ID:', cartId)
        console.error('[CHECKOUT] Region ID:', regionId)
        console.error('[CHECKOUT] Cart region:', latestCart?.region || medusa.cart?.region)
        console.error('[CHECKOUT] Shipping address:', latestCart?.shipping_address || medusa.cart?.shipping_address)
        throw new Error(
          "Nessuna Shipping Option disponibile per questo carrello/indirizzo.\n\n" +
          "IMPORTANTE: In Medusa v2, devi creare una Shipping Option (non solo un Shipping Option Type).\n\n" +
          "Verifica in Medusa Admin:\n" +
          "1. Che esista una Shipping Option (ID inizia con 'so_') per la regione: " + (regionId || 'N/A') + "\n" +
          "2. Che la Shipping Option sia associata a:\n" +
          "   - La regione corretta del carrello\n" +
          "   - Un Shipping Profile che include i prodotti nel carrello\n" +
          "   - Un Fulfillment Provider attivo\n\n" +
          `Cart ID: ${cartId}\n` +
          `Region ID: ${regionId || 'N/A'}\n` +
          "Controlla la console del browser per i dettagli completi delle chiamate API."
        )
      }

      // Add shipping method to cart
      console.log('[CHECKOUT] Adding shipping method:', chosenShippingOptionId)
      const smRes = await fetch(`/api/medusa/store/carts/${cartId}/shipping-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
        },
        body: JSON.stringify({ option_id: chosenShippingOptionId }),
      })

      if (!smRes.ok) {
        const txt = await smRes.text()
        console.error('[CHECKOUT] ❌ Failed to add shipping method:', {
          option_id: chosenShippingOptionId,
          status: smRes.status,
          error: txt
        })
        throw new Error(
          `Impossibile aggiungere il metodo di spedizione: ${txt || smRes.statusText}. ` +
          `Shipping Option ID usato: ${chosenShippingOptionId}`
        )
      }

      // CRITICAL: Verify shipping method was actually added
      console.log('[CHECKOUT] Verifying shipping method was added...')
      const verifyRes = await fetch(`/api/medusa/store/carts/${cartId}`, {
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
        },
        cache: "no-store",
      })

      if (!verifyRes.ok) {
        throw new Error("Impossibile verificare il metodo di spedizione")
      }

      const verifyData = await verifyRes.json()
      const vCart = verifyData.cart || verifyData

      if (!vCart?.shipping_methods || vCart.shipping_methods.length === 0) {
        console.error('[CHECKOUT] ❌ Shipping method NOT found in cart after add!')
        console.error('[CHECKOUT] Cart state:', {
          id: vCart.id,
          shipping_methods: vCart.shipping_methods,
          shipping_address: vCart.shipping_address,
          region: vCart.region
        })
        throw new Error(
          "Il metodo di spedizione non è stato applicato al carrello. " +
          "Verifica che la Shipping Option esista e sia valida per questa regione/indirizzo. " +
          `Shipping Option ID tentato: ${chosenShippingOptionId}`
        )
      }

      console.log('[CHECKOUT] ✅ Shipping method verified:', vCart.shipping_methods.length, 'methods')

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

      // CRITICAL: Wait for payment collection to be initialized automatically by Medusa
      // In Medusa v2, payment collection is created automatically when shipping method is added
      console.log('[CHECKOUT] Waiting for payment collection to be initialized...')
      let paymentCollectionReady = false
      let finalCartBeforeComplete: any = null
      
      for (let i = 0; i < 15; i++) {
        const cRes = await fetch(`/api/medusa/store/carts/${cartId}`, {
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
          },
          cache: "no-store",
        })
        
        if (cRes.ok) {
          const cData = await cRes.json()
          const c = cData.cart || cData
          
          console.log(`[CHECKOUT] Payment collection check ${i + 1}/15:`, {
            hasPaymentCollection: !!c?.payment_collection,
            paymentCollectionId: c?.payment_collection?.id,
            paymentSessionsCount: c?.payment_sessions?.length || 0,
            paymentSessions: c?.payment_sessions?.map((ps: any) => ({ 
              id: ps.id, 
              provider_id: ps.provider_id,
              status: ps.status 
            })) || []
          })
          
          if (c?.payment_collection || (c?.payment_sessions?.length || 0) > 0) {
            paymentCollectionReady = true
            finalCartBeforeComplete = c
            console.log('[CHECKOUT] ✅ Payment collection initialized!')
            break
          }
        }
        
        await new Promise((r) => setTimeout(r, 500))
      }
      
      if (!paymentCollectionReady) {
        console.error('[CHECKOUT] ❌ Payment collection NOT initialized after 15 attempts!')
        throw new Error(
          "La payment collection non è stata inizializzata automaticamente. " +
          "Verifica che il metodo di spedizione sia stato aggiunto correttamente e che il backend Medusa sia configurato correttamente."
        )
      }

      // Try to create payment session if endpoint exists (some Medusa setups auto-create sessions)
      // If endpoint doesn't exist (404), skip and let Medusa handle it during complete
      console.log('[CHECKOUT] Attempting to create payment session...')
      try {
        const psRes = await fetch(`/api/medusa/store/carts/${cartId}/payment-sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
          },
          body: JSON.stringify({ provider_id: providerId }),
        })
        
        if (psRes.ok) {
          console.log('[CHECKOUT] ✅ Payment session created successfully')
        } else if (psRes.status === 404) {
          // Endpoint doesn't exist - Medusa will handle payment session creation automatically
          console.log('[CHECKOUT] ⚠️ Payment sessions endpoint not found (404) - Medusa will handle automatically')
        } else {
          const errorText = await psRes.text()
          console.warn('[CHECKOUT] ⚠️ Payment session creation failed (non-404):', {
            status: psRes.status,
            error: errorText.substring(0, 500)
          })
          // Don't block - some setups auto-create sessions during complete
        }
      } catch (err: any) {
        console.warn('[CHECKOUT] ⚠️ Exception creating payment session:', err.message)
        // Don't block - some setups auto-create sessions during complete
      }
      
      // Final verification: ensure payment collection is still ready before complete
      const finalCheckRes = await fetch(`/api/medusa/store/carts/${cartId}`, {
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
        },
        cache: "no-store",
      })
      
      if (finalCheckRes.ok) {
        const finalCheckData = await finalCheckRes.json()
        const finalCart = finalCheckData.cart || finalCheckData
        
        if (!finalCart?.payment_collection && (!finalCart?.payment_sessions || finalCart.payment_sessions.length === 0)) {
          console.error('[CHECKOUT] ❌ Payment collection lost before complete!')
          throw new Error(
            "La payment collection non è disponibile. Riprova il checkout."
          )
        }
        
        console.log('[CHECKOUT] ✅ Final verification passed - payment collection ready for complete')
      }
      // Stripe UI would happen here (Stripe Elements), but Medusa can handle authorization server-side.

      // Step 5: Complete Cart
      const completeRes = await fetch(`/api/medusa/store/carts/${cartId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
        },
      })
      if (!completeRes.ok) {
        const txt = await completeRes.text()
        throw new Error(txt || "Completamento ordine fallito")
      }
      const orderData = await completeRes.json()
      const order = orderData.order || orderData
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

                  {/* DEBUG PANEL */}
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-left">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      DEBUG Checkout
                    </p>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 font-mono">
                      <div>cookie cart_id: {cookieCartId || "N/A"}</div>
                      <div>medusa.cart.id: {medusa.cart?.id || "N/A"}</div>
                      <div>localStorage.medusa_cart_id: {typeof window !== "undefined" ? localStorage.getItem("medusa_cart_id") || "N/A" : "N/A"}</div>
                      <div>localStorage.cart_id: {typeof window !== "undefined" ? localStorage.getItem("cart_id") || "N/A" : "N/A"}</div>
                      <div>shipping_methods: {medusa.cart?.shipping_methods?.length || 0}</div>
                      <div>payment_sessions: {medusa.cart?.payment_sessions?.length || 0}</div>
                      <div>payment selected: {paymentMethod || "Nessuno"}</div>
                      <div>providers: {(medusa.paymentProviders || []).map((p: any) => p.id).join(", ") || "N/A"}</div>
                      <div>subtotal: €{(medusaSubtotal || subtotal).toFixed(2)}</div>
                      <div>total: €{(medusaTotal || total).toFixed(2)}</div>
                      <div>complete endpoint: {cookieCartId ? `/api/medusa/store/carts/${cookieCartId}/complete` : "N/A"}</div>
                    </div>
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


