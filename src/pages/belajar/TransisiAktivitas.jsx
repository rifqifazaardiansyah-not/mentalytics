import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import { ArrowRight, CheckCircle2, Clock, Shield, FileText, AlertCircle, Info } from 'lucide-react'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function TransisiAktivitas() {
  const navigate = useNavigate()
  const { studentId, studentName } = useContext(StudentContext)
  const [existingSubmission, setExistingSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if student already submitted
  useEffect(() => {
    async function checkSubmission() {
      if (!studentId) {
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('survey_results')
          .select('*')
          .eq('siswa_id', studentId)
          .single()

        if (data) {
          setExistingSubmission(data)
          console.log('✅ Found existing submission:', data)
        }
      } catch (err) {
        console.log('ℹ️ No existing submission found')
      } finally {
        setLoading(false)
      }
    }

    checkSubmission()
  }, [studentId])

  // If loading, show loading state
  if (loading) {
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ink-600">Memeriksa data...</p>
          </div>
        </div>
      </LearningLayout>
    )
  }

  // If already submitted, show only "Lihat Hasil" button (Option 2)
  if (existingSubmission) {
    const submittedDate = new Date(existingSubmission.waktu_selesai)
    const formattedDate = submittedDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return (
      <LearningLayout showAI={false}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          
          {/* Milo Section */}
          <div className="flex flex-col items-center mb-8">
            <MiloCharacter pose="happy" className="mb-4" />
            <MiloDialogBubble tailPosition="top" className="max-w-2xl">
              <p className="font-medium text-ink-900 mb-2">
                Halo {studentName}! 👋
              </p>
              <p className="text-sm text-ink-700">
                Kamu sudah pernah mengisi kedua angket. Data kamu sudah tersimpan dengan aman!
              </p>
            </MiloDialogBubble>
          </div>

          {/* Already Submitted Card */}
          <div className="bg-gradient-to-br from-blue-50 to-primary-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-poppins font-semibold text-blue-900 mb-2">
                  Data Angket Sudah Tersimpan
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Waktu pengisian: {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Skor Bullying: {existingSubmission.skor_bullying}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Skor Anxiety: {existingSubmission.skor_anxiety}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Single Action Button */}
          <div className="text-center mb-6">
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge/hasil-guiding-activities')}
              className="inline-flex items-center gap-3 bg-primary-700 hover:from-primary-700 hover:to-primary-600 text-white font-poppins font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              <span className="text-lg">Lihat Hasil</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Data Integrity Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Mengapa data tidak bisa diubah setelah submit?
                </p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Data tidak bisa diubah setelah submit untuk <strong>menjaga integritas data pembelajaran</strong>. 
                  Respon pertama adalah yang paling jujur dan mencerminkan pengalaman sebenarnya. 
                  Dataset yang konsisten penting untuk analisis statistika yang valid. 
                  Yang terpenting adalah proses belajar membuat diagram pencar dan menganalisis data, bukan kesempurnaan data itu sendiri. 📊
                </p>
              </div>
            </div>
          </div>

        </div>
      </LearningLayout>
    )
  }

  // If not submitted yet, show normal intro
  return (
    <LearningLayout showAI={false}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Milo Section */}
        <div className="flex flex-col items-center mb-8">
          <MiloCharacter pose="explain" className="mb-4" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900">
              Sekarang waktunya untuk mengumpulkan data! 📊
            </p>
            <p className="text-sm text-ink-700 mt-2">
              Kamu akan mengisi dua angket singkat yang hasilnya akan kita gunakan untuk membuat diagram pencar. 
              Data ini sangat penting untuk pembelajaran kita, jadi isi dengan jujur dan tenang ya!
            </p>
          </MiloDialogBubble>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-3">
            Aktivitas Pengumpulan Data
          </h1>
          <p className="text-lg text-ink-600">
            Mari kumpulkan data autentik untuk pembelajaran statistika kita
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Angket 1: Bullying */}
          <div className="bg-white border-2 border-primary-300 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-2">
                  Angket Pengalaman Bullying
                </h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Diadaptasi dari <strong>Olweus Bully/Victim Questionnaire-Revised (OBVQ-R)</strong> 
                  yang dikembangkan oleh Dan Olweus.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-ink-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>22 pernyataan tentang pengalaman di sekolah</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Skala: Tidak pernah sampai 7 kali atau lebih</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Estimasi waktu: <strong>5-7 menit</strong></span>
              </div>
            </div>
          </div>

          {/* Angket 2: Anxiety */}
          <div className="bg-white border-2 border-primary-300 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-2">
                  Angket Tingkat Kecemasan
                </h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  Diadaptasi dari <strong>Hamilton Anxiety Rating Scale (HARS)</strong> 
                  yang dikembangkan oleh Max Hamilton.
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-ink-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>14 kelompok gejala kecemasan</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Emotikon: 😊 Sangat Jarang sampai 😣 Sangat Sering</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Estimasi waktu: <strong>6-8 menit</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-primary-100 border-l-4 border-primary-600 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary-700 flex-shrink-0 mt-1" />
            <div className="space-y-3">
              <h3 className="text-lg font-poppins font-semibold text-ink-900">
                Penting untuk Diperhatikan
              </h3>
              <ul className="space-y-2 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  <span>
                    <strong>Data bersifat anonim</strong> — identitas kamu hanya diketahui sebagai Kode Responden
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  <span>
                    <strong>Jawablah dengan jujur</strong> — tidak ada jawaban benar atau salah, yang penting sesuai dengan pengalaman kamu
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  <span>
                    <strong>Data autentik untuk pembelajaran</strong> — hasil angket akan diolah menjadi dataset untuk membuat diagram pencar
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  <span>
                    <strong>Bukan diagnosis klinis</strong> — instrumen ini untuk tujuan pembelajaran statistika, bukan untuk diagnosis psikologis
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">•</span>
                  <span>
                    <strong>AI akan memberikan rekomendasi edukatif</strong> — berdasarkan data kelas secara keseluruhan
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Purpose Explanation */}
        <div className="bg-white border-2 border-primary-400 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-3">
            Mengapa Kita Mengumpulkan Data Ini?
          </h3>
          <p className="text-sm text-ink-700 leading-relaxed mb-4">
            Dalam pembelajaran statistika yang bermakna, menggunakan <strong>data autentik</strong> (data nyata dari pengalaman kita sendiri) 
            lebih penting daripada hanya menggunakan angka-angka simulasi. Data dari angket ini akan menjadi:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-primary-50 rounded-lg p-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-1">Dataset Pembelajaran Statistika</p>
                <p className="text-sm text-ink-700">
                  Data akan dikumpulkan dari seluruh murid di kelas ini untuk membentuk <strong>dataset kelas</strong> yang akan kita gunakan untuk belajar konsep statistika
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-primary-50 rounded-lg p-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-1">Visualisasi dan Analisis Data</p>
                <p className="text-sm text-ink-700">
                  Setelah data terkumpul, kita akan belajar cara <strong>memvisualisasikan</strong> dan <strong>menganalisis</strong> data menggunakan berbagai metode statistika
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-primary-50 rounded-lg p-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900 mb-1">Konteks Pembelajaran yang Relevan</p>
                <p className="text-sm text-ink-700">
                  Dengan menggunakan data dari pengalaman kita sendiri, pembelajaran statistika menjadi lebih <strong>bermakna</strong> dan mudah dipahami
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-ink-600 mt-4 italic">
            💡 Nanti kita akan menjawab pertanyaan menarik tentang data ini menggunakan konsep statistika yang akan kita pelajari bersama!
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-1 shadow-lg">
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge/guiding-activities')}
              className="bg-white hover:bg-primary-50 text-ink-900 font-poppins font-semibold px-8 py-4 rounded-xl transition-all flex items-center gap-3 group"
            >
              <span className="text-lg">Mulai Isi Angket</span>
              <ArrowRight className="w-6 h-6 text-primary-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-sm text-ink-600 mt-4">
            Total estimasi waktu: <strong>10-15 menit</strong> untuk kedua angket
          </p>
        </div>

      </div>
    </LearningLayout>
  )
}
