# Configurazione Checkout

Questa guida ti aiuterà a configurare il sistema di checkout per il tuo ecommerce con integrazione Medusa e Stripe.

## Prerequisiti

1. Backend Medusa configurato e funzionante
2. Metodi di spedizione configurati su Medusa
3. Stripe configurato come payment provider su Medusa
4. Account Stripe con chiavi API

## Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto con le seguenti variabili:

```env
# Medusa Backend
MEDUSA_BACKEND_URL=https://your-medusa-backend.com
MEDUSA_PUBLISHABLE_API_KEY=your_publishable_api_key
MEDUSA_REGION_ID=your_region_id

# Variabili pubbliche (accessibili nel browser)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-medusa-backend.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY=your_publishable_api_key
NEXT_PUBLIC_MEDUSA_REGION_ID=your_region_id

# Stripe (per il checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Dove trovare le chiavi:

1. **MEDUSA_BACKEND_URL**: L'URL del tuo backend Medusa (es. https://backend.tuosito.com)

2. **MEDUSA_PUBLISHABLE_API_KEY**: 
   - Vai al tuo dashboard Medusa Admin
   - Vai su Settings → API Key Management
   - Crea una nuova Publishable API Key o copia quella esistente

3. **MEDUSA_REGION_ID**: 
   - Vai al tuo dashboard Medusa Admin
   - Vai su Settings → Regions
   - Copia l'ID della regione che vuoi usare (es. "reg_01...")

4. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**:
   - Vai al tuo [Stripe Dashboard](https://dashboard.stripe.com)
   - Vai su Developers → API keys
   - Copia la Publishable key (pk_test_... per test, pk_live_... per production)

## Configurazione Backend Medusa

### 1. Configura Stripe nel Backend

Assicurati che il tuo backend Medusa abbia Stripe configurato correttamente.

Nel file `medusa-config.js` del tuo backend:

```javascript
module.exports = {
  plugins: [
    // ... altri plugin
    {
      resolve: `medusa-payment-stripe`,
      options: {
        api_key: process.env.STRIPE_SECRET_KEY,
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  ],
}
```

### 2. Configura i Metodi di Spedizione

1. Vai al Medusa Admin
2. Vai su Settings → Shipping
3. Crea almeno un metodo di spedizione per la tua regione
4. Configura prezzi e condizioni

### 3. Configura la Regione

1. Vai al Medusa Admin
2. Vai su Settings → Regions
3. Assicurati che la regione abbia:
   - Valuta configurata (es. EUR)
   - Stripe abilitato come payment provider
   - Almeno un metodo di spedizione

## Flusso di Checkout

Il checkout è diviso in 3 step:

### Step 1: Indirizzo di Spedizione
L'utente inserisce i suoi dati di spedizione:
- Email
- Nome e Cognome
- Telefono
- Indirizzo completo (via, città, provincia, CAP)

### Step 2: Metodo di Spedizione
L'utente seleziona il metodo di spedizione tra quelli disponibili:
- I metodi vengono caricati automaticamente da Medusa
- Vengono mostrati con nome e prezzo
- Il totale viene aggiornato automaticamente

### Step 3: Pagamento
L'utente completa il pagamento con Stripe:
- Viene mostrato Stripe Elements per inserire i dati della carta
- Il pagamento viene processato in modo sicuro tramite Stripe
- Dopo il pagamento, l'ordine viene creato su Medusa

### Step 4: Conferma
L'utente viene reindirizzato alla pagina di successo con:
- Dettagli dell'ordine
- Numero ordine
- Riepilogo prodotti
- Indirizzo di spedizione
- Email di conferma

## File Creati

### Pagine
- `/app/checkout/page.tsx` - Pagina principale del checkout (3 step)
- `/app/checkout/success/page.tsx` - Pagina di conferma ordine

### API Routes
- `/app/api/checkout/shipping-address/route.ts` - Aggiorna indirizzo di spedizione
- `/app/api/checkout/shipping-options/route.ts` - Ottiene opzioni di spedizione
- `/app/api/checkout/shipping-method/route.ts` - Seleziona metodo di spedizione
- `/app/api/checkout/payment-session/route.ts` - Inizializza sessione di pagamento Stripe
- `/app/api/checkout/complete/route.ts` - Completa l'ordine
- `/app/api/orders/[orderId]/route.ts` - Ottiene dettagli ordine

## Test del Checkout

### 1. In Sviluppo (Test Mode)

Usa le carte di test di Stripe:
- Numero carta: `4242 4242 4242 4242`
- Data scadenza: Qualsiasi data futura
- CVC: Qualsiasi 3 cifre
- CAP: Qualsiasi 5 cifre

### 2. In Produzione

1. Cambia le chiavi Stripe da test a live
2. Assicurati che il backend Medusa sia in produzione
3. Configura i webhook Stripe per la produzione
4. Testa con una transazione reale piccola

## Troubleshooting

### Errore: "Client secret non trovato"
- Verifica che Stripe sia configurato correttamente nel backend Medusa
- Controlla che la chiave `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sia corretta
- Verifica nei log del backend Medusa se ci sono errori Stripe

### Errore: "Nessun metodo di spedizione disponibile"
- Controlla che ci siano metodi di spedizione configurati per la regione
- Verifica che l'indirizzo inserito sia compatibile con i metodi disponibili
- Controlla i log del backend per vedere se ci sono errori

### Errore: "Ordine non trovato"
- Verifica che l'ordine sia stato creato correttamente nel backend
- Controlla l'ID ordine nell'URL della pagina success
- Verifica i permessi dell'API key per leggere gli ordini

## Personalizzazione

### Cambiare lo Stile
Tutti i componenti usano i componenti UI di shadcn/ui. Puoi personalizzare:
- Colori modificando `tailwind.config.js`
- Stili modificando i componenti in `components/ui/`

### Aggiungere Campi al Form
Modifica lo schema Zod in `app/checkout/page.tsx`:

```typescript
const shippingSchema = z.object({
  // ... campi esistenti
  company: z.string().optional(), // Esempio: campo opzionale azienda
})
```

### Personalizzare Email di Conferma
Le email sono gestite dal backend Medusa. Configura i template email nel tuo backend.

## Supporto

Se hai problemi con:
- **Medusa**: [Documentazione Medusa](https://docs.medusajs.com)
- **Stripe**: [Documentazione Stripe](https://stripe.com/docs)
- **Next.js**: [Documentazione Next.js](https://nextjs.org/docs)

## Checklist Pre-Lancio

- [ ] Variabili d'ambiente configurate correttamente
- [ ] Backend Medusa funzionante e accessibile
- [ ] Stripe configurato nel backend
- [ ] Almeno un metodo di spedizione creato
- [ ] Regione configurata con valuta e payment provider
- [ ] Test del checkout completato con successo
- [ ] Chiavi Stripe in modalità live per produzione
- [ ] Webhook Stripe configurati per produzione
- [ ] Email di conferma ordine testate
- [ ] Politiche di reso e spedizione aggiornate

## Note di Sicurezza

- ⚠️ Non esporre mai le chiavi segrete di Stripe nel frontend
- ⚠️ Le chiavi `NEXT_PUBLIC_*` sono visibili nel browser
- ⚠️ Usa sempre HTTPS in produzione
- ⚠️ Configura CORS correttamente nel backend Medusa
- ⚠️ Abilita i webhook Stripe per gestire eventi di pagamento

