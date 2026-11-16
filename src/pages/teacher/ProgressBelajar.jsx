import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TeacherContext } from '../../context/TeacherContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../components/ui/Toast'
import {
  TrendingUp,
  ArrowLeft,
  Users,
  BookOpen,
  FileText,
  Lightbulb,
  MessageSquare,
  Brain,
  Eye,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  Award
} from 'lucide-react'

export default function ProgressBelajar() {
  const navigate = useNavigate()
  const toast = useToast()
  const { kelasId, namaKelas, kodeKelas } = useContext(TeacherContext)
  
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [expandedStudent, setExpandedStudent] = useState(null)
  const [sortBy, setSortBy] = useState('name') // name, progress, lastActivity
  const [filterStatus, setFilterStatus] = useState('all') // all, completed, inProgress, notStarted

  useEffect(() => {
    if (kelasId) {
      loadStudentProgress()
    }
  }, [kelasId])

  const loadStudentProgress = async () => {
    try {
      setLoading(true)

      // Get all students in class
      const { data: studentsData, error: studentsError } = await supabase
        .from('siswa')
        .select('id, nama, created_at')
        .eq('kelas_id', kelasId)
        .order('nama', { ascending: true })

      if (studentsError) throw studentsError

      if (!studentsData || studentsData.length === 0) {
        setStudents([])
        setLoading(false)
        return
      }

      // Get all progress data for each student
      const studentProgressPromises = studentsData.map(async (student) => {
        const [
          eqResult,
          surveyResult,
          solutionsResult,
          gqResult,
          aiResult,
          reflectionResult
        ] = await Promise.all([
          // Essential Questions
          supabase
            .from('essential_question_answers')
            .select('created_at')
            .eq('siswa_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          
          // Survey
          supabase
            .from('survey_results')
            .select('waktu_selesai, skor_bullying, skor_anxiety')
            .eq('siswa_id', student.id)
            .order('waktu_selesai', { ascending: false })
            .limit(1)
            .single(),
          
          // Solutions
          supabase
            .from('solutions')
            .select('created_at, pola_hubungan, strategi_mengatasi, rencana_tindakan')
            .eq('siswa_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          
          // Guiding Questions - count
          supabase
            .from('guiding_question_answers')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', student.id),
          
          // AI Interactions - count
          supabase
            .from('ai_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', student.id),
          
          // Reflections
          supabase
            .from('reflections')
            .select('created_at')
            .eq('siswa_id', student.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ])

        // Calculate progress
        let progress = 0
        const milestones = {
          eq: !!eqResult.data,
          survey: !!surveyResult.data,
          solutions: !!solutionsResult.data
        }

        if (milestones.eq) progress += 33
        if (milestones.survey) progress += 33
        if (milestones.solutions) progress += 34

        // Get last activity date
        const activityDates = [
          eqResult.data?.created_at,
          surveyResult.data?.waktu_selesai,
          solutionsResult.data?.created_at,
          reflectionResult.data?.created_at
        ].filter(Boolean)

        const lastActivity = activityDates.length > 0
          ? new Date(Math.max(...activityDates.map(d => new Date(d))))
          : new Date(student.created_at)

        return {
          id: student.id,
          nama: student.nama,
          joinedAt: student.created_at,
          progress,
          lastActivity,
          milestones,
          activities: {
            eq: eqResult.data ? {
              completed: true,
              date: eqResult.data.created_at
            } : null,
            survey: surveyResult.data ? {
              completed: true,
              date: surveyResult.data.waktu_selesai,
              bullying: surveyResult.data.skor_bullying,
              anxiety: surveyResult.data.skor_anxiety
            } : null,
            solutions: solutionsResult.data ? {
              completed: true,
              date: solutionsResult.data.created_at,
              hasContent: !!(solutionsResult.data.pola_hubungan && 
                            solutionsResult.data.strategi_mengatasi && 
                            solutionsResult.data.rencana_tindakan)
            } : null,
            gqCount: gqResult.count || 0,
            aiCount: aiResult.count || 0,
            reflection: reflectionResult.data ? {
              completed: true,
              date: reflectionResult.data.created_at
            } : null
          }
        }
      })

      const progressData = await Promise.all(studentProgressPromises)
      setStudents(progressData)

    } catch (error) {
      console.error('Error loading student progress:', error)
      toast.error('Gagal memuat progress belajar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sortStudents = (students) => {
    const sorted = [...students]
    switch (sortBy) {
      case 'progress':
        return sorted.sort((a, b) => b.progress - a.progress)
      case 'lastActivity':
        return sorted.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      case 'name':
      default:
        return sorted.sort((a, b) => a.nama.localeCompare(b.nama))
    }
  }

  const filterStudents = (students) => {
    switch (filterStatus) {
      case 'completed':
        return students.filter(s => s.progress === 100)
      case 'inProgress':
        return students.filter(s => s.progress > 0 && s.progress < 100)
      case 'notStarted':
        return students.filter(s => s.progress === 0)
      case 'all':
      default:
        return students
    }
  }

  const filteredAndSortedStudents = sortStudents(filterStudents(students))

  const stats = {
    total: students.length,
    completed: students.filter(s => s.progress === 100).length,
    inProgress: students.filter(s => s.progress > 0 && s.progress < 100).length,
    notStarted: students.filter(s => s.progress === 0).length,
    avgProgress: students.length > 0 
      ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
      : 0
  }

  if (!kelasId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Masuk ke kelas terlebih dahulu untuk melihat progress</p>
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
          <p className="text-ink-600 font-medium">Memuat progress belajar...</p>
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
              <TrendingUp className="w-7 h-7 text-orange-600" />
              Progress Belajar
            </h1>
            <p className="text-ink-600 mt-1">
              Kelas: <span className="font-semibold">{namaKelas}</span> ({kodeKelas})
            </p>
          </div>
          <button
            onClick={loadStudentProgress}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Refresh Data
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <StatCard label="Total Siswa" value={stats.total} color="blue" icon={Users} />
          <StatCard label="Selesai" value={stats.completed} color="green" icon={CheckCircle2} />
          <StatCard label="Berjalan" value={stats.inProgress} color="yellow" icon={Clock} />
          <StatCard label="Belum Mulai" value={stats.notStarted} color="gray" icon={Activity} />
          <StatCard label="Rata-rata" value={`${stats.avgProgress}%`} color="purple" icon={Target} />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Siswa</h3>
          <p className="text-gray-600">Belum ada siswa yang terdaftar di kelas ini.</p>
        </div>
      ) : (
        <>
          {/* Filters & Sort */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Filter Status */}
              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={filterStatus === 'all'}
                  onClick={() => setFilterStatus('all')}
                  count={stats.total}
                  label="Semua"
                  color="gray"
                />
                <FilterButton
                  active={filterStatus === 'completed'}
                  onClick={() => setFilterStatus('completed')}
                  count={stats.completed}
                  label="Selesai"
                  color="green"
                />
                <FilterButton
                  active={filterStatus === 'inProgress'}
                  onClick={() => setFilterStatus('inProgress')}
                  count={stats.inProgress}
                  label="Berjalan"
                  color="yellow"
                />
                <FilterButton
                  active={filterStatus === 'notStarted'}
                  onClick={() => setFilterStatus('notStarted')}
                  count={stats.notStarted}
                  label="Belum Mulai"
                  color="gray"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                >
                  <option value="name">Nama (A-Z)</option>
                  <option value="progress">Progress (Tertinggi)</option>
                  <option value="lastActivity">Aktivitas Terakhir</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Progress List */}
          <div className="space-y-3">
            {filteredAndSortedStudents.map((student, index) => (
              <StudentProgressCard
                key={student.id}
                student={student}
                index={index}
                isExpanded={expandedStudent === student.id}
                onToggle={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
              />
            ))}
          </div>

          {filteredAndSortedStudents.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Data</h3>
              <p className="text-gray-600">
                Tidak ada siswa dengan filter yang dipilih.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 opacity-60" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-75 mt-1">{label}</p>
    </div>
  )
}

function FilterButton({ active, onClick, count, label, color }) {
  const colors = {
    gray: active ? 'bg-gray-200 border-gray-400 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400',
    green: active ? 'bg-green-100 border-green-400 text-green-900' : 'bg-white border-green-300 text-green-700 hover:border-green-400',
    yellow: active ? 'bg-yellow-100 border-yellow-400 text-yellow-900' : 'bg-white border-yellow-300 text-yellow-700 hover:border-yellow-400'
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${colors[color]}`}
    >
      {label} <span className="font-bold">({count})</span>
    </button>
  )
}

function StudentProgressCard({ student, index, isExpanded, onToggle }) {
  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-400'
    if (progress === 100) return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const getProgressBgColor = (progress) => {
    if (progress === 0) return 'bg-gray-200'
    if (progress === 100) return 'bg-green-200'
    return 'bg-yellow-200'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const daysSinceActivity = Math.floor(
    (new Date() - new Date(student.lastActivity)) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header - Always Visible */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Index */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold text-sm">{index + 1}</span>
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-ink-900 text-lg truncate">{student.nama}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Bergabung: {formatDate(student.joinedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Aktif: {daysSinceActivity === 0 ? 'Hari ini' : `${daysSinceActivity} hari lalu`}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{student.progress}%</p>
              <p className="text-xs text-gray-600 font-medium">Progress</p>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full ${getProgressBgColor(student.progress)} rounded-full h-2 mt-4`}>
          <div
            className={`${getProgressColor(student.progress)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${student.progress}%` }}
          />
        </div>

        {/* Quick Milestone Status */}
        <div className="flex gap-2 mt-4">
          <MilestoneChip
            icon={BookOpen}
            label="EQ"
            completed={student.milestones.eq}
            color="blue"
          />
          <MilestoneChip
            icon={FileText}
            label="Survey"
            completed={student.milestones.survey}
            color="green"
          />
          <MilestoneChip
            icon={Lightbulb}
            label="Solusi"
            completed={student.milestones.solutions}
            color="purple"
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
          <h4 className="font-bold text-ink-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Detail Aktivitas Pembelajaran
          </h4>

          {/* Milestone Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Essential Questions */}
            <ActivityDetail
              icon={BookOpen}
              title="Essential Questions"
              completed={student.activities.eq?.completed}
              date={student.activities.eq?.date}
              color="blue"
            />

            {/* Survey */}
            <div className={`rounded-lg p-4 border-2 ${
              student.activities.survey?.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`w-5 h-5 ${
                  student.activities.survey?.completed ? 'text-green-600' : 'text-gray-400'
                }`} />
                <h5 className="font-semibold text-sm">Survey</h5>
              </div>
              {student.activities.survey?.completed ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-green-700 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{formatDate(student.activities.survey.date)}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bullying:</span>
                      <span className="font-bold text-red-700">{student.activities.survey.bullying}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kecemasan:</span>
                      <span className="font-bold text-yellow-700">{student.activities.survey.anxiety}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500">Belum dikerjakan</p>
              )}
            </div>

            {/* Solutions */}
            <div className={`rounded-lg p-4 border-2 ${
              student.activities.solutions?.completed 
                ? 'bg-purple-50 border-purple-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className={`w-5 h-5 ${
                  student.activities.solutions?.completed ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <h5 className="font-semibold text-sm">Solusi</h5>
              </div>
              {student.activities.solutions?.completed ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-purple-700 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{formatDate(student.activities.solutions.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {student.activities.solutions.hasContent ? (
                      <span className="text-xs text-purple-700 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Lengkap
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">Perlu dilengkapi</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500">Belum dikerjakan</p>
              )}
            </div>
          </div>

          {/* Additional Engagement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EngagementDetail
              icon={MessageSquare}
              title="Guiding Questions"
              count={student.activities.gqCount}
              color="teal"
            />
            <EngagementDetail
              icon={Brain}
              title="Interaksi AI"
              count={student.activities.aiCount}
              color="indigo"
            />
            <ActivityDetail
              icon={Eye}
              title="Refleksi"
              completed={student.activities.reflection?.completed}
              date={student.activities.reflection?.date}
              color="pink"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MilestoneChip({ icon: Icon, label, completed, color }) {
  const colors = {
    blue: completed ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-500 border-gray-300',
    green: completed ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300',
    purple: completed ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-gray-100 text-gray-500 border-gray-300'
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold ${colors[color]}`}>
      {completed ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      <span>{label}</span>
    </div>
  )
}

function ActivityDetail({ icon: Icon, title, completed, date, color }) {
  const colors = {
    blue: completed ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-400',
    pink: completed ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-gray-50 border-gray-200 text-gray-400'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`rounded-lg p-4 border-2 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${completed ? colors[color].split(' ')[2] : 'text-gray-400'}`} />
        <h5 className="font-semibold text-sm text-gray-900">{title}</h5>
      </div>
      {completed ? (
        <div className={`flex items-center gap-2 text-xs ${completed ? colors[color].split(' ')[2] : 'text-gray-500'}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{formatDate(date)}</span>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Belum dikerjakan</p>
      )}
    </div>
  )
}

function EngagementDetail({ icon: Icon, title, count, color }) {
  const colors = {
    teal: count > 0 ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200',
    indigo: count > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'
  }

  const iconColors = {
    teal: count > 0 ? 'text-teal-600' : 'text-gray-400',
    indigo: count > 0 ? 'text-indigo-600' : 'text-gray-400'
  }

  const textColors = {
    teal: count > 0 ? 'text-teal-700' : 'text-gray-500',
    indigo: count > 0 ? 'text-indigo-700' : 'text-gray-500'
  }

  return (
    <div className={`rounded-lg p-4 border-2 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} />
        <h5 className="font-semibold text-sm text-gray-900">{title}</h5>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-2xl font-bold ${textColors[color]}`}>{count}</span>
        <span className="text-xs text-gray-600">aktivitas</span>
      </div>
    </div>
  )
}
