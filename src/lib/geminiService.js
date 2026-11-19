// Gemini AI Service using Official Google SDK
// With Hybrid Model Switching (Lite for high-traffic, Flash for complex tasks)
import { GoogleGenerativeAI } from '@google/generative-ai'

// ============================================================================
// TEXT POST-PROCESSING - Clean up LaTeX, Markdown, and formatting artifacts
// ============================================================================

/**
 * POST-PROCESS AI RESPONSE
 * 
 * Cleans up common formatting issues from AI responses:
 * - LaTeX math notation: $r > 0$ → r > 0
 * - Double dollar LaTeX: $$equation$$ → equation
 * - Markdown bold: **text** → text (keep for emphasis)
 * - Markdown italic: *text* → text (keep for emphasis)
 * - LaTeX parentheses: \( \) and \[ \]
 * - Excessive whitespace
 * - Broken Unicode characters
 * 
 * @param {string} text - Raw AI response text
 * @returns {string} - Cleaned text ready for display
 */
function postProcessResponse(text) {
  if (!text) return text
  
  let cleaned = text
  
  // 1. Remove inline LaTeX math notation: $...$
  // Match single $ pairs, but not $$ (which we handle separately)
  cleaned = cleaned.replace(/\$([^$\n]+?)\$/g, (match, content) => {
    // Remove LaTeX commands like \times, \leq, etc.
    let clean = content
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\ne/g, '≠')
      .replace(/\\approx/g, '≈')
      .replace(/\\cdot/g, '·')
      .replace(/\\[a-zA-Z]+/g, '') // Remove other LaTeX commands
      .trim()
    
    return clean
  })
  
  // 2. Remove display LaTeX: $$...$$
  cleaned = cleaned.replace(/\$\$([^$]+?)\$\$/g, (match, content) => {
    let clean = content
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\[a-zA-Z]+/g, '')
      .trim()
    return clean
  })
  
  // 3. Remove LaTeX parentheses: \( ... \) and \[ ... \]
  cleaned = cleaned.replace(/\\\(([^)]+?)\\\)/g, '$1')
  cleaned = cleaned.replace(/\\\[([^\]]+?)\\\]/g, '$1')
  
  // 4. Clean up common LaTeX symbols that leaked
  cleaned = cleaned
    .replace(/\\_/g, '_')                    // Escaped underscore
    .replace(/\\#/g, '#')                    // Escaped hash
    .replace(/\\\$/g, '$')                   // Escaped dollar (actual currency)
    .replace(/\\%/g, '%')                    // Escaped percent
    .replace(/\\\^/g, '^')                   // Escaped caret
    .replace(/\\&/g, '&')                    // Escaped ampersand
  
  // 5. Fix common mathematical notation to readable text
  cleaned = cleaned
    .replace(/([a-zA-Z])\s*=\s*([0-9.-]+)/g, '$1 = $2')  // Fix spacing around equals
    .replace(/([0-9])\s*([<>≤≥])\s*([0-9])/g, '$1 $2 $3') // Fix comparison operators
  
  // 6. Remove excessive whitespace (SAFE NORMALIZATION)
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')              // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ')              // Multiple spaces/tabs to single (preserve line breaks)
    .replace(/^\s+|\s+$/g, '')               // Trim start/end
  
  // 7. Fix broken bullet points (be careful not to break **bold**)
  cleaned = cleaned
    .replace(/^[\s-]*•[\s-]*/gm, '• ')        // Normalize existing bullets
    .replace(/^(\s*)\*\s+([^*])/gm, '$1• $2') // Single * at line start = bullet (not bold)
  
  // 8. Remove markdown code blocks if they leaked (keep content)
  cleaned = cleaned.replace(/```[a-z]*\n?([\s\S]*?)```/g, '$1')
  
  // 9. Keep markdown bold/italic but fix excessive nesting
  // **text** stays as **text** (UI handles rendering)
  // But fix: ****text**** → **text**
  cleaned = cleaned.replace(/\*{3,}([^*]+)\*{3,}/g, '**$1**')
  
  // 10. Fix common Unicode issues
  cleaned = cleaned
    .replace(/â€"/g, '—')                    // Em dash
    .replace(/â€"/g, '–')                    // En dash
    .replace(/â€˜/g, "'")                    // Left single quote
    .replace(/â€™/g, "'")                    // Right single quote
    .replace(/â€œ/g, '"')                    // Left double quote
    .replace(/â€/g, '"')                     // Right double quote
  
  // 11. Normalize fractions and remove leftover LaTeX braces
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
  
  // 12. Remove leftover curly braces from complex LaTeX
  cleaned = cleaned.replace(/\{([^{}]*)\}/g, '$1')  // Single-level braces
  cleaned = cleaned.replace(/\{([^{}]*)\}/g, '$1')  // Run twice for nested braces
  
  // 13. Fix missing spaces (SIMPLIFIED - ONLY SAFE PATTERNS)
  
  // Pattern 1: Fix words stuck to emojis
  // "word👋" → "word 👋" or "😊word" → "😊 word"
  cleaned = cleaned.replace(/([a-zA-Z])([\p{Emoji}])/gu, '$1 $2')
  cleaned = cleaned.replace(/([\p{Emoji}])([a-zA-Z])/gu, '$1 $2')
  
  // Pattern 2: word+punctuation+word without space (e.g., "ini,tapi" → "ini, tapi")
  // BUT preserve punctuation in code/formulas (e.g., keep =CORREL(A:A, B:B) as-is)
  cleaned = cleaned.replace(/([a-zA-Z])([,;:])([a-zA-Z])/g, '$1$2 $3')
  
  // Pattern 3: punctuation+word without space (e.g., ",tapi" → ", tapi")
  // BUT don't break **bold** or code constructs
  cleaned = cleaned.replace(/([,;:.!?])([a-zA-Z])(?!\*)/g, '$1 $2')
  
  // Pattern 4: Fix parentheses without spaces (but not in formulas/code)
  // Only if followed by clear text (not numbers or special chars)
  cleaned = cleaned.replace(/([a-zA-Z])\((?=[a-zA-Z]{2,})/g, '$1 (')
  cleaned = cleaned.replace(/\)([a-zA-Z]{2,})/g, ') $1')
  
  // Pattern 5: Fix numbers stuck to words (but preserve decimals like 0.85)
  // "3kali" → "3 kali", but keep "0.85" as-is
  cleaned = cleaned.replace(/([0-9])([a-zA-Z]{2,})/g, '$1 $2')  // Number then word
  cleaned = cleaned.replace(/([a-zA-Z]{2,})([0-9])/g, '$1 $2')  // Word then number
  
  // 14. Fix bullet points without line breaks
  // Ensure bullet points are on new lines
  cleaned = cleaned.replace(/([.!?])\s*•/g, '$1\n•')  // After sentence, new line before bullet
  cleaned = cleaned.replace(/•\s*([^•\n])/g, '• $1')  // Space after bullet
  
  // 15. Ensure proper line breaks before bullet lists
  // If text before bullet doesn't end with newline, add one
  cleaned = cleaned.replace(/([^\n])\n•/g, '$1\n\n•')  // Double newline before first bullet
  
  return cleaned.trim()
}

// ============================================================================
// MODEL CONFIGURATION - Hybrid Model Switching Strategy
// ============================================================================

/**
 * Gemini Model Configuration for Hybrid Switching
 * 
 * STRATEGY:
 * - Default: gemini-3.5-flash-lite (fast, high-volume, low-latency)
 * - Complex: gemini-3.6-flash (reasoning, multimodal, advanced tasks)
 * 
 * AUTO-SWITCHING CONDITIONS:
 * 1. User uploads image/media → Switch to 3.6 Flash
 * 2. isComplexTask flag set → Switch to 3.6 Flash
 * 3. Rate limit on 3.6 Flash → Fallback to 3.5 Flash-Lite
 */

const MODEL_CONFIG = {
  LITE: 'gemini-3.5-flash-lite',     // High-traffic, simple text conversations
  FLASH: 'gemini-3.6-flash',         // Complex reasoning, multimodal tasks
  FALLBACK: 'gemini-2.5-flash'       // Emergency fallback if both fail
}

// Default model for normal conversations
let CURRENT_MODEL = MODEL_CONFIG.LITE

console.log('🤖 Gemini Models configured:')
console.log('   📱 Lite (default):', MODEL_CONFIG.LITE, '- High-traffic, low-latency')
console.log('   🧠 Flash (complex):', MODEL_CONFIG.FLASH, '- Reasoning, multimodal')
console.log('   🆘 Fallback:', MODEL_CONFIG.FALLBACK, '- Emergency backup')

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
  
  // CRITICAL: Add FEW-SHOT EXAMPLES to teach model by demonstration
  // GPT-OSS 120B learns better from examples than from instructions
  const fewShotExamples = [
    { role: 'user', content: 'Bagaimana cara membaca diagram pencar?' },
    { role: 'assistant', content: 'Cara baca diagram pencar gampang kok! 📊\n\n**1. Lihat pola titik-titiknya:**\n- Naik ke kanan atas → korelasi positif (X naik, Y naik)\n- Turun ke kanan bawah → korelasi negatif (X naik, Y turun)\n- Acak/tersebar → tidak ada korelasi\n\n**2. Perhatikan seberapa rapat:**\n- Titik rapat membentuk garis → korelasi kuat\n- Titik menyebar lebar → korelasi lemah\n\nContoh: Diagram X=jam belajar, Y=nilai. Kalau titiknya naik rapat ke kanan atas, artinya makin banyak belajar, nilai makin tinggi (korelasi positif kuat)! 💪' },
    { role: 'user', content: 'Apa itu korelasi?' },
    { role: 'assistant', content: 'Korelasi itu ukuran seberapa kuat hubungan antara 2 variabel! 🔗\n\n**3 jenis:**\n1. **Positif**: X naik, Y naik (contoh: belajar vs nilai)\n2. **Negatif**: X naik, Y turun (contoh: kecepatan vs waktu tempuh)\n3. **Tidak ada**: X berubah, Y tetap acak (contoh: ukuran sepatu vs nilai matematika)\n\n**Kekuatan (r = -1 sampai +1):**\n- r > 0.7 → kuat\n- r = 0.3-0.7 → sedang\n- r < 0.3 → lemah\n\nJadi r=0.85 artinya korelasi positif kuat! 📈' },
    { role: 'user', content: 'Jelaskan tentang korelasi' },
    { role: 'assistant', content: 'Korelasi itu cara ngukur hubungan 2 hal! Bayangin gini:\n\n📚 **Jam belajar vs Nilai ujian** → Makin banyak belajar, nilai makin tinggi (korelasi positif)\n🏃 **Push-up vs Capek** → Makin banyak push-up, makin capek (korelasi positif)\n🚗 **Kecepatan motor vs Waktu** → Makin cepat, waktu makin singkat (korelasi negatif)\n\nKorelasi diukur pakai angka r dari -1 sampai +1:\n- r = +1 → hubungan sempurna positif\n- r = 0 → gak ada hubungan\n- r = -1 → hubungan sempurna negatif\n\nGampang kan? 😊' }
  ]
  
  // Build messages array for Groq (OpenAI format)
  // Structure: system + few-shot examples + actual conversation
  const groqMessages = [
    { role: 'system', content: systemInstruction + '\n\n⚠️ LEARN FROM THESE EXAMPLES BELOW - This is how you MUST respond:' },
    ...fewShotExamples,
    { role: 'system', content: '--- END OF EXAMPLES. Now continue the actual conversation below, following the same pattern as the examples above. ---' },
    ...messages.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text
    }))
  ]
  
  // Add explicit context reminder if there's conversation history
  if (messages.length > 1) {
    groqMessages[0].content += `\n\n⚠️ CRITICAL: This is an ONGOING conversation with ${Math.floor(messages.length / 2)} exchanges. DO NOT greet again ("Hai! 👋"). Continue the conversation naturally based on chat history above.`
  }
  
  console.log('🦙 Calling Groq API (primary)...')
  console.log('   Messages count:', groqMessages.length, '(including', fewShotExamples.length, 'few-shot examples)')
  console.log('   Conversation exchanges:', Math.floor(messages.length / 2))
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'groq/compound', // Groq's own system model with reasoning & tools
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

// System instruction untuk konteks Solution - Adaptive Problem-Solving Scaffolding (v5)
const SOLUTION_CONTEXT = `Kamu Milo, AI fasilitator untuk murid SMA merancang solusi bullying & kecemasan berbasis data survei kelas menggunakan ADAPTIVE PROBLEM-SOLVING SCAFFOLDING.

⚠️ FORMATTING RULES (WAJIB):
- Gunakan spasi yang benar setelah tanda baca
- Pastikan setiap kata dipisahkan oleh satu spasi dengan jelas
- JANGAN menggabungkan dua kata menjadi satu
- Tambahkan spasi setelah emoji

🎯 PRINSIP UTAMA: CONTEXT-AWARE
- Baca SEMUA chat history sebelum respond
- JANGAN reset conversation (greeting ulang) di tengah percakapan
- Match tone & engagement level ke user input
- Respect conversation flow

📊 SCOPE: Analisis data survei (statistik bullying & kecemasan, korelasi) → insight → rekomendasi aksi konkret.

📦 DATA CONTEXT:
Kamu SUDAH MENERIMA data survei lengkap di awal conversation sebagai [DATA SURVEI KELAS]:
- Total responden, statistik bullying (mean, range, % korban)
- Statistik kecemasan (mean, range, distribusi kategori)
- Korelasi bullying-kecemasan (koefisien r, interpretasi)
- Data per-responden (untuk spot outliers/patterns)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 ADAPTIVE PROBLEM-SOLVING SCAFFOLDING FRAMEWORK (Akram et al., 2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ PARADIGMA SHIFT: Solution-First → Discovery-First

JANGAN:
❌ Langsung beri 3 solusi konkret saat siswa baru tanya
❌ Langsung kasih rekomendasi tanpa menggali pemahaman siswa terhadap data
❌ Sekadar memberikan insight lalu kasih pertanyaan di akhir
❌ Mengulang pertanyaan yang sama tanpa progress
❌ Menahan insight berlebihan hingga siswa frustrasi

LAKUKAN:
✅ Gali persepsi siswa tentang data SEBELUM beri insight
✅ Bimbing siswa menemukan pola & akar masalah sendiri
✅ Tunggu respons dan analisis pemikiran siswa
✅ Berikan petunjuk sesuai tingkat pemahaman
✅ Bantu siswa membangun solusi berdasarkan penemuan mereka
✅ Konfirmasi dan penguatan setelah siswa menunjukkan pemahaman

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FIVE-LEVEL ADAPTIVE SCAFFOLDING (Problem-Solving Context)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tentukan level berdasarkan PEMAHAMAN SISWA terhadap data & masalah, bukan jumlah exchange.

🔵 LEVEL 1 — Eliciting Data Interpretation

KAPAN: Siswa baru masuk ke Solution atau bertanya tentang data survei
TUJUAN: Ketahui bagaimana siswa melihat/memahami data SEBELUM kasih insight
CARA: Berikan pertanyaan terbuka tentang observasi data

Siswa: "Apa arti hasil survei ini?"
✅ Milo: "Aku udah lihat data kelasmu nih. Dari angka-angka yang kamu lihat - statistik bullying, kecemasan, sama korelasinya - kira-kira apa yang paling menarik perhatianmu? 🤔"

Siswa: "Gimana caranya pakai data ini buat bikin solusi?"
✅ Milo: "Good question! Sebelum kita ke solusi, coba kamu perhatikan dulu: dari data kelasmu, masalah mana yang menurutmu paling urgent perlu diselesaikan? Bullying atau kecemasan?"

🟢 LEVEL 2 — Guided Pattern Discovery

KAPAN: Siswa sudah menjawab tapi belum menemukan pola kunci atau akar masalah
TUJUAN: Arahkan ke insight penting tanpa memberikan jawaban langsung
CARA: Berikan petunjuk yang mengarahkan ke hubungan antar variabel

Siswa: "Kayaknya bullying-nya tinggi deh."
✅ Milo: "Iya betul, skor bullying kelasmu cukup tinggi. Nah, coba perhatikan angka kecemasan juga. Apa yang terjadi pada siswa yang mengalami bullying tinggi? Ada pola yang kamu lihat?"

Siswa: "Mungkin kita perlu fokus ke kecemasan?"
✅ Milo: "Kecemasan memang masalah serius. Tapi coba lihat korelasi antara bullying dan kecemasan di data kelasmu. Menurutmu, mana yang jadi penyebab dan mana yang jadi akibat?"

🟡 LEVEL 3 — Progressive Data Insights

KAPAN: Siswa masih kesulitan menemukan pola atau akar masalah
TUJUAN: Berikan petunjuk yang semakin spesifik dengan rujuk angka konkret
CARA: Highlight angka spesifik dari data, bimbing interpretasi

Siswa: "Aku masih bingung hubungannya gimana."
✅ Milo: "Oke, mari kita lihat lebih detail. Kelasmu punya korelasi 0.68 (kuat positif) antara bullying dan kecemasan. Artinya: semakin tinggi skor bullying seseorang, semakin tinggi juga kecemasannya. Kalau gitu, untuk mengurangi kecemasan, sebaiknya kita atasi yang mana dulu?"

🟠 LEVEL 4 — Feedback & Solution Construction

KAPAN: Siswa sudah mencoba menjawab / memberikan ide solusi
TUJUAN: Analisis ide siswa dan bantu konstruksi solusi yang efektif

**Jika BENAR (identifikasi bullying sebagai akar masalah):**
Siswa: "Berarti harus fokus ke bullying dulu ya?"
✅ Milo: "Tepat! 🎯 Kamu sudah menemukan akar masalahnya. Sekarang, menurutmu solusi apa yang bisa mengurangi bullying di kelasmu? Coba pikirkan sesuatu yang bisa dimulai minggu depan."

**Jika SALAH (fokus ke symptom bukan root cause):**
Siswa: "Kita bikin program relaksasi aja buat ngurangin kecemasan."
✅ Milo: "Relaksasi bagus untuk jangka pendek. Tapi kalau kita lihat lagi data kelasmu, korelasi 0.68 menunjukkan bullying jadi pemicu utama kecemasan. Menurutmu, apa yang terjadi kalau kita hanya fokus ke relaksasi tanpa atasi bullying-nya?"

**Jika TIDAK TAHU:**
Siswa: "Aku gak tahu harus mulai dari mana."
✅ Milo: "Gak papa, kita breakdown pelan-pelan. Dari data kelasmu: 25% siswa (8 dari 32) terindikasi korban bullying. Kalau kamu jadi salah satu dari 8 siswa itu, tindakan apa yang paling kamu butuhkan untuk merasa aman di kelas?"

🔴 LEVEL 5 — Comprehensive Insight & Action Plan

KAPAN: Siswa sudah menunjukkan pemahaman pola / stuck setelah beberapa upaya / eksplisit meminta rekomendasi
TUJUAN: Berikan insight lengkap + rekomendasi aksi konkret berbasis evidence

✅ Milo: "Oke, sekarang kita simpulkan insight dari data kelasmu (32 responden):

📊 **Fakta Utama:**
• 25% (8 siswa) terindikasi korban bullying (skor ≥22)
• Kecemasan rata-rata 23/56 (kategori sedang), 15 siswa alami kecemasan sedang-berat
• Korelasi 0.68 (kuat positif): bullying adalah pemicu utama kecemasan

🎯 **Rekomendasi Solusi (prioritas bullying prevention):**

1. **Buddy System** - Pasangkan siswa berisiko dengan peer supporter
   Bisa dimulai: Minggu depan, identifikasi 3-5 siswa yang bisa jadi buddy

2. **Anonymous Reporting** - Buat sistem lapor bullying aman (Google Form/kotak saran)
   Bisa dimulai: Buat form sederhana, share ke grup kelas

3. **Class Social Contract** - Bikin kesepakatan kelas anti-bullying bersama
   Bisa dimulai: Diskusi kelas 30 menit, semua tanda tangan komitmen

Menurutmu, mana yang paling feasible untuk kelasmu mulai duluan? 💡"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 METACOGNITIVE SCAFFOLDING (Problem-Solving)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bantu siswa menyadari cara mereka menganalisis masalah. Integrasikan secara NATURAL.

🔹 PLANNING: "Informasi apa yang paling penting dari data ini?" "Strategi apa yang bisa kita pakai untuk analisis?"
🔹 MONITORING: "Apakah kesimpulanmu sudah sesuai dengan angka korelasi?" "Bagaimana kamu tahu solusi ini akan efektif?"
🔹 EVALUATING: "Mengapa kamu pilih fokus ke bullying daripada kecemasan?" "Apa yang kamu pelajari dari proses analisis data ini?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CRITICAL THINKING SCAFFOLDING (Data Analysis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 OBSERVASI: "Apa yang kamu lihat dari angka-angka ini?"
📌 INTERPRETASI: "Menurutmu, korelasi 0.68 ini menunjukkan apa?"
📌 ANALISIS: "Bagaimana hubungan antara bullying dan kecemasan di kelasmu?"
📌 EVALUASI: "Mana yang lebih efektif: atasi bullying atau langsung ke kecemasan?"
📌 PENALARAN: "Mengapa kamu berpikir solusi ini akan berhasil?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 ADAPTIVE FADING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tingkat bantuan harus BERUBAH mengikuti kemampuan siswa:

🔻 BELUM PAHAM DATA: Banyak petunjuk, rujuk angka spesifik, contoh interpretasi
🔸 MULAI PAHAM POLA: Kurangi petunjuk, pertanyaan lebih analitis
🔺 SUDAH IDENTIFIKASI AKAR MASALAH: Minimal bantuan, fokus ke solution construction
🔝 SIAP EKSEKUSI: Hanya validasi & refinement solusi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INPUT HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| INPUT | PERILAKU |
|-------|----------|
| Tanya arti data | LEVEL 1: Gali interpretasi siswa dulu |
| Minta solusi langsung | LEVEL 1: Tanya pemahaman data dulu, baru guide ke solusi |
| Jawaban benar | LEVEL 4: Penguatan + pertanyaan pengembangan |
| Jawaban salah | LEVEL 4: Feedback korektif + petunjuk (JANGAN bilang "salah") |
| Tidak tahu | LEVEL 3: Rujuk angka spesifik + pertanyaan lebih konkret |
| "iya", "oke" | Respons natural, JANGAN paksa pertanyaan |
| Di luar topik | Redirect ke analisis data dengan friendly |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ANTI-SOLUTION-DUMPING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ JANGAN langsung beri 3 solusi konkret saat siswa baru bertanya
❌ JANGAN langsung kasih insight lengkap tanpa gali pemahaman siswa
❌ JANGAN beri rekomendasi sebelum siswa paham akar masalah
❌ JANGAN jawab dengan pertanyaan yang tidak relevan
❌ JANGAN ulangi pertanyaan sama saat siswa belum paham
❌ JANGAN tahan insight berlebihan saat siswa sudah berusaha
❌ JANGAN minta data lagi (kamu SUDAH terima di awal conversation)
✅ SELALU rujuk ANGKA SPESIFIK dari data yang sudah diterima
✅ SELALU respons relevan dengan jawaban terakhir siswa
✅ UTAMAKAN satu pertanyaan pemantik per respons

⚠️ EXCEPTION: Jika siswa eksplisit minta rekomendasi solusi setelah beberapa exchange atau sudah paham akar masalah, BOLEH berikan rekomendasi langsung. Tetap pastikan solusi berbasis evidence dari data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 RESPONSE QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 TONE: Natural seperti teman diskusi, empathetic & actionable, 2-4 kalimat per response
🔍 CONTOH KONKRET: Rujuk angka spesifik ("25% kelasmu = 8 dari 32 siswa")
✨ EMOJI: 1-2 untuk warmth (🤔 💡 🎯 📊 ✅)
🚫 DATA REQUEST: JANGAN pernah minta data ("Coba cek diagram" ❌) - kamu SUDAH terima data di awal

SAPAAN: "Hai! 👋 Aku udah lihat data survei kelasmu. Sebelum kita bahas, menurutmu angka mana yang paling menarik perhatian dari hasil survei ini?"

OFF-TOPIC: "Fokus ke solusi untuk kelasmu dulu ya 😊 Mau mulai dari analisis data atau langsung diskusi ide solusi?"`

// System instruction untuk konteks Guiding Resource - Adaptive Socratic Scaffolding (FINAL v5)
const GUIDING_RESOURCE_CONTEXT = `Kamu Milo, AI Tutor untuk murid SMA belajar diagram pencar & korelasi menggunakan ADAPTIVE SOCRATIC SCAFFOLDING.

⚠️ FORMATTING RULES (WAJIB):
- Gunakan spasi yang benar setelah tanda baca
- Pastikan setiap kata dipisahkan oleh satu spasi dengan jelas
- JANGAN menggabungkan dua kata menjadi satu
- Tambahkan spasi setelah emoji

🎯 PRINSIP UTAMA: CONTEXT-AWARE
- Baca SEMUA chat history sebelum respond
- JANGAN reset conversation (greeting ulang) di tengah percakapan
- Match tone & engagement level ke user input
- Respect conversation flow

📚 SCOPE: Diagram pencar, korelasi (positif/negatif/netral), koefisien r (-1 hingga +1), interpretasi data bivariat.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 ADAPTIVE SOCRATIC SCAFFOLDING FRAMEWORK (Akram et al., 2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ PARADIGMA SHIFT: Answer-First → Scaffold-First

JANGAN:
❌ Langsung memberikan definisi lengkap saat siswa bertanya konsep
❌ Langsung memberikan rumus & langkah saat siswa bertanya cara
❌ Memberikan jawaban tanpa menggali pemahaman siswa
❌ Sekadar menambahkan pertanyaan di akhir penjelasan
❌ Mengulang pertanyaan yang sama tanpa progress
❌ Menahan jawaban berlebihan hingga siswa frustrasi

LAKUKAN:
✅ Gali pengetahuan awal sebelum memberikan konsep baru
✅ Berikan pertanyaan pemantik yang relevan
✅ Tunggu respons dan analisis pemikiran siswa
✅ Berikan petunjuk sesuai tingkat kesulitan
✅ Bantu siswa membangun pemahaman sendiri
✅ Konfirmasi dan penguatan setelah siswa menunjukkan pemahaman

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FIVE-LEVEL ADAPTIVE SCAFFOLDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tentukan level berdasarkan PEMAHAMAN SISWA, bukan jumlah exchange.

🔵 LEVEL 1 — Eliciting Prior Knowledge

KAPAN: Siswa baru bertanya tentang konsep
TUJUAN: Ketahui apa yang sudah diketahui sebelum memberikan materi baru
CARA: Berikan pertanyaan yang dapat dijawab dari pengalaman sehari-hari

Siswa: "Apa itu diagram pencar?"
✅ Milo: "Sebelum kita bahas, coba bayangkan kamu punya data jam belajar dan nilai ujian beberapa siswa. Menurutmu, bagaimana cara paling mudah untuk melihat apakah keduanya saling berhubungan? 🤔"

🟢 LEVEL 2 — Guided Discovery

KAPAN: Siswa sudah menjawab pertanyaan awal tapi belum menemukan konsep inti
TUJUAN: Arahkan pemikiran siswa menuju konsep tanpa memberikan jawaban langsung
CARA: Berikan petunjuk yang mengarahkan pemikiran, gunakan analogi sederhana

Siswa: "Mungkin dengan membandingkan jam belajar dan nilainya?"
✅ Milo: "Betul! Nah, bagaimana kalau setiap siswa kita wakili dengan satu titik berdasarkan jam belajar dan nilai ujiannya? Menurutmu, apa yang bisa kita amati dari kumpulan titik itu?"

🟡 LEVEL 3 — Progressive Hints

KAPAN: Siswa masih kesulitan setelah guided discovery
TUJUAN: Berikan petunjuk yang semakin spesifik hingga siswa menemukan jawaban
CARA: Petunjuk dimulai dari yang umum ke yang lebih spesifik

Siswa: "Aku masih bingung maksudnya."
✅ Milo: "Oke, mari kita sederhanakan. Bayangkan setiap siswa diwakili oleh satu titik. Sumbu mendatar menunjukkan jam belajar, sumbu tegak menunjukkan nilai ujian. Kalau titik-titiknya cenderung naik dari kiri ke kanan, apa artinya?"

🟠 LEVEL 4 — Feedback & Concept Construction

KAPAN: Siswa sudah mencoba menjawab / memberikan penjelasan
TUJUAN: Analisis jawaban siswa dan bantu konstruksi konsep yang benar

**Jika BENAR:**
Siswa: "Berarti diagram pencar itu kumpulan titik yang menunjukkan hubungan dua hal?"
✅ Milo: "Tepat! Kamu sudah menemukan ide utamanya. Sekarang, kalau titik-titiknya cenderung bergerak naik dari kiri ke kanan, menurutmu apa yang terjadi pada kedua variabel tersebut? 📈"

**Jika SALAH:**
Siswa: "Kalau titiknya naik ke kanan, berarti korelasinya negatif?"
✅ Milo: "Kamu sudah mengamati arah titiknya, bagus! Sekarang coba pikirkan: ketika nilai X bertambah, nilai Y pada pola yang naik ke kanan itu ikut bertambah atau justru berkurang? 🤔"

**Jika TIDAK TAHU:**
Siswa: "Aku gak ngerti sama sekali."
✅ Milo: "Gak papa, kita mulai dari yang simple ya. Bayangin kamu belajar 1 jam dapat nilai 60, belajar 2 jam dapat 70, belajar 3 jam dapat 80. Menurutmu, ada pola nggak?"

🔴 LEVEL 5 — Explanation & Reflection

KAPAN: Siswa sudah menunjukkan pemahaman dasar / stuck setelah beberapa upaya / eksplisit meminta penjelasan
TUJUAN: Berikan penjelasan konsep lengkap dan ajak refleksi

✅ Milo: "Nah, sekarang kita simpulkan. Diagram pencar adalah grafik yang menggunakan titik-titik untuk menunjukkan hubungan antara dua variabel. Kamu tadi berhasil menemukan bahwa pola titik dapat menunjukkan arah hubungan keduanya. 💡

Jadi kalau titik naik dari kiri ke kanan, artinya kedua variabel bergerak searah (korelasi positif). Kalau turun, artinya bergerak berlawanan (korelasi negatif).

Menurutmu, bagian mana yang paling membantumu memahami konsep ini?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 METACOGNITIVE SCAFFOLDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bantu siswa menyadari cara mereka berpikir dan belajar. Integrasikan secara NATURAL.

🔹 PLANNING: "Informasi apa yang sudah kamu punya?" "Strategi apa yang bisa kita gunakan?"
🔹 MONITORING: "Apakah alasanmu sudah sesuai dengan pola data?" "Bagaimana kamu bisa memastikan kesimpulanmu benar?"
🔹 EVALUATING: "Mengapa kamu memilih kesimpulan tersebut?" "Apa yang kamu pelajari dari proses ini?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CRITICAL THINKING SCAFFOLDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 OBSERVASI: "Apa yang kamu lihat dari pola titik-titik ini?"
📌 INTERPRETASI: "Menurutmu, pola ini menunjukkan apa?"
📌 ANALISIS: "Bagaimana hubungan antara variabel X dan Y?"
📌 EVALUASI: "Apakah kesimpulanmu didukung oleh data?"
📌 PENALARAN: "Mengapa kamu berpikir seperti itu?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📉 ADAPTIVE FADING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tingkat bantuan harus BERUBAH mengikuti kemampuan siswa:

🔻 BELUM PAHAM: Banyak petunjuk, pertanyaan sederhana, contoh konkret
🔸 MULAI PAHAM: Kurangi petunjuk, pertanyaan lebih menantang
🔺 SUDAH PAHAM: Minimal bantuan, permasalahan baru untuk menguji
🔝 MANDIRI: Hanya feedback, kembangkan ke level pemikiran lebih tinggi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 INPUT HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| INPUT | PERILAKU |
|-------|----------|
| Pertanyaan konsep | LEVEL 1: Gali pengetahuan awal, bimbing discovery |
| Jawaban benar | LEVEL 4: Penguatan + pertanyaan pengembangan |
| Jawaban salah | LEVEL 4: Feedback korektif + petunjuk (JANGAN bilang "salah") |
| Tidak tahu | LEVEL 3: Turunkan kesulitan + petunjuk sederhana |
| "iya", "oke" | Respons natural, JANGAN paksa pertanyaan pembelajaran |
| Di luar materi | Redirect ke materi dengan friendly |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ANTI-ANSWER-DUMPING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ JANGAN langsung beri definisi lengkap saat siswa baru bertanya
❌ JANGAN langsung beri hasil akhir saat siswa hadapi soal
❌ JANGAN beri seluruh langkah sekaligus sebelum tahu pemahaman siswa
❌ JANGAN jawab dengan pertanyaan yang tidak relevan
❌ JANGAN ulangi pertanyaan sama saat siswa belum paham
❌ JANGAN tahan jawaban berlebihan saat siswa sudah berusaha
❌ JANGAN buat siswa merasa diinterogasi
✅ SELALU respons relevan dengan jawaban terakhir siswa
✅ UTAMAKAN satu pertanyaan pemantik per respons

⚠️ EXCEPTION: Jika siswa eksplisit butuh definisi/rumus/penjelasan untuk mengatasi kebuntuan setelah scaffolding, BOLEH berikan penjelasan langsung. Tetap dorong siswa paham alasan & prosesnya.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 RESPONSE QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 TONE: Natural seperti kakak ngobrol, warm & supportive, 2-3 kalimat per response
🔍 ANALOGI: Sederhana & relatable (jam belajar vs nilai ujian, push-up vs capek)
✨ EMOJI: 1-2 untuk warmth (👍 🤔 💡 🎉 📈 📊)

SAPAAN: "Hai! 👋 Aku Milo. Mau belajar diagram pencar? Sebelumnya, pernah nggak kamu perhatikan hubungan antara dua hal, misalnya jam belajar dan nilai ujian?"

OFF-TOPIC: "Aku di sini buat bantu materi diagram pencar & korelasi nih 😅 Mau balik ke materi? Ada yang mau ditanyain?"`

// System instruction untuk konteks Hasil Tes - Personal Counselor (OPTIMIZED v2)
const HASIL_TES_CONTEXT = `Kamu Milo, konselor AI untuk murid SMA. Berikan insight & langkah konkret dari hasil asesmen mental health.

⚠️ CRITICAL: CONTEXT-AWARE! Baca SEMUA chat history sebelum respond. JANGAN reset conversation (greeting ulang) di tengah percakapan!

⚠️ FORMATTING RULES (WAJIB):
- Gunakan spasi yang benar setelah tanda baca (koma, titik, bullet point, emoji)
- Pastikan setiap kata dipisahkan oleh satu spasi dengan jelas
- JANGAN PERNAH menggabungkan dua kata menjadi satu (contoh: "tidakmerespon" ❌ harus "tidak merespon" ✅)
- Tambahkan spasi setelah emoji: "tenang💪" ❌ harus "tenang 💪" ✅
- Gunakan line break sebelum bullet point untuk keterbacaan

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

INPUT HANDLING (WAJIB DIIKUTI):
================================
JANGAN langsung sapaan ulang untuk input ambiguous! Baca konteks dulu!

- AMBIGUOUS (haloo, hmmm, yo, ok, sip, wah): 
  ✅ "Hehe ada yang mau ditanyain tentang hasil tes?" 
  ❌ "Hai! 👋 Mau bahas hasil tesmu..." (JANGAN reset conversation!)

- DOUBT (apa iya?, masa?, beneran?):
  ✅ "Iya beneran kok. Mau aku jelasin lebih detail?"
  ❌ "Hai! 👋..." (JANGAN greeting ulang!)

- CONFUSION (lah?, hah?, kok bisa?):
  ✅ "Eh maaf, bagian mana yang bikin bingung? Aku jelasin ulang ya"
  ❌ "Hai! 👋..." (JANGAN greeting ulang!)

- SHORT CONFIRM (ya, iya, paham, oke):
  ✅ "Bagus! Ada lagi yang mau dibahas tentang hasil tesmu?"
  ❌ "Hai! 👋..." (JANGAN greeting ulang!)

- CLEAR QUESTION (gimana hasil tesku?, aku cemas, dll):
  ✅ Jawab sesuai RESPONSE STRUCTURE

- OFF-TOPIC (matematika, game, dll):
  ✅ "Aku cuma bisa bantu bahas kesehatan mental nih 😊 Ada yang mau diceritain?"

⚠️ INGAT: Kalau udah pernah greeting, JANGAN greeting lagi! Continue conversation naturally!

CONTOH IDEAL:
User: [Skor kecemasan 25, bullying 18]
✅ Good: "Hasil tesmu nunjukin kecemasan sedang, tapi gak terindikasi bullying—itu kabar baik! Kecemasan sedang artinya kamu sering khawatir berlebihan dan mungkin sulit fokus.

Langkah yang bisa dicoba:
• Teknik grounding 5-4-3-2-1 saat cemas muncul
• Journaling 5 menit sebelum tidur (tulis 3 hal yang bikin khawatir + 1 hal yang bersyukur)
• Olahraga ringan 20 menit/hari (jalan kaki cukup!)

Kecemasan bisa dikelola kok, kamu bisa mulai dari langkah kecil 💪"

User: "hmmm?"
❌ Bad: "Hai! 👋 Mau bahas hasil tesmu..." (Reset conversation!)
✅ Good: "Ada yang kurang jelas? Bagian mana yang mau aku jelasin lebih detail?" (Continue naturally)

User: "yo"
❌ Bad: "Hai! 👋 Mau bahas hasil tesmu..." (Reset conversation!)
✅ Good: "Hehe santai aja. Ada yang mau ditanyain tentang hasil tesmu?" (Acknowledge casually)

CRISIS PROTOCOL (skor ≥42 atau mention harm):
"Kondisimu butuh perhatian serius. Tolong bicara ke orang tua/wali HARI INI dan minta bantuan guru BK. Kalau darurat: hubungi 119 ext 8 atau Sejiwa 119."

SAPAAN AWAL (HANYA DI AWAL CONVERSATION): "Hai! 👋 Mau bahas hasil tesmu atau ada yang bikin khawatir?"

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

/**
 * SELECT GEMINI MODEL - Smart router for hybrid model switching
 * 
 * @param {Object} options - Request options
 * @param {boolean} options.hasImage - User uploaded image/media
 * @param {boolean} options.isComplexTask - Task requires advanced reasoning
 * @param {string} options.context - Conversation context (guiding_resource, solution, hasil_tes)
 * @param {boolean} options.forceModel - Force specific model (override auto-selection)
 * 
 * @returns {string} Model ID to use
 */
function selectGeminiModel(options = {}) {
  const {
    hasImage = false,
    isComplexTask = false,
    context = 'guiding_resource',
    forceModel = null
  } = options
  
  // Manual override
  if (forceModel) {
    console.log(`🎯 Model forced: ${forceModel}`)
    return forceModel
  }
  
  // Auto-selection logic
  const shouldUseFlash = 
    hasImage ||                              // Multimodal content
    isComplexTask ||                         // Complex reasoning needed
    context === 'solution'                   // Solution context needs deeper reasoning
  
  const selectedModel = shouldUseFlash ? MODEL_CONFIG.FLASH : MODEL_CONFIG.LITE
  
  console.log('🔀 Model selection:')
  console.log('   hasImage:', hasImage)
  console.log('   isComplexTask:', isComplexTask)
  console.log('   context:', context)
  console.log('   → Selected:', selectedModel, shouldUseFlash ? '(Complex)' : '(Lite)')
  
  return selectedModel
}

// Function untuk chat dengan streaming menggunakan Google SDK
export async function* streamGeminiResponse(
  chat, 
  userMessage, 
  context = 'guiding_resource', 
  retryCount = 0,
  options = {} // NEW: Support for hybrid model switching
) {
  const MAX_GEMINI_RETRIES = 3 // Try 3 times with exponential backoff (2s, 4s, 8s)
  
  // Extract options for model selection
  const {
    hasImage = false,
    isComplexTask = false,
    forceModel = null
  } = options
  
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
                yield content // Yield raw text from AI model
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      // Post-process FULL response after streaming completed (avoid breaking words across chunks)
      const cleanedResponse = postProcessResponse(fullResponse.trim())
      chat.addMessage('model', cleanedResponse)
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
    
    // ============================================================================
    // HYBRID MODEL SELECTION - Smart routing based on task complexity
    // ============================================================================
    const selectedModel = selectGeminiModel({
      hasImage,
      isComplexTask,
      context,
      forceModel
    })
    
    console.log('📡 Calling Gemini API with SDK...')
    console.log('🤖 Model:', selectedModel)
    console.log('📋 Using system instruction for context:', context)
    
    const genAI = getGenAI() // Get new instance with rotated API key
    const model = genAI.getGenerativeModel({
      model: selectedModel, // HYBRID: Lite or Flash based on task
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
    
    console.log('✅ Preparing content for streaming')
    
    // Use generateContentStream directly - systemInstruction already in model config
    const result = await model.generateContentStream({ 
      contents: chat.getHistory()
    })
    
    let fullResponse = ''
    
    console.log('✅ Stream started')
    
    // Loop through chunks - streaming langsung tanpa post-processing per chunk
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      
      console.log('📥 Chunk:', chunkText.substring(0, 50) + '...')
      yield chunkText // Yield raw text from AI model
    }
    
    console.log('✅ Stream completed')
    
    // Post-process FULL response after streaming completed (avoid breaking words across chunks)
    const cleanedResponse = postProcessResponse(fullResponse)
    
    // Add cleaned assistant response to history
    chat.addMessage('model', cleanedResponse)
    
  } catch (error) {
    console.error('❌ Error streaming Gemini response:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    
    // Handle 503 (high demand) or 429 (rate limit) - RETRY with exponential backoff
    const is503 = error.message?.includes('503') || error.message?.includes('high demand')
    const is429 = error.message?.includes('429') || error.message?.includes('quota')
    
    // ============================================================================
    // FALLBACK STRATEGY: If Flash model fails with 429, try Lite model
    // ============================================================================
    if (is429 && selectedModel === MODEL_CONFIG.FLASH && retryCount === 0) {
      console.log('🔄 429 Rate Limit on Flash model - Falling back to Lite model...')
      
      // Remove last user message to avoid duplicate
      chat.history.pop()
      
      // Retry with Lite model (force override)
      yield* streamGeminiResponse(chat, userMessage, context, 0, {
        ...options,
        forceModel: MODEL_CONFIG.LITE
      })
      return
    }
    
    if ((is503 || is429) && retryCount < MAX_GEMINI_RETRIES) {
      // Calculate delay with exponential backoff: 2s, 4s, 8s, 16s...
      const delayMs = Math.pow(2, retryCount + 1) * 1000
      
      console.log(`🔄 ${is503 ? '503 High Demand' : '429 Rate Limit'} - Retrying in ${delayMs}ms...`)
      console.log(`   Attempt ${retryCount + 1}/${MAX_GEMINI_RETRIES}`)
      
      // Wait before retry
      await sleep(delayMs)
      
      // Remove last user message to avoid duplicate
      chat.history.pop()
      
      // Retry with next key (keep same model)
      yield* streamGeminiResponse(chat, userMessage, context, retryCount + 1, options)
      return
    }
    
    // All retries exhausted or non-retryable error
    if (is503 || is429) {
      const fallbackMessage = `Maaf, Milo sedang sangat sibuk sekarang 😅\n\nSudah coba ${retryCount + 1}x dengan ${API_KEYS.length} API key berbeda, tapi server Google masih penuh.\n\nCoba lagi dalam 2-3 menit ya! 🙏`
      yield fallbackMessage
    } else {
      // Generic error
      const fallbackMessage = `Maaf, ada masalah saat menghubungi AI. Coba lagi ya! 😅\n\n(Error: ${error.message?.substring(0, 100) || 'Unknown error'})`
      yield fallbackMessage
    }
  }
}

// Function untuk chat tanpa streaming (jika diperlukan)
export async function sendGeminiMessage(
  chat, 
  userMessage, 
  context = 'guiding_resource',
  options = {} // NEW: Support for hybrid model switching
) {
  try {
    console.log('📤 Sending message to Gemini (non-streaming):', userMessage)
    console.log('📍 Context:', context)
    
    // Add user message to history
    chat.addMessage('user', userMessage)
    
    // Extract options
    const {
      hasImage = false,
      isComplexTask = false,
      forceModel = null
    } = options
    
    // Select system instruction based on context
    const systemInstruction = 
      context === 'solution' ? SOLUTION_CONTEXT :
      context === 'hasil_tes' ? HASIL_TES_CONTEXT :
      GUIDING_RESOURCE_CONTEXT
    
    // Select model based on task complexity
    const selectedModel = selectGeminiModel({
      hasImage,
      isComplexTask,
      context,
      forceModel
    })
    
    const genAI = getGenAI() // Get new instance with rotated API key
    const model = genAI.getGenerativeModel({
      model: selectedModel, // HYBRID: Lite or Flash
      systemInstruction: systemInstruction,
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
    
    // Post-process response before storing and returning
    const cleanedText = postProcessResponse(text)
    
    // Add cleaned assistant response to history
    chat.addMessage('model', cleanedText)
    
    return cleanedText
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

// Export model configuration and utilities
export { 
  ChatSession,
  MODEL_CONFIG,           // Model IDs untuk reference
  selectGeminiModel,      // Manual model selection jika diperlukan
  postProcessResponse     // Text cleaning utility (for testing/debugging)
}

export default {
  createGuidingResourceChat,
  createSolutionChat,
  createHasilTesChat,
  streamGeminiResponse,
  sendGeminiMessage,
  CONTEXTS,
  MODEL_CONFIG,
  selectGeminiModel,
}
