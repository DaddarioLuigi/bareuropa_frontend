import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { MEDUSA_REGION_ID } from '@/lib/medusa'

export async function POST(req: Request) {
  try {
    // Try to parse as JSON first, fallback to formData
    let product_id: string
    let variant_id: string
    let quantity: number = 1
    let productTitle: string = ''
    let price: number = 0
    let image: string = ''
    let weight: string = ''

    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const body = await req.json()
      product_id = body.productId
      variant_id = body.variantId
      quantity = body.quantity || 1
      productTitle = body.productTitle || ''
      price = body.price || 0
      image = body.image || ''
      weight = body.weight || ''
    } else {
      const form = await req.formData()
      product_id = String(form.get('product_id'))
      variant_id = String(form.get('variant_id'))
      quantity = Number(form.get('quantity')) || 1
    }
    
    if (!product_id || !variant_id) {
      return NextResponse.json(
        { error: 'Missing product_id or variant_id' }, 
        { status: 400 }
      )
    }

    // Store in localStorage cart (for the UI)
    const cartData = {
      product_id,
      variant_id,
      quantity,
      productTitle,
      price,
      image,
      weight,
      addedToLocalCart: true
    }

    const cartId = cookies().get('cart_id')?.value

    // Create cart if it doesn't exist
    let cart
    if (!cartId) {
      const createRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts`, { 
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
        },
        body: JSON.stringify({
          region_id: MEDUSA_REGION_ID
        })
      })
      cart = await createRes.json()
    } else {
      cart = { id: cartId }
    }
    
    const id = cart.id || cart.cart?.id

    // Add item to cart
    const liRes = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${id}/line-items`, {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      },
      body: JSON.stringify({ 
        variant_id, 
        quantity 
      }),
    })

    if (!liRes.ok) {
      const errorText = await liRes.text()
      throw new Error(`Failed to add item: ${errorText}`)
    }

    const updated = await liRes.json()
    
    console.log('Cart response:', { id, updated: updated.cart?.id, updatedCartId: updated.cart?.id || updated.id })
    
    // Return cart ID so client can set the cookie
    const response = NextResponse.json({ 
      ...updated, 
      ...cartData,
      cartId: id,
      isNewCart: !cartId
    })
    
    console.log('Setting cart_id cookie:', id)
    
    // Always set/update the cookie to ensure it's fresh
    response.cookies.set('cart_id', id, {
      httpOnly: false, // Allow client-side access for localStorage sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' }, 
      { status: 500 }
    )
  }
}
