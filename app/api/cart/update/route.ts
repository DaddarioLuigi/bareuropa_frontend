import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type')
    let lineItemId, quantity
    
    if (contentType?.includes('application/json')) {
      const body = await req.json()
      lineItemId = body.lineItemId
      quantity = body.quantity
    } else {
      const formData = await req.formData()
      lineItemId = formData.get('lineItemId') as string
      quantity = Number(formData.get('quantity'))
    }
    
    if (!lineItemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Missing lineItemId or quantity' }, 
        { status: 400 }
      )
    }

    const cartId = cookies().get('cart_id')?.value
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'No cart found' }, 
        { status: 404 }
      )
    }

    const res = await fetch(`${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
      method: 'POST',
      headers: { 
        'content-type': 'application/json',
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      },
      body: JSON.stringify({ quantity }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to update item: ${errorText}`)
    }

    const updated = await res.json()
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' }, 
      { status: 500 }
    )
  }
}
