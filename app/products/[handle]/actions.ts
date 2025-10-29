'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function addToCart(formData: FormData) {
  console.log('Server Action called with:', {
    productId: formData.get('product_id'),
    variantId: formData.get('variant_id'),
    quantity: formData.get('quantity')
  })
  
  const productId = formData.get('product_id') as string
  const variantId = formData.get('variant_id') as string
  const quantity = Number(formData.get('quantity')) || 1
  
  if (!productId || !variantId) {
    console.error('Missing product or variant ID')
    throw new Error('Missing product or variant ID')
  }
  
  try {
    // Get or create cart
    let cartId = cookies().get('cart_id')?.value
    
    if (!cartId) {
      console.log('Creating new cart...')
      const createRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
      const cart = await createRes.json()
      cartId = cart.cart?.id || cart.id
      
      console.log('Created cart:', cartId)
      
      // Set cookie
      cookies().set('cart_id', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    } else {
      console.log('Using existing cart:', cartId)
    }
    
    // Add item to cart
    console.log('Adding item to cart:', { cartId, variantId, quantity })
    const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      },
      body: JSON.stringify({
        variant_id: variantId,
        quantity
      }),
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Failed to add item:', errorText)
      throw new Error(`Failed to add item: ${errorText}`)
    }
    
    const result = await res.json()
    console.log('Item added successfully:', result)
    
    // Redirect to cart page
    redirect('/cart')
  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}



