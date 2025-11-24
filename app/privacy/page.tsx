import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Informativa sulla Privacy</h1>
            <p className="text-muted-foreground mb-8 text-base">
              <strong>Ultimo aggiornamento:</strong> Gennaio 2025
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che consultano il sito web e utilizzano i servizi offerti da Bar Europa, ai sensi del Regolamento (UE) 2016/679 (GDPR) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018 (Codice Privacy).
            </p>

            <div className="space-y-8 text-base leading-7">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Titolare del Trattamento</h2>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Bar Europa</strong></p>
                  <p className="mb-1">Corso Vittorio Emanuele II 161</p>
                  <p className="mb-1">76125 Trani (BT), Italia</p>
                  <p className="mb-1">Email: <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></p>
                  <p className="mb-1">Telefono: <a href="tel:+390883583483" className="text-accent hover:underline">0883 583483</a></p>
                  <p className="mt-2 text-sm text-muted-foreground">P.IVA: [da inserire se disponibile]</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Categorie di Dati Trattati</h2>
                <p className="mb-3">I dati personali che possono essere raccolti e trattati includono:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dati di identificazione:</strong> nome, cognome, indirizzo email, numero di telefono</li>
                  <li><strong>Dati di acquisto:</strong> informazioni relative agli ordini effettuati, prodotti acquistati, importi</li>
                  <li><strong>Dati di pagamento:</strong> gestiti esclusivamente tramite provider terzi certificati (Stripe, PayPal, ecc.)</li>
                  <li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, data e ora di accesso</li>
                  <li><strong>Dati di localizzazione:</strong> indirizzo di spedizione e fatturazione</li>
                  <li><strong>Cookie e tecnologie simili:</strong> come descritto nell'Informativa sui Cookie</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Finalità e Basi Giuridiche del Trattamento</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.1. Esecuzione del Contratto</h3>
                    <p className="mb-2">I dati sono trattati per:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Gestione e evasione degli ordini</li>
                      <li>Comunicazioni relative agli ordini (conferme, aggiornamenti, spedizioni)</li>
                      <li>Gestione del servizio clienti</li>
                      <li>Adempimenti contabili e fiscali</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Base giuridica:</strong> esecuzione di un contratto (art. 6, comma 1, lett. b) GDPR)</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.2. Obblighi di Legge</h3>
                    <p className="mb-2">I dati sono trattati per:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Adempimenti fiscali e contabili</li>
                      <li>Conservazione di documenti contabili</li>
                      <li>Risposta a richieste delle autorità competenti</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Base giuridica:</strong> obbligo di legge (art. 6, comma 1, lett. c) GDPR)</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.3. Consenso (Marketing)</h3>
                    <p className="mb-2">Con il tuo consenso esplicito, i dati possono essere trattati per:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Invio di newsletter e comunicazioni promozionali</li>
                      <li>Marketing diretto via email o SMS</li>
                      <li>Analisi delle preferenze per migliorare i servizi</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Base giuridica:</strong> consenso (art. 6, comma 1, lett. a) GDPR) - revocabile in qualsiasi momento</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3.4. Legittimo Interesse</h3>
                    <p className="mb-2">I dati possono essere trattati per:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Prevenzione di frodi e abusi</li>
                      <li>Miglioramento del sito web e dei servizi</li>
                      <li>Analisi statistiche anonime</li>
                      <li>Esercizio o difesa di diritti in sede giudiziaria</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Base giuridica:</strong> legittimo interesse (art. 6, comma 1, lett. f) GDPR)</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Modalità di Trattamento</h2>
                <p className="mb-3">I dati sono trattati mediante strumenti informatici e telematici, con logiche strettamente correlate alle finalità indicate e, comunque, in modo da garantire la sicurezza e la riservatezza dei dati stessi.</p>
                <p>Le misure di sicurezza adottate includono:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Crittografia dei dati sensibili</li>
                  <li>Accesso ai dati limitato al personale autorizzato</li>
                  <li>Backup regolari e sistemi di recupero</li>
                  <li>Monitoraggio continuo per prevenire accessi non autorizzati</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Conservazione dei Dati</h2>
                <p className="mb-3">I dati personali sono conservati per i seguenti periodi:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dati contrattuali:</strong> 10 anni dalla conclusione del rapporto contrattuale (obblighi contabili e fiscali)</li>
                  <li><strong>Dati di marketing:</strong> fino alla revoca del consenso o opposizione al trattamento</li>
                  <li><strong>Dati di navigazione:</strong> massimo 12 mesi, salvo obblighi di legge</li>
                  <li><strong>Cookie:</strong> come indicato nell'Informativa sui Cookie</li>
                </ul>
                <p className="mt-3">Trascorsi i termini di conservazione, i dati saranno cancellati o anonimizzati in modo sicuro.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Destinatari dei Dati</h2>
                <p className="mb-3">I dati personali possono essere comunicati a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Provider di pagamento:</strong> per l'elaborazione dei pagamenti (Stripe, PayPal, ecc.)</li>
                  <li><strong>Corrieri e servizi di spedizione:</strong> per la consegna degli ordini</li>
                  <li><strong>Fornitori di servizi IT:</strong> per l'hosting, manutenzione e sviluppo del sito</li>
                  <li><strong>Servizi di analisi:</strong> per statistiche e miglioramento del sito (Google Analytics, ecc.)</li>
                  <li><strong>Autorità competenti:</strong> su richiesta o obbligo di legge</li>
                </ul>
                <p className="mt-3">I dati non saranno mai venduti a terzi per scopi commerciali.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Trasferimento Dati all'Estero</h2>
                <p className="mb-3">Alcuni servizi utilizzati (es. provider di pagamento, servizi cloud) possono comportare il trasferimento di dati in paesi extra-UE. In tali casi, garantiamo che:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>I trasferimenti avvengano verso paesi con adeguato livello di protezione</li>
                  <li>Siano utilizzate clausole contrattuali standard approvate dalla Commissione Europea</li>
                  <li>Siano rispettati gli standard di sicurezza previsti dal GDPR</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Diritti dell'Interessato</h2>
                <p className="mb-3">Ai sensi del GDPR, hai diritto a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Accesso:</strong> ottenere conferma dell'esistenza dei tuoi dati e accedere agli stessi</li>
                  <li><strong>Rettifica:</strong> correggere dati inesatti o incompleti</li>
                  <li><strong>Cancellazione:</strong> richiedere la cancellazione dei dati ("diritto all'oblio")</li>
                  <li><strong>Limitazione:</strong> limitare il trattamento in determinate circostanze</li>
                  <li><strong>Portabilità:</strong> ricevere i dati in formato strutturato e trasferirli ad altro titolare</li>
                  <li><strong>Opposizione:</strong> opporti al trattamento per motivi legittimi o per marketing diretto</li>
                  <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento (per il marketing)</li>
                  <li><strong>Proporre reclamo:</strong> al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it)</li>
                </ul>
                <div className="bg-accent/10 p-4 rounded-lg mt-4">
                  <p className="font-semibold mb-2">Per esercitare i tuoi diritti:</p>
                  <p>Invia una richiesta scritta a <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline font-semibold">info@barpasticceriaeuropa.it</a></p>
                  <p className="text-sm mt-2">Risponderemo entro 30 giorni dalla ricezione della richiesta.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">9. Dati di Minori</h2>
                <p>I nostri servizi sono destinati a utenti maggiorenni. Non raccogliamo consapevolmente dati personali di minori di 16 anni. Se veniamo a conoscenza di aver raccolto dati di un minore senza il consenso del genitore/tutore, provvederemo immediatamente alla cancellazione.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">10. Modifiche all'Informativa</h2>
                <p>Bar Europa si riserva il diritto di modificare la presente informativa in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento. Ti invitiamo a consultare periodicamente questa pagina.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">11. Contatti</h2>
                <p className="mb-3">Per qualsiasi domanda o richiesta relativa al trattamento dei dati personali, puoi contattarci:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="mb-1"><strong>Email:</strong> <a href="mailto:info@barpasticceriaeuropa.it" className="text-accent hover:underline">info@barpasticceriaeuropa.it</a></p>
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
