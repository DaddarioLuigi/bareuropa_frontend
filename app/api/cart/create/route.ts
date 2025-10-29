import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts`, { 
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      }
    })
    
    if (!res.ok) {
      throw new Error(`Failed to create cart: ${res.status}`)
    }
    
    const json = await res.json()
    const cartId = json.cart?.id || json.id
    
    return NextResponse.json(json, { 
      headers: { 
        'set-cookie': `cart_id=${cartId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000` 
      }
    })
  } catch (error) {
    console.error('Error creating cart:', error)
    return NextResponse.json(
      { error: 'Failed to create cart' }, 
      { status: 500 }
    )
  }
}
