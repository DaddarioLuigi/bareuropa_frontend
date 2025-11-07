import { Card, CardContent } from "@/components/ui/card"

export function StorySection() {
  return (
    <section id="storia" className="py-12 sm:py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          {/* Text Content */}
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 sm:mb-6 text-balance">
              La nostra storia
              <span className="block text-accent text-2xl sm:text-3xl md:text-4xl mt-1 sm:mt-2">inizia nel 1966</span>
            </h2>

            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
              <p>
                Nel cuore di Trani, lungo Corso Vittorio Emanuele, Bar Europa nasce nel 1966 dalla passione della famiglia Farucci per l'arte dolciaria e la tradizione del caffè. Da oltre cinquant'anni, portiamo avanti l'eredità dei nostri fondatori Francesco e Cataldo con la stessa dedizione e amore.
              </p>

              <p>
                Ogni mattina, i nostri maestri pasticceri preparano a mano cornetti fragranti, mignon delicati e torte artigianali, seguendo ricette tramandate di generazione in generazione. Il nostro caffè, selezionato con cura, offre l'autentico sapore dell'espresso italiano nel nostro locale rinnovato con interni luminosi e archi in pietra.
              </p>

              <p>
                Il nostro ricco banco di dolci e il dehors su Corso Vittorio Emanuele sono il cuore pulsante della nostra attività, dove i clienti possono gustare le nostre specialità in un ambiente accogliente e familiare.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
              <Card className="text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-accent mb-2">58</div>
                  <div className="text-xs sm:text-sm text-muted-foreground break-words leading-tight">Anni di Tradizione</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-accent mb-2">50+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground break-words leading-tight">Specialità Artigianali</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4 sm:p-6">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-accent mb-2">3</div>
                  <div className="text-xs sm:text-sm text-muted-foreground break-words leading-tight">Generazioni</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img src="/storia_1.jpeg" alt="Storia di Bar Europa" className="w-full h-full object-cover" />
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
