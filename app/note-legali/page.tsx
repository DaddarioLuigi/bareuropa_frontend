import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Note Legali</h1>
            <div className="space-y-8 text-sm leading-7">
              <section>
                <h2 className="text-lg font-semibold mb-2">Informazioni societarie</h2>
                <p>Bar Europa – Sede: Via Roma 123, 20100 Milano – P.IVA: 00000000000</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Contatti</h2>
                <p>Email: info@bareuropa.it – Tel: +39 02 1234 5678</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">Proprietà intellettuale</h2>
                <p>Testi, immagini e marchi sono di proprietà dei rispettivi titolari. È vietata la riproduzione non autorizzata.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}




