import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Spedizioni</h1>
            <p className="text-muted-foreground mb-8">
              Informazioni su tempi, costi e aree di consegna.
            </p>
            <div className="space-y-8 text-sm leading-7">
              <section>
                <h2 className="text-lg font-semibold mb-2">Tempi di consegna</h2>
                <p>Le spedizioni avvengono generalmente entro 2-5 giorni lavorativi, salvo diversa indicazione.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Costi</h2>
                <p>Spedizione gratuita sopra una certa soglia d’ordine, altrimenti costo fisso indicato al checkout.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Aree coperte</h2>
                <p>Consegniamo in Italia; per estero contattare l’assistenza per un preventivo.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}




