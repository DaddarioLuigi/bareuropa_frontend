import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Note Legali</h1>
            <p className="text-muted-foreground mb-8 text-base">
              <strong>Ultimo aggiornamento:</strong> Gennaio 2025
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Informazioni legali relative al sito web e all'attività di Bar Europa, in conformità con la normativa italiana ed europea.
            </p>

            <div className="space-y-8 text-base leading-7">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Informazioni Societarie</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Denominazione:</strong> Bar Europa</p>
                  <p className="mb-2"><strong>Sede legale e operativa:</strong></p>
                  <p className="mb-1">Corso Vittorio Emanuele II 161</p>
                  <p className="mb-1">76125 Trani (BT), Italia</p>
                  <p className="mb-2 mt-3"><strong>Partita IVA:</strong> [da inserire se disponibile]</p>
                  <p className="mb-2"><strong>Codice Fiscale:</strong> [da inserire se disponibile]</p>
                  <p className="mb-2"><strong>Registro Imprese:</strong> [da inserire se disponibile]</p>
                  <p className="mb-2"><strong>REA:</strong> [da inserire se disponibile]</p>
                  <p className="mb-2"><strong>Attività dal:</strong> 1966</p>
                  <p className="mb-2"><strong>Settore:</strong> Pasticceria, Bar, Gelateria Artigianale</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Contatti</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Email:</strong> <a href="mailto:info@bareuropa.it" className="text-accent hover:underline">info@bareuropa.it</a></p>
                  <p className="mb-2"><strong>Telefono:</strong> <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mb-2"><strong>WhatsApp:</strong> <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+39 345 804 1890</a></p>
                  <p className="mb-2"><strong>Orari di apertura:</strong> Lun-Dom: 7:00 - 20:00</p>
                  <p className="mb-2"><strong>Indirizzo:</strong> Corso Vittorio Emanuele II 161, 76125 Trani (BT), Italia</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Proprietà Intellettuale</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.1. Contenuti del Sito</h3>
                    <p className="mb-2">Tutti i contenuti presenti sul sito web di Bar Europa sono protetti dalle leggi sul diritto d'autore e sulla proprietà intellettuale, inclusi ma non limitati a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Testi, articoli, descrizioni prodotti</li>
                      <li>Immagini, fotografie, grafiche</li>
                      <li>Loghi, marchi, segni distintivi</li>
                      <li>Design, layout, struttura del sito</li>
                      <li>Codice sorgente, software</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.2. Marchi</h3>
                    <p className="mb-2">Il marchio "Bar Europa" e i relativi loghi sono di proprietà di Bar Europa o dei rispettivi titolari. È vietato utilizzare, riprodurre o modificare tali marchi senza autorizzazione scritta.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.3. Utilizzo dei Contenuti</h3>
                    <p className="mb-2">È vietato:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Riprodurre, distribuire o comunicare al pubblico i contenuti senza autorizzazione</li>
                      <li>Modificare, adattare o trasformare i contenuti</li>
                      <li>Utilizzare i contenuti per scopi commerciali senza autorizzazione</li>
                      <li>Rimuovere indicazioni di copyright o marchi</li>
                    </ul>
                    <p className="mt-2">Eventuali eccezioni devono essere autorizzate per iscritto da Bar Europa.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Link Esterni</h2>
                <p className="mb-3">Il sito web di Bar Europa può contenere link a siti web di terze parti. Bar Europa non ha alcun controllo sul contenuto di tali siti e non si assume alcuna responsabilità per:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Il contenuto dei siti collegati</li>
                  <li>Le politiche sulla privacy dei siti collegati</li>
                  <li>Le pratiche commerciali dei siti collegati</li>
                  <li>Eventuali danni derivanti dall'accesso a siti collegati</li>
                </ul>
                <p className="mt-3">L'inclusione di un link non implica approvazione o associazione con il sito collegato.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Limitazione di Responsabilità</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.1. Contenuti del Sito</h3>
                    <p className="mb-2">Bar Europa si impegna a mantenere aggiornati e accurati i contenuti del sito, tuttavia:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Non garantisce l'assoluta accuratezza, completezza o aggiornamento delle informazioni</li>
                      <li>Si riserva il diritto di modificare i contenuti in qualsiasi momento senza preavviso</li>
                      <li>Non è responsabile per errori, omissioni o imprecisioni nei contenuti</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.2. Funzionamento del Sito</h3>
                    <p className="mb-2">Bar Europa non garantisce che:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Il sito funzioni senza interruzioni o errori</li>
                      <li>I server siano privi di virus o componenti dannosi</li>
                      <li>Le informazioni trasmesse siano completamente sicure</li>
                    </ul>
                    <p className="mt-2">Bar Europa non è responsabile per danni derivanti dall'uso o dall'impossibilità di usare il sito.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.3. Forza Maggiore</h3>
                    <p>Bar Europa non è responsabile per ritardi o mancati adempimenti dovuti a cause di forza maggiore, incluse ma non limitate a: scioperi, calamità naturali, guerre, pandemie, malfunzionamenti di reti o servizi di terze parti.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Protezione dei Dati Personali</h2>
                <p className="mb-3">Il trattamento dei dati personali degli utenti è regolato dall'<a href="/privacy" className="text-accent hover:underline">Informativa sulla Privacy</a>, che costituisce parte integrante delle presenti note legali.</p>
                <p>Bar Europa si impegna a rispettare la normativa sulla protezione dei dati personali (GDPR, D.Lgs. 196/2003) e a trattare i dati in modo lecito, corretto e trasparente.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Condizioni di Vendita</h2>
                <p className="mb-3">Le vendite effettuate attraverso il sito web sono regolate dai <a href="/termini-e-condizioni" className="text-accent hover:underline">Termini e Condizioni di Vendita</a>, che costituiscono parte integrante delle presenti note legali.</p>
                <p>L'acquisto di prodotti implica l'accettazione integrale delle condizioni di vendita.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Modifiche alle Note Legali</h2>
                <p className="mb-3">Bar Europa si riserva il diritto di modificare le presenti note legali in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.</p>
                <p>Ti invitiamo a consultare periodicamente questa pagina per essere informato su eventuali modifiche.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">9. Legge Applicabile e Foro Competente</h2>
                <p className="mb-3">Le presenti note legali sono regolate dalla legge italiana.</p>
                <p className="mb-3">Per qualsiasi controversia relativa all'interpretazione o all'applicazione delle presenti note legali, sarà competente il Foro di Trani, salvo diverse norme inderogabili di legge.</p>
                <p className="text-sm text-muted-foreground">Ai sensi dell'art. 14 del Regolamento (UE) n. 524/2013, ti informiamo che hai diritto di ricorrere a una procedura di risoluzione alternativa delle controversie (ADR) tramite la piattaforma ODR: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">https://ec.europa.eu/consumers/odr</a></p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">10. Conformità Normativa</h2>
                <p className="mb-3">Bar Europa si impegna a rispettare tutte le normative applicabili, incluse ma non limitate a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Normativa sulla sicurezza alimentare</li>
                  <li>Normativa sulla protezione dei consumatori</li>
                  <li>Normativa sulla privacy e protezione dei dati</li>
                  <li>Normativa sul commercio elettronico</li>
                  <li>Normativa fiscale e contabile</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">11. Contatti per Questioni Legali</h2>
                <p className="mb-3">Per qualsiasi questione legale o richiesta di informazioni, puoi contattarci:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-1"><strong>Email:</strong> <a href="mailto:info@bareuropa.it" className="text-accent hover:underline">info@bareuropa.it</a></p>
                  <p className="mb-1"><strong>Telefono:</strong> <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mb-1"><strong>Indirizzo:</strong> Corso Vittorio Emanuele II 161, 76125 Trani (BT), Italia</p>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
