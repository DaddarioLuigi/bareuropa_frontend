"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Star, Heart, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock product data - in a real app this would come from an API
const products = [
  {
    id: 1,
    name: "Panettone Tradizionale",
    description:
      "Il nostro panettone classico con uvetta e canditi, preparato secondo la ricetta tradizionale milanese. Un dolce soffice e profumato che racchiude tutta la magia del Natale italiano.",
    longDescription:
      "Questo panettone rappresenta l'eccellenza della tradizione dolciaria italiana. Preparato con un impasto madre coltivato da oltre 50 anni, ogni panettone richiede 3 giorni di lavorazione artigianale. Gli ingredienti selezionati includono uvetta sultanina, canditi di cedro e arancia, burro fresco e uova di galline allevate a terra. Il risultato è un dolce dalla consistenza soffice e alveolata, dal profumo inconfondibile e dal sapore che evoca i ricordi più dolci delle feste natalizie.",
    price: 28.5,
    originalPrice: 32.0,
    images: [
      "/traditional-italian-panettone-with-raisins-and-can.jpg",
      "/placeholder.svg?height=400&width=400&text=Panettone+2",
      "/placeholder.svg?height=400&width=400&text=Panettone+3",
    ],
    category: "Panettoni",
    rating: 4.9,
    reviews: 127,
    isOnSale: true,
    weight: "1kg",
    ingredients: [
      "Farina di grano tenero",
      "Burro",
      "Uova",
      "Zucchero",
      "Uvetta sultanina",
      "Canditi di cedro e arancia",
      "Lievito madre",
      "Miele",
      "Sale",
      "Vaniglia",
    ],
    allergens: ["Glutine", "Uova", "Latte", "Frutta a guscio"],
    nutritionalInfo: {
      calories: "385 kcal per 100g",
      fat: "16g",
      carbs: "54g",
      protein: "8g",
      sugar: "28g",
    },
  },
  {
    id: 2,
    name: "Pandoro Artigianale",
    description: "Soffice pandoro veronese dalla forma a stella, spolverato con zucchero a velo.",
    longDescription:
      "Il nostro pandoro artigianale è un capolavoro della pasticceria veronese. La sua caratteristica forma a stella ottagonale e la consistenza soffice e burrosa lo rendono unico. Preparato con burro di prima qualità e vaniglia bourbon, ogni pandoro viene cotto lentamente per ottenere la perfetta doratura esterna e la morbidezza interna.",
    price: 24.9,
    originalPrice: null,
    images: [
      "/golden-italian-pandoro-star-shaped-cake-with-powde.jpg",
      "/placeholder.svg?height=400&width=400&text=Pandoro+2",
    ],
    category: "Pandori",
    rating: 4.8,
    reviews: 89,
    isOnSale: false,
    weight: "750g",
    ingredients: ["Farina di grano tenero", "Burro", "Uova", "Zucchero", "Lievito madre", "Vaniglia bourbon", "Sale"],
    allergens: ["Glutine", "Uova", "Latte"],
    nutritionalInfo: {
      calories: "410 kcal per 100g",
      fat: "18g",
      carbs: "58g",
      protein: "7g",
      sugar: "22g",
    },
  },
  {
    id: 3,
    name: "Colomba Pasquale Premium",
    description: "Colomba pasquale con glassa alle mandorle e granella, simbolo della tradizione italiana.",
    longDescription:
      "La nostra colomba pasquale premium è un simbolo di rinascita e tradizione. Preparata con la stessa cura del panettone, è arricchita da una glassa alle mandorle e decorata con granella di zucchero e mandorle. La forma di colomba rappresenta la pace e la speranza, mentre il sapore delicato e profumato celebra l'arrivo della primavera.",
    price: 26.0,
    originalPrice: 30.0,
    images: [
      "/italian-easter-colomba-cake-with-almond-glaze-and-.jpg",
      "/placeholder.svg?height=400&width=400&text=Colomba+2",
    ],
    category: "Colombe",
    rating: 4.9,
    reviews: 156,
    isOnSale: true,
    weight: "900g",
    ingredients: [
      "Farina di grano tenero",
      "Burro",
      "Uova",
      "Zucchero",
      "Mandorle",
      "Glassa alle mandorle",
      "Lievito madre",
      "Vaniglia",
      "Sale",
    ],
    allergens: ["Glutine", "Uova", "Latte", "Frutta a guscio"],
    nutritionalInfo: {
      calories: "395 kcal per 100g",
      fat: "17g",
      carbs: "56g",
      protein: "9g",
      sugar: "30g",
    },
  },
  {
    id: 4,
    name: "Panettone al Cioccolato",
    description: "Variante golosa del panettone tradizionale con gocce di cioccolato fondente.",
    longDescription:
      "Una deliziosa variante del panettone classico, arricchita con gocce di cioccolato fondente di alta qualità. L'impasto soffice e profumato si sposa perfettamente con l'intensità del cioccolato, creando un equilibrio di sapori che conquista al primo assaggio. Perfetto per gli amanti del cioccolato che non vogliono rinunciare alla tradizione.",
    price: 30.0,
    originalPrice: null,
    images: [
      "/chocolate-chip-panettone-italian-christmas-cake.jpg",
      "/placeholder.svg?height=400&width=400&text=Panettone+Cioccolato+2",
    ],
    category: "Panettoni",
    rating: 4.7,
    reviews: 94,
    isOnSale: false,
    weight: "1kg",
    ingredients: [
      "Farina di grano tenero",
      "Burro",
      "Uova",
      "Zucchero",
      "Gocce di cioccolato fondente",
      "Lievito madre",
      "Cacao",
      "Vaniglia",
      "Sale",
    ],
    allergens: ["Glutine", "Uova", "Latte", "Soia"],
    nutritionalInfo: {
      calories: "405 kcal per 100g",
      fat: "19g",
      carbs: "52g",
      protein: "8g",
      sugar: "26g",
    },
  },
]

export default function ProductPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id as string)
  const product = products.find((p) => p.id === productId)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Prodotto non trovato</h1>
            <Link href="/shop">
              <Button>Torna al Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    // In a real app, this would add to cart context/state
    console.log(`Added ${quantity} x ${product.name} to cart`)
    // Show success message or redirect to cart
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-primary">
                Shop
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
              <ArrowLeft className="h-4 w-4" />
              Torna al Shop
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {product.images.length > 1 && (
                  <div className="flex gap-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square w-20 overflow-hidden rounded-lg border-2 ${
                          selectedImage === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{product.category}</Badge>
                    {product.isOnSale && <Badge className="bg-accent text-accent-foreground">In Offerta</Badge>}
                  </div>

                  <h1 className="font-display text-3xl font-bold text-primary mb-4">{product.name}</h1>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-muted-foreground">({product.reviews} recensioni)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl font-bold text-primary">€{product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">({product.weight})</span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Quantità:</span>
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 font-medium">{quantity}</span>
                      <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg" className="flex-1 bg-accent hover:bg-accent/90" onClick={handleAddToCart}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Aggiungi al Carrello
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={isWishlisted ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <p className="text-sm font-medium">Spedizione Gratuita</p>
                    <p className="text-xs text-muted-foreground">Ordini sopra €50</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <p className="text-sm font-medium">Qualità Garantita</p>
                    <p className="text-xs text-muted-foreground">Prodotti artigianali</p>
                  </div>
                  <div className="text-center">
                    <RotateCcw className="h-6 w-6 mx-auto mb-2 text-accent" />
                    <p className="text-sm font-medium">Reso Facile</p>
                    <p className="text-xs text-muted-foreground">Entro 14 giorni</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-4">Descrizione</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-4">Ingredienti</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>• {ingredient}</li>
                    ))}
                  </ul>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium mb-2">Allergeni:</h4>
                    <p className="text-sm text-muted-foreground">{product.allergens.join(", ")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Nutritional Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-4">Valori Nutrizionali</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Calorie:</span>
                      <span className="font-medium">{product.nutritionalInfo.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grassi:</span>
                      <span className="font-medium">{product.nutritionalInfo.fat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carboidrati:</span>
                      <span className="font-medium">{product.nutritionalInfo.carbs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proteine:</span>
                      <span className="font-medium">{product.nutritionalInfo.protein}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zuccheri:</span>
                      <span className="font-medium">{product.nutritionalInfo.sugar}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
