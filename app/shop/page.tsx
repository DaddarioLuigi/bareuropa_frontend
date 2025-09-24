"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart, Star, Eye } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimatePresence } from "framer-motion"

const products = [
  {
    id: 1,
    name: "Panettone Tradizionale",
    description:
      "Il nostro panettone classico con uvetta e canditi, preparato secondo la ricetta tradizionale milanese.",
    price: 28.5,
    originalPrice: 32.0,
    image: "/traditional-italian-panettone-with-raisins-and-can.jpg",
    category: "Panettoni",
    rating: 4.9,
    reviews: 127,
    isOnSale: true,
    weight: "1kg",
  },
  {
    id: 2,
    name: "Pandoro Artigianale",
    description: "Soffice pandoro veronese dalla forma a stella, spolverato con zucchero a velo.",
    price: 24.9,
    originalPrice: null,
    image: "/golden-italian-pandoro-star-shaped-cake-with-powde.jpg",
    category: "Pandori",
    rating: 4.8,
    reviews: 89,
    isOnSale: false,
    weight: "750g",
  },
  {
    id: 3,
    name: "Colomba Pasquale Premium",
    description: "Colomba pasquale con glassa alle mandorle e granella, simbolo della tradizione italiana.",
    price: 26.0,
    originalPrice: 30.0,
    image: "/italian-easter-colomba-cake-with-almond-glaze-and-.jpg",
    category: "Colombe",
    rating: 4.9,
    reviews: 156,
    isOnSale: true,
    weight: "900g",
  },
  {
    id: 4,
    name: "Panettone al Cioccolato",
    description: "Variante golosa del panettone tradizionale con gocce di cioccolato fondente.",
    price: 30.0,
    originalPrice: null,
    image: "/chocolate-chip-panettone-italian-christmas-cake.jpg",
    category: "Panettoni",
    rating: 4.7,
    reviews: 94,
    isOnSale: false,
    weight: "1kg",
  },
]

export default function ShopPage() {
  const { dispatch } = useCart()

  const addToCart = (product: (typeof products)[0]) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight,
      },
    })
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
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
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-64 object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                        <AnimatePresence>
                          {product.isOnSale && (
                            <motion.div
                              initial={{ scale: 0, rotate: -12 }}
                              animate={{ scale: 1, rotate: -12 }}
                              className="absolute top-3 left-3"
                            >
                              <Badge className="bg-accent text-accent-foreground">In Offerta</Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                          {product.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                      </div>

                      <CardTitle className="text-lg mb-2 line-clamp-1">{product.name}</CardTitle>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <motion.span
                          className="text-2xl font-bold text-primary"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          €{product.price.toFixed(2)}
                        </motion.span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            €{product.originalPrice.toFixed(2)}
                          </span>
                        )}
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
                        <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => addToCart(product)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Aggiungi
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
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
