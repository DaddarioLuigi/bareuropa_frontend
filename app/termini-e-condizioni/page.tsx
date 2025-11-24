import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Termini e Condizioni di Vendita</h1>
            <p className="text-muted-foreground mb-8 text-base">
              <strong>Ultimo aggiornamento:</strong> Gennaio 2025
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Le presenti condizioni generali di vendita regolano l'uso del sito web e la vendita dei prodotti offerti da Bar Europa. L'utilizzo del sito e l'acquisto di prodotti implicano l'accettazione integrale delle presenti condizioni.
            </p>

            <div className="space-y-8 text-base leading-7">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Informazioni sul Venditore</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Bar Europa</strong></p>
                  <p className="mb-1">Corso Vittorio Emanuele II 161</p>
                  <p className="mb-1">76125 Trani (BT), Italia</p>
                  <p className="mb-1">Email: <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></p>
                  <p className="mb-1">Telefono: <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mb-1">WhatsApp: <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+39 345 804 1890</a></p>
                  <p className="mt-2 text-sm text-muted-foreground">P.IVA: [da inserire se disponibile]</p>
                  <p className="text-sm text-muted-foreground">Attività dal 1966</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Oggetto</h2>
                <p className="mb-3">Bar Europa offre attraverso il sito web prodotti di pasticceria, caffetteria e gelateria artigianale. I prodotti sono descritti sul sito con le relative caratteristiche, immagini e prezzi.</p>
                <p>Bar Europa si riserva il diritto di modificare, sospendere o interrompere in qualsiasi momento la vendita di qualsiasi prodotto senza preavviso.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Accettazione delle Condizioni</h2>
                <p className="mb-3">L'accesso e l'utilizzo del sito, nonché l'acquisto di prodotti, implicano l'accettazione integrale delle presenti condizioni generali di vendita.</p>
                <p>Se non accetti queste condizioni, ti preghiamo di non utilizzare il sito né effettuare acquisti.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Ordini</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.1. Procedura di Ordine</h3>
                    <p className="mb-2">Per effettuare un ordine:</p>
                    <ol className="list-decimal pl-6 space-y-1">
                      <li>Seleziona i prodotti desiderati e aggiungili al carrello</li>
                      <li>Verifica il contenuto del carrello e le quantità</li>
                      <li>Procedi al checkout inserendo i dati richiesti</li>
                      <li>Seleziona il metodo di pagamento</li>
                      <li>Conferma l'ordine</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.2. Conferma dell'Ordine</h3>
                    <p className="mb-2">L'ordine si considera:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Ricevuto:</strong> al momento dell'invio del modulo di ordine</li>
                      <li><strong>Accettato:</strong> al momento dell'invio della conferma via email</li>
                    </ul>
                    <p className="mt-2">La conferma dell'ordine contiene il numero d'ordine, l'elenco dei prodotti, i prezzi e le informazioni di spedizione.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.3. Modifica e Cancellazione Ordini</h3>
                    <p className="mb-2">Puoi modificare o cancellare il tuo ordine:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Prima della conferma:</strong> direttamente dal carrello</li>
                      <li><strong>Dopo la conferma:</strong> contattando immediatamente il servizio clienti a <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a> o al <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Non possiamo garantire modifiche o cancellazioni se l'ordine è già in fase di preparazione o spedizione.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.4. Rifiuto degli Ordini</h3>
                    <p>Bar Europa si riserva il diritto di rifiutare o cancellare ordini in caso di:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Indisponibilità dei prodotti</li>
                      <li>Errori nei prezzi o nelle descrizioni</li>
                      <li>Problemi con il pagamento</li>
                      <li>Sospetta attività fraudolenta</li>
                      <li>Violazione delle condizioni di vendita</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Prezzi e Pagamenti</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.1. Prezzi</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>I prezzi sono indicati in Euro (€) e includono l'IVA salvo diversa indicazione</li>
                      <li>I prezzi possono essere modificati in qualsiasi momento, ma gli ordini già confermati restano validi al prezzo indicato</li>
                      <li>I prezzi non includono i costi di spedizione, che sono indicati separatamente al checkout</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.2. Metodi di Pagamento</h3>
                    <p className="mb-2">Accettiamo i seguenti metodi di pagamento:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Carta di credito/debito (Visa, Mastercard, American Express)</li>
                      <li>PayPal</li>
                      <li>Bonifico bancario (solo per ordini superiori a €100)</li>
                      <li>Altri metodi indicati al momento del checkout</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">I pagamenti sono elaborati in modo sicuro tramite provider certificati (Stripe, PayPal, ecc.). Bar Europa non conserva i dati delle carte di credito.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">5.3. Conferma del Pagamento</h3>
                    <p>L'ordine verrà elaborato solo dopo la conferma del pagamento. In caso di pagamento non autorizzato o rifiutato, l'ordine verrà automaticamente annullato.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Spedizione e Consegna</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">6.1. Tempi di Consegna</h3>
                    <p className="mb-2">I tempi di consegna indicati sono indicativi e possono variare in base a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Disponibilità del prodotto</li>
                      <li>Destinazione di spedizione</li>
                      <li>Periodo dell'anno (es. festività)</li>
                      <li>Condizioni meteorologiche (per prodotti deperibili)</li>
                    </ul>
                    <p className="mt-2">Ti invieremo un'email con il numero di tracking non appena l'ordine sarà spedito.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">6.2. Costi di Spedizione</h3>
                    <p>I costi di spedizione sono calcolati in base al peso, alle dimensioni e alla destinazione. Spedizione gratuita per ordini superiori a €50. Per maggiori dettagli, consulta la pagina <a href="/spedizioni" className="text-accent hover:underline">Spedizioni</a>.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">6.3. Ritiro in Negozio</h3>
                    <p>Per ordini nella zona di Trani, è possibile il ritiro diretto presso il nostro punto vendita in Corso Vittorio Emanuele II 161. Ti contatteremo quando l'ordine sarà pronto.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Diritto di Recesso</h2>
                <p className="mb-3">Ai sensi del D.Lgs. 21/2014, hai diritto di recedere dal contratto entro 14 giorni dalla data di ricevimento dei prodotti, senza dover indicare il motivo.</p>
                <p className="mb-3"><strong>Eccezioni:</strong> Il diritto di recesso non si applica a:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Prodotti deperibili o con scadenza breve</li>
                  <li>Prodotti personalizzati o realizzati su misura</li>
                  <li>Prodotti sigillati che sono stati aperti</li>
                </ul>
                <p className="mt-3">Per maggiori informazioni, consulta la pagina <a href="/resi-e-rimborsi" className="text-accent hover:underline">Resi e Rimborsi</a>.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Garanzie e Responsabilità</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">8.1. Garanzia sui Prodotti</h3>
                    <p>Bar Europa garantisce che i prodotti siano conformi alle descrizioni sul sito e alle norme di sicurezza alimentare vigenti. I prodotti sono preparati artigianalmente con ingredienti di qualità.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">8.2. Responsabilità</h3>
                    <p className="mb-2">Bar Europa non è responsabile per:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Ritardi o mancate consegne dovuti a cause di forza maggiore (scioperi, calamità naturali, ecc.)</li>
                      <li>Danni causati da un uso improprio dei prodotti</li>
                      <li>Allergie o intolleranze non comunicate al momento dell'ordine</li>
                      <li>Problemi tecnici del sito web non imputabili a Bar Europa</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">8.3. Limitazione di Responsabilità</h3>
                    <p>La responsabilità di Bar Europa è limitata al valore dell'ordine. In nessun caso Bar Europa sarà responsabile per danni indiretti, perdite di profitto o danni consequenziali.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">9. Proprietà Intellettuale</h2>
                <p className="mb-3">Tutti i contenuti del sito (testi, immagini, loghi, marchi, grafica) sono di proprietà di Bar Europa o dei rispettivi titolari ed sono protetti dalle leggi sul diritto d'autore e sulla proprietà intellettuale.</p>
                <p>È vietata la riproduzione, distribuzione, modifica o utilizzo non autorizzato di qualsiasi contenuto del sito senza il consenso scritto di Bar Europa.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">10. Protezione dei Dati Personali</h2>
                <p>Il trattamento dei dati personali è regolato dall'<a href="/privacy" className="text-accent hover:underline">Informativa sulla Privacy</a>, che costituisce parte integrante delle presenti condizioni.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">11. Modifiche alle Condizioni</h2>
                <p>Bar Europa si riserva il diritto di modificare le presenti condizioni generali di vendita in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina e diventeranno efficaci immediatamente. Ti invitiamo a consultare periodicamente questa pagina.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">12. Legge Applicabile e Foro Competente</h2>
                <p className="mb-3">Le presenti condizioni sono regolate dalla legge italiana.</p>
                <p className="mb-3">Per qualsiasi controversia relativa all'interpretazione, esecuzione o risoluzione delle presenti condizioni, sarà competente il Foro di Trani, salvo diverse norme inderogabili di legge.</p>
                <p className="text-sm text-muted-foreground">Ai sensi dell'art. 14 del Regolamento (UE) n. 524/2013, ti informiamo che hai diritto di ricorrere a una procedura di risoluzione alternativa delle controversie (ADR) tramite la piattaforma ODR: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">https://ec.europa.eu/consumers/odr</a></p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">13. Contatti</h2>
                <p className="mb-3">Per qualsiasi domanda o richiesta relativa alle presenti condizioni, puoi contattarci:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-1"><strong>Email:</strong> <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></p>
                  <p className="mb-1"><strong>Telefono:</strong> <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mb-1"><strong>WhatsApp:</strong> <a href="https://wa.me/393458041890" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+39 345 804 1890</a></p>
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
