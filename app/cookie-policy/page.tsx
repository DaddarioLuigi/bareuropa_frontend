import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const revalidate = 3600

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-primary mb-6">Informativa sui Cookie</h1>
            <p className="text-muted-foreground mb-8 text-base">
              <strong>Ultimo aggiornamento:</strong> Gennaio 2025
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Questa pagina descrive l'uso dei cookie e tecnologie simili sul sito web di Bar Europa, nel rispetto della normativa italiana ed europea in materia di privacy.
            </p>

            <div className="space-y-8 text-base leading-7">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">1. Cosa sono i Cookie</h2>
                <p className="mb-3">
                  I cookie sono piccoli file di testo che vengono salvati sul tuo dispositivo (computer, tablet, smartphone) quando visiti un sito web. I cookie permettono al sito di ricordare le tue azioni e preferenze per un determinato periodo di tempo, così non devi reinserirle ogni volta che torni sul sito o navighi da una pagina all'altra.
                </p>
                <p>
                  I cookie possono essere di "prima parte" (impostati direttamente dal sito che stai visitando) o di "terza parte" (impostati da altri siti o servizi).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">2. Tipologie di Cookie Utilizzati</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.1. Cookie Tecnici (Necessari)</h3>
                    <p className="mb-2">Questi cookie sono essenziali per il funzionamento del sito e non possono essere disattivati. Includono:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Cookie di sessione:</strong> necessari per mantenere la sessione durante la navigazione</li>
                      <li><strong>Cookie di autenticazione:</strong> per identificare l'utente durante la sessione</li>
                      <li><strong>Cookie di sicurezza:</strong> per prevenire frodi e abusi</li>
                      <li><strong>Cookie di preferenze:</strong> per ricordare le impostazioni dell'utente (lingua, regione, ecc.)</li>
                      <li><strong>Cookie del carrello:</strong> per mantenere i prodotti nel carrello durante la navigazione</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Durata:</strong> sessione o fino a 12 mesi</p>
                    <p className="text-sm text-muted-foreground"><strong>Base giuridica:</strong> esecuzione di un contratto (non richiedono consenso)</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.2. Cookie Analitici</h3>
                    <p className="mb-2">Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito, raccogliendo informazioni in forma anonima:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Numero di visitatori e pagine visitate</li>
                      <li>Tempo di permanenza sul sito</li>
                      <li>Percorso di navigazione</li>
                      <li>Origine del traffico</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Servizi utilizzati:</strong> Google Analytics (con IP anonimizzato)</p>
                    <p className="text-sm text-muted-foreground"><strong>Durata:</strong> fino a 24 mesi</p>
                    <p className="text-sm text-muted-foreground"><strong>Base giuridica:</strong> consenso (puoi rifiutare senza conseguenze)</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.3. Cookie di Marketing/Profilazione</h3>
                    <p className="mb-2">Questi cookie vengono utilizzati per mostrarti pubblicità e contenuti personalizzati:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cookie di remarketing (per mostrarti prodotti che hai visualizzato)</li>
                      <li>Cookie di social media (per condividere contenuti)</li>
                      <li>Cookie pubblicitari di terze parti</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Durata:</strong> fino a 12 mesi</p>
                    <p className="text-sm text-muted-foreground"><strong>Base giuridica:</strong> consenso esplicito (puoi rifiutare)</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2.4. Cookie di Terze Parti</h3>
                    <p className="mb-2">Il nostro sito può utilizzare servizi di terze parti che impostano cookie propri:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Google Analytics:</strong> per analisi statistiche</li>
                      <li><strong>Stripe/PayPal:</strong> per i pagamenti</li>
                      <li><strong>Social Media:</strong> per la condivisione di contenuti (Facebook, Instagram, ecc.)</li>
                      <li><strong>Vercel Analytics:</strong> per il monitoraggio delle prestazioni</li>
                    </ul>
                    <p className="mt-2 text-sm text-muted-foreground">Ti invitiamo a consultare le informative privacy di queste terze parti per maggiori dettagli.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">3. Durata dei Cookie</h2>
                <div className="space-y-2">
                  <p><strong>Cookie di sessione:</strong> vengono eliminati automaticamente quando chiudi il browser</p>
                  <p><strong>Cookie persistenti:</strong> rimangono sul dispositivo per un periodo determinato (indicato nella tabella sopra) o fino alla loro eliminazione manuale</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">4. Gestione delle Preferenze sui Cookie</h2>
                <p className="mb-3">Puoi gestire le preferenze sui cookie in diversi modi:</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.1. Tramite il Banner di Consenso</h3>
                    <p>Al primo accesso al sito, ti verrà mostrato un banner che ti permette di:</p>
                    <ul className="list-disc pl-6 space-y-1 mt-2">
                      <li>Accettare tutti i cookie</li>
                      <li>Rifiutare i cookie non necessari</li>
                      <li>Personalizzare le tue preferenze</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.2. Tramite le Impostazioni del Browser</h3>
                    <p className="mb-2">Puoi configurare il tuo browser per bloccare o eliminare i cookie. Tuttavia, questo potrebbe limitare alcune funzionalità del sito:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
                      <li><strong>Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie</li>
                      <li><strong>Safari:</strong> Preferenze → Privacy → Cookie</li>
                      <li><strong>Edge:</strong> Impostazioni → Privacy → Cookie</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4.3. Opt-out da Servizi Specifici</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Strumento di opt-out</a></li>
                      <li><strong>Preferenze pubblicitarie:</strong> <a href="http://www.youronlinechoices.com/it/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Your Online Choices</a></li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">5. Conseguenze della Disattivazione dei Cookie</h2>
                <p className="mb-2">Se disattivi i cookie, alcune funzionalità del sito potrebbero non funzionare correttamente:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Impossibilità di aggiungere prodotti al carrello</li>
                  <li>Perdita delle preferenze di navigazione</li>
                  <li>Necessità di reinserire le credenziali ad ogni accesso</li>
                  <li>Limitazioni nell'uso di alcune funzionalità interattive</li>
                </ul>
                <p className="mt-3">I cookie tecnici sono sempre necessari per il funzionamento base del sito.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">6. Cookie Utilizzati sul Nostro Sito</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border mt-4">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Nome Cookie</th>
                        <th className="border border-border p-3 text-left">Tipo</th>
                        <th className="border border-border p-3 text-left">Durata</th>
                        <th className="border border-border p-3 text-left">Finalità</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3">cart_id</td>
                        <td className="border border-border p-3">Tecnico</td>
                        <td className="border border-border p-3">Sessione</td>
                        <td className="border border-border p-3">Gestione del carrello</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">session_id</td>
                        <td className="border border-border p-3">Tecnico</td>
                        <td className="border border-border p-3">Sessione</td>
                        <td className="border border-border p-3">Gestione della sessione</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">cookie_consent</td>
                        <td className="border border-border p-3">Tecnico</td>
                        <td className="border border-border p-3">12 mesi</td>
                        <td className="border border-border p-3">Memorizzazione delle preferenze sui cookie</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">_ga, _gid</td>
                        <td className="border border-border p-3">Analitico</td>
                        <td className="border border-border p-3">24 mesi / 24 ore</td>
                        <td className="border border-border p-3">Google Analytics (con IP anonimizzato)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">7. Aggiornamenti all'Informativa</h2>
                <p>Bar Europa si riserva il diritto di modificare questa informativa sui cookie in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">8. Contatti</h2>
                <p className="mb-3">Per domande o richieste relative all'uso dei cookie, puoi contattarci:</p>
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
