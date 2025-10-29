import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lineItemId = searchParams.get('lineItemId')
    
    if (!lineItemId) {
      return NextResponse.json(
        { error: 'Missing lineItemId' }, 
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
      method: 'DELETE',
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY || '',
      }
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to remove item: ${errorText}`)
    }

    const updated = await res.json()
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { error: 'Failed to remove cart item' }, 
      { status: 500 }
    )
  }
}
