'use client'

export interface AddToCartParams {
  productId: string
  variantId: string
  productTitle: string
  price: number
  image: string
  weight?: string
  quantity?: number
}

export async function addToCartAPI(params: AddToCartParams) {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: params.productId,
        variantId: params.variantId,
        productTitle: params.productTitle,
        price: params.price,
        image: params.image,
        weight: params.weight || '',
        quantity: params.quantity || 1
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to add item to cart')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

