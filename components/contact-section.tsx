import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Mail } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contatti" className="py-12 sm:py-24 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-balance">
              Vieni a trovarci
              <span className="block text-accent text-2xl sm:text-3xl md:text-4xl mt-1 sm:mt-2">nel cuore della città</span>
            </h2>

            <p className="text-lg sm:text-xl text-primary-foreground/90 mb-6 sm:mb-8 leading-relaxed">
              Ti aspettiamo nel cuore di Trani, lungo Corso Vittorio Emanuele, per farti assaporare l'autentica tradizione italiana in un ambiente accogliente e familiare.
            </p>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Indirizzo</h3>
                  <p className="text-primary-foreground/80">
                    Corso Vittorio Emanuele II 161
                    <br />
                    76125 Trani, Italia
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Telefono</h3>
                  <p className="text-primary-foreground/80">0883 583483</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <p className="text-primary-foreground/80">info@bareuropa.it</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Orari</h3>
                  <div className="text-primary-foreground/80 space-y-1">
                    <p>Lun - Ven: 6:30 - 20:00</p>
                    <p>Sabato: 7:00 - 21:00</p>
                    <p>Domenica: 8:00 - 19:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg"
              >
                Prenota un Tavolo
              </Button>
            </div>
          </div>

          {/* Map/Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3]">
                  <img
                    src="/home_hero.jpeg"
                    alt="Bar Europa Esterno"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-full -z-10"></div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-foreground/10 rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
