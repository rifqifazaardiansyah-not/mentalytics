import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TeacherContext } from '../../context/TeacherContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../components/ui/Toast'
import {
  FileText,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react'

export default function HasilSurvei() {
  const navigate = useNavigate()
  const toast = useToast()
  const { kelasId, namaKelas, kodeKelas } = useContext(TeacherContext)
  
  const [surveyData, setSurveyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (kelasId) {
      loadSurveyData()
    }
  }, [kelasId])

  const loadSurveyData = async () => {
    try {
      setLoading(true)

      // Get all students in the class
      const { data: students, error: studentsError } = await supabase
        .from('siswa')
        .select('id, nama')
        .eq('kelas_id', kelasId)
        .order('nama', { ascending: true })

      console.log('Raw students data:', students)
      console.log('Students error:', studentsError)

      if (studentsError) throw studentsError
      if (!students || students.length === 0) {
        console.log('No students found in class')
        setSurveyData([])
        setLoading(false)
        return
      }

      // Get all student IDs
      const studentIds = students.map(s => s.id)
      console.log('Student IDs:', studentIds)

      // Get survey results for these students
      const { data: surveyResults, error: surveyError } = await supabase
        .from('survey_results')
        .select('siswa_id, skor_bullying, skor_anxiety, waktu_selesai')
        .in('siswa_id', studentIds)

      console.log('Survey results:', surveyResults)
      console.log('Survey error:', surveyError)

      if (surveyError) throw surveyError

      // Manual join: combine students with their survey results
      const completedSurveys = students
        .map(student => {
          const survey = surveyResults?.find(sr => sr.siswa_id === student.id)
          if (!survey) return null
          
          return {
            id: student.id,
            nama: student.nama,
            skor_bullying: survey.skor_bullying,
            skor_anxiety: survey.skor_anxiety,
            waktu_selesai: survey.waktu_selesai
          }
        })
        .filter(s => s !== null) // Remove students without surveys

      console.log('Completed surveys:', completedSurveys)
      setSurveyData(completedSurveys)

      // Calculate statistics
      if (completedSurveys.length > 0) {
        const bullyingScores = completedSurveys.map(s => s.skor_bullying)
        const anxietyScores = completedSurveys.map(s => s.skor_anxiety)

        const calculateStats = (scores) => ({
          min: Math.min(...scores),
          max: Math.max(...scores),
          avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
          median: calculateMedian(scores)
        })

        setStats({
          total: completedSurveys.length,
          totalStudents: students.length,
          bullying: calculateStats(bullyingScores),
          anxiety: calculateStats(anxietyScores),
          correlation: calculateCorrelation(bullyingScores, anxietyScores)
        })
      }
    } catch (error) {
      console.error('Error loading survey data:', error)
      toast.error('Gagal memuat data survei: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateMedian = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1)
      : sorted[mid]
  }

  const calculateCorrelation = (x, y) => {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : (numerator / denominator).toFixed(3)
  }

  const getCategoryLevel = (score, type) => {
    // Bullying: 10-50 range
    // Anxiety: 10-50 range
    if (type === 'bullying') {
      if (score <= 20) return { label: 'Rendah', color: 'text-green-700 bg-green-100' }
      if (score <= 35) return { label: 'Sedang', color: 'text-yellow-700 bg-yellow-100' }
      return { label: 'Tinggi', color: 'text-red-700 bg-red-100' }
    } else {
      if (score <= 20) return { label: 'Rendah', color: 'text-green-700 bg-green-100' }
      if (score <= 35) return { label: 'Sedang', color: 'text-yellow-700 bg-yellow-100' }
      return { label: 'Tinggi', color: 'text-red-700 bg-red-100' }
    }
  }

  const getCorrelationInterpretation = (r) => {
    const value = Math.abs(parseFloat(r))
    if (value < 0.3) return { label: 'Lemah', color: 'text-gray-700', icon: Minus }
    if (value < 0.7) return { label: 'Sedang', color: 'text-yellow-700', icon: TrendingUp }
    return { label: 'Kuat', color: 'text-red-700', icon: TrendingUp }
  }

  if (!kelasId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Masuk ke kelas terlebih dahulu untuk melihat hasil survei</p>
          <button
            onClick={() => navigate('/dashboard-guru')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-600 font-medium">Memuat data survei...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/dashboard-guru')}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-purple-600" />
              Hasil Survei
            </h1>
            <p className="text-ink-600 mt-1">
              Kelas: <span className="font-semibold">{namaKelas}</span> ({kodeKelas})
            </p>
          </div>
          <button
            onClick={loadSurveyData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Refresh Data
          </button>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Siswa</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalStudents}</p>
                </div>
                <Users className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Sudah Survei</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.total}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Tingkat Partisipasi</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {Math.round((stats.total / stats.totalStudents) * 100)}%
                  </p>
                </div>
                <PieChart className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
            </div>
          </div>
        )}
      </div>

      {surveyData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Data Survei</h3>
          <p className="text-gray-600">
            Belum ada siswa yang menyelesaikan survei di kelas ini.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bullying Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  Statistik Bullying
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Rata-rata" value={stats.bullying.avg} color="blue" />
                  <StatCard label="Median" value={stats.bullying.median} color="blue" />
                  <StatCard label="Minimum" value={stats.bullying.min} color="green" />
                  <StatCard label="Maximum" value={stats.bullying.max} color="red" />
                </div>
              </div>

              {/* Anxiety Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  Statistik Kecemasan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Rata-rata" value={stats.anxiety.avg} color="blue" />
                  <StatCard label="Median" value={stats.anxiety.median} color="blue" />
                  <StatCard label="Minimum" value={stats.anxiety.min} color="green" />
                  <StatCard label="Maximum" value={stats.anxiety.max} color="red" />
                </div>
              </div>
            </div>
          )}

          {/* Correlation Card */}
          {stats && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Korelasi Bullying & Kecemasan
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-4xl font-bold text-purple-900">{stats.correlation}</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Koefisien Korelasi Pearson
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  getCorrelationInterpretation(stats.correlation).label === 'Kuat' ? 'bg-red-100' :
                  getCorrelationInterpretation(stats.correlation).label === 'Sedang' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <p className={`text-lg font-bold ${getCorrelationInterpretation(stats.correlation).color}`}>
                    {getCorrelationInterpretation(stats.correlation).label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.correlation > 0 ? 'Positif' : 'Negatif'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-purple-800 mt-4 leading-relaxed bg-white/50 p-3 rounded-lg">
                💡 <strong>Interpretasi:</strong> Korelasi {getCorrelationInterpretation(stats.correlation).label.toLowerCase()} 
                {stats.correlation > 0 ? ' positif' : ' negatif'} menunjukkan bahwa {
                  Math.abs(parseFloat(stats.correlation)) >= 0.7 ? 'terdapat hubungan yang kuat' :
                  Math.abs(parseFloat(stats.correlation)) >= 0.3 ? 'terdapat hubungan yang moderat' :
                  'hubungan yang lemah'
                } antara tingkat bullying dan kecemasan siswa.
              </p>
            </div>
          )}

          {/* Student Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-ink-900">Detail Hasil Survei Per Siswa</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Skor Bullying
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Skor Kecemasan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Waktu Selesai
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {surveyData.map((student, index) => {
                    const bullyingLevel = getCategoryLevel(student.skor_bullying, 'bullying')
                    const anxietyLevel = getCategoryLevel(student.skor_anxiety, 'anxiety')

                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-ink-900">{student.nama}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-2xl font-bold text-red-700">{student.skor_bullying}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bullyingLevel.color}`}>
                            {bullyingLevel.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-2xl font-bold text-yellow-700">{student.skor_anxiety}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${anxietyLevel.color}`}>
                            {anxietyLevel.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(student.waktu_selesai).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
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
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }

  return (
    <div className={`border rounded-lg p-3 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
