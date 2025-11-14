export type MedusaCompletionPayload = unknown

const ORDER_ID_PREFIX_PATTERN = /^(order_|ord_|or_|medorder_|med_ord_)/i

const ORDER_REQUIRED_KEYS = ["payment_status", "fulfillment_status", "display_id"] as const

type OrderLike = {
  id?: string
  object?: string
  payment_status?: string
  fulfillment_status?: string
  display_id?: string | number
  [key: string]: unknown
}

type ErrorLike = {
  message?: string
  type?: string
  [key: string]: unknown
}

type PaymentSessionLike = {
  status?: string
  provider_id?: string
  data?: {
    status?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

type PaymentCollectionLike = {
  status?: string
  payment_sessions?: PaymentSessionLike[]
  [key: string]: unknown
}

type CartLike = {
  payment_collection?: PaymentCollectionLike
  payment_sessions?: PaymentSessionLike[]
  [key: string]: unknown
}

type CompletionWithCart = {
  cart?: CartLike
  type?: string
  error?: ErrorLike | string
  data?: unknown
  payment_collection?: PaymentCollectionLike
  [key: string]: unknown
}

function looksLikeOrderId(value: unknown): value is string {
  return typeof value === "string" && ORDER_ID_PREFIX_PATTERN.test(value)
}

function looksLikeOrderObject(value: unknown): value is OrderLike {
  if (!value || typeof value !== "object") {
    return false
  }

  const maybeOrder = value as OrderLike

  if (typeof maybeOrder.id === "string" && looksLikeOrderId(maybeOrder.id)) {
    return true
  }

  if (typeof maybeOrder.object === "string" && maybeOrder.object.toLowerCase() === "order") {
    return true
  }

  return ORDER_REQUIRED_KEYS.every((key) => key in maybeOrder)
}

/**
 * Traverses a Medusa "complete" payload and attempts to return the embedded order object.
 */
export function extractOrderFromCompletion(
  data: MedusaCompletionPayload
): OrderLike | null {
  if (!data || typeof data !== "object") {
    return null
  }

  const visited = new Set<unknown>()
  const stack: unknown[] = [data]

  while (stack.length > 0) {
    const current = stack.pop()

    if (!current || typeof current !== "object" || visited.has(current)) {
      continue
    }

    visited.add(current)

    if (Array.isArray(current)) {
      for (const item of current) {
        if (item && typeof item === "object") {
          stack.push(item)
        }
      }
      continue
    }

    const value = current as Record<string, unknown>

    if (value.order && typeof value.order === "object") {
      const { order } = value as { order: unknown }
      if (looksLikeOrderObject(order)) {
        return order
      }
      stack.push(order)
    }

    if (value.data && typeof value.data === "object") {
      const { data: nestedData } = value as { data: unknown }
      if (looksLikeOrderObject(nestedData)) {
        return nestedData
      }
      stack.push(nestedData)
    }

    if (value.type === "order" && value.data && typeof value.data === "object") {
      const orderData = value.data
      if (looksLikeOrderObject(orderData)) {
        return orderData
      }
      stack.push(orderData)
      continue
    }

    const id = (value.order_id || value.orderId) as unknown
    if (looksLikeOrderId(id)) {
      return {
        id,
        ...(typeof value.order === "object" ? value.order : {}),
      }
    }

    if (looksLikeOrderObject(value)) {
      return value as OrderLike
    }

    for (const nested of Object.values(value)) {
      if (nested && typeof nested === "object") {
        stack.push(nested)
      }
    }
  }

  return null
}

function normaliseString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }
  return null
}

function collectPaymentSessions(payload: CompletionWithCart): PaymentSessionLike[] {
  const sessions: PaymentSessionLike[] = []

  const cartSessions = payload.cart?.payment_sessions
  if (Array.isArray(cartSessions)) {
    sessions.push(...cartSessions)
  }

  const collectionSessions = payload.cart?.payment_collection?.payment_sessions
  if (Array.isArray(collectionSessions)) {
    sessions.push(...collectionSessions)
  }

  const topLevelCollectionSessions = payload.payment_collection?.payment_sessions
  if (Array.isArray(topLevelCollectionSessions)) {
    sessions.push(...topLevelCollectionSessions)
  }

  const dataAsCart = (payload.data ?? {}) as CartLike
  if (Array.isArray(dataAsCart?.payment_sessions)) {
    sessions.push(...(dataAsCart.payment_sessions as PaymentSessionLike[]))
  }

  if (Array.isArray(dataAsCart?.payment_collection?.payment_sessions)) {
    sessions.push(...(dataAsCart.payment_collection.payment_sessions as PaymentSessionLike[]))
  }

  return sessions
}

function hasStatus(collection: PaymentCollectionLike | undefined, ...targets: string[]): boolean {
  if (!collection?.status) {
    return false
  }

  const status = collection.status.toLowerCase()
  return targets.some((target) => target.toLowerCase() === status)
}

/**
 * Derives a descriptive explanation for a payment authorization failure.
 */
export function describePaymentAuthorizationFailure(
  payload: MedusaCompletionPayload
): string | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const data = payload as CompletionWithCart

  const defaultMessage =
    normaliseString((data.error as string)?.toString?.()) ||
    normaliseString((data.error as ErrorLike)?.message) ||
    normaliseString((data.error as ErrorLike)?.type) ||
    normaliseString((data as { message?: string }).message) ||
    null

  const sessions = collectPaymentSessions(data)

  const providerStatuses = new Set<string>()
  const medusaStatuses = new Set<string>()

  for (const session of sessions) {
    if (typeof session.status === "string") {
      medusaStatuses.add(session.status.toLowerCase())
    }
    const providerStatus = session.data?.status
    if (typeof providerStatus === "string") {
      providerStatuses.add(providerStatus.toLowerCase())
    }
  }

  if (providerStatuses.has("requires_payment_method")) {
    return (
      "Il pagamento con carta non è stato autorizzato perché manca un metodo di pagamento valido. " +
      "Inserisci una carta valida oppure scegli un altro metodo e riprova."
    )
  }

  if (providerStatuses.has("requires_action") || providerStatuses.has("requires_confirmation")) {
    return (
      "Il pagamento richiede un'ulteriore conferma (ad esempio 3D Secure). " +
      "Completa l'autenticazione richiesta oppure seleziona un metodo alternativo."
    )
  }

  if (medusaStatuses.has("pending") || medusaStatuses.has("requires_more")) {
    return (
      "Il pagamento risulta ancora in attesa di autorizzazione. " +
      "Completa la procedura di pagamento o riprova con un metodo differente."
    )
  }

  const paymentCollection =
    data.cart?.payment_collection || data.payment_collection || (data.data as CartLike)?.payment_collection

  if (hasStatus(paymentCollection, "not_paid", "requires_more", "pending")) {
    const statusLabel = paymentCollection?.status?.toLowerCase()
    return (
      "Il pagamento non è stato finalizzato (stato attuale: " +
      (statusLabel || "sconosciuto") +
      "). Verifica i dettagli del pagamento o riprova."
    )
  }

  return defaultMessage
}
