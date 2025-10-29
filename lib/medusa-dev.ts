// Configurazione temporanea per bypassare CORS durante lo sviluppo
const MEDUSA_BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? '/api/medusa' // Proxy locale
  : process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://backend-production-d71e9.up.railway.app"

export const medusaClient = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  maxRetries: 3,
})
