import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users, TrendingUp, BarChart3, Download, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function HasilGuidingActivities() {
  const navigate = useNavigate()
  const { kelasId, studentId, studentName } = useContext(StudentContext)
  
  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState([])
  const [myData, setMyData] = useState(null)
  const [stats, setStats] = useState({
    totalResponses: 0,
    avgBullying: 0,
    avgAnxiety: 0,
    maxBullying: 0,
    maxAnxiety: 0,
    minBullying: 0,
    minAnxiety: 0
  })
  const [error, setError] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    async function fetchData() {
      if (!kelasId || !studentId) {
        setError('Data kelas atau siswa tidak ditemukan')
        setLoading(false)
        return
      }

      try {
        // Fetch all survey results from the same class
        const { data: allStudents, error: studentsError } = await supabase
          .from('siswa')
          .select('id')
          .eq('kelas_id', kelasId)

        if (studentsError) throw studentsError

        const studentIds = allStudents.map(s => s.id)

        // Fetch survey results for all students in class
        const { data: surveyData, error: surveyError } = await supabase
          .from('survey_results')
          .select('*')
          .in('siswa_id', studentIds)
          .order('waktu_selesai', { ascending: false })

        if (surveyError) throw surveyError

        if (!surveyData || surveyData.length === 0) {
          setError('Belum ada data survei di kelas ini')
          setLoading(false)
          return
        }

        setClassData(surveyData)

        // Find my own data
        const myResult = surveyData.find(d => d.siswa_id === studentId)
        setMyData(myResult)

        // Calculate statistics
        const totalResponses = surveyData.length
        const bullyingScores = surveyData.map(d => d.skor_bullying)
        const anxietyScores = surveyData.map(d => d.skor_anxiety)

        const avgBullying = Math.round(bullyingScores.reduce((a, b) => a + b, 0) / totalResponses)
        const avgAnxiety = Math.round(anxietyScores.reduce((a, b) => a + b, 0) / totalResponses)

        setStats({
          totalResponses,
          avgBullying,
          avgAnxiety,
          maxBullying: Math.max(...bullyingScores),
          maxAnxiety: Math.max(...anxietyScores),
          minBullying: Math.min(...bullyingScores),
          minAnxiety: Math.min(...anxietyScores)
        })

      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Gagal memuat data. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [kelasId, studentId])

  // Loading state
  if (loading) {
    return (
      <LearningLayout showAI={true}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ink-600">Memuat data kelas...</p>
          </div>
        </div>
      </LearningLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <LearningLayout showAI={true}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg text-ink-900 font-semibold mb-2">Terjadi Kesalahan</p>
            <p className="text-ink-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              Kembali ke The Challenge
            </button>
          </div>
        </div>
      </LearningLayout>
    )
  }

  return (
    <LearningLayout showAI={true}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Milo Section */}
        <div className="flex flex-col items-center mb-8">
          <MiloCharacter pose="happy" className="mb-4" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900 mb-2">
              Selamat, {studentName}! 🎉
            </p>
            <p className="text-sm text-ink-700">
              Data dari angket sudah terkumpul! Sekarang kita punya dataset kelas yang akan kita gunakan 
              untuk pembelajaran statistika. Yuk lihat data yang sudah dikumpulkan! 📊
            </p>
          </MiloDialogBubble>
        </div>

        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-poppins font-semibold text-ink-900 mb-2 md:mb-3">
            Guiding Activities
          </h1>
          <p className="text-base md:text-lg text-ink-600">
            Hasil Pengumpulan Data Kelas
          </p>
        </div>

        {/* My Data Card */}
        {myData && (
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-300 rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-md">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-poppins font-semibold text-ink-900 mb-2 md:mb-3">
                  Data Kamu
                </h3>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-primary-200">
                    <p className="text-xs md:text-sm text-ink-600 mb-1">Skor Bullying</p>
                    <p className="text-2xl md:text-3xl font-poppins font-bold text-primary-700">
                      {myData.skor_bullying}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-primary-200">
                    <p className="text-xs md:text-sm text-ink-600 mb-1">Skor Kecemasan</p>
                    <p className="text-2xl md:text-3xl font-poppins font-bold text-primary-700">
                      {myData.skor_anxiety}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Statistics */}
        <div className="bg-white border-2 border-primary-300 rounded-xl p-4 md:p-6 mb-6 md:mb-8 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary-700" />
            </div>
            <h2 className="text-xl md:text-2xl font-poppins font-semibold text-ink-900">
              Statistik Kelas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Total Responses */}
            <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary-600" />
                <p className="text-xs font-medium text-ink-700">Total Responden</p>
              </div>
              <p className="text-3xl md:text-4xl font-poppins font-bold text-ink-900">
                {stats.totalResponses}
              </p>
              <p className="text-xs text-ink-600 mt-1">murid telah mengisi angket</p>
            </div>

            {/* Avg Bullying */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-xs font-medium text-ink-700">Rata-rata Bullying</p>
              </div>
              <p className="text-3xl md:text-4xl font-poppins font-bold text-ink-900">
                {stats.avgBullying}
              </p>
              <p className="text-xs text-ink-600 mt-1">
                Range: {stats.minBullying} - {stats.maxBullying}
              </p>
            </div>

            {/* Avg Anxiety */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <p className="text-xs font-medium text-ink-700">Rata-rata Kecemasan</p>
              </div>
              <p className="text-3xl md:text-4xl font-poppins font-bold text-ink-900">
                {stats.avgAnxiety}
              </p>
              <p className="text-xs text-ink-600 mt-1">
                Range: {stats.minAnxiety} - {stats.maxAnxiety}
              </p>
            </div>
          </div>

          {/* Data Table - Mobile Optimized with Pagination */}
          <div className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-200">
            <h3 className="text-base md:text-lg font-poppins font-semibold text-ink-900 mb-4">
              Data Kelas ({classData.length} responden)
            </h3>
            
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700">No.</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700">Bullying</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700">Kecemasan</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700 hidden sm:table-cell">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {classData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((row, idx) => {
                      const globalIdx = (currentPage - 1) * itemsPerPage + idx
                      return (
                        <tr 
                          key={row.id} 
                          className={`border-b border-gray-200 ${
                            row.siswa_id === studentId 
                              ? 'bg-primary-100 font-semibold' 
                              : ''
                          }`}
                        >
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-ink-700">
                            {globalIdx + 1}
                            {row.siswa_id === studentId && (
                              <span className="ml-1 text-primary-700 font-bold">★</span>
                            )}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base font-bold text-ink-900">
                            {row.skor_bullying}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base font-bold text-ink-900">
                            {row.skor_anxiety}
                          </td>
                          <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-ink-600 hidden sm:table-cell">
                            {new Date(row.waktu_selesai).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {classData.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500'
                  }`}
                  aria-label="Halaman sebelumnya"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(classData.length / itemsPerPage)
                    const pages = []
                    
                    // Always show max 3 page buttons
                    if (totalPages <= 3) {
                      // Show all pages if 3 or less
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      // More than 3 pages - smart display
                      if (currentPage === 1) {
                        // At first page: 1 2 3 ...
                        pages.push(1, 2, 3, '...')
                      } else if (currentPage === totalPages) {
                        // At last page: ... (n-2) (n-1) n
                        pages.push('...', totalPages - 2, totalPages - 1, totalPages)
                      } else if (currentPage === 2) {
                        // At second page: 1 2 3 ...
                        pages.push(1, 2, 3, '...')
                      } else if (currentPage === totalPages - 1) {
                        // At second to last: ... (n-2) (n-1) n
                        pages.push('...', totalPages - 2, totalPages - 1, totalPages)
                      } else {
                        // In the middle: ... (current-1) current (current+1) ...
                        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...')
                      }
                    }

                    return pages.map((page, idx) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-2 text-ink-500">
                            ...
                          </span>
                        )
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-white border-2 border-gray-200 text-ink-700 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(classData.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(classData.length / itemsPerPage)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    currentPage === Math.ceil(classData.length / itemsPerPage)
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500'
                  }`}
                  aria-label="Halaman berikutnya"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Legend for mobile */}
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-600">
              <span className="text-primary-700 font-bold">★</span>
              <span>= Data kamu</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 md:p-5 mb-6 md:mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-2">
                Apa yang akan kita lakukan dengan data ini?
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Data yang sudah terkumpul ini akan kita gunakan untuk membuat <strong>diagram pencar (scatter plot)</strong> dan 
                menganalisis pola hubungan antara dua variabel. Ini adalah bagian penting dari pembelajaran statistika kita! 
                Nanti kita akan menjawab pertanyaan-pertanyaan menarik tentang data ini di tahap <strong>Guiding Question</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-400 rounded-xl md:rounded-2xl p-1 shadow-lg w-full sm:w-auto">
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge/eksplorasi-diagram')}
              className="bg-white hover:bg-primary-50 text-ink-900 font-poppins font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl transition-all flex items-center justify-center gap-2 md:gap-3 group w-full"
            >
              <span className="text-base md:text-lg">Lanjut ke Eksplorasi Diagram</span>
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-primary-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-sm text-ink-600 mt-3 md:mt-4 px-4">
            Sebelum analisis, yuk coba eksplorasi diagram pencar secara interaktif!
          </p>
        </div>

      </div>
    </LearningLayout>
  )
}

