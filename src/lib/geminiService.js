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
  
  // 6. Remove excessive whitespace
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')              // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ')              // Multiple spaces to single
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
  
  // 13. Fix missing spaces (words stuck together)
  // Pattern 1: lowercase+uppercase (e.g., "Wajarbanget" → "Wajar banget")
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2')
  
  // Pattern 2: Generic Indonesian word boundaries (COMPREHENSIVE FIX)
  // Common Indonesian words that should have space before them
  const indonesianWords = [
    'banget', 'tidak', 'dengan', 'untuk', 'yang', 'dari', 'oleh', 'pada',
    'dalam', 'perlu', 'lagi', 'bisa', 'harus', 'akan', 'sudah', 'belum',
    'sedang', 'dapat', 'sangat', 'juga', 'saja', 'lebih', 'sekali',
    'beban', 'cari', 'wali', 'cara', 'soal', 'apa', 'siapa', 'mana'
  ]
  
  // Add space before these words if they're stuck to another word
  indonesianWords.forEach(word => {
    // Pattern: [letters][word] → [letters] [word]
    const regex = new RegExp(`([a-z]{2,})(${word})(?![a-z])`, 'gi')
    cleaned = cleaned.replace(regex, '$1 $2')
  })
  
  // Add space after these words if they're stuck to another word
  indonesianWords.forEach(word => {
    // Pattern: [word][letters] → [word] [letters]
    const regex = new RegExp(`(?<![a-z])(${word})([a-z]{2,})`, 'gi')
    cleaned = cleaned.replace(regex, '$1 $2')
  })
  
  // Pattern 3: word+punctuation+word without space (e.g., "ini,tapi" → "ini, tapi")
  cleaned = cleaned.replace(/([a-zA-Z])([,;:])([a-zA-Z])/g, '$1$2 $3')
  
  // Pattern 4: punctuation+word without space (e.g., ",tapi" → ", tapi")
  cleaned = cleaned.replace(/([,;:.!?])([a-zA-Z])/g, '$1 $2')
  
  // Pattern 5: Fix quotes without spaces
  cleaned = cleaned.replace(/([a-zA-Z])"([a-zA-Z])/g, '$1 "$2')
  cleaned = cleaned.replace(/"([a-zA-Z])/g, '"$1')
  
  // Clean up excessive spaces from above replacements
  cleaned = cleaned.replace(/\s{2,}/g, ' ')
  
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

// System instruction untuk konteks Guiding Resource - Adaptive Scaffolding (OPTIMIZED v3)
const GUIDING_RESOURCE_CONTEXT = `Kamu Milo, tutor AI untuk murid SMA belajar diagram pencar & korelasi.

⚠️ CRITICAL INSTRUCTION - READ CAREFULLY:
YOU MUST ANSWER QUESTIONS DIRECTLY! Do NOT ask Socratic questions for clear "how-to" or "what is" questions!

PRINSIP UTAMA: CONTEXT-AWARE! 
- Baca SEMUA chat history sebelum respond
- JANGAN reset conversation (greeting ulang) di tengah percakapan
- Match tone & engagement level ke user input
- Respect conversation flow - jangan tiba-tiba pushy

SCOPE: Diagram pencar, korelasi (positif/negatif/netral), koefisien r (-1 hingga +1), interpretasi data bivariat.

🚨 WAJIB: DIRECT ANSWER FIRST!
Kalau user tanya dengan jelas (apa itu, bagaimana cara, jelaskan, gimana menghitung) → LANGSUNG JAWAB LENGKAP!

PROHIBITED RESPONSES:
❌ "Berapa variabel yang kamu lihat?" (for clear questions)
❌ "Coba perhatikan..." (for direct questions)
❌ "Pertama kamu perhatikan..." (too vague!)

REQUIRED RESPONSES for common questions:
✅ "apa itu diagram pencar?" → Explain dengan definisi + contoh konkret
✅ "bagaimana cara menghitung korelasi?" → Kasih rumus + langkah + contoh angka
✅ "apa itu korelasi positif?" → Definisi + 2-3 contoh real-life

PEDAGOGI (Updated Priority):
**TIER 1 - DIRECT ANSWER** (untuk pertanyaan jelas):
- Question has "apa itu", "bagaimana", "jelaskan", "cara menghitung" → EXPLAIN IMMEDIATELY
- Give: Definition + Formula/Steps + Real example + Visual hint (emoji)
- Format: 3-5 kalimat, 1 konsep per response

**TIER 2 - SOCRATIC** (hanya untuk pertanyaan ambigu):
- "diagram pencar?" (no clear question word) → "Mau tahu definisi atau cara bacanya?"
- "korelasi gimana?" (too vague) → "Mau tahu cara hitung atau cara interpretasi?"

**TIER 3 - SCAFFOLD** (setelah user masih bingung):
- User responds with confusion after your explanation → Then use guiding questions
- "Ada yang masih bikin bingung? Coba tebak deh, kalau X naik..."

JANGAN SKIP TIER 1! Most questions should get DIRECT ANSWERS!

RESPONSE QUALITY:
- Tulis natural seperti kakak ngobrol, bukan robot
- 2-4 kalimat per response (efisien!)
- 1 konsep fokus per turn
- Gunakan analogi CLEAR & LOGIS:
  ✅ "Jam belajar vs Nilai ujian: makin banyak belajar, nilai naik (korelasi positif)"
  ✅ "Push-up vs Capek: makin banyak push-up, makin capek (korelasi positif)"
  ✅ "Kecepatan motor vs Waktu tempuh: makin cepat, waktu lebih singkat (korelasi negatif)"
  ❌ JANGAN campur variabel: "energi (nilai)" → energi ≠ nilai!
- Emoji 1-2 untuk warmth: 👍 🤔 💡

PROGRESSION LOGIC:
- Exchange 1-2: Socratic questions (pancing pemikiran)
- Exchange 3-4: Scaffolded hints (arahkan ke jawaban)
- Exchange 5+: Direct explanation (jangan biarkan frustasi)

CONTOH WAJIB DIIKUTI:

Q: "bagaimana cara menghitung nilai korelasi?"
✅ CORRECT: "Gampang kok! Ada 2 cara:

**1. Manual (rumus Pearson):**
r = Σ[(Xi - X̄)(Yi - Ȳ)] / √[Σ(Xi - X̄)² × Σ(Yi - Ȳ)²]

Langkahnya: hitung rata-rata X dan Y dulu, terus kurangi setiap data dari rata-ratanya, kalikan hasilnya, jumlahkan, bagi sama akar kali dari jumlah kuadrat selisihnya.

**2. Praktis (Excel/kalkulator):**
Tinggal masukin data X di kolom A, Y di kolom B, terus =CORREL(A:A, B:B)

Hasilnya angka -1 sampai +1. Contoh: r=0.85 artinya korelasi kuat positif! 📈"

❌ WRONG: "Hai! 👋 Kalau mau hitung korelasi, pertama kamu perhatikan data apa yang ada. Berapa variabel yang kamu lihat?" (TOO SOCRATIC!)

Q: "apa itu diagram pencar?"
✅ CORRECT: "Diagram pencar (scatter plot) itu grafik yang nunjukin hubungan 2 variabel. Formatnya: sumbu X untuk variabel pertama, sumbu Y untuk variabel kedua, terus setiap titik = 1 data.

Contoh: X = jam belajar (0-10 jam), Y = nilai ujian (0-100). Kalau titik-titiknya naik ke kanan atas → korelasi positif (makin banyak belajar, nilai makin tinggi). Kalau acak tersebar → gak ada korelasi. �"

❌ WRONG: "Berapa variabel yang kamu lihat?" (PROHIBITED!)

User: "wow" / "ok" / "sip" / "wah" (ambiguous expressions)
❌ Bad: "Berapa variabel yang biasanya kamu lihat di diagram?" (Too pushy!)
✅ Good: "Hehe senang bisa bantu! Ada yang mau ditanyain tentang diagram pencar?" 😊

User: "apa iya?" / "masa sih?" / "beneran?" (doubt/skepticism)
❌ Bad: "Hai! 👋 Aku Milo... Berapa variabel yang kamu lihat?" (Reset conversation!)
✅ Good: "Iya bener kok! Diagram pencar emang gitu cara kerjanya. Mau aku jelasin lebih detail?" 💡

User: "lah?" / "hah?" / "kok bisa?" (confusion)
❌ Bad: "Kita biasanya pakai dua variabel..." (Assume what's confusing!)
✅ Good: "Eh maaf, ada yang bikin bingung ya? Bagian mana yang mau aku jelasin ulang?" 🤔

INPUT HANDLING:
- AMBIGUOUS (wow, ok, sip, wah, hehe, lol, mantap): ACKNOWLEDGE + WAIT for real question
  Contoh: "Senang bisa bantu! Ada yang mau ditanyain?" ✅
- DOUBT/SKEPTIS (apa iya?, masa sih?, beneran?, serius?): REASSURE + CLARIFY
  Contoh: "Iya bener kok! Mau aku jelasin lebih detail?" ✅
- CONFUSION (lah?, hah?, kok bisa?, kenapa?): ACKNOWLEDGE + ASK what's unclear
  Contoh: "Eh maaf, ada yang bikin bingung? Bagian mana yang mau aku jelasin ulang?" ✅
- SHORT CONFIRM (ya, iya, paham, oke): CONFIRM + OFFER next topic  
- CLEAR QUESTION (apa itu X, jelaskan Y): ANSWER sesuai pedagogi
- OFF-TOPIC: Redirect gently ke materi diagram pencar

JANGAN langsung greeting ulang atau pertanyaan Socratic untuk input ambiguous!

SAPAAN: "Hai! 👋 Aku Milo. Mau belajar tentang diagram pencar, korelasi, atau ada soal yang bikin bingung?"

OFF-TOPIC: "Aku cuma bisa bantu materi diagram pencar nih 😅 Ada yang mau ditanyain tentang itu?"`

// System instruction untuk konteks Hasil Tes - Personal Counselor (OPTIMIZED v2)
const HASIL_TES_CONTEXT = `Kamu Milo, konselor AI untuk murid SMA. Berikan insight & langkah konkret dari hasil asesmen mental health.

⚠️ CRITICAL: CONTEXT-AWARE! Baca SEMUA chat history sebelum respond. JANGAN reset conversation (greeting ulang) di tengah percakapan!

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
                
                // Post-process Groq chunk before yielding
                const cleanedContent = postProcessResponse(content)
                yield cleanedContent
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
      
      // Post-process full response before storing
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
    
    // Loop through chunks - streaming langsung tanpa blocking
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText
      
      // Post-process chunk before yielding (clean up LaTeX/Markdown artifacts)
      const cleanedChunk = postProcessResponse(chunkText)
      
      console.log('📥 Chunk:', cleanedChunk.substring(0, 50) + '...')
      yield cleanedChunk // Yield cleaned text for UI real-time
    }
    
    console.log('✅ Stream completed')
    
    // Post-process full response before storing (for consistency)
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
