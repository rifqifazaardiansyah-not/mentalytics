import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TeacherContext } from '../../context/TeacherContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../components/ui/Toast'
import {
  BarChart3,
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileText,
  Lightbulb,
  MessageSquare,
  Brain,
  Target,
  PieChart,
  Activity
} from 'lucide-react'

export default function StatistikKelas() {
  const navigate = useNavigate()
  const toast = useToast()
  const { kelasId, namaKelas, kodeKelas } = useContext(TeacherContext)
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (kelasId) {
      loadClassStatistics()
    }
  }, [kelasId])

  const loadClassStatistics = async () => {
    try {
      setLoading(true)

      // Get all students in class
      const { data: students, error: studentsError } = await supabase
        .from('siswa')
        .select('id, nama')
        .eq('kelas_id', kelasId)

      if (studentsError) throw studentsError

      if (!students || students.length === 0) {
        setStats({
          totalStudents: 0,
          completion: { completed: 0, inProgress: 0, notStarted: 0 },
          milestones: { eq: 0, survey: 0, solutions: 0 },
          engagement: { gq: 0, ai: 0, reflection: 0 },
          avgProgress: 0
        })
        setLoading(false)
        return
      }

      const studentIds = students.map(s => s.id)

      // Parallel queries for all statistics
      const [
        eqResults,
        surveyResults,
        solutionsResults,
        gqResults,
        aiResults,
        reflectionResults
      ] = await Promise.all([
        // Essential Questions completion
        supabase
          .from('essential_question_answers')
          .select('siswa_id')
          .in('siswa_id', studentIds),
        
        // Survey completion
        supabase
          .from('survey_results')
          .select('siswa_id, skor_bullying, skor_anxiety')
          .in('siswa_id', studentIds),
        
        // Solutions completion
        supabase
          .from('solutions')
          .select('siswa_id')
          .in('siswa_id', studentIds),
        
        // Guiding Questions responses
        supabase
          .from('guiding_question_answers')
          .select('siswa_id')
          .in('siswa_id', studentIds),
        
        // AI interactions
        supabase
          .from('ai_interactions')
          .select('siswa_id')
          .in('siswa_id', studentIds),
        
        // Reflections
        supabase
          .from('reflections')
          .select('siswa_id')
          .in('siswa_id', studentIds)
      ])

      // Check for errors
      if (eqResults.error) throw eqResults.error
      if (surveyResults.error) throw surveyResults.error
      if (solutionsResults.error) throw solutionsResults.error
      if (gqResults.error) throw gqResults.error
      if (aiResults.error) throw aiResults.error
      if (reflectionResults.error) throw reflectionResults.error

      // Process completion status per student
      const eqCompletedIds = new Set(eqResults.data?.map(r => r.siswa_id) || [])
      const surveyCompletedIds = new Set(surveyResults.data?.map(r => r.siswa_id) || [])
      const solutionsCompletedIds = new Set(solutionsResults.data?.map(r => r.siswa_id) || [])
      const gqCompletedIds = new Set(gqResults.data?.map(r => r.siswa_id) || [])
      const aiCompletedIds = new Set(aiResults.data?.map(r => r.siswa_id) || [])
      const reflectionCompletedIds = new Set(reflectionResults.data?.map(r => r.siswa_id) || [])

      // Calculate completion categories
      let completed = 0
      let inProgress = 0
      let notStarted = 0
      let totalProgress = 0

      students.forEach(student => {
        const hasEQ = eqCompletedIds.has(student.id)
        const hasSurvey = surveyCompletedIds.has(student.id)
        const hasSolutions = solutionsCompletedIds.has(student.id)

        let progress = 0
        if (hasEQ) progress += 33
        if (hasSurvey) progress += 33
        if (hasSolutions) progress += 34

        totalProgress += progress

        if (progress === 0) {
          notStarted++
        } else if (progress === 100) {
          completed++
        } else {
          inProgress++
        }
      })

      const avgProgress = students.length > 0 ? Math.round(totalProgress / students.length) : 0

      // Calculate survey statistics
      let surveyStats = null
      if (surveyResults.data && surveyResults.data.length > 0) {
        const bullyingScores = surveyResults.data.map(s => s.skor_bullying)
        const anxietyScores = surveyResults.data.map(s => s.skor_anxiety)

        surveyStats = {
          totalCompleted: surveyResults.data.length,
          bullying: {
            avg: (bullyingScores.reduce((a, b) => a + b, 0) / bullyingScores.length).toFixed(1),
            min: Math.min(...bullyingScores),
            max: Math.max(...bullyingScores)
          },
          anxiety: {
            avg: (anxietyScores.reduce((a, b) => a + b, 0) / anxietyScores.length).toFixed(1),
            min: Math.min(...anxietyScores),
            max: Math.max(...anxietyScores)
          }
        }
      }

      setStats({
        totalStudents: students.length,
        completion: {
          completed,
          inProgress,
          notStarted
        },
        milestones: {
          eq: eqCompletedIds.size,
          survey: surveyCompletedIds.size,
          solutions: solutionsCompletedIds.size
        },
        engagement: {
          gq: gqCompletedIds.size,
          ai: aiCompletedIds.size,
          reflection: reflectionCompletedIds.size
        },
        avgProgress,
        surveyStats
      })

    } catch (error) {
      console.error('Error loading class statistics:', error)
      toast.error('Gagal memuat statistik kelas: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!kelasId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Masuk ke kelas terlebih dahulu untuk melihat statistik</p>
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
          <p className="text-ink-600 font-medium">Memuat statistik kelas...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const completionPercentage = stats.totalStudents > 0 
    ? Math.round((stats.completion.completed / stats.totalStudents) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard-guru')}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-blue-600" />
              Statistik Kelas
            </h1>
            <p className="text-ink-600 mt-1">
              Kelas: <span className="font-semibold">{namaKelas}</span> ({kodeKelas})
            </p>
          </div>
          <button
            onClick={loadClassStatistics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {stats.totalStudents === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Siswa</h3>
          <p className="text-gray-600">
            Belum ada siswa yang terdaftar di kelas ini.
          </p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Students */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-8 h-8 text-blue-300" />
              </div>
              <p className="text-sm font-medium text-blue-700 mb-1">Total Siswa</p>
              <p className="text-4xl font-bold text-blue-900">{stats.totalStudents}</p>
            </div>

            {/* Completed */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <Award className="w-8 h-8 text-green-300" />
              </div>
              <p className="text-sm font-medium text-green-700 mb-1">Selesai 100%</p>
              <p className="text-4xl font-bold text-green-900">{stats.completion.completed}</p>
              <p className="text-xs text-green-600 mt-1">
                {completionPercentage}% dari total siswa
              </p>
            </div>

            {/* In Progress */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-sm font-medium text-yellow-700 mb-1">Sedang Berjalan</p>
              <p className="text-4xl font-bold text-yellow-900">{stats.completion.inProgress}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {Math.round((stats.completion.inProgress / stats.totalStudents) * 100)}% dari total siswa
              </p>
            </div>

            {/* Average Progress */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <PieChart className="w-8 h-8 text-purple-300" />
              </div>
              <p className="text-sm font-medium text-purple-700 mb-1">Rata-rata Progress</p>
              <p className="text-4xl font-bold text-purple-900">{stats.avgProgress}%</p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.avgProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Milestone Completion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-ink-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-orange-600" />
              Pencapaian Milestone
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Essential Questions */}
              <MilestoneCard
                icon={BookOpen}
                title="Essential Questions"
                completed={stats.milestones.eq}
                total={stats.totalStudents}
                color="blue"
                description="Siswa yang sudah menyelesaikan pertanyaan esensial"
              />

              {/* Survey */}
              <MilestoneCard
                icon={FileText}
                title="Survey"
                completed={stats.milestones.survey}
                total={stats.totalStudents}
                color="green"
                description="Siswa yang sudah mengisi survei bullying & kecemasan"
              />

              {/* Solutions */}
              <MilestoneCard
                icon={Lightbulb}
                title="Solusi"
                completed={stats.milestones.solutions}
                total={stats.totalStudents}
                color="purple"
                description="Siswa yang sudah menyelesaikan aktivitas solusi"
              />
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-ink-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              Tingkat Keterlibatan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Guiding Questions */}
              <EngagementCard
                icon={MessageSquare}
                title="Guiding Questions"
                count={stats.engagement.gq}
                total={stats.totalStudents}
                color="teal"
                description="Siswa yang menjawab pertanyaan pemandu"
              />

              {/* AI Interactions */}
              <EngagementCard
                icon={Brain}
                title="Interaksi AI"
                count={stats.engagement.ai}
                total={stats.totalStudents}
                color="indigo"
                description="Siswa yang berinteraksi dengan AI Milo"
              />

              {/* Reflections */}
              <EngagementCard
                icon={FileText}
                title="Refleksi"
                count={stats.engagement.reflection}
                total={stats.totalStudents}
                color="pink"
                description="Siswa yang menulis refleksi pembelajaran"
              />
            </div>
          </div>

          {/* Survey Summary (if available) */}
          {stats.surveyStats && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-ink-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                Ringkasan Survei Kelas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bullying Stats */}
                <div className="bg-white rounded-lg p-5 border border-orange-200">
                  <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Statistik Bullying
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rata-rata:</span>
                      <span className="text-2xl font-bold text-red-700">
                        {stats.surveyStats.bullying.avg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Terendah:</span>
                      <span className="text-lg font-semibold text-green-600">
                        {stats.surveyStats.bullying.min}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tertinggi:</span>
                      <span className="text-lg font-semibold text-red-600">
                        {stats.surveyStats.bullying.max}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Anxiety Stats */}
                <div className="bg-white rounded-lg p-5 border border-yellow-200">
                  <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Statistik Kecemasan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rata-rata:</span>
                      <span className="text-2xl font-bold text-yellow-700">
                        {stats.surveyStats.anxiety.avg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Terendah:</span>
                      <span className="text-lg font-semibold text-green-600">
                        {stats.surveyStats.anxiety.min}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tertinggi:</span>
                      <span className="text-lg font-semibold text-yellow-600">
                        {stats.surveyStats.anxiety.max}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-white/60 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>{stats.surveyStats.totalCompleted}</strong> dari <strong>{stats.totalStudents}</strong> siswa 
                    telah menyelesaikan survei ({Math.round((stats.surveyStats.totalCompleted / stats.totalStudents) * 100)}% partisipasi)
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-ink-900 mb-4">Aksi Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/dashboard-guru/students')}
                className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <Users className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-ink-900">Data Siswa</p>
                <p className="text-sm text-gray-600 mt-1">Lihat detail progress per siswa</p>
              </button>

              <button
                onClick={() => navigate('/dashboard-guru/surveys')}
                className="bg-white border-2 border-green-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all text-left group"
              >
                <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-ink-900">Hasil Survei</p>
                <p className="text-sm text-gray-600 mt-1">Analisis hasil survei kelas</p>
              </button>

              <button
                onClick={loadClassStatistics}
                className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all text-left group"
              >
                <BarChart3 className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-ink-900">Refresh Statistik</p>
                <p className="text-sm text-gray-600 mt-1">Perbarui data statistik terbaru</p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MilestoneCard({ icon: Icon, title, completed, total, color, description }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-900',
      progress: 'bg-blue-500',
      progressBg: 'bg-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-900',
      progress: 'bg-green-500',
      progressBg: 'bg-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-900',
      progress: 'bg-purple-500',
      progressBg: 'bg-purple-200'
    }
  }

  const colorScheme = colors[color]

  return (
    <div className={`${colorScheme.bg} border-2 ${colorScheme.border} rounded-xl p-5`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 ${colorScheme.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${colorScheme.text} mb-1`}>{title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className={`text-3xl font-bold ${colorScheme.text}`}>{completed}</span>
          <span className="text-sm text-gray-600">/ {total} siswa</span>
        </div>
        
        <div className={`w-full ${colorScheme.progressBg} rounded-full h-3`}>
          <div 
            className={`${colorScheme.progress} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1`}
            style={{ width: `${percentage}%` }}
          >
            {percentage >= 20 && (
              <span className="text-xs font-bold text-white">{percentage}%</span>
            )}
          </div>
        </div>
        {percentage < 20 && (
          <p className="text-xs text-gray-600 text-right">{percentage}%</p>
        )}
      </div>
    </div>
  )
}

function EngagementCard({ icon: Icon, title, count, total, color, description }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0
  
  const colors = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      icon: 'bg-teal-100 text-teal-600',
      text: 'text-teal-900',
      badge: 'bg-teal-100 text-teal-700'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'bg-indigo-100 text-indigo-600',
      text: 'text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-700'
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      icon: 'bg-pink-100 text-pink-600',
      text: 'text-pink-900',
      badge: 'bg-pink-100 text-pink-700'
    }
  }

  const colorScheme = colors[color]

  return (
    <div className={`${colorScheme.bg} border-2 ${colorScheme.border} rounded-xl p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 ${colorScheme.icon} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${colorScheme.text}`}>{title}</h3>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
      
      <div className="flex items-center justify-between">
        <div>
          <span className={`text-3xl font-bold ${colorScheme.text}`}>{count}</span>
          <span className="text-gray-600 text-sm ml-2">/ {total}</span>
        </div>
        <div className={`${colorScheme.badge} px-3 py-1 rounded-full`}>
          <span className="font-bold text-lg">{percentage}%</span>
        </div>
      </div>
    </div>
  )
}
