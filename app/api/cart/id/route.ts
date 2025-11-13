import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const cartId = cookies().get('cart_id')?.value || null
		return NextResponse.json(
			{ cart_id: cartId },
			{
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
				},
			},
		)
	} catch (error) {
		console.error('[API] Failed to read cart_id cookie:', error)
		return NextResponse.json({ cart_id: null }, { status: 200 })
	}
}


