import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Informativa sui Cookie</h1>
            <p className="text-muted-foreground mb-8">
              Questa pagina descrive l’uso dei cookie e tecnologie simili sul sito.
            </p>
            <div className="space-y-8 text-sm leading-7">
              <section>
                <h2 className="text-lg font-semibold mb-2">Cosa sono i cookie</h2>
                <p>I cookie sono piccoli file di testo salvati sul dispositivo per migliorare l’esperienza utente.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Tipologie</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tecnici e necessari</li>
                  <li>Analitici (eventualmente anonimizzati)</li>
                  <li>Profilazione/marketing (previo consenso)</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Gestione preferenze</h2>
                <p>Puoi gestire le preferenze dal browser o tramite l’apposito banner di consenso, se presente.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}




