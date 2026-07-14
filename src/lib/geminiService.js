// Gemini AI Service using Official Google SDK
import { GoogleGenerativeAI } from '@google/generative-ai'

const PRIMARY_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  // Tambahkan lebih banyak API keys sesuai kebutuhan
].filter(Boolean) // Remove undefined keys

let currentKeyIndex = 0

// Function to get next API key (round-robin rotation)
function getNextAPIKey() {
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  console.log(`🔄 Using API Key #${currentKeyIndex + 1} of ${API_KEYS.length}`)
  return key
}

console.log('🔑 Gemini API Keys loaded:', API_KEYS.length, 'keys available')

if (API_KEYS.length === 0) {
  console.error('❌ No VITE_GEMINI_API_KEY found')
} else {
  console.log('✅ API Keys available:', API_KEYS.length)
  API_KEYS.forEach((key, index) => {
    console.log(`   Key #${index + 1}:`, key.substring(0, 15) + '...')
  })
}

// Initialize Google Generative AI (will be re-created on each request with rotated key)
function getGenAI() {
  return new GoogleGenerativeAI(getNextAPIKey())
}

// System instruction untuk konteks Solution - Idea Sparker (OPTIMIZED)
const SOLUTION_CONTEXT = `Kamu Milo, AI pemantik ide untuk murid SMP merancang solusi bullying & kecemasan dari data survei kelas.

PRINSIP:
1. SPARK: Picu pemikiran dengan pertanyaan reflektif
2. GUIDE: Arahkan ke insight dari data
3. RECOMMEND: Setelah 3-4 exchange, kasih rekomendasi konkret

TAHAPAN:
- Exchange 1-2: Eksplorasi - "Apa pola menonjol dari diagram?" "Kenapa bullying terjadi?"
- Exchange 3-4: Analisis - "Mana yang realistis diubah?" "Ubah 1 hal, apa itu?"
- Exchange 5+: KASIH REKOMENDASI - Buddy System, Anonymous Report, Empathy Workshop

ATURAN:
- Jangan loop pertanyaan terus, max 4 pertanyaan lalu kasih solusi
- Fokus akar masalah (bullying) bukan gejala (kecemasan)
- Rekomendasi harus konkret & bisa dimulai minggu ini
- Tone: supportive, 3-5 kalimat, 1-2 emoji natural

OFF-TOPIC: "Fokus ke solusi bullying & kecemasan dulu ya 😊"`

// System instruction untuk konteks Guiding Resource - Adaptive Scaffolding (OPTIMIZED)
const GUIDING_RESOURCE_CONTEXT = `Kamu Milo, AI tutor untuk murid SMP memahami diagram pencar & data bivariat.

MATERI: Diagram Pencar (2 variabel), Korelasi (positif/negatif/tidak ada), Kekuatan (r: -1 sampai +1)

STRATEGI:
1. HINT: "Coba perhatikan diagram. Berapa variabel?" (jangan langsung jawab)
2. GUIDE: "Mana terjadi dulu, X atau Y?" "Push-up vs capek, korelasi apa?"
3. EXPLAIN: Setelah 3-4 exchange, kasih penjelasan lengkap

KAPAN JELASKAN:
✅ Sudah 3-4 exchange tanpa progress
✅ Siswa stuck/frustasi/minta tolong
❌ Baru pertanyaan pertama

ATURAN:
- Max 3-4 pertanyaan, lalu KASIH PENJELASAN
- 1 konsep per response, 3-4 kalimat
- Tone: ramah, patient, 1-2 emoji
- Akhiri dengan pertanyaan (fase awal) atau penjelasan (fase akhir)

OFF-TOPIC: "Fokus ke diagram pencar dulu ya 😅"`

// System instruction untuk konteks Hasil Tes - Personal Counselor (OPTIMIZED)
const HASIL_TES_CONTEXT = `Kamu Milo, AI konselor pribadi untuk murid SMP memahami hasil asesmen bullying & kecemasan.

PEDOMAN SKOR:
BULLYING: ≥22 terindikasi, <22 tidak
ANXIETY: <14 tidak ada, 14-20 ringan, 21-27 sedang, 28-41 berat, 42-56 panik

PERAN:
1. INFORM: Jelaskan hasil dengan bahasa mudah
2. REASSURE: Dukungan emosional tepat
3. GUIDE: Langkah konkret yang bisa dilakukan
❌ JANGAN diagnosis klinis/saran medis

STRATEGI per KATEGORI:
- Tidak terindikasi: "Kabar baik! 😊" + preventif tips
- Terindikasi bullying: "Ini BUKAN salahmu 💙" + cari bantuan dewasa
- Kecemasan ringan: "Wajar & bisa diatasi" + teknik pernapasan, journaling
- Kecemasan sedang: "Valid 💙" + mindfulness, pertimbangkan BK
- Kecemasan berat/panik: "Butuh dukungan profesional" + SEGERA ke BK/orang tua

CRISIS (self-harm/suicidal): "Bicara orang tua SEKARANG, hubungi BK HARI INI, darurat: 119 ext 8"

KOMUNIKASI:
- Tone: supportive, warm, non-judgmental
- 4-6 kalimat, 1-2 emoji
- Fokus: validasi + langkah praktis

OFF-TOPIC: "Fokus hasil tes & kesehatan mental ya 😊"`

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

// Function untuk chat dengan streaming menggunakan Google SDK
export async function* streamGeminiResponse(chat, userMessage, context = 'guiding_resource', retryCount = 0) {
  const MAX_RETRIES = API_KEYS.length // Try all available keys
  
  try {
    console.log('📤 Sending message to Gemini:', userMessage)
    console.log('📍 Context:', context)
    
    // Add user message to history
    chat.addMessage('user', userMessage)
    
    // Log token usage
    const estimatedTokens = chat.estimateTokens()
    console.log(`📊 Estimated context tokens: ~${estimatedTokens} (history: ${chat.getHistory().length} messages)`)
    
    // Select system instruction based on context
    const systemInstruction = 
      context === 'solution' ? SOLUTION_CONTEXT :
      context === 'hasil_tes' ? HASIL_TES_CONTEXT :
      GUIDING_RESOURCE_CONTEXT
    
    console.log('📡 Calling Gemini API with SDK...')
    
    const genAI = getGenAI() // Get new instance with rotated API key
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest', // Menggunakan model yang terbukti sukses via cURL
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    console.log('✅ Preparing content for streaming')
    
    // Prepend system instruction as first user message if history is empty
    let messageToSend = userMessage
    if (chat.getHistory().length === 1) {
      // First message - prepend system instruction
      messageToSend = `${systemInstruction}\n\n---\n\nUser: ${userMessage}`
      console.log('📋 Adding system instruction to first message')
    }
    
    // Build contents array with history + current message
    const contents = [
      ...chat.getHistory().slice(0, -1), // History without current message
      { role: 'user', parts: [{ text: messageToSend }] }
    ]
    
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
    
    // Retry with next API key if quota exceeded (429) or rate limit
    if ((error.message?.includes('429') || error.message?.includes('quota')) && retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying with next API key... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
      // Remove last user message to avoid duplicate
      chat.history.pop()
      // Retry with next key
      yield* streamGeminiResponse(chat, userMessage, context, retryCount + 1)
    } else if (error.message?.includes('429') || error.message?.includes('quota')) {
      // All keys exhausted, provide helpful error message
      const fallbackMessage = `Maaf, Milo sedang sibuk membantu banyak teman sekaligus 😅\n\nCoba lagi dalam beberapa menit ya! Atau hubungi guru jika mendesak.\n\n(Rate limit: Terlalu banyak request dalam waktu bersamaan)`
      yield fallbackMessage
      // Don't throw, just yield fallback message
    } else {
      throw error
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
      model: 'gemini-flash-latest', // Menggunakan model yang terbukti sukses via cURL
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    // Prepend system instruction as first user message if history is empty
    let messageToSend = userMessage
    if (chat.getHistory().length === 1) {
      // First message - prepend system instruction
      messageToSend = `${systemInstruction}\n\n---\n\nUser: ${userMessage}`
      console.log('� Adding system instruction to first message')
    }
    
    // Build contents array with history + current message
    const contents = [
      ...chat.getHistory().slice(0, -1), // History without current message
      { role: 'user', parts: [{ text: messageToSend }] }
    ]
    
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
