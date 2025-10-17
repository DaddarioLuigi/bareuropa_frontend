# Integrazione Medusa.js con Next.js

Questo progetto è stato configurato per utilizzare Medusa.js come backend ecommerce. Ecco come configurare e utilizzare l'integrazione.

## Configurazione

### 1. Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto con:

```env
# Medusa Backend URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Per produzione, sostituisci con il tuo URL Medusa deployato
# NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-medusa-backend.vercel.app
```

### 2. Backend Medusa

Per utilizzare questa integrazione, devi avere un backend Medusa in esecuzione. Puoi:

1. **Usare Medusa Cloud** (raccomandato per produzione)
2. **Deployare il tuo backend Medusa** su Vercel, Railway, o altri provider
3. **Eseguire localmente** per sviluppo

#### Setup locale Medusa (opzionale per sviluppo)

```bash
# Installa Medusa CLI
npm install -g @medusajs/medusa-cli

# Crea un nuovo progetto Medusa
medusa new my-medusa-backend

# Vai nella cartella del backend
cd my-medusa-backend

# Installa le dipendenze
npm install

# Avvia il backend
npm run dev
```

Il backend sarà disponibile su `http://localhost:9000`

## Funzionalità Implementate

### ✅ Sistema Carrello Integrato
- Sincronizzazione automatica tra carrello locale e Medusa
- Fallback al sistema locale se Medusa non è disponibile
- Gestione quantità e rimozione prodotti

### ✅ Gestione Prodotti
- Caricamento prodotti da Medusa
- Fallback a prodotti statici se Medusa non è disponibile
- Supporto per varianti, prezzi e immagini

### ✅ Processo Checkout
- Integrazione con sistema di indirizzi Medusa
- Supporto per metodi di spedizione
- Gestione sessioni di pagamento
- Completamento ordini

## Struttura File

```
lib/
├── medusa.ts              # Configurazione client Medusa e tipi
hooks/
├── use-medusa.ts          # Hook personalizzato per operazioni Medusa
contexts/
├── cart-context.tsx       # Context carrello integrato con Medusa
app/
├── shop/page.tsx          # Pagina prodotti con integrazione Medusa
├── carrello/page.tsx      # Pagina carrello aggiornata
└── checkout/page.tsx      # Pagina checkout con Medusa
```

## Utilizzo

### Hook useMedusa

```typescript
import { useMedusa } from '@/hooks/use-medusa'

function MyComponent() {
  const {
    products,
    cart,
    loadingProducts,
    fetchProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    setShippingAddress,
    setBillingAddress,
    addShippingMethod,
    addPaymentSession,
    completeOrder
  } = useMedusa()

  // Usa le funzioni per interagire con Medusa
}
```

### Context Carrello Integrato

```typescript
import { useCart } from '@/contexts/cart-context'

function MyComponent() {
  const { 
    state, 
    addItemWithMedusa,
    removeItemWithMedusa,
    updateQuantityWithMedusa,
    clearCartWithMedusa,
    medusa 
  } = useCart()

  // Le funzioni con suffisso "WithMedusa" sincronizzano automaticamente
  // con il backend Medusa mantenendo la compatibilità con l'UI esistente
}
```

## Configurazione Produzione

### 1. Deploy Backend Medusa

Deploya il tuo backend Medusa su:
- **Vercel** (raccomandato)
- **Railway**
- **DigitalOcean**
- **AWS/GCP/Azure**

### 2. Aggiorna Variabili d'Ambiente

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-medusa-backend.vercel.app
```

### 3. Configurazione CORS

Nel tuo backend Medusa, assicurati che CORS sia configurato per permettere richieste dal tuo frontend:

```typescript
// medusa-config.js
module.exports = {
  projectConfig: {
    // ... altre configurazioni
    cors: {
      origin: [
        "http://localhost:3000", // Per sviluppo
        "https://your-frontend-domain.com" // Per produzione
      ],
    },
  },
}
```

## Personalizzazione

### Aggiungere Nuovi Provider di Pagamento

1. Installa il plugin nel backend Medusa
2. Configura il provider
3. Aggiorna la logica di checkout nel frontend

### Gestione Inventario

Medusa gestisce automaticamente l'inventario. Per prodotti con quantità limitata:

```typescript
// Nel backend Medusa
const product = await medusa.products.create({
  title: "Prodotto",
  variants: [{
    title: "Variante",
    inventory_quantity: 10 // Quantità disponibile
  }]
})
```

### Gestione Ordini

Gli ordini completati sono automaticamente salvati nel backend Medusa e possono essere gestiti tramite admin panel.

## Troubleshooting

### Errore di Connessione

Se vedi errori di connessione:

1. Verifica che il backend Medusa sia in esecuzione
2. Controlla l'URL nelle variabili d'ambiente
3. Verifica la configurazione CORS

### Prodotti Non Caricati

Se i prodotti non si caricano:

1. Verifica che ci siano prodotti nel backend Medusa
2. Controlla i log del browser per errori
3. Il sistema usa prodotti di fallback se Medusa non è disponibile

### Checkout Fallisce

Se il checkout fallisce:

1. Verifica che i metodi di spedizione siano configurati nel backend
2. Controlla che i provider di pagamento siano attivi
3. Verifica i log per errori specifici

## Supporto

Per problemi con Medusa.js:
- [Documentazione Medusa](https://docs.medusajs.com/)
- [Community Discord](https://discord.gg/medusajs)
- [GitHub Issues](https://github.com/medusajs/medusa/issues)
