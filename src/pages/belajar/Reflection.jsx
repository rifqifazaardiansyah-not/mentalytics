import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { supabase } from '../../lib/supabaseClient'

export default function Reflection() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('') // 'saving' | 'saved' | 'error'
  const [siswaId, setSiswaId] = useState(null)
  
  // Reflection answers state
  const [ratings, setRatings] = useState({
    q1: 0, // Pandangan tentang bullying berubah
    q2: 0, // Lebih peduli karena data dari teman sendiri
    q3: 0, // Lebih percaya diri membaca statistik
    q4: 0, // Data statistik membantu jelaskan masalah nyata
  })
  
  const [reflection, setReflection] = useState('') // Essay answer
  
  // Questions data
  const questions = [
    {
      id: 'q1',
      text: 'Pandangan saya tentang isu bullying di sekolah berubah setelah melihat data dari kelas saya sendiri.'
    },
    {
      id: 'q2',
      text: 'Mengetahui hasil ini berasal dari teman-teman sekelas saya sendiri membuat saya lebih peduli dibanding sekadar membaca angka dari penelitian orang lain.'
    },
    {
      id: 'q3',
      text: 'Setelah pengalaman ini, saya merasa lebih percaya diri membaca data atau statistik dalam kehidupan sehari-hari.'
    },
    {
      id: 'q4',
      text: 'Saya merasa data statistik dapat membantu menjelaskan masalah nyata di sekitar saya, bukan cuma materi pelajaran.'
    }
  ]

  // Load existing reflection on mount
  useEffect(() => {
    async function loadReflection() {
      try {
        const storedSiswaId = localStorage.getItem('mentalytics_student_id')
        if (!storedSiswaId) {
          alert('Data siswa tidak ditemukan. Silakan login ulang.')
          navigate('/kelas')
          return
        }
        setSiswaId(storedSiswaId)

        // Load existing reflection from database
        const { data, error } = await supabase
          .from('reflections')
          .select('*')
          .eq('siswa_id', storedSiswaId)
          .maybeSingle()

        if (data && !error) {
          setRatings({
            q1: data.rating_q1 || 0,
            q2: data.rating_q2 || 0,
            q3: data.rating_q3 || 0,
            q4: data.rating_q4 || 0,
          })
          setReflection(data.essay_answer || '')
          console.log('✅ Loaded existing reflection')
        }
      } catch (err) {
        console.error('Error loading reflection:', err)
      } finally {
        setLoading(false)
      }
    }

    loadReflection()
  }, [navigate])

  // Auto-save with debounce
  useEffect(() => {
    if (!siswaId || loading) return

    const saveTimer = setTimeout(() => {
      saveReflection()
    }, 2000) // Debounce 2 seconds

    return () => clearTimeout(saveTimer)
  }, [ratings, reflection, siswaId, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save reflection to database
  const saveReflection = async () => {
    if (!siswaId) return

    setSaveStatus('saving')

    try {
      const reflectionData = {
        siswa_id: siswaId,
        rating_q1: ratings.q1,
        rating_q2: ratings.q2,
        rating_q3: ratings.q3,
        rating_q4: ratings.q4,
        essay_answer: reflection,
        updated_at: new Date().toISOString()
      }

      // Upsert (insert or update)
      const { error } = await supabase
        .from('reflections')
        .upsert(reflectionData, {
          onConflict: 'siswa_id'
        })

      if (error) throw error

      console.log('✅ Reflection auto-saved')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (err) {
      console.error('❌ Error saving reflection:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  // Handle rating change
  const handleRatingChange = (questionId, value) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Check if all questions are answered
  const allQuestionsAnswered = () => {
    const isComplete = (
      ratings.q1 > 0 &&
      ratings.q2 > 0 &&
      ratings.q3 > 0 &&
      ratings.q4 > 0 &&
      reflection.trim().length >= 20 // Min 20 characters
    )
    
    console.log('Validation check:', {
      q1: ratings.q1,
      q2: ratings.q2,
      q3: ratings.q3,
      q4: ratings.q4,
      essayLength: reflection.trim().length,
      isComplete
    })
    
    return isComplete
  }

  // Handle submit
  const handleSubmit = async () => {
    console.log('Submit button clicked')
    
    if (!allQuestionsAnswered()) {
      alert('Mohon lengkapi semua pertanyaan terlebih dahulu (skala 1-5 dan refleksi singkat)')
      return
    }

    console.log('Validation passed, saving and navigating...')

    // Save one last time before navigation
    await saveReflection()

    // Navigate to hasil tes
    navigate('/kegiatan-belajar/the-challenge/hasil-tes')
  }

  if (loading) {
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ink-600">Memuat...</p>
          </div>
        </div>
      </LearningLayout>
    )
  }

  return (
    <LearningLayout showAI={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <MiloCharacter pose="thinking" className="mb-3" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900 mb-1">
              Refleksi Pembelajaran 💭
            </p>
            <p className="text-sm text-ink-700">
              Mari refleksikan pengalaman belajarmu! Tidak ada jawaban benar atau salah.
            </p>
          </MiloDialogBubble>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-2">
            Reflection
          </h1>
          <p className="text-ink-600">
            Berikan tanda pada skala 1 (Sangat Tidak Setuju) sampai 5 (Sangat Setuju) sesuai dengan yang kamu rasakan.
          </p>
        </div>

        {/* Save Status Indicator */}
        <div className="mb-6 flex justify-end">
          {saveStatus === 'saving' && (
            <span className="text-sm text-ink-600 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              Menyimpan...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tersimpan otomatis
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 flex items-center gap-2">
              ⚠️ Gagal menyimpan
            </span>
          )}
        </div>

        {/* Rating Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <p className="text-ink-900 leading-relaxed flex-1">
                  {question.text}
                </p>
              </div>

              {/* Rating Scale */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                <span className="text-xs text-ink-600 font-medium sm:w-32">
                  Sangat Tidak Setuju
                </span>
                <div className="flex gap-2 sm:gap-3 justify-center flex-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRatingChange(question.id, value)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 font-bold text-lg transition-all ${
                        ratings[question.id] === value
                          ? 'bg-primary-600 border-primary-600 text-white scale-110 shadow-lg'
                          : 'bg-white border-gray-300 text-ink-700 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-ink-600 font-medium sm:w-32 text-right">
                  Sangat Setuju
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Essay Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-primary-50 rounded-xl p-6 shadow-lg border-2 border-purple-300 mb-8"
        >
          <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-3 flex items-center gap-2">
            <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              5
            </span>
            Refleksi Singkat
          </h3>
          <p className="text-ink-700 mb-4">
            Ceritakan singkat, adakah hal dari pengalaman ini yang paling membekas buatmu?
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Tuliskan refleksi singkatmu di sini... (minimal 20 karakter)"
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none bg-white"
            rows="5"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-ink-500">
              {reflection.length} karakter {reflection.length < 20 && `(minimal 20 karakter)`}
            </p>
            {reflection.length >= 20 && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Cukup lengkap
              </span>
            )}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered()}
            className={`px-8 py-4 font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg ${
              allQuestionsAnswered()
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allQuestionsAnswered() ? (
              <>
                Lanjut ke Hasil Tes
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lengkapi Semua Pertanyaan
              </>
            )}
          </button>
        </motion.div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Catatan:</strong> Jawabanmu akan tersimpan otomatis setiap beberapa detik. 
            Kamu bisa kembali ke halaman ini kapan saja untuk mengubah jawabanmu.
          </p>
        </div>

      </div>
    </LearningLayout>
  )
}
