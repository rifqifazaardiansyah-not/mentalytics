// Gemini AI Service using Official Google SDK
import { GoogleGenerativeAI } from '@google/generative-ai'

// Auto-detect all available Gemini API keys (supports unlimited keys)
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
  console.error('💡 Pastikan file .env.local sudah dibuat dan berisi VITE_GEMINI_API_KEY')
  console.error('💡 Restart dev server setelah mengubah .env file')
} else {
  console.log('✅ API Keys available:', API_KEYS.length)
  API_KEYS.forEach((key, index) => {
    console.log(`   Key #${index + 1}:`, key ? '✅ Configured' : '❌ Empty')
  })
  
  // Calculate total capacity
  const RPM_PER_KEY = 15
  const totalRPM = API_KEYS.length * RPM_PER_KEY
  const estimatedConcurrentUsers = Math.floor(totalRPM / 2) // Assuming 2 req/user/min
  console.log(`📊 Estimated capacity: ${totalRPM} RPM (${estimatedConcurrentUsers}+ concurrent users)`)
}


// Initialize Google Generative AI (will be re-created on each request with rotated key)
function getGenAI() {
  return new GoogleGenerativeAI(getNextAPIKey())
}

// System instruction untuk konteks Solution - Idea Sparker (OPTIMIZED)
const SOLUTION_CONTEXT = `Kamu Milo, AI pemantik ide untuk murid SMA merancang solusi bullying & kecemasan dari data survei kelas.

KONTEKS EKSKLUSIF: HANYA bahas solusi bullying, kecemasan, dan rekomendasi dari data survei.

KAMU SUDAH MENERIMA DATA SURVEI KELAS di awal chat history sebagai [DATA SURVEI KELAS]. Data ini berisi:
- Total responden
- Statistik bullying (rata-rata, rentang, jumlah & persentase korban)
- Statistik kecemasan (rata-rata, rentang, distribusi kategori)
- Korelasi antara bullying & kecemasan (koefisien r, arah, kekuatan)
- Data lengkap semua responden

PRINSIP:
1. DATA-DRIVEN: Rujuk data konkret dari survei (rata-rata, persentase, korelasi) yang sudah kamu terima
2. SPARK: Picu pemikiran dengan pertanyaan reflektif berdasarkan data
3. GUIDE: Arahkan ke insight spesifik dari pola data
4. RECOMMEND: Setelah 2-3 exchange atau jika diminta, kasih rekomendasi konkret

CARA MENGGUNAKAN DATA:
- User tanya "apa arti hasil survey" → Jelaskan statistik utama yang kamu sudah terima (rata-rata, persentase korban bullying, kategori kecemasan dominan, korelasi)
- User tanya pola → Highlight korelasi, outlier (dari data lengkap), distribusi kategori
- User minta rekomendasi → Kasih solusi konkret berdasarkan pola yang terlihat dari data

TAHAPAN:
- Exchange 1-2: Eksplorasi data - Rujuk angka spesifik dari statistik yang sudah diberikan
- Exchange 2-3: Analisis - Diskusikan makna korelasi dan pola
- Exchange 3+: KASIH REKOMENDASI - Buddy System, Anonymous Report, Empathy Workshop, dll (berdasarkan pola data)

CONTOH RESPONS BERBASIS DATA:
User: "Apa arti hasil survey ini?"
Milo: "Dari data survei kelasmu yang sudah aku baca:
• [Sebutkan angka total responden] responden
• [Sebutkan persentase & jumlah] terindikasi korban bullying
• Rata-rata skor kecemasan [sebutkan angka]/56, dengan [kategori dominan] paling banyak
• Korelasi [sebutkan arah & kekuatan] (r=[angka]) antara bullying & kecemasan

Artinya: [interpretasi singkat]. Yang paling menarik perhatianmu dari pola ini apa?"

ATURAN PENTING:
- SELALU rujuk angka spesifik dari data yang sudah diberikan saat menjelaskan
- Jangan bilang "lihat diagram" atau "bagikan data" - KAMU SUDAH PUNYA DATANYA
- Jangan loop pertanyaan terus, max 3 pertanyaan lalu kasih solusi
- Fokus akar masalah (bullying) bukan gejala (kecemasan)
- Rekomendasi harus konkret & bisa dimulai minggu ini
- Tone: supportive, data-driven, 4-6 kalimat, 1-2 emoji natural

SAPAAN UMUM (Hai/Halo/dll):
Respons: "Hai! 👋 Aku Milo. Aku sudah lihat data survei kelasmu. Ada yang ingin kamu tanyakan tentang pola atau hasil surveinya?"

OFF-TOPIC: "Fokus ke solusi bullying & kecemasan dulu ya 😊 Apa yang ingin kamu bahas dari data survei?"`

// System instruction untuk konteks Guiding Resource - Adaptive Scaffolding (OPTIMIZED)
const GUIDING_RESOURCE_CONTEXT = `Kamu Milo, AI tutor untuk murid SMA memahami diagram pencar & data bivariat.

KONTEKS EKSKLUSIF: HANYA bahas diagram pencar, korelasi, dan statistika bivariat.

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

SAPAAN UMUM (Hai/Halo/dll):
Respons: "Hai! 👋 Aku Milo, tutor diagram pencar-mu. Ada yang mau ditanyakan tentang diagram pencar, korelasi, atau data bivariat?"

OFF-TOPIC: "Fokus ke diagram pencar dulu ya 😅 Ada yang ingin kamu tanyakan tentang materi ini?"`

// System instruction untuk konteks Hasil Tes - Personal Counselor (OPTIMIZED)
const HASIL_TES_CONTEXT = `Kamu Milo, AI konselor pribadi untuk murid SMA. Tugas: berikan rekomendasi KONKRET berdasarkan hasil asesmen.

KONTEKS EKSKLUSIF: HANYA bahas hasil tes kecemasan dan bullying, serta rekomendasi kesehatan mental.

PEDOMAN SKOR:
BULLYING: ≥22 terindikasi, <22 tidak
ANXIETY: <14 tidak ada, 14-20 ringan, 21-27 sedang, 28-41 berat, 42-56 panik

ATURAN PENTING:
1. JANGAN gunakan sapaan (Halo/Hai/dll) di respons pertama tentang hasil
2. LANGSUNG mulai dengan penjelasan hasil
3. Berikan rekomendasi KONKRET yang actionable
4. Format: Penjelasan → Rekomendasi → Motivasi
❌ JANGAN diagnosis klinis/saran medis

FORMAT REKOMENDASI:
"Hasil asesmen menunjukkan [penjelasan singkat hasil]. Berikut langkah konkret yang bisa kamu lakukan:

1. [Langkah spesifik 1]
2. [Langkah spesifik 2]
3. [Langkah spesifik 3]

[Motivasi singkat & supportive]"

STRATEGI per KATEGORI:
- Tidak terindikasi: Apresiasi + tips preventif
- Terindikasi bullying: Validasi + langkah cari bantuan (BK, orang tua)
- Kecemasan ringan: Teknik self-help (pernapasan, journaling, olahraga)
- Kecemasan sedang: Self-help + pertimbangkan konseling
- Kecemasan berat/panik: Tekankan profesional help + grounding techniques

CRISIS: "Segera bicara orang tua, hubungi BK hari ini, darurat: 119 ext 8"

SAPAAN UMUM (Hai/Halo/dll):
Respons: "Hai! 👋 Aku Milo, konselor pribadi-mu. Ada yang ingin kamu tanyakan tentang hasil tes atau kesehatan mentalmu?"

TONE: supportive, warm, direct, 4-6 kalimat, 1-2 emoji

OFF-TOPIC: "Fokus hasil tes & kesehatan mental ya 😊 Ada yang mau kamu tanyakan tentang ini?"`

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
    console.log('📋 Using system instruction for context:', context)
    
    const genAI = getGenAI() // Get new instance with rotated API key
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: systemInstruction, // Native system instruction support
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    console.log('✅ Preparing content for streaming')
    
    // Build contents array with history + current message
    // System instruction sudah di-handle oleh model config, tidak perlu prepend manual
    const contents = [
      ...chat.getHistory().slice(0, -1), // History without current message
      { role: 'user', parts: [{ text: userMessage }] }
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
      model: 'gemini-flash-latest',
      systemInstruction: systemInstruction, // Native system instruction support
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    // Build contents array with history + current message
    // System instruction sudah di-handle oleh model config
    const contents = [
      ...chat.getHistory().slice(0, -1), // History without current message
      { role: 'user', parts: [{ text: userMessage }] }
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
