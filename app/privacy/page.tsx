import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Informativa sulla Privacy</h1>
            <p className="text-muted-foreground mb-8">
              La presente informativa descrive le modalità di trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR).
            </p>

            <div className="space-y-8 text-sm leading-7">
              <section>
                <h2 className="text-lg font-semibold mb-2">Titolare del trattamento</h2>
                <p>Bar Europa, Via Roma 123, Milano – Email: info@bareuropa.it</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Categorie di dati trattati</h2>
                <p>Dati di contatto, dati di acquisto, dati di pagamento (gestiti tramite provider), dati di navigazione e cookie.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Finalità e basi giuridiche</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Evasione ordini e adempimenti contrattuali</li>
                  <li>Assistenza clienti e comunicazioni</li>
                  <li>Obblighi legali e fiscali</li>
                  <li>Marketing previo consenso</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Conservazione</h2>
                <p>I dati sono conservati per il tempo necessario alle finalità indicate o secondo gli obblighi di legge.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Diritti dell’interessato</h2>
                <p>Accesso, rettifica, cancellazione, limitazione, opposizione e portabilità. Per esercitarli scrivere a info@bareuropa.it.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Destinatari</h2>
                <p>Provider di pagamento e logistica, fornitori IT, autorità competenti ove richiesto.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}



