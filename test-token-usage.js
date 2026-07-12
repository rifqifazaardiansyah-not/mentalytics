// Test script untuk check token usage dan error handling
// Run dengan: node test-token-usage.js

import 'dotenv/config'

const API_KEY = process.env.VITE_GEMINI_API_KEY
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

// Estimate tokens (rough approximation)
function estimateTokens(text) {
  // For Indonesian: ~4 characters = 1 token
  return Math.ceil(text.length / 4)
}

// Test 1: Simple request
async function testSimpleRequest() {
  console.log('\n🧪 TEST 1: Simple Request')
  console.log('═══════════════════════════════════════')
  
  const requestBody = {
    contents: [{
      role: 'user',
      parts: [{ text: 'Halo!' }]
    }],
    generationConfig: {
      maxOutputTokens: 100
    }
  }
  
  const bodyStr = JSON.stringify(requestBody)
  console.log('📊 Request size:', bodyStr.length, 'bytes')
  console.log('📊 Estimated tokens:', estimateTokens(bodyStr))
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY
        },
        body: bodyStr
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error:', response.status, errorText)
      return
    }
    
    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('✅ Response received')
    console.log('📊 Response tokens:', estimateTokens(responseText))
    console.log('📝 Response:', responseText.substring(0, 100) + '...')
    
    // Check usage metadata
    if (data.usageMetadata) {
      console.log('📊 Usage Metadata:', data.usageMetadata)
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Test 2: Large context
async function testLargeContext() {
  console.log('\n🧪 TEST 2: Large Context (Simulate Long Chat)')
  console.log('═══════════════════════════════════════')
  
  // Simulate chat history
  const history = []
  for (let i = 0; i < 10; i++) {
    history.push({
      role: 'user',
      parts: [{ text: 'Ini adalah pesan panjang untuk test token usage. '.repeat(10) }]
    })
    history.push({
      role: 'model',
      parts: [{ text: 'Ini adalah response panjang dari AI untuk test. '.repeat(15) }]
    })
  }
  
  // Add current message
  history.push({
    role: 'user',
    parts: [{ text: 'Apa itu diagram pencar?' }]
  })
  
  const systemPrompt = `Kamu adalah Milo, asisten AI...`.repeat(50) // Simulate long system prompt
  
  const requestBody = {
    contents: history,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      maxOutputTokens: 2048
    }
  }
  
  const bodyStr = JSON.stringify(requestBody)
  console.log('📊 Request size:', bodyStr.length, 'bytes')
  console.log('📊 Estimated input tokens:', estimateTokens(bodyStr))
  console.log('📊 History messages:', history.length)
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY
        },
        body: bodyStr
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error:', response.status)
      
      try {
        const errorObj = JSON.parse(errorText)
        console.error('🔴 Error Details:', {
          code: errorObj.error?.code,
          message: errorObj.error?.message,
          status: errorObj.error?.status
        })
      } catch (e) {
        console.error('🔴 Raw Error:', errorText)
      }
      return
    }
    
    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('✅ Response received')
    console.log('📊 Response tokens:', estimateTokens(responseText))
    
    // Check usage metadata
    if (data.usageMetadata) {
      console.log('📊 Usage Metadata:', JSON.stringify(data.usageMetadata, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Test 3: Rate limit test
async function testRateLimit() {
  console.log('\n🧪 TEST 3: Rate Limit Test (15 RPM)')
  console.log('═══════════════════════════════════════')
  console.log('⚠️ Will send 20 requests rapidly to test rate limit')
  console.log('⏱️ Free tier: 15 requests per minute')
  
  const requests = 20
  let success = 0
  let rateLimited = 0
  let errors = 0
  
  for (let i = 0; i < requests; i++) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/models/gemini-flash-latest:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `Test ${i}` }] }],
            generationConfig: { maxOutputTokens: 50 }
          })
        }
      )
      
      if (response.ok) {
        success++
        process.stdout.write(`✅ ${i+1} `)
      } else if (response.status === 429) {
        rateLimited++
        process.stdout.write(`⚠️ ${i+1} `)
      } else {
        errors++
        process.stdout.write(`❌ ${i+1} `)
      }
      
      // Small delay to avoid instant block
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      errors++
      process.stdout.write(`❌ ${i+1} `)
    }
  }
  
  console.log('\n')
  console.log('📊 Results:')
  console.log(`  ✅ Success: ${success}`)
  console.log(`  ⚠️ Rate Limited (429): ${rateLimited}`)
  console.log(`  ❌ Other Errors: ${errors}`)
  console.log(`  📈 Success Rate: ${(success/requests*100).toFixed(1)}%`)
}

// Run tests
async function runTests() {
  console.log('🚀 Gemini API Token Usage Tests')
  console.log('═══════════════════════════════════════')
  console.log('📅 Date:', new Date().toISOString())
  console.log('🔑 API Key:', API_KEY?.substring(0, 15) + '...')
  console.log('')
  
  // Test 1
  await testSimpleRequest()
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 2
  await testLargeContext()
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 3 (optional - akan hit rate limit)
  console.log('\n⚠️ Test 3 akan hit rate limit. Run? (comment out jika tidak perlu)')
  // await testRateLimit()
  
  console.log('\n✅ Tests completed')
  console.log('\n💡 Tips:')
  console.log('  - Check console for detailed logs')
  console.log('  - Monitor token usage per request')
  console.log('  - Add backup API keys untuk auto-fallback')
  console.log('  - Clear chat history setelah 5-10 pesan')
}

// Execute
runTests().catch(console.error)
