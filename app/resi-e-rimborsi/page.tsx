import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Resi e Rimborsi</h1>
            <p className="text-muted-foreground mb-8 text-base">
              <strong>Ultimo aggiornamento:</strong> Gennaio 2025
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Questa pagina contiene tutte le informazioni relative al diritto di recesso, alle procedure di reso e ai rimborsi per gli acquisti effettuati su Bar Europa.
            </p>

            <div className="space-y-8 text-base leading-7">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Diritto di Recesso</h2>
                <div className="bg-accent/10 p-4 rounded-lg mb-4">
                  <p className="font-semibold mb-2">Hai diritto di recedere dal contratto entro 14 giorni senza dover indicare il motivo.</p>
                  <p className="text-sm">Il termine di 14 giorni decorre dal giorno della ricezione dell'ultimo prodotto ordinato.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">1.1. Prodotti Soggetti a Recesso</h3>
                    <p className="mb-2">Il diritto di recesso si applica a tutti i prodotti acquistati, tranne:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Prodotti deperibili:</strong> prodotti alimentari con scadenza breve o che devono essere consumati rapidamente</li>
                      <li><strong>Prodotti personalizzati:</strong> prodotti realizzati su misura o personalizzati secondo le tue specifiche</li>
                      <li><strong>Prodotti sigillati aperti:</strong> prodotti sigillati che sono stati aperti e non possono essere restituiti per motivi igienici</li>
                      <li><strong>Prodotti deteriorati:</strong> prodotti che si sono deteriorati dopo la consegna a causa della loro natura</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">1.2. Come Esercitare il Diritto di Recesso</h3>
                    <p className="mb-2">Per esercitare il diritto di recesso, devi comunicarci la tua decisione in modo chiaro. Puoi farlo:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Via email:</strong> inviando una comunicazione a <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></li>
                      <li><strong>Via telefono:</strong> chiamando il <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></li>
                      <li><strong>Via WhatsApp:</strong> contattandoci al <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+39 345 804 1890</a></li>
                    </ul>
                    <p className="mt-2">La comunicazione deve includere:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Numero d'ordine</li>
                      <li>Elenco dei prodotti da restituire</li>
                      <li>Data di ricezione dei prodotti</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">1.3. Modulo di Recesso</h3>
                    <div className="bg-muted/50 p-4 rounded-lg mt-2">
                      <p className="mb-2 font-semibold">Puoi utilizzare il seguente modulo (non obbligatorio):</p>
                      <p className="text-sm italic">
                        "Io sottoscritto/a [NOME E COGNOME] comunico la mia volontà di recedere dal contratto di vendita relativo ai seguenti prodotti:<br/>
                        - Numero ordine: [NUMERO ORDINE]<br/>
                        - Prodotti: [ELENCO PRODOTTI]<br/>
                        - Data di ricezione: [DATA]<br/><br/>
                        Data: [DATA]<br/>
                        Firma: [FIRMA]"
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Procedura di Reso</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.1. Condizioni per il Reso</h3>
                    <p className="mb-2">I prodotti devono essere restituiti:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Entro 14 giorni dalla comunicazione del recesso</li>
                      <li>Nelle condizioni originali (imballaggio integro, prodotti non utilizzati, etichette attaccate)</li>
                      <li>Completi di tutti gli accessori, documenti e istruzioni</li>
                      <li>Con la prova d'acquisto (fattura o conferma ordine)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.2. Costi di Reso</h3>
                    <p className="mb-2">I costi di spedizione per il reso sono a tuo carico, salvo che:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Bar Europa abbia fornito prodotti difettosi o non conformi</li>
                      <li>Bar Europa abbia commesso errori nell'ordine</li>
                    </ul>
                    <p className="mt-2">Ti consigliamo di utilizzare un servizio di spedizione tracciabile e assicurato.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.3. Indirizzo di Reso</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="mb-1"><strong>Bar Europa</strong></p>
                      <p className="mb-1">Corso Vittorio Emanuele II 161</p>
                      <p className="mb-1">76125 Trani (BT), Italia</p>
                      <p className="mt-2 text-sm text-muted-foreground">Ti invieremo l'indirizzo completo e le istruzioni dettagliate dopo la comunicazione del recesso.</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.4. Reso in Negozio</h3>
                    <p>Se risiedi nella zona di Trani, puoi restituire i prodotti direttamente presso il nostro punto vendita in Corso Vittorio Emanuele II 161, previo appuntamento.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Rimborsi</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.1. Modalità di Rimborso</h3>
                    <p className="mb-2">Il rimborso verrà effettuato:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Con lo stesso metodo di pagamento utilizzato per l'acquisto</li>
                      <li>Entro 14 giorni dalla data in cui abbiamo ricevuto i prodotti restituiti o dalla comunicazione del recesso (se hai ricevuto i prodotti prima della comunicazione)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.2. Importo del Rimborso</h3>
                    <p className="mb-2">Ti rimborseremo:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>L'intero importo pagato per i prodotti restituiti</li>
                      <li>I costi di spedizione standard (non i costi di spedizione espressa se scelti da te)</li>
                    </ul>
                    <p className="mt-2">Non ti rimborseremo i costi di spedizione del reso, salvo i casi indicati al punto 2.2.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.3. Riduzione del Rimborso</h3>
                    <p className="mb-2">Possiamo trattenere il rimborso fino a quando non avremo ricevuto i prodotti o fino a quando non ci avrai fornito la prova dell'avvenuto reso.</p>
                    <p className="mb-2">Possiamo ridurre il rimborso se:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>I prodotti presentano segni di deterioramento dovuti a una manipolazione diversa da quella necessaria per stabilire la natura, le caratteristiche e il funzionamento dei prodotti</li>
                      <li>I prodotti non sono stati restituiti nelle condizioni originali</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.4. Tempi di Elaborazione</h3>
                    <p>Una volta ricevuti i prodotti e verificata la loro conformità, elaboreremo il rimborso entro 5-7 giorni lavorativi. I tempi di accredito sul tuo conto/carta dipendono dalla tua banca o dal provider di pagamento.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Prodotti Difettosi o Non Conformi</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.1. Garanzia Legale</h3>
                    <p className="mb-2">Ai sensi del D.Lgs. 206/2005 (Codice del Consumo), hai diritto alla garanzia di conformità per 2 anni dalla consegna. Se il prodotto è difettoso o non conforme:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Hai diritto alla riparazione o sostituzione gratuita</li>
                      <li>In alternativa, puoi richiedere la riduzione del prezzo o la risoluzione del contratto</li>
                      <li>I costi di spedizione per il reso sono a carico di Bar Europa</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.2. Comunicazione</h3>
                    <p>In caso di prodotti difettosi o non conformi, contattaci immediatamente a <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a> o al <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a>, indicando il numero d'ordine e descrivendo il problema.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Prodotti Deperibili</h2>
                <p className="mb-3">Per i prodotti deperibili (es. prodotti freschi, prodotti con scadenza breve), il diritto di recesso non si applica per motivi di sicurezza alimentare. Tuttavia, se ricevi prodotti:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Danneggiati durante la spedizione</li>
                  <li>Non conformi alla descrizione</li>
                  <li>Scaduti o prossimi alla scadenza</li>
                </ul>
                <p className="mt-3">Contattaci immediatamente e provvederemo al rimborso completo o alla sostituzione senza costi aggiuntivi.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Assistenza Clienti</h2>
                <p className="mb-3">Per qualsiasi domanda o assistenza sui resi e rimborsi, siamo a tua disposizione:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-1"><strong>Email:</strong> <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></p>
                  <p className="mb-1"><strong>Telefono:</strong> <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mb-1"><strong>WhatsApp:</strong> <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+39 345 804 1890</a></p>
                  <p className="mb-1"><strong>Orari:</strong> Lun-Dom 06:00-00:00</p>
                  <p className="mb-1"><strong>Indirizzo:</strong> Corso Vittorio Emanuele II 161, 76125 Trani (BT), Italia</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Risoluzione Alternative delle Controversie</h2>
                <p className="mb-3">Ai sensi dell'art. 14 del Regolamento (UE) n. 524/2013, ti informiamo che hai diritto di ricorrere a una procedura di risoluzione alternativa delle controversie (ADR) tramite la piattaforma ODR:</p>
                <p className="mb-3"><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">https://ec.europa.eu/consumers/odr</a></p>
                <p>Inoltre, puoi contattare il servizio clienti per trovare una soluzione amichevole a qualsiasi problema.</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
