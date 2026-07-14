import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Heart, Brain, Sparkles, ArrowRight, Info, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import ChallengeFloatingButton from '../../components/layout/ChallengeFloatingButton'
import { StudentContext } from '../../context/StudentContext'
import { useChallenge } from '../../context/ChallengeContext'
import { supabase } from '../../lib/supabaseClient'
import { streamGeminiResponse, createHasilTesChat } from '../../lib/geminiService'

export default function HasilTes() {
  const navigate = useNavigate()
  const { studentName } = useContext(StudentContext)
  const { challengeText, setChallengeText } = useChallenge()
  const [loading, setLoading] = useState(true)
  const [surveyResult, setSurveyResult] = useState(null)
  const [aiRecommendation, setAiRecommendation] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [error, setError] = useState(null)
  const [canRegenerate, setCanRegenerate] = useState(false)

  // Ensure challengeText is set for ChallengeFloatingButton
  useEffect(() => {
    if (!challengeText) {
      const challengeDescription = `THE CHALLENGE

Setiap sekolah punya tanggung jawab memastikan muridnya merasa aman dan nyaman saat belajar. Namun, tidak semua murid mengalaminya. Sebagian pernah mengalami perlakuan tidak menyenangkan dari teman yang lama-kelamaan dapat menimbulkan rasa cemas dan mengganggu proses belajar.

BAGAIMANA DENGAN DI SEKOLAHMU?

Untuk mengetahuinya, kita akan menggunakan data dari kelasmu sendiri. Setiap murid akan mengisi survei singkat dan anonim tentang bullying dan kecemasan yang dirasakan.

Hasilnya akan diolah menjadi diagram pencar, lalu kita selidiki bersama:

• Benarkah ada hubungan antara bullying dan kecemasan di sekolahmu?
• Apa yang bisa dilakukan sekolah agar skor kecemasan murid bisa turun?

INSTRUKSI:
1. Buatlah kelompok yang beranggotakan 3-4 orang murid
2. Simak tantangan berikut lalu kerjakan secara berkelompok`

      console.log('HasilTes - Setting challenge text for floating button')
      setChallengeText(challengeDescription)
    }
  }, [challengeText, setChallengeText])

  // Load survey result
  useEffect(() => {
    async function loadSurveyResult() {
      try {
        const siswaId = localStorage.getItem('mentalytics_student_id')
        if (!siswaId) {
          setError('Data siswa tidak ditemukan. Silakan login ulang.')
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from('survey_results')
          .select('*')
          .eq('siswa_id', siswaId)
          .single()

        if (fetchError) {
          console.error('Error fetching survey result:', fetchError)
          setError('Gagal memuat hasil tes. Pastikan kamu sudah mengisi survei.')
          setLoading(false)
          return
        }

        setSurveyResult(data)
        
        // Check if AI recommendation already exists
        const { data: existingAI, error: aiError } = await supabase
          .from('ai_interactions')
          .select('response')
          .eq('siswa_id', siswaId)
          .eq('halaman', 'hasil_tes')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (existingAI && existingAI.response && !aiError) {
          // Use existing recommendation
          console.log('📌 Using existing AI recommendation')
          setAiRecommendation(existingAI.response)
          
          // Check if it's old format (starts with greeting)
          const hasGreeting = /^(Halo|Hai|Hi|Selamat)/i.test(existingAI.response.trim())
          if (hasGreeting) {
            console.log('⚠️ Old format detected, regenerating...')
            // Delete old recommendation
            await supabase
              .from('ai_interactions')
              .delete()
              .eq('siswa_id', siswaId)
              .eq('halaman', 'hasil_tes')
            
            // Generate new one
            await generateAIRecommendation(data)
          } else {
            setCanRegenerate(true)
          }
        } else {
          // Generate new recommendation
          console.log('✨ Generating new AI recommendation')
          await generateAIRecommendation(data)
          setCanRegenerate(true)
        }
        
      } catch (err) {
        console.error('Error loading survey result:', err)
        setError('Terjadi kesalahan saat memuat data.')
      } finally {
        setLoading(false)
      }
    }

    loadSurveyResult()
  }, [])

  // Generate AI recommendation based on scores
  async function generateAIRecommendation(result) {
    setLoadingAI(true)
    try {
      const chat = createHasilTesChat()
      
      // Create detailed prompt for concrete recommendations
      const bullyingCategory = result.skor_bullying >= 22 ? 'Terindikasi sebagai korban bullying' : 'Tidak terindikasi sebagai korban bullying'
      const anxietyCategory = getAnxietyCategory(result.skor_anxiety)
      
      const prompt = `HASIL ASESMEN SISWA:
Skor Bullying: ${result.skor_bullying}/88 (${bullyingCategory})
Skor Kecemasan: ${result.skor_anxiety}/56 (${anxietyCategory})

INSTRUKSI:
Berikan rekomendasi personal KONKRET untuk siswa ini. JANGAN gunakan sapaan atau pembuka seperti "Halo" atau "Hai". Langsung mulai dengan penjelasan hasil dan rekomendasi.

FORMAT YANG DIHARAPKAN:
1. Penjelasan singkat tentang hasil (2-3 kalimat)
2. Rekomendasi konkret yang bisa dilakukan (3-5 langkah praktis)
3. Motivasi singkat

Mulai langsung dengan: "Hasil asesmen menunjukkan..." atau "Berdasarkan hasil..."`

      let fullResponse = ''
      for await (const chunk of streamGeminiResponse(chat, prompt, 'hasil_tes')) {
        fullResponse += chunk
        setAiRecommendation(fullResponse)
      }
      
      // Save recommendation to database
      await supabase
        .from('ai_interactions')
        .insert({
          siswa_id: result.siswa_id,
          halaman: 'hasil_tes',
          prompt: prompt,
          response: fullResponse,
          created_at: new Date().toISOString()
        })
        
    } catch (err) {
      console.error('Error generating AI recommendation:', err)
      setAiRecommendation('Maaf, terjadi kesalahan saat memuat rekomendasi AI. Silakan refresh halaman atau gunakan tombol AI di pojok kanan bawah untuk berkonsultasi.')
    } finally {
      setLoadingAI(false)
      setCanRegenerate(true)
    }
  }

  // Regenerate recommendation
  async function handleRegenerate() {
    if (!surveyResult) return
    
    setAiRecommendation('')
    
    // Delete old recommendation
    const siswaId = localStorage.getItem('mentalytics_student_id')
    await supabase
      .from('ai_interactions')
      .delete()
      .eq('siswa_id', siswaId)
      .eq('halaman', 'hasil_tes')
    
    // Generate new
    await generateAIRecommendation(surveyResult)
  }

  // Convert markdown bold (**text**) to HTML
  function convertMarkdownToHTML(text) {
    if (!text) return ''
    // Convert **bold** to <strong>bold</strong>
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  }

  // Get anxiety category based on score
  function getAnxietyCategory(score) {
    if (score < 14) return 'Tidak terdapat kecemasan'
    if (score <= 20) return 'Kecemasan ringan'
    if (score <= 27) return 'Kecemasan sedang'
    if (score <= 41) return 'Kecemasan berat'
    return 'Kecemasan panik'
  }

  // Get category color
  function getCategoryColor(type, score) {
    if (type === 'bullying') {
      return score >= 22 ? 'red' : 'green'
    } else {
      if (score < 14) return 'green'
      if (score <= 20) return 'yellow'
      if (score <= 27) return 'orange'
      return 'red'
    }
  }

  // Get category styles
  function getCategoryStyles(color) {
    const styles = {
      green: {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-900',
        badge: 'bg-green-600',
        icon: CheckCircle2
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        badge: 'bg-yellow-600',
        icon: Info
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-900',
        badge: 'bg-orange-600',
        icon: AlertCircle
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-900',
        badge: 'bg-red-600',
        icon: AlertCircle
      }
    }
    return styles[color] || styles.green
  }

  if (loading) {
    return (
      <LearningLayout showAI={true} aiContext="hasil_tes">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ink-600">Memuat hasil tes...</p>
          </div>
        </div>
      </LearningLayout>
    )
  }

  if (error || !surveyResult) {
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg text-ink-900 font-semibold mb-2">{error || 'Data tidak ditemukan'}</p>
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </LearningLayout>
    )
  }

  const bullyingColor = getCategoryColor('bullying', surveyResult.skor_bullying)
  const anxietyColor = getCategoryColor('anxiety', surveyResult.skor_anxiety)
  const bullyingStyles = getCategoryStyles(bullyingColor)
  const anxietyStyles = getCategoryStyles(anxietyColor)
  const bullyingCategory = surveyResult.skor_bullying >= 22 ? 'Terindikasi sebagai korban bullying' : 'Tidak terindikasi sebagai korban bullying'
  const anxietyCategory = getAnxietyCategory(surveyResult.skor_anxiety)

  return (
    <LearningLayout showAI={true} aiContext="hasil_tes">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Challenge Floating Button */}
        <ChallengeFloatingButton />
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <MiloCharacter pose="happy" className="mb-3" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900 mb-1">
              Hasil Asesmen Individual 📊
            </p>
            <p className="text-sm text-ink-700">
              Ini adalah hasil asesmen pribadi kamu tentang bullying dan kecemasan. Ingat, ini bukan diagnosis medis ya!
            </p>
          </MiloDialogBubble>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-2">
            Hasil Tes: {studentName}
          </h1>
          <p className="text-ink-600">
            Berdasarkan survei yang telah kamu isi
          </p>
        </div>

        {/* Results Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Bullying Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${bullyingStyles.bg} border-2 ${bullyingStyles.border} rounded-2xl p-6 shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${bullyingStyles.badge} rounded-full flex items-center justify-center`}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900">
                    Bullying
                  </h3>
                  <p className="text-xs text-ink-600">40 pertanyaan</p>
                </div>
              </div>
              <bullyingStyles.icon className={`w-8 h-8 ${bullyingStyles.text}`} />
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-ink-900">
                  {surveyResult.skor_bullying}
                </span>
                <span className="text-lg text-ink-600">/88</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${bullyingStyles.badge} transition-all duration-500`}
                  style={{ width: `${(surveyResult.skor_bullying / 88) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className={`${bullyingStyles.badge} text-white px-4 py-2 rounded-lg font-semibold text-center`}>
              {bullyingCategory}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-ink-600 mb-1 font-medium">Pedoman Penskoran:</p>
              <p className="text-xs text-ink-700">
                • Skor ≥ 22: Terindikasi korban bullying<br/>
                • Skor &lt; 22: Tidak terindikasi
              </p>
            </div>
          </motion.div>

          {/* Anxiety Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${anxietyStyles.bg} border-2 ${anxietyStyles.border} rounded-2xl p-6 shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${anxietyStyles.badge} rounded-full flex items-center justify-center`}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900">
                    Kecemasan
                  </h3>
                  <p className="text-xs text-ink-600">20 pertanyaan</p>
                </div>
              </div>
              <anxietyStyles.icon className={`w-8 h-8 ${anxietyStyles.text}`} />
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-ink-900">
                  {surveyResult.skor_anxiety}
                </span>
                <span className="text-lg text-ink-600">/56</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${anxietyStyles.badge} transition-all duration-500`}
                  style={{ width: `${(surveyResult.skor_anxiety / 56) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className={`${anxietyStyles.badge} text-white px-4 py-2 rounded-lg font-semibold text-center`}>
              {anxietyCategory}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-xs text-ink-600 mb-1 font-medium">Pedoman Penskoran:</p>
              <p className="text-xs text-ink-700">
                • &lt;14: Tidak ada kecemasan<br/>
                • 14-20: Ringan | 21-27: Sedang<br/>
                • 28-41: Berat | 42-56: Panik
              </p>
            </div>
          </motion.div>
        </div>

        {/* AI Recommendation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-primary-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-purple-300 mb-8"
        >
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-poppins font-semibold text-ink-900">
                  Rekomendasi Personal dari Milo
                </h2>
                <p className="text-sm text-ink-600">Disesuaikan dengan hasil asesmen kamu</p>
              </div>
            </div>
            {canRegenerate && !loadingAI && (
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-primary-600 font-medium rounded-lg border-2 border-primary-600 transition-colors flex items-center gap-2"
                title="Regenerate rekomendasi"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>

          {loadingAI ? (
            <div className="flex items-center gap-3 py-8">
              <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-ink-700">Milo sedang menyusun rekomendasi personal untuk kamu...</p>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <div 
                className="bg-white rounded-xl p-6 text-ink-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(aiRecommendation) || 'Rekomendasi sedang dimuat...' }}
              />
            </div>
          )}

          <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-semibold mb-1">
                  Penting untuk Diingat:
                </p>
                <p className="text-xs text-blue-800">
                  Rekomendasi ini bukan diagnosis medis. Jika kamu merasa memerlukan bantuan lebih lanjut, jangan ragu untuk berbicara dengan guru BK, konselor sekolah, atau orang tua/wali. Kamu tidak sendirian! 💙
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Support Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 mb-8"
        >
          <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-4">
            💬 Butuh Bicara Lebih Lanjut?
          </h3>
          <p className="text-ink-700 mb-4">
            Gunakan tombol AI di pojok kanan bawah untuk berkonsultasi lebih lanjut dengan Milo. Milo siap mendengarkan dan membantu kamu memahami hasil asesmen ini lebih dalam.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="font-semibold text-green-900 mb-2">🏫 Guru BK / Konselor</p>
              <p className="text-sm text-green-800">Kunjungi ruang BK sekolah kamu</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
          >
            Selesai & Kembali ke Home
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

      </div>
    </LearningLayout>
  )
}
