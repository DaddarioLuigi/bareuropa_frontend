import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cartId = cookies().get('cart_id')?.value
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' }, 
        { status: 404 }
      )
    }

    // Get cart items first
    const cartRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      }
    })
    if (!cartRes.ok) {
      throw new Error('Failed to fetch cart')
    }
    
    const cart = await cartRes.json()
    
    // Remove all items
    for (const item of cart.cart?.items || []) {
      await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' }, 
      { status: 500 }
    )
  }
}
