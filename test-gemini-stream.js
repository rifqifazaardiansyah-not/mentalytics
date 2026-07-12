// Test streaming with new API key format
import 'dotenv/config'

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'AQ.Ab8RN6JwWmLWaPGGFxIyCG72vWd8F5dQQ53scCcndQozHM4ecg'
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

console.log('🔑 Testing Gemini Streaming...')
console.log('API Key:', API_KEY ? API_KEY.substring(0, 15) + '...' : 'NOT FOUND')

async function testStreaming() {
  try {
    console.log('\n📡 Sending streaming request...')
    
    const response = await fetch(
      `${API_BASE_URL}/models/gemini-flash-latest:streamGenerateContent?alt=sse`,
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
                { text: 'Jelaskan apa itu diagram pencar dalam 2-3 kalimat sederhana untuk murid SMP' }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('\n❌ ERROR:', response.status, response.statusText)
      console.error('Response:', errorText)
      return
    }

    console.log('✅ Stream started\n')
    console.log('Response:')
    console.log('─'.repeat(50))
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      
      // Keep last incomplete line in buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          
          if (!jsonStr || jsonStr === '[DONE]') {
            continue
          }

          try {
            const data = JSON.parse(jsonStr)
            console.log('\n[DEBUG] Chunk data:', JSON.stringify(data, null, 2))
            
            if (data.candidates && data.candidates[0]?.content?.parts) {
              const text = data.candidates[0].content.parts[0]?.text || ''
              if (text) {
                process.stdout.write(text)
                fullText += text
              }
            }
          } catch (parseError) {
            console.log('\n[DEBUG] Failed to parse:', jsonStr.substring(0, 100))
          }
        }
      }
    }

    console.log('\n' + '─'.repeat(50))
    console.log('\n✨ Streaming completed successfully!')
    console.log('Total characters:', fullText.length)
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('Full error:', error)
  }
}

testStreaming()
