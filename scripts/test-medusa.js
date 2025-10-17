// Test script per verificare l'integrazione Medusa
// Questo file può essere eseguito per testare le funzionalità

import { medusaClient } from './lib/medusa'

async function testMedusaConnection() {
  try {
    console.log('🔍 Testando connessione a Medusa...')
    
    // Test connessione di base
    const response = await medusaClient.products.list({ limit: 1 })
    console.log('✅ Connessione a Medusa riuscita!')
    console.log(`📦 Prodotti trovati: ${response.products.length}`)
    
    // Test creazione carrello
    console.log('🛒 Testando creazione carrello...')
    const cartResponse = await medusaClient.carts.create()
    console.log('✅ Carrello creato con successo!')
    console.log(`🆔 ID Carrello: ${cartResponse.cart.id}`)
    
    return true
  } catch (error) {
    console.error('❌ Errore nella connessione a Medusa:', error.message)
    console.log('💡 Suggerimenti:')
    console.log('   1. Verifica che il backend Medusa sia in esecuzione')
    console.log('   2. Controlla l\'URL in NEXT_PUBLIC_MEDUSA_BACKEND_URL')
    console.log('   3. Verifica la configurazione CORS nel backend')
    return false
  }
}

// Funzione per testare le funzionalità del carrello
async function testCartFunctionality() {
  try {
    console.log('🧪 Testando funzionalità carrello...')
    
    // Crea un carrello
    const cart = await medusaClient.carts.create()
    const cartId = cart.cart.id
    
    console.log('✅ Carrello creato')
    
    // Prova ad aggiungere un prodotto (se disponibile)
    const products = await medusaClient.products.list({ limit: 1 })
    
    if (products.products.length > 0) {
      const product = products.products[0]
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0]
        
        await medusaClient.carts.lineItems.create(cartId, {
          variant_id: variant.id,
          quantity: 1
        })
        
        console.log('✅ Prodotto aggiunto al carrello')
        
        // Recupera il carrello aggiornato
        const updatedCart = await medusaClient.carts.retrieve(cartId)
        console.log(`📊 Carrello aggiornato: ${updatedCart.cart.items.length} prodotti`)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Errore nel test del carrello:', error.message)
    return false
  }
}

// Funzione principale di test
async function runTests() {
  console.log('🚀 Avvio test integrazione Medusa.js\n')
  
  const connectionTest = await testMedusaConnection()
  
  if (connectionTest) {
    console.log('\n')
    await testCartFunctionality()
  }
  
  console.log('\n✨ Test completati!')
}

// Esegui i test se questo file viene eseguito direttamente
if (typeof window === 'undefined') {
  runTests().catch(console.error)
}

export { testMedusaConnection, testCartFunctionality, runTests }
