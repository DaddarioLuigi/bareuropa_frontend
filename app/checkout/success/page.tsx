'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Mail, Loader2 } from "lucide-react"
import Link from "next/link"

interface OrderDetails {
  id: string
  display_id: number
  email: string
  created_at: string
  total: number
  currency_code: string
  shipping_address: {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    province?: string
    postal_code: string
    country_code: string
  }
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    thumbnail?: string
    variant?: {
      title?: string
    }
  }>
  shipping_total: number
  tax_total: number
  subtotal: number
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const orderId = searchParams.get('order_id')
    
    if (!orderId) {
      setError('ID ordine mancante')
      setLoading(false)
      return
    }

    loadOrder(orderId)
  }, [searchParams])

  const loadOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      
      if (!res.ok) {
        throw new Error('Impossibile caricare i dettagli dell\'ordine')
      }

      const data = await res.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Errore nel caricamento dell\'ordine:', err)
      setError('Impossibile caricare i dettagli dell\'ordine')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento dettagli ordine...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 mb-8">
              <h1 className="font-display text-2xl font-bold mb-2">Errore</h1>
              <p>{error || 'Ordine non trovato'}</p>
            </div>
            
            <Button asChild>
              <Link href="/">Torna alla Home</Link>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header successo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="font-display text-4xl font-bold text-primary mb-4">
              Ordine Completato!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-2">
              Grazie per il tuo acquisto
            </p>
            
            <p className="text-muted-foreground">
              Numero ordine: <span className="font-mono font-semibold">#{order.display_id}</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Info spedizione */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="mr-2 h-5 w-5" />
                  Spedizione
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p>{order.shipping_address.address_1}</p>
                {order.shipping_address.address_2 && (
                  <p>{order.shipping_address.address_2}</p>
                )}
                <p>
                  {order.shipping_address.postal_code} {order.shipping_address.city}
                  {order.shipping_address.province && ` (${order.shipping_address.province})`}
                </p>
              </CardContent>
            </Card>

            {/* Info email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Conferma Email
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">
                  Abbiamo inviato una conferma a:
                </p>
                <p className="font-medium break-all">{order.email}</p>
              </CardContent>
            </Card>

            {/* Info data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Ordine</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Dettagli ordine */}
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Ordine</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Prodotti */}
              <div className="space-y-4 mb-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.thumbnail && (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.title}</p>
                      {item.variant?.title && (
                        <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Quantità: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        €{((item.unit_price * item.quantity) / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        €{(item.unit_price / 100).toFixed(2)} cad.
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Totali */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span>€{(order.subtotal / 100).toFixed(2)}</span>
                </div>
                
                {order.shipping_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spedizione</span>
                    <span>€{(order.shipping_total / 100).toFixed(2)}</span>
                  </div>
                )}

                {order.tax_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IVA</span>
                    <span>€{(order.tax_total / 100).toFixed(2)}</span>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-xl">
                  <span>Totale</span>
                  <span className="text-primary">€{(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                Continua a Navigare
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                Scopri Altri Prodotti
              </Link>
            </Button>
          </div>

          {/* Info aggiuntive */}
          <div className="mt-8 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Cosa succede ora?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Riceverai una email di conferma con i dettagli dell'ordine</li>
              <li>✓ Prepareremo il tuo ordine con cura</li>
              <li>✓ Ti invieremo una notifica quando il pacco sarà spedito</li>
              <li>✓ Potrai tracciare la spedizione tramite il link che ti invieremo</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

