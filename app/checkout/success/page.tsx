import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <CheckCircle className="h-24 w-24 mx-auto text-green-500 mb-6" />
            <h1 className="font-display text-4xl font-bold text-primary mb-4">Ordine Completato!</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Grazie per il tuo acquisto. Il tuo ordine è stato ricevuto e sarà processato a breve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Mail className="h-12 w-12 mx-auto text-accent mb-4" />
                <CardTitle className="text-lg">Conferma Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Riceverai una email di conferma con i dettagli del tuo ordine
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Package className="h-12 w-12 mx-auto text-accent mb-4" />
                <CardTitle className="text-lg">Preparazione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Il tuo ordine sarà preparato con cura nel nostro laboratorio
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 mx-auto text-accent mb-4" />
                <CardTitle className="text-lg">Spedizione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Spedizione in 24-48h con tracking incluso</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cosa Succede Ora?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Conferma dell'Ordine</h3>
                  <p className="text-sm text-muted-foreground">
                    Riceverai una email di conferma con tutti i dettagli del tuo ordine e il numero di tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Preparazione Artigianale</h3>
                  <p className="text-sm text-muted-foreground">
                    I nostri maestri pasticceri prepareranno i tuoi prodotti con la massima cura e attenzione.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Spedizione Sicura</h3>
                  <p className="text-sm text-muted-foreground">
                    Il tuo ordine sarà imballato con cura e spedito con corriere espresso in 24-48h.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Continua lo Shopping
                </Button>
              </Link>
              <Link href="/contatti">
                <Button variant="outline" size="lg">
                  Contattaci
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              Hai domande sul tuo ordine?{" "}
              <Link href="/contatti" className="text-accent hover:underline">
                Contattaci
              </Link>{" "}
              - siamo qui per aiutarti!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
