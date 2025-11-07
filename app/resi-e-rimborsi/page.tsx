import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Resi e Rimborsi</h1>
            <p className="text-muted-foreground mb-8">
              Informazioni su diritto di recesso, resi e rimborsi.
            </p>
            <div className="space-y-8 text-sm leading-7">
              <section>
                <h2 className="text-lg font-semibold mb-2">Diritto di recesso</h2>
                <p>Puoi esercitare il diritto di recesso entro 14 giorni, salvo prodotti deperibili o personalizzati.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Procedura di reso</h2>
                <p>Contatta l’assistenza a info@bareuropa.it indicando numero ordine e motivazione. Ti forniremo le istruzioni per il reso.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Rimborsi</h2>
                <p>Il rimborso verrà effettuato con lo stesso metodo di pagamento entro i termini di legge, una volta verificata l’integrità del reso.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}





