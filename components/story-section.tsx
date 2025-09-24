import { Card, CardContent } from "@/components/ui/card"

export function StorySection() {
  return (
    <section id="storia" className="py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
              La nostra storia
              <span className="block text-accent text-3xl md:text-4xl mt-2">inizia nel 1966</span>
            </h2>

            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                Nel cuore della città, Bar Europa nasce dalla passione di una famiglia italiana per l'arte dolciaria e
                la tradizione del caffè. Da oltre cinquant'anni, portiamo avanti l'eredità dei nostri fondatori con la
                stessa dedizione e amore.
              </p>

              <p>
                Ogni mattina, i nostri maestri pasticceri preparano a mano cornetti fragranti, cannoli siciliani e
                tiramisù cremosi, seguendo ricette tramandate di generazione in generazione. Il nostro caffè, tostato
                artigianalmente, offre l'autentico sapore dell'espresso italiano.
              </p>

              <p>
                La nostra gelateria propone gusti unici preparati con ingredienti freschi e naturali, dalle classiche
                creme ai sorbetti alla frutta di stagione.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="font-display text-3xl font-bold text-accent mb-2">58</div>
                  <div className="text-sm text-muted-foreground">Anni di Tradizione</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="font-display text-3xl font-bold text-accent mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Specialità Artigianali</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="font-display text-3xl font-bold text-accent mb-2">3</div>
                  <div className="text-sm text-muted-foreground">Generazioni</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img src="/vintage-italian-pastry-shop-with-traditional-displ.jpg" alt="Storia di Bar Europa" className="w-full h-full object-cover" />
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full -z-10"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
