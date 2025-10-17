"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useMedusa } from "@/hooks/use-medusa"
import { convertMedusaCartToLocalCart } from "@/lib/medusa"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  weight: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SYNC_MEDUSA_CART"; payload: { items: CartItem[]; total: number; itemCount: number } }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  medusa: any
  addItemWithMedusa: (payload: Omit<CartItem, "quantity">) => Promise<void>
  removeItemWithMedusa: (id: number) => Promise<void>
  updateQuantityWithMedusa: (id: number, quantity: number) => Promise<void>
  clearCartWithMedusa: () => Promise<void>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: updatedItems, total, itemCount }
      } else {
        const newItem = { ...action.payload, quantity: 1 }
        const updatedItems = [...state.items, newItem]
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

        return { items: updatedItems, total, itemCount }
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload)
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: updatedItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: updatedItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "SYNC_MEDUSA_CART":
      return action.payload

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  const medusa = useMedusa()

  // Sincronizza il carrello Medusa con lo stato locale
  useEffect(() => {
    if (medusa.cart) {
      const localCart = convertMedusaCartToLocalCart(medusa.cart)
      dispatch({ type: "SYNC_MEDUSA_CART", payload: localCart })
    }
  }, [medusa.cart])

  // Funzioni wrapper per integrare Medusa
  const addItemWithMedusa = async (payload: Omit<CartItem, "quantity">) => {
    try {
      // Prima aggiungi al carrello Medusa
      await medusa.addToCart(payload.id.toString(), payload.id.toString(), 1)
      // Poi aggiorna lo stato locale
      dispatch({ type: "ADD_ITEM", payload })
    } catch (error) {
      console.error("Errore nell'aggiunta al carrello Medusa:", error)
      // Fallback al sistema locale
      dispatch({ type: "ADD_ITEM", payload })
    }
  }

  const removeItemWithMedusa = async (id: number) => {
    try {
      // Prima rimuovi dal carrello Medusa
      if (medusa.cart) {
        const medusaItem = medusa.cart.items.find(item => parseInt(item.variant_id) === id)
        if (medusaItem) {
          await medusa.removeFromCart(medusaItem.id)
        }
      }
      // Poi aggiorna lo stato locale
      dispatch({ type: "REMOVE_ITEM", payload: id })
    } catch (error) {
      console.error("Errore nella rimozione dal carrello Medusa:", error)
      // Fallback al sistema locale
      dispatch({ type: "REMOVE_ITEM", payload: id })
    }
  }

  const updateQuantityWithMedusa = async (id: number, quantity: number) => {
    try {
      // Prima aggiorna nel carrello Medusa
      if (medusa.cart) {
        const medusaItem = medusa.cart.items.find(item => parseInt(item.variant_id) === id)
        if (medusaItem) {
          await medusa.updateCartItem(medusaItem.id, quantity)
        }
      }
      // Poi aggiorna lo stato locale
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    } catch (error) {
      console.error("Errore nell'aggiornamento del carrello Medusa:", error)
      // Fallback al sistema locale
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const clearCartWithMedusa = async () => {
    try {
      // Prima svuota il carrello Medusa
      await medusa.clearCart()
      // Poi aggiorna lo stato locale
      dispatch({ type: "CLEAR_CART" })
    } catch (error) {
      console.error("Errore nello svuotamento del carrello Medusa:", error)
      // Fallback al sistema locale
      dispatch({ type: "CLEAR_CART" })
    }
  }

  return (
    <CartContext.Provider 
      value={{ 
        state, 
        dispatch,
        medusa,
        addItemWithMedusa,
        removeItemWithMedusa,
        updateQuantityWithMedusa,
        clearCartWithMedusa
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
