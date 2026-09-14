// Gemini AI Service using Official Google SDK
// With Groq fallback for high demand scenarios
import { GoogleGenerativeAI } from '@google/generative-ai'

// Load Gemini API keys
const API_KEYS = (() => {
  const keys = []
  
  // Check for VITE_GEMINI_API_KEY (no number suffix)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    keys.push(import.meta.env.VITE_GEMINI_API_KEY)
  }
  
  // Check for VITE_GEMINI_API_KEY_2, _3, _4, ... up to _20
  for (let i = 2; i <= 20; i++) {
    const key = import.meta.env[`VITE_GEMINI_API_KEY_${i}`]
    if (key) {
      keys.push(key)
    }
  }
  
  return keys
})()

// Load Groq API keys (fallback)
const GROQ_API_KEYS = (() => {
  const keys = []
  
  if (import.meta.env.VITE_GROQ_API_KEY) {
    keys.push(import.meta.env.VITE_GROQ_API_KEY)
  }
  
  // Support both numeric suffix (local) and word suffix (Vercel-friendly)
  const suffixes = ['TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN']
  
  // Check numeric suffixes first (_2, _3, etc.) for local development
  for (let i = 2; i <= 20; i++) {
    const key = import.meta.env[`VITE_GROQ_API_KEY_${i}`]
    if (key) {
      keys.push(key)
    }
  }
  
  // Check word suffixes (_TWO, _THREE, etc.) for Vercel
  for (const suffix of suffixes) {
    const key = import.meta.env[`VITE_GROQ_API_KEY_${suffix}`]
    if (key) {
      keys.push(key)
    }
  }
  
  return keys
})()

let currentKeyIndex = 0
let currentGroqKeyIndex = 0

// Function to get next API key (round-robin rotation)
function getNextAPIKey() {
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  console.log(`🔄 Using Gemini API Key #${currentKeyIndex + 1} of ${API_KEYS.length}`)
  return key
}

// Function to get next Groq API key
function getNextGroqKey() {
  const key = GROQ_API_KEYS[currentGroqKeyIndex]
  currentGroqKeyIndex = (currentGroqKeyIndex + 1) % GROQ_API_KEYS.length
  console.log(`🔄 Using Groq API Key #${currentGroqKeyIndex + 1} of ${GROQ_API_KEYS.length}`)
  return key
}

// Force use Groq if Gemini is unstable (set to true to skip Gemini entirely)
const FORCE_USE_GROQ = import.meta.env.VITE_FORCE_USE_GROQ === 'true'

console.log('🔑 Gemini API Keys loaded:', API_KEYS.length, 'keys available')
console.log('🔑 Groq API Keys loaded:', GROQ_API_KEYS.length, 'keys available (fallback)')

if (FORCE_USE_GROQ) {
  console.log('⚡ FORCE_USE_GROQ enabled - Groq will be used as primary')
}

if (API_KEYS.length === 0 && GROQ_API_KEYS.length === 0) {
  console.error('❌ No AI API keys found!')
  console.error('💡 Add VITE_GEMINI_API_KEY or VITE_GROQ_API_KEY to .env.local')
} else {
  if (API_KEYS.length > 0) {
    console.log('✅ Gemini Keys available:', API_KEYS.length)
    const RPM_PER_KEY = 15
    const totalRPM = API_KEYS.length * RPM_PER_KEY
    console.log(`📊 Gemini capacity: ${totalRPM} RPM`)
  }
  
  if (GROQ_API_KEYS.length > 0) {
    console.log('✅ Groq Keys available:', GROQ_API_KEYS.length, '(fallback)')
    const RPM_PER_KEY = 30 // Groq is faster
    const totalRPM = GROQ_API_KEYS.length * RPM_PER_KEY
    console.log(`📊 Groq capacity: ${totalRPM} RPM`)
  }
}


// Initialize Google Generative AI (will be re-created on each request with rotated key)
function getGenAI() {
  if (API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured')
  }
  return new GoogleGenerativeAI(getNextAPIKey())
}

// Function to call Groq API (fallback when Gemini fails)
async function callGroqAPI(messages, systemInstruction) {
  if (GROQ_API_KEYS.length === 0) {
    throw new Error('No Groq API keys configured')
  }
  
  const apiKey = getNextGroqKey()
  
  // Build messages array for Groq (OpenAI format)
  // Use FULL system instruction for better context understanding
  const groqMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    }))
  ]
  
  console.log('🦙 Calling Groq API (fallback)...')
  console.log('   Messages count:', groqMessages.length)
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b', // FREE production model - BEST quality, 120B parameters
      messages: groqMessages,
      temperature: 0.7, // Balanced creativity & consistency
      top_p: 0.9, // Nucleus sampling for quality
      max_tokens: 2048, // Allow detailed responses
      frequency_penalty: 0.3, // Reduce repetition
      presence_penalty: 0.2, // Encourage topic exploration
      stream: true,
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Groq API error response:', errorText)
    throw new Error(`Groq API error: ${response.status} - ${errorText.substring(0, 200)}`)
  }
  
  return response
}

// System instruction untuk konteks Solution - Idea Sparker (OPTIMIZED v2)
const SOLUTION_CONTEXT = `Kamu Milo, AI fasilitator untuk murid SMA merancang solusi bullying & kecemasan berbasis data survei kelas.

SCOPE: Analisis data survei (statistik, korelasi) → insight → rekomendasi aksi konkret.

DATA CONTEXT:
Kamu SUDAH MENERIMA data survei lengkap di awal conversation sebagai [DATA SURVEI KELAS]:
- Total responden, statistik bullying (mean, range, % korban)
- Statistik kecemasan (mean, range, distribusi kategori)
- Korelasi bullying-kecemasan (koefisien r, interpretasi)
- Data per-responden (untuk spot outliers/patterns)

FACILITATION APPROACH (3-stage):
STAGE 1 (Explore): Bantu user pahami data dengan pertanyaan terbuka
- "Dari angka-angka ini, pola apa yang kamu lihat?"
- Highlight 1-2 insight menarik dari data yang sudah diterima

STAGE 2 (Analyze): Gali makna & akar masalah
- Hubungkan korelasi dengan realitas: "Korelasi 0.65 artinya..."
- Ajak identifikasi grup berisiko tinggi dari data

STAGE 3 (Solution): Kasih rekomendasi berbasis evidence (setelah 2-3 exchange atau diminta)
- 3 solusi konkret, prioritas pada bullying prevention (akar masalah)
- Actionable: Buddy System, Anonymous Reporting, Class Contract, Empathy Workshop
- Specificity: "Bisa dimulai minggu depan dengan..."

RESPONSE QUALITY:
- Selalu rujuk ANGKA SPESIFIK dari data: "25% kelasmu (8 dari 32 siswa)..."
- Jangan minta data lagi: "Coba cek diagram" ❌ | "Dari data yang aku terima..." ✅
- Token-efficient: 3-5 kalimat per response
- Progresif: Jangan loop pertanyaan >3x, move to action

CONTOH IDEAL:
User: "Apa arti hasil survey?"
✅ Good: "Dari data kelasmu (32 responden):
• 25% (8 siswa) terindikasi korban bullying
• Kecemasan rata-rata 23/56 (sedang), dengan 15 siswa kecemasan sedang-berat
• Korelasi 0.68 (kuat positif): semakin tinggi bullying, kecemasan makin parah

Ini menunjukkan bullying jadi akar masalah utama. Menurutmu, siapa yang paling rentan di kelasmu? 🤔"

SAPAAN: "Hai! 👋 Aku udah lihat data survei kelasmu. Mau bahas pola yang muncul atau langsung ke ide solusi?"

OFF-TOPIC: "Fokus ke solusi untuk kelasmu dulu ya 😊 Mau bahas bagian mana dari data survei?"`

// System instruction untuk konteks Guiding Resource - Adaptive Scaffolding (OPTIMIZED v2)
const GUIDING_RESOURCE_CONTEXT = `Kamu Milo, tutor AI untuk murid SMA belajar diagram pencar & korelasi.

SCOPE: Diagram pencar, korelasi (positif/negatif/netral), koefisien r (-1 hingga +1), interpretasi data bivariat.

PEDAGOGI SOCRATIC (Adaptive):
1. Pertanyaan pertama → HINT minimal: "Berapa variabel yang kamu lihat?" 
2. Belum paham → SCAFFOLD: "Coba bandingkan, kalau X naik, Y-nya naik/turun?"
3. Masih stuck (3-4 exchange) → EXPLAIN penuh dengan contoh konkret
4. Sudah paham → DEEPEN: "Kenapa korelasi kuat/lemah bisa terjadi?"

RESPONSE QUALITY:
- Tulis natural seperti kakak ngobrol, bukan robot
- 2-4 kalimat per response (efisien!)
- 1 konsep fokus per turn
- Gunakan analogi real-life: "Kayak push-up vs capek"
- Emoji 1-2 untuk warmth: 👍 🤔 💡

PROGRESSION LOGIC:
- Exchange 1-2: Socratic questions (pancing pemikiran)
- Exchange 3-4: Scaffolded hints (arahkan ke jawaban)
- Exchange 5+: Direct explanation (jangan biarkan frustasi)

CONTOH IDEAL:
User: "Apa itu diagram pencar?"
❌ Bad: "Coba perhatikan, berapa variabel?"
✅ Good: "Diagram pencar itu grafik yang nunjukin hubungan 2 variabel. Bayangin, sumbu X = jam belajar, sumbu Y = nilai ujian. Tiap titik = 1 siswa. Kamu bisa lihat polanya: makin banyak belajar, nilai naik? 📊"

User: "wow" / "ok" / "sip" / "wah" (ambiguous expressions)
❌ Bad: "Berapa variabel yang biasanya kamu lihat di diagram?" (Too pushy!)
✅ Good: "Hehe senang bisa bantu! Ada yang mau ditanyain tentang diagram pencar?" 😊

INPUT HANDLING:
- AMBIGUOUS (wow, ok, sip, wah, hehe, lol, mantap): ACKNOWLEDGE + WAIT for real question
- SHORT CONFIRM (ya, iya, paham, oke): CONFIRM + OFFER next topic  
- CLEAR QUESTION (apa itu X, jelaskan Y): ANSWER sesuai pedagogi
- OFF-TOPIC: Redirect gently ke materi diagram pencar

SAPAAN: "Hai! 👋 Aku Milo. Mau belajar tentang diagram pencar, korelasi, atau ada soal yang bikin bingung?"

OFF-TOPIC: "Aku cuma bisa bantu materi diagram pencar nih 😅 Ada yang mau ditanyain tentang itu?"`

// System instruction untuk konteks Hasil Tes - Personal Counselor (OPTIMIZED v2)
const HASIL_TES_CONTEXT = `Kamu Milo, konselor AI untuk murid SMA. Berikan insight & langkah konkret dari hasil asesmen mental health.

SCOPE: Hasil tes kecemasan (GAD-7 modif) & bullying. JANGAN diagnosis/terapi klinis.

INTERPRETASI SKOR:
Bullying: <22 = aman | ≥22 = terindikasi korban
Kecemasan: <14 = minimal | 14-20 = ringan | 21-27 = sedang | 28-41 = berat | 42-56 = sangat berat

RESPONSE STRUCTURE (Token-efficient):
1. ACKNOWLEDGE (1 kalimat): Validasi perasaan
2. INTERPRET (2 kalimat): Jelaskan artinya dalam bahasa sederhana
3. ACTION (3 bullets): Langkah konkret, spesifik, bisa dilakukan minggu ini
4. ENCOURAGE (1 kalimat): Motivasi closing

TONE PRINCIPLES:
- Warm tapi professional (bukan over-friendly)
- Empati tanpa dramatisir ("Kamu gak sendiri" > "OMG ini serius banget!")
- Actionable > teoritis ("Coba teknik 4-7-8" > "Pernapasan itu penting")
- Normalize struggle: "Wajar kok kalau..."

CONTOH IDEAL:
User: [Skor kecemasan 25, bullying 18]
✅ Good: "Hasil tesmu nunjukin kecemasan sedang, tapi gak terindikasi bullying—itu kabar baik! Kecemasan sedang artinya kamu sering khawatir berlebihan dan mungkin sulit fokus.

Langkah yang bisa dicoba:
• Teknik grounding 5-4-3-2-1 saat cemas muncul
• Journaling 5 menit sebelum tidur (tulis 3 hal yang bikin khawatir + 1 hal yang bersyukur)
• Olahraga ringan 20 menit/hari (jalan kaki cukup!)

Kecemasan bisa dikelola kok, kamu bisa mulai dari langkah kecil 💪"

CRISIS PROTOCOL (skor ≥42 atau mention harm):
"Kondisimu butuh perhatian serius. Tolong bicara ke orang tua/wali HARI INI dan minta bantuan guru BK. Kalau darurat: hubungi 119 ext 8 atau Sejiwa 119."

SAPAAN: "Hai! 👋 Mau bahas hasil tesmu atau ada yang bikin khawatir?"

OFF-TOPIC: "Aku di sini buat bantu bahas kesehatan mentalmu. Ada yang mau diceritain?"`

// Chat history storage dengan token management
class ChatSession {
  constructor() {
    this.history = []
    this.maxHistoryPairs = 5 // Keep last 5 pairs (10 messages) untuk hemat token
  }

  addMessage(role, content) {
    this.history.push({
      role: role === 'user' ? 'user' : 'model',
      parts: [{ text: content }]
    })
    
    // Auto-prune old messages untuk hemat token
    this.pruneHistory()
  }

  pruneHistory() {
    // Keep only last N pairs of messages (user + model)
    // Free tier Gemini: 32k tokens per request
    // System prompt: ~600 tokens (optimized)
    // Target: Keep context under 4k tokens for safety
    const maxMessages = this.maxHistoryPairs * 2
    
    if (this.history.length > maxMessages) {
      // Remove oldest messages but keep flow
      const removed = this.history.splice(0, this.history.length - maxMessages)
      console.log(`🗑️ Pruned ${removed.length} old messages to save tokens`)
    }
  }

  getHistory() {
    return this.history
  }
  
  // Estimate token count (rough approximation)
  estimateTokens() {
    const text = this.history.map(msg => 
      msg.parts.map(p => p.text).join('')
    ).join('')
    // Rough estimate: 1 token ≈ 4 characters for Indonesian
    return Math.ceil(text.length / 4)
  }

  clear() {
    this.history = []
  }
}

// Create chat session with specific context
export function createGuidingResourceChat() {
  return new ChatSession()
}

export function createSolutionChat() {
  return new ChatSession()
}

export function createHasilTesChat() {
  return new ChatSession()
}

// Helper function: sleep/delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Function untuk chat dengan streaming menggunakan Google SDK
export async function* streamGeminiResponse(chat, userMessage, context = 'guiding_resource', retryCount = 0) {
  const MAX_GEMINI_RETRIES = 2 // Only try Gemini twice before giving up
  
  // Select system instruction based on context (DECLARE EARLY!)
  const systemInstruction = 
    context === 'solution' ? SOLUTION_CONTEXT :
    context === 'hasil_tes' ? HASIL_TES_CONTEXT :
    GUIDING_RESOURCE_CONTEXT
  
  // If FORCE_USE_GROQ is enabled, skip Gemini entirely and use Groq directly
  if (FORCE_USE_GROQ && GROQ_API_KEYS.length > 0) {
    console.log('⚡ FORCE_USE_GROQ enabled - Using Groq directly, skipping Gemini')
    
    try {
      chat.addMessage('user', userMessage)
      
      const response = await callGroqAPI(chat.getHistory(), systemInstruction)
      
      // Parse SSE stream from Groq
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ''
              
              if (content) {
                fullResponse += content
                yield content
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      fullResponse = fullResponse.trim()
      chat.addMessage('model', fullResponse)
      console.log('✅ Groq response completed (primary mode)')
      return
      
    } catch (error) {
      console.error('❌ Groq (primary) failed:', error.message)
      const fallbackMessage = `Maaf, ada masalah saat menghubungi AI. Coba lagi ya! 😅\n\n(Error: ${error.message?.substring(0, 100) || 'Unknown error'})`
      yield fallbackMessage
      return
    }
  }
  
  try {
    console.log('📤 Sending message to Gemini:', userMessage)
    console.log('📍 Context:', context)
    
    // Add user message to history
    chat.addMessage('user', userMessage)
    
    // Log token usage
    const estimatedTokens = chat.estimateTokens()
    console.log(`📊 Estimated context tokens: ~${estimatedTokens} (history: ${chat.getHistory().length} messages)`)
    
    console.log('📡 Calling Gemini API with SDK...')
    console.log('📋 Using system instruction for context:', context)
    
    const genAI = getGenAI() // Get new instance with rotated API key
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      // Removed systemInstruction parameter - causes 503 errors
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    console.log('✅ Preparing content for streaming')
    
    // Build contents array with system instruction prepended as conversation
    const contents = []
    
    // Always include system instruction at start
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] })
    contents.push({ role: 'model', parts: [{ text: 'Mengerti, saya akan mengikuti instruksi tersebut.' }] })
    
    // Add all chat history
    contents.push(...chat.getHistory())
    
    // Use generateContentStream for faster streaming
    const result = await model.generateContentStream({ contents })
    
    let fullResponse = ''
    
    console.log('✅ Stream started')
    
    // Loop through chunks - streaming langsung tanpa blocking
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      console.log('📥 Chunk:', chunkText.substring(0, 50) + '...')
      yield chunkText // Yield langsung untuk UI real-time
    }
    
    console.log('✅ Stream completed')
    
    // Add assistant response to history
    chat.addMessage('model', fullResponse)
    
  } catch (error) {
    console.error('❌ Error streaming Gemini response:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    
    // Handle 503 (high demand) or 429 (rate limit) - RETRY with exponential backoff
    const is503 = error.message?.includes('503') || error.message?.includes('high demand')
    const is429 = error.message?.includes('429') || error.message?.includes('quota')
    
    if ((is503 || is429) && retryCount < MAX_GEMINI_RETRIES) {
      // Calculate delay: 1s, 2s, 3s, 4s... (linear backoff)
      const delayMs = (retryCount + 1) * 1000
      
      console.log(`🔄 ${is503 ? '503 High Demand' : '429 Rate Limit'} - Retrying in ${delayMs}ms...`)
      console.log(`   Attempt ${retryCount + 1}/${MAX_GEMINI_RETRIES}`)
      
      // Wait before retry
      await sleep(delayMs)
      
      // Remove last user message to avoid duplicate
      chat.history.pop()
      
      // Retry with next key
      yield* streamGeminiResponse(chat, userMessage, context, retryCount + 1)
      return
    }
    
    // All retries exhausted
    if (is503) {
      const fallbackMessage = `Maaf, server Gemini sedang sangat ramai 😅\n\nSudah coba ${retryCount + 1} kali dengan ${API_KEYS.length} API key berbeda.\n\nCoba lagi dalam 2-3 menit ya! 🙏`
      yield fallbackMessage
    } else if (is429) {
      const fallbackMessage = `Maaf, Milo sedang sibuk membantu banyak teman sekaligus 😅\n\nSemua ${API_KEYS.length} API key sudah mencapai limit.\n\nCoba lagi dalam 1 menit ya! 🙏`
      yield fallbackMessage
    } else {
      // Generic error
      const fallbackMessage = `Maaf, ada masalah saat menghubungi AI. Coba lagi ya! 😅\n\n(Error: ${error.message?.substring(0, 100) || 'Unknown error'})`
      yield fallbackMessage
    }
  }
}

// Function untuk chat tanpa streaming (jika diperlukan)
export async function sendGeminiMessage(chat, userMessage, context = 'guiding_resource') {
  try {
    console.log('📤 Sending message to Gemini (non-streaming):', userMessage)
    console.log('📍 Context:', context)
    
    // Add user message to history
    chat.addMessage('user', userMessage)
    
    // Select system instruction based on context
    const systemInstruction = 
      context === 'solution' ? SOLUTION_CONTEXT :
      context === 'hasil_tes' ? HASIL_TES_CONTEXT :
      GUIDING_RESOURCE_CONTEXT
    
    const genAI = getGenAI() // Get new instance with rotated API key
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      // Removed systemInstruction parameter - causes 503 errors
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    // Build contents array with system instruction prepended
    const contents = []
    
    // Always include system instruction at start
    contents.push({ role: 'user', parts: [{ text: systemInstruction }] })
    contents.push({ role: 'model', parts: [{ text: 'Mengerti, saya akan mengikuti instruksi tersebut.' }] })
    
    // Add all chat history
    contents.push(...chat.getHistory())
    
    // Generate content
    const result = await model.generateContent({ contents })
    const text = result.response.text()
    
    // Add assistant response to history
    chat.addMessage('model', text)
    
    return text
  } catch (error) {
    console.error('❌ Error sending Gemini message:', error)
    throw error
  }
}

// Context presets untuk halaman lain (future)
export const CONTEXTS = {
  guiding_resource: GUIDING_RESOURCE_CONTEXT,
  solution: SOLUTION_CONTEXT,
  hasil_tes: HASIL_TES_CONTEXT,
}

// Export utility functions
export { ChatSession }

export default {
  createGuidingResourceChat,
  createSolutionChat,
  createHasilTesChat,
  streamGeminiResponse,
  sendGeminiMessage,
  CONTEXTS,
}
