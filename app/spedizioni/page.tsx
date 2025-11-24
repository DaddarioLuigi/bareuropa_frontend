import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Truck, Package, Clock, MapPin } from "lucide-react"

export const revalidate = 3600

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Spedizioni e Consegne</h1>
            <p className="text-muted-foreground mb-8 text-base">
              <strong>Ultimo aggiornamento:</strong> Gennaio 2025
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Informazioni dettagliate su tempi, costi, aree di consegna e modalità di spedizione dei nostri prodotti artigianali.
            </p>

            <div className="space-y-8 text-base leading-7">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Tempi di Consegna</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Clock className="h-6 w-6 text-accent mb-2" />
                    <h3 className="font-semibold mb-2">Consegna Standard</h3>
                    <p className="text-sm">2-5 giorni lavorativi</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Truck className="h-6 w-6 text-accent mb-2" />
                    <h3 className="font-semibold mb-2">Consegna Espressa</h3>
                    <p className="text-sm">24-48 ore (disponibile su richiesta)</p>
                  </div>
                </div>
                <p className="mb-3">I tempi di consegna indicati sono calcolati a partire dalla conferma dell'ordine e dal completamento del pagamento. I tempi possono variare in base a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Disponibilità del prodotto:</strong> alcuni prodotti artigianali richiedono tempo di preparazione</li>
                  <li><strong>Destinazione:</strong> le zone più remote possono richiedere tempi aggiuntivi</li>
                  <li><strong>Periodo dell'anno:</strong> durante le festività (Natale, Pasqua) i tempi possono essere più lunghi</li>
                  <li><strong>Condizioni meteorologiche:</strong> per prodotti deperibili, condizioni estreme possono ritardare la consegna</li>
                  <li><strong>Scioperi o eventi eccezionali:</strong> situazioni di forza maggiore che possono influire sui servizi di spedizione</li>
                </ul>
                <div className="bg-accent/10 p-4 rounded-lg mt-4">
                  <p className="font-semibold mb-2">📦 Tracking dell'Ordine</p>
                  <p className="text-sm">Riceverai un'email con il numero di tracking non appena l'ordine sarà spedito, così potrai monitorare la consegna in tempo reale.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Costi di Spedizione</h2>
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Spedizione Gratuita</h3>
                    <p className="mb-2">Spedizione gratuita per ordini superiori a <strong className="text-accent">€50,00</strong></p>
                    <p className="text-sm text-muted-foreground">Il calcolo viene effettuato automaticamente al checkout.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Costi Standard</h3>
                    <p className="mb-2">Per ordini inferiori a €50,00, i costi di spedizione sono:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Italia (penisola):</strong> €5,90</li>
                      <li><strong>Isole e zone remote:</strong> €8,90</li>
                      <li><strong>Consegna espressa (24-48h):</strong> €12,90</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">I costi sono calcolati in base al peso e alle dimensioni del pacco. Il costo esatto viene mostrato al checkout prima della conferma dell'ordine.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Spedizioni Internazionali</h3>
                    <p className="mb-2">Per spedizioni fuori dall'Italia, contattaci per un preventivo personalizzato:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Email: <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></li>
                      <li>Telefono: <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Nota: per prodotti deperibili, le spedizioni internazionali potrebbero non essere disponibili per motivi di sicurezza alimentare.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Aree di Consegna</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.1. Italia</h3>
                    <p className="mb-2">Consegniamo in tutta Italia tramite corrieri espressi certificati:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Tutte le regioni della penisola italiana</li>
                      <li>Isole (Sicilia, Sardegna, isole minori)</li>
                      <li>Zone montane e remote</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Per alcune zone remote, i tempi di consegna possono essere più lunghi.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.2. Estero</h3>
                    <p className="mb-2">Le spedizioni internazionali sono disponibili su richiesta. Contattaci per:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Verificare la disponibilità per il tuo paese</li>
                      <li>Ricevere un preventivo personalizzato</li>
                      <li>Conoscere i tempi di consegna stimati</li>
                      <li>Verificare eventuali restrizioni doganali</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.3. Ritiro in Negozio</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <MapPin className="h-6 w-6 text-accent mb-2" />
                      <p className="mb-2">Se risiedi nella zona di Trani o dintorni, puoi ritirare il tuo ordine direttamente presso il nostro punto vendita:</p>
                      <p className="mb-1"><strong>Bar Europa</strong></p>
                      <p className="mb-1">Corso Vittorio Emanuele II 161</p>
                      <p className="mb-1">76125 Trani (BT), Italia</p>
                      <p className="mt-2 text-sm">Ti contatteremo quando l'ordine sarà pronto per il ritiro. Il ritiro in negozio è gratuito.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Modalità di Consegna</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.1. Consegna a Domicilio</h3>
                    <p className="mb-2">Il corriere consegnerà il pacco all'indirizzo indicato al momento dell'ordine. È importante che:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>L'indirizzo sia completo e corretto</li>
                      <li>Ci sia qualcuno presente al momento della consegna (per prodotti deperibili)</li>
                      <li>Il numero di telefono sia corretto per eventuali contatti del corriere</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.2. Consegna in Punto Ritiro</h3>
                    <p className="mb-2">Su richiesta, possiamo organizzare la consegna presso un punto ritiro del corriere (es. Locker, punti vendita convenzionati).</p>
                    <p className="text-sm text-muted-foreground">Questa opzione è particolarmente utile se non sei presente a casa durante gli orari di consegna.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.3. Istruzioni Speciali</h3>
                    <p className="mb-2">Al momento dell'ordine, puoi inserire note speciali per il corriere (es. "Lasciare presso il portiere", "Consegnare al piano X", ecc.).</p>
                    <p className="text-sm text-muted-foreground">Nota: per prodotti deperibili, consigliamo la consegna diretta per garantire la freschezza.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Imballaggio e Conservazione</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.1. Imballaggio</h3>
                    <p className="mb-2">I nostri prodotti sono imballati con cura per garantire:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Protezione durante il trasporto</li>
                      <li>Conservazione della freschezza (per prodotti deperibili)</li>
                      <li>Integrità del prodotto</li>
                      <li>Rispetto dell'ambiente (utilizziamo materiali riciclabili quando possibile)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.2. Prodotti Deperibili</h3>
                    <p className="mb-2">I prodotti deperibili (es. prodotti freschi, prodotti con scadenza breve) sono:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Imballati con materiali isolanti</li>
                      <li>Spediti con corrieri espressi</li>
                      <li>Consegnati con priorità</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Ti consigliamo di conservare i prodotti secondo le istruzioni riportate sulla confezione o sul sito.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Problemi con la Consegna</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">6.1. Ritardi nella Consegna</h3>
                    <p className="mb-2">Se l'ordine non arriva entro i tempi indicati:</p>
                    <ol className="list-decimal pl-6 space-y-1">
                      <li>Controlla il tracking dell'ordine</li>
                      <li>Contatta il corriere utilizzando il numero di tracking</li>
                      <li>Se il problema persiste, contattaci immediatamente</li>
                    </ol>
                    <p className="mt-2">Provvederemo a indagare e, se necessario, a inviare un nuovo ordine o a rimborsare l'importo.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">6.2. Pacco Danneggiato</h3>
                    <p className="mb-2">Se ricevi un pacco danneggiato:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Non accettare la consegna se il danno è evidente</li>
                      <li>Fai una foto del pacco danneggiato</li>
                      <li>Contattaci immediatamente con il numero d'ordine e le foto</li>
                    </ul>
                    <p className="mt-2">Provvederemo immediatamente alla sostituzione o al rimborso.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">6.3. Pacco Non Ricevuto</h3>
                    <p className="mb-2">Se il tracking indica che il pacco è stato consegnato ma non l'hai ricevuto:</p>
                    <ol className="list-decimal pl-6 space-y-1">
                      <li>Verifica con familiari, vicini o portiere</li>
                      <li>Controlla eventuali punti di ritiro indicati dal corriere</li>
                      <li>Contattaci con il numero d'ordine</li>
                    </ol>
                    <p className="mt-2">Indagheremo con il corriere e, se necessario, invieremo un nuovo ordine.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Corrieri Utilizzati</h2>
                <p className="mb-3">Utilizziamo corrieri espressi certificati e affidabili per garantire consegne sicure e puntuali:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Corrieri nazionali per le consegne in Italia</li>
                  <li>Servizi specializzati per prodotti deperibili</li>
                  <li>Corrieri internazionali per le spedizioni all'estero</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">Il corriere utilizzato per il tuo ordine ti sarà comunicato insieme al numero di tracking.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Assistenza</h2>
                <p className="mb-3">Per qualsiasi domanda o problema relativo alle spedizioni, siamo a tua disposizione:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-1"><strong>Email:</strong> <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></p>
                  <p className="mb-1"><strong>Telefono:</strong> <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mb-1"><strong>WhatsApp:</strong> <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+39 345 804 1890</a></p>
                  <p className="mb-1"><strong>Orari:</strong> Lun-Dom 06:00-00:00</p>
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
