import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Lightbulb, Users, ArrowRight, FileText, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import AIFloatingButton from '../../components/layout/AIFloatingButton'
import ChallengeFloatingButton from '../../components/layout/ChallengeFloatingButton'
import { StudentContext } from '../../context/StudentContext'
import { useChallenge } from '../../context/ChallengeContext'
import { supabase } from '../../lib/supabaseClient'

export default function Solution() {
  const navigate = useNavigate()
  const { studentName } = useContext(StudentContext)
  const { challengeText, setChallengeText } = useChallenge()
  const [siswaId, setSiswaId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Solution content
  const [recommendation, setRecommendation] = useState('')
  const [actionStep, setActionStep] = useState('')
  
  // Assessment checklist
  const [checklist, setChecklist] = useState({
    diagramCorrect: false,
    canExplain: false,
    considerLimits: false,
    concreteRecommendation: false,
    realAction: false
  })

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedSiswaId = localStorage.getItem('mentalytics_student_id')
        if (!storedSiswaId) {
          alert('Data siswa tidak ditemukan. Silakan login ulang.')
          navigate('/kelas')
          return
        }
        setSiswaId(storedSiswaId)

        // Load existing solution from database
        const { data: existingSolution, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('siswa_id', storedSiswaId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading solution:', error)
        } else if (existingSolution) {
          setRecommendation(existingSolution.rekomendasi || '')
          setActionStep(existingSolution.langkah_aksi || '')
          if (existingSolution.checklist) {
            try {
              setChecklist(JSON.parse(existingSolution.checklist))
            } catch (e) {
              console.error('Error parsing checklist:', e)
            }
          }
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

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

      console.log('Solution - Setting challenge text for floating button')
      setChallengeText(challengeDescription)
    }
  }, [challengeText, setChallengeText])

  // Auto-save with debounce
  useEffect(() => {
    if (!siswaId || loading) return

    const timer = setTimeout(() => {
      saveSolution()
    }, 2000)

    return () => clearTimeout(timer)
  }, [recommendation, actionStep, checklist, siswaId, loading])

  const saveSolution = async () => {
    if (!siswaId) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('solutions')
        .upsert({
          siswa_id: siswaId,
          rekomendasi: recommendation,
          langkah_aksi: actionStep,
          checklist: JSON.stringify(checklist),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'siswa_id'
        })

      if (error) throw error
    } catch (err) {
      console.error('Error saving solution:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allChecked = Object.values(checklist).every(v => v === true)

  if (loading) {
    return (
      <LearningLayout showAI={true}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </LearningLayout>
    )
  }

  return (
    <LearningLayout showAI={true}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* AI Floating Button - Using shared component */}
        <AIFloatingButton context="solution" />
        
        {/* Challenge Floating Button */}
        <ChallengeFloatingButton />
        
        {/* Milo Section */}
        <div className="flex flex-col items-center mb-8">
          <MiloCharacter pose="thinking" className="mb-4" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900 mb-2">
              Saatnya Merancang Solusi! 💡
            </p>
            <p className="text-sm text-ink-700">
              {studentName}, gunakan temuan dari diagram pencar kalian untuk membuat rekomendasi yang konkret dan dapat diterapkan!
            </p>
          </MiloDialogBubble>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-semibold text-ink-900 mb-3">
            Solutions
          </h1>
          <p className="text-base md:text-lg text-ink-600 max-w-3xl mx-auto">
            Kalian sudah membuat diagram pencar dan menyelidiki pola hubungannya. Sekarang, gunakan temuan itu untuk merancang solusi nyata.
          </p>
        </div>

        {/* Auto-save indicator */}
        {saving && (
          <div className="fixed top-20 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            💾 Menyimpan...
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          
          {/* Recommendation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border-2 border-primary-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-poppins font-semibold text-ink-900">
                Rekomendasi Solusi
              </h2>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-r-lg">
              <p className="text-sm text-blue-900 leading-relaxed">
                <strong>Template:</strong> Karena diagram menunjukkan <span className="text-blue-700">[pola yang kalian temukan]</span>, 
                kami merekomendasikan sekolah untuk <span className="text-blue-700">[rekomendasi kalian]</span>, 
                karena hal ini dapat membantu <span className="text-blue-700">[alasan]</span>.
              </p>
              <p className="text-xs text-blue-800 mt-2">
                💡 <strong>Ingat:</strong> Solusi terbaik biasanya menyasar akar masalahnya (bullying) sendiri, bukan hanya meredakan rasa cemas yang sudah muncul.
              </p>
            </div>

            <textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Tulis rekomendasi kelompok kalian di sini..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none min-h-[200px] text-ink-900"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              {recommendation.length} karakter
            </p>
          </motion.div>

          {/* Action Step Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-400"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-poppins font-semibold text-ink-900">
                Langkah Aksi Konkret
              </h2>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-lg">
              <p className="text-sm text-green-900 leading-relaxed">
                <strong>Pertanyaan:</strong> Apa satu langkah kecil dan konkret yang bisa kelompok kalian mulai lakukan <strong>minggu ini</strong> untuk mendorong terlaksananya rekomendasi tersebut?
              </p>
            </div>

            <textarea
              value={actionStep}
              onChange={(e) => setActionStep(e.target.value)}
              placeholder="Contoh: Membuat poster kampanye anti-bullying dan menempelnya di papan pengumuman kelas..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none min-h-[150px] text-ink-900"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              {actionStep.length} karakter
            </p>
          </motion.div>

          {/* Assessment Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-amber-400"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-poppins font-semibold text-ink-900">
                Assessment
              </h2>
            </div>

            <p className="text-sm text-ink-700 mb-4">
              Sebelum kalian mempresentasikan hasil kerja kelompok, checklist dulu yuk!
            </p>

            <div className="space-y-3">
              {[
                { key: 'diagramCorrect', label: 'Diagram pencar dibuat dengan benar dari data survei kelompok (sumbu X dan Y sesuai, semua titik data termasuk).' },
                { key: 'canExplain', label: 'Kelompok bisa menjelaskan arah, kekuatan korelasi, dan ada/tidaknya outlier dengan alasan yang sesuai data.' },
                { key: 'considerLimits', label: 'Kelompok mempertimbangkan keterbatasan data (representativitas, korelasi vs sebab-akibat) sebelum menyimpulkan.' },
                { key: 'concreteRecommendation', label: 'Rekomendasi yang ditulis konkret, dapat dilakukan, dan menyasar akar masalah, bukan cuma meredakan gejala.' },
                { key: 'realAction', label: 'Ada langkah aksi nyata yang diusulkan, bukan cuma imbauan umum.' }
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                    checklist[item.key]
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-white border-2 border-gray-300 hover:border-amber-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleChecklist(item.key)}
                    className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <span className={`text-sm flex-1 ${checklist[item.key] ? 'text-green-900 font-medium' : 'text-ink-700'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Publishing Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-400"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-poppins font-semibold text-ink-900">
                Publishing
              </h2>
            </div>

            <p className="text-ink-700 mb-4 font-medium">
              Saatnya membagikan hasil kerja kelompok kalian ke kelompok lain! 📢
            </p>

            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">Alur presentasi:</p>
              <ol className="space-y-2 text-sm text-purple-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">1.</span>
                  <span>Buka hasil kerja kelompok kalian yang menampilkan diagram pencar dan rekomendasi yang sudah kalian tulis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">2.</span>
                  <span>Setiap kelompok presentasi singkat (3 menit) ke kelompok lain, menunjukkan diagram pencar dan rekomendasi mereka.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">3.</span>
                  <span>Kelompok yang mendengarkan memberi tanggapan singkat: satu hal yang menarik dari temuan kelompok tersebut, dan satu pertanyaan atau masukan untuk memperkuat rekomendasinya.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-[20px]">4.</span>
                  <span>Setelah semua kelompok presentasi, diskusikan bersama: apakah pola yang ditemukan tiap kelompok cenderung mirip atau justru berbeda-beda? Kenapa bisa begitu?</span>
                </li>
              </ol>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                <strong>Tips:</strong> Gunakan diagram pencar dari halaman Eksplorasi Diagram sebagai visual saat presentasi!
              </p>
            </div>
          </motion.div>

          {/* View Diagram Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg border-2 border-indigo-300"
          >
            <p className="text-ink-700 mb-4 text-center font-medium">
              Siap untuk presentasi? Lihat tampilan lengkap hasil kerja kelompok kalian!
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/kegiatan-belajar/the-challenge/presentation')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md"
              >
                📊 Lihat Halaman Presentasi
              </button>
            </div>
            <p className="text-xs text-center text-gray-600 mt-3">
              Halaman ini menggabungkan diagram pencar dengan rekomendasi kalian
            </p>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge/hasil-tes')}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
            >
              Lanjut ke Hasil Tes
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </LearningLayout>
  )
}
