// Test script untuk verify Gemini API key dengan format baru (X-goog-api-key)
import 'dotenv/config'

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'AQ.Ab8RN6JwWmLWaPGGFxIyCG72vWd8F5dQQ53scCcndQozHM4ecg'
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

console.log('🔑 Testing Gemini API Key (New Format)...')
console.log('API Key:', API_KEY ? API_KEY.substring(0, 15) + '...' : 'NOT FOUND')

async function testGemini() {
  try {
    console.log('\n📡 Sending test request...')
    
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-flash-latest:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: 'Say hello in Indonesian' }
              ]
            }
          ]
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('\n❌ ERROR:', response.status, response.statusText)
      console.error('Response:', errorText)
      return
    }

    const data = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text
    
    console.log('✅ SUCCESS! Response:')
    console.log(text)
    console.log('\n✨ API Key is valid and working!')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('Full error:', error)
  }
}

testGemini()

