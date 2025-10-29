import { Client } from "@medusajs/js-sdk"

const MEDUSA_BACKEND_URL = process.env.NODE_ENV === 'development'
  ? "/api/medusa" // Proxy locale per sviluppo
  : process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://backend-production-d71e9.up.railway.app"

export const sdk = new Client({
  baseUrl: MEDUSA_BACKEND_URL,
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || process.env.MEDUSA_PUBLISHABLE_API_KEY,
  maxRetries: 3,
})
