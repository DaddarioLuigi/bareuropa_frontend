// Script per testare le shipping options da Medusa
// Usa le variabili d'ambiente o i valori di default

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://backend-production-d71e9.up.railway.app'
const PUBLISHABLE_API_KEY = process.env.MEDUSA_PUBLISHABLE_API_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY

console.log('\n🔍 Testing Medusa Shipping Options API\n')
console.log('Backend URL:', MEDUSA_BACKEND_URL)
console.log('API Key:', PUBLISHABLE_API_KEY ? `${PUBLISHABLE_API_KEY.substring(0, 10)}...` : '❌ MISSING')

if (!PUBLISHABLE_API_KEY) {
  console.error('\n❌ ERROR: MEDUSA_PUBLISHABLE_API_KEY is not set!')
  console.log('\nPlease add it to your .env.local file:')
  console.log('MEDUSA_PUBLISHABLE_API_KEY=pk_...')
  console.log('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY=pk_...')
  process.exit(1)
}

// Prima ottieni un cart ID
async function testShippingOptions() {
  try {
    // Step 1: Crea un carrello di test
    console.log('\n📦 Step 1: Creating test cart...')
    const cartRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        region_id: process.env.MEDUSA_REGION_ID || process.env.NEXT_PUBLIC_MEDUSA_REGION_ID,
      }),
    })

    if (!cartRes.ok) {
      const error = await cartRes.text()
      throw new Error(`Failed to create cart: ${error}`)
    }

    const cartData = await cartRes.json()
    const cart = cartData.cart || cartData
    console.log('✅ Cart created:', cart.id)

    // Step 2: Aggiungi un indirizzo di spedizione
    console.log('\n📍 Step 2: Adding shipping address...')
    const addressRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cart.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_API_KEY,
      },
      body: JSON.stringify({
        email: 'test@example.com',
        shipping_address: {
          first_name: 'Test',
          last_name: 'User',
          address_1: 'Via Roma 123',
          city: 'Milano',
          province: 'MI',
          postal_code: '20100',
          country_code: 'it',
          phone: '1234567890',
        },
      }),
    })

    if (!addressRes.ok) {
      const error = await addressRes.text()
      throw new Error(`Failed to add address: ${error}`)
    }
    console.log('✅ Address added')

    // Step 3: Testa diversi endpoint per shipping options
    console.log('\n🚚 Step 3: Testing shipping options endpoints...')
    
    const endpoints = [
      `/store/fulfillments/shipping-options?cart_id=${cart.id}`,
      `/store/shipping-options?cart_id=${cart.id}`,
      `/store/shipping-options/${cart.id}`,
    ]

    for (const endpoint of endpoints) {
      console.log(`\n📍 Testing: ${endpoint}`)
      
      const res = await fetch(`${MEDUSA_BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'x-publishable-api-key': PUBLISHABLE_API_KEY,
        },
      })

      console.log(`   Status: ${res.status} ${res.statusText}`)

      if (res.ok) {
        const data = await res.json()
        console.log('   ✅ SUCCESS!')
        console.log('   Response:', JSON.stringify(data, null, 2))
        
        const options = data.shipping_options || data
        if (Array.isArray(options) && options.length > 0) {
          console.log(`\n✅ Found ${options.length} shipping option(s):`)
          options.forEach((opt, i) => {
            console.log(`   ${i + 1}. ${opt.name || opt.title} - €${(opt.amount / 100).toFixed(2)}`)
          })
        } else {
          console.log('\n⚠️  No shipping options returned')
        }
        
        return // Exit on first success
      } else {
        const error = await res.text()
        console.log(`   ❌ Error: ${error}`)
      }
    }

    console.log('\n❌ All endpoints failed')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    process.exit(1)
  }
}

testShippingOptions()

