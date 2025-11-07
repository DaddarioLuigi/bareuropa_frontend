import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Termini e Condizioni</h1>
            <p className="text-muted-foreground mb-8">
              Le presenti condizioni regolano l’uso del sito e la vendita dei prodotti.
            </p>
            <div className="space-y-8 text-sm leading-7">
              <section>
                <h2 className="text-lg font-semibold mb-2">Informazioni sul venditore</h2>
                <p>Bar Europa, Via Roma 123, Milano – P.IVA: 00000000000</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Ordini</h2>
                <p>L’ordine si considera accettato al momento della conferma e-mail. Ci riserviamo la possibilità di rifiutare o cancellare ordini in caso di anomalie.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Prezzi e pagamenti</h2>
                <p>I prezzi sono indicati in Euro e includono IVA salvo diversa indicazione. I pagamenti sono gestiti da provider terzi.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Responsabilità</h2>
                <p>Non rispondiamo di ritardi o disservizi dovuti a cause di forza maggiore.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Legge applicabile</h2>
                <p>Contratto regolato dalla legge italiana. Foro competente: Milano, salvo diverse norme inderogabili.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}





