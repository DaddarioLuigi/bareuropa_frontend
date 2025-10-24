"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart, Star, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useMedusa } from "@/hooks/use-medusa"
import { convertMedusaProductToCartItem } from "@/lib/medusa"

export default function ShopPage() {
  const { addItemWithMedusa } = useCart()
  const medusa = useMedusa()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  // Test diretto dell'hook
  const testMedusa = async () => {
    console.log('Test diretto Medusa...')
    try {
      const response = await fetch('http://localhost:3000/api/medusa/store/products?limit=1')
      const data = await response.json()
      console.log('Test diretto risultato:', data)
    } catch (error) {
      console.error('Test diretto errore:', error)
    }
  }

  // Esegui il test all'avvio
  useEffect(() => {
    testMedusa()
  }, [])

  // Debug: log dei prodotti
  useEffect(() => {
    console.log('Prodotti Medusa:', medusa.products.length)
    console.log('Loading:', medusa.loadingProducts)
    console.log('Error:', medusa.error)
    if (medusa.products.length > 0) {
      console.log('Primo prodotto:', medusa.products[0])
      console.log('Varianti primo prodotto:', medusa.products[0].variants)
      if (medusa.products[0].variants && medusa.products[0].variants.length > 0) {
        console.log('Prima variante:', medusa.products[0].variants[0])
      }
    }
  }, [medusa.products, medusa.loadingProducts, medusa.error])

  // Forza il caricamento dei prodotti se non ci sono
  useEffect(() => {
    if (medusa.products.length === 0 && !medusa.loadingProducts && !medusa.error) {
      console.log('Forzando caricamento prodotti...')
      medusa.fetchProducts()
    }
  }, [medusa.products.length, medusa.loadingProducts, medusa.error, medusa.fetchProducts])

  const addToCart = async (product: any) => {
    console.log('Tentativo di aggiungere al carrello:', product.title)
    console.log('Varianti disponibili:', product.variants)
    
    if (!product.variants || product.variants.length === 0) {
      console.error('Prodotto senza varianti disponibili')
      return
    }

    const variant = product.variants[0] // Usa la prima variante disponibile
    console.log('Variante selezionata:', variant)
    setAddingToCart(product.id)

    try {
      // Converti il prodotto Medusa nel formato del carrello locale
      const cartItem = convertMedusaProductToCartItem(product, variant.id)
      console.log('Cart item creato:', cartItem)
      
      // Aggiungi al carrello usando la funzione integrata con Medusa
      await addItemWithMedusa(cartItem)
      console.log('Prodotto aggiunto con successo!')
    } catch (error) {
      console.error('Errore nell\'aggiunta al carrello:', error)
    } finally {
      setAddingToCart(null)
    }
  }

  // Prodotti di fallback se Medusa non è disponibile
  const fallbackProducts = [
    {
      id: 1,
      title: "Panettone Tradizionale",
      description: "Il nostro panettone classico con uvetta e canditi, preparato secondo la ricetta tradizionale milanese.",
      variants: [{
        id: "1",
        prices: [{ amount: 2850, currency_code: "eur" }],
        options: [{ value: "1kg" }]
      }],
      thumbnail: "/traditional-italian-panettone-with-raisins-and-can.jpg",
      images: [{ url: "/traditional-italian-panettone-with-raisins-and-can.jpg" }],
      tags: [{ value: "Panettoni" }]
    },
    {
      id: 2,
      title: "Pandoro Artigianale",
      description: "Soffice pandoro veronese dalla forma a stella, spolverato con zucchero a velo.",
      variants: [{
        id: "2",
        prices: [{ amount: 2490, currency_code: "eur" }],
        options: [{ value: "750g" }]
      }],
      thumbnail: "/golden-italian-pandoro-star-shaped-cake-with-powde.jpg",
      images: [{ url: "/golden-italian-pandoro-star-shaped-cake-with-powde.jpg" }],
      tags: [{ value: "Pandori" }]
    },
    {
      id: 3,
      title: "Colomba Pasquale Premium",
      description: "Colomba pasquale con glassa alle mandorle e granella, simbolo della tradizione italiana.",
      variants: [{
        id: "3",
        prices: [{ amount: 2600, currency_code: "eur" }],
        options: [{ value: "900g" }]
      }],
      thumbnail: "/italian-easter-colomba-cake-with-almond-glaze-and-.jpg",
      images: [{ url: "/italian-easter-colomba-cake-with-almond-glaze-and-.jpg" }],
      tags: [{ value: "Colombe" }]
    },
    {
      id: 4,
      title: "Panettone al Cioccolato",
      description: "Variante golosa del panettone tradizionale con gocce di cioccolato fondente.",
      variants: [{
        id: "4",
        prices: [{ amount: 3000, currency_code: "eur" }],
        options: [{ value: "1kg" }]
      }],
      thumbnail: "/chocolate-chip-panettone-italian-christmas-cake.jpg",
      images: [{ url: "/chocolate-chip-panettone-italian-christmas-cake.jpg" }],
      tags: [{ value: "Panettoni" }]
    },
  ]

  // Usa SEMPRE i prodotti da Medusa se disponibili
  const products = medusa.products.length > 0 ? medusa.products : fallbackProducts
  
  console.log('Prodotti selezionati:', products.length, 'Medusa:', medusa.products.length, 'Fallback:', fallbackProducts.length)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              className="font-display text-4xl md:text-5xl font-bold text-primary mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Shop Online
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Scopri la nostra selezione di dolci tradizionali italiani, preparati con ingredienti di prima qualità
            </motion.p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {medusa.loadingProducts ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Caricamento prodotti...</span>
              </div>
            ) : medusa.error ? (
              <div className="text-center py-16">
                <p className="text-destructive mb-4">{medusa.error}</p>
                <Button onClick={() => medusa.fetchProducts()}>
                  Riprova
                </Button>
              </div>
            ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => {
            // Debug prezzo - ora dovrebbe funzionare con i prezzi reali da JS SDK
            console.log('Prodotto:', product.title, 'Varianti:', product.variants)
            console.log('Prima variante prezzi:', product.variants?.[0]?.prices)
            
            // Estrai il prezzo dalla struttura Medusa v2 con JS SDK
            let price = 25.99 // Fallback
            if (product.variants?.[0]?.prices?.[0]?.amount) {
              price = product.variants[0].prices[0].amount / 100
              console.log(`Prezzo reale per ${product.title}: €${price}`)
            } else {
              console.warn(`Nessun prezzo trovato per ${product.title}, usando fallback`)
            }
                  const weight = product.variants?.[0]?.options?.[0]?.value || "N/A"
                  const category = product.tags?.[0]?.value || "Generale"
                  const image = product.thumbnail || product.images?.[0]?.url || "/placeholder.svg"
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="group hover:shadow-lg transition-all duration-300 h-full">
                        <CardHeader className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <motion.img
                              src={image}
                              alt={product.title}
                              className="w-full h-64 object-cover"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                            />
                            <motion.div
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ scale: 0 }}
                              whileHover={{ scale: 1 }}
                            >
                              <Link href={`/shop/${product.id}`}>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </Link>
                            </motion.div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-4 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">
                                4.8 (127)
                              </span>
                            </div>
                          </div>

                          <CardTitle className="text-lg mb-2 line-clamp-1">{product.title}</CardTitle>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                          <div className="flex items-center gap-2 mb-4">
                            <motion.span
                              className="text-2xl font-bold text-primary"
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              €{price.toFixed(2)}
                            </motion.span>
                          </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Link href={`/shop/${product.id}`} className="flex-1">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                              <Button variant="outline" className="w-full bg-transparent">
                                <Eye className="h-4 w-4 mr-2" />
                                Dettagli
                              </Button>
                            </motion.div>
                          </Link>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                            <Button 
                              className="w-full bg-accent hover:bg-accent/90" 
                              onClick={() => addToCart(product)}
                              disabled={addingToCart === product.id}
                            >
                              {addingToCart === product.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 mr-2" />
                              )}
                              Aggiungi
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <motion.section
          className="bg-primary/5 py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="font-display text-3xl font-bold text-primary mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Tradizione e Qualità dal 1966
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ogni prodotto è preparato artigianalmente nel nostro laboratorio, seguendo le ricette tradizionali
              tramandate di generazione in generazione.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href="/la-nostra-storia">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg">
                    Scopri la Nostra Storia
                  </Button>
                </motion.div>
              </Link>
              <Link href="/contatti">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Contattaci
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
