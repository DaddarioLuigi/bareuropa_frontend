# Configurazione Recensioni Google

Questo documento spiega come configurare l'integrazione delle recensioni Google sul sito.

## Prerequisiti

1. **Account Google Cloud Platform** con fatturazione attiva (o account con crediti gratuiti)
2. **API Key** per Google Places API

## Passaggi per la configurazione

### 1. Ottenere il Place ID

Il Place ID è un identificatore univoco per la tua attività su Google Maps. Per trovarlo:

1. Vai su [Google Maps](https://www.google.com/maps)
2. Cerca "Bar Pasticceria Europa" o il tuo indirizzo
3. Clicca sulla tua attività
4. Nella sidebar, scorri fino a trovare il Place ID (o usa uno strumento come [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id))

Alternativamente, puoi usare l'API di Google Places per cercare il Place ID tramite indirizzo:

```bash
curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Bar%20Pasticceria%20Europa%20Corso%20Vittorio%20Emanuele%20II%20161%20Trani&inputtype=textquery&fields=place_id&key=YOUR_API_KEY"
```

### 2. Abilitare Google Places API

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona o crea un progetto
3. Vai su **API & Services** > **Library**
4. Cerca "Places API"
5. Clicca su **Enable**

### 3. Creare una API Key

1. Vai su **API & Services** > **Credentials**
2. Clicca su **Create Credentials** > **API Key**
3. (Opzionale) Limita la chiave API solo a Places API per maggiore sicurezza
4. Copia la chiave API generata

### 4. Configurare le variabili d'ambiente

Aggiungi le seguenti variabili al tuo file `.env.local`:

```bash
# Google Places API Configuration
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_PLACE_ID=your_place_id_here
```

**Per Vercel o altri servizi di hosting:**

Aggiungi le stesse variabili nelle impostazioni del progetto:
- Vai su **Settings** > **Environment Variables**
- Aggiungi `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID`

## Funzionalità

- ✅ Recupera recensioni in tempo reale da Google Places API
- ✅ Mostra rating complessivo e numero totale di recensioni
- ✅ Visualizza fino a 6 recensioni con foto profilo, nome, rating e testo
- ✅ Link diretto a Google Maps per vedere tutte le recensioni
- ✅ Cache delle recensioni (1 ora) per migliorare le performance
- ✅ Design responsive e moderno
- ✅ Gestione errori con messaggi informativi

## Limitazioni API

Google Places API ha i seguenti limiti:
- **Free tier**: $200 di crediti gratuiti al mese
- Ogni chiamata a Place Details costa circa $0.017 (17 centesimi per 1000 richieste)
- Con $200 puoi fare circa 11,700 richieste al mese

Con la cache configurata (1 ora), il numero di chiamate API sarà molto limitato.

## Troubleshooting

### Errore: "Google Places API Key non configurata"
- Verifica che le variabili d'ambiente siano configurate correttamente
- Riavvia il server di sviluppo dopo aver aggiunto le variabili

### Errore: "REQUEST_DENIED"
- Verifica che Places API sia abilitata nel tuo progetto Google Cloud
- Controlla che la chiave API non sia limitata in modo errato
- Verifica che la fatturazione sia attiva (anche con crediti gratuiti)

### Errore: "INVALID_REQUEST"
- Verifica che il Place ID sia corretto
- Assicurati che il Place ID corrisponda alla tua attività

### Nessuna recensione visualizzata
- Verifica che la tua attività abbia recensioni su Google Maps
- Controlla i log del server per eventuali errori

## Note

- Le recensioni vengono cachate per 1 ora per ridurre le chiamate API
- Il componente mostra un messaggio informativo se l'API key non è configurata
- Se non ci sono recensioni o si verifica un errore, la sezione non viene mostrata

