import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const products = [
  {
    category: "Pasticceria",
    title: "Cornetti e Mignon",
    description: "Cornetti freschi ogni mattina, mignon delicati e specialità della tradizione pugliese",
    image: "/traditional-italian-pastries-display-with-cannoli-.jpg",
    accent: "bg-accent",
  },
  {
    category: "Caffetteria",
    title: "Caffè e Bevande",
    description: "Caffè pregiato, espresso perfetto e bevande nel cuore di Trani",
    image: "/italian-espresso-coffee-beans-and-vintage-coffee-m.jpg",
    accent: "bg-primary",
  },
  {
    category: "Torte",
    title: "Torte Artigianali",
    description: "Torte fresche preparate con ricette tradizionali e ingredienti di qualità",
    image: "/artisanal-italian-gelato-display-with-colorful-fla.jpg",
    accent: "bg-accent",
  },
]

export function ProductsSection() {
  return (
    <section id="prodotti" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
            Le nostre
            <span className="block text-accent">specialità</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Scopri l'autentico sapore italiano attraverso le nostre specialità: cornetti freschi, mignon, torte artigianali e caffè pregiato nel cuore di Trani.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute top-4 left-4 ${product.accent} text-white px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {product.category}
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="font-display text-2xl font-semibold text-primary mb-3">{product.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{product.description}</p>
                <Button variant="ghost" className="group/btn p-0 h-auto text-accent hover:text-accent/80">
                  Scopri di più
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg"
          >
            Vedi Tutti i Prodotti
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
