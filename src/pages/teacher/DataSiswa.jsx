import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TeacherContext } from '../../context/TeacherContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../components/ui/Toast'
import StudentDetailModal from '../../components/teacher/StudentDetailModal'
import { 
  Users, 
  Search, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  BarChart3,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'

export default function DataSiswa() {
  const navigate = useNavigate()
  const toast = useToast()
  const { kelasId, namaKelas, kodeKelas } = useContext(TeacherContext)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, completed, in-progress, not-started
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    if (kelasId) {
      loadStudents()
    }
  }, [kelasId])

  const loadStudents = async () => {
    try {
      setLoading(true)
      
      // Query siswa dengan progress mereka (count-based approach)
      const { data, error } = await supabase
        .from('siswa')
        .select(`
          id,
          nama,
          created_at
        `)
        .eq('kelas_id', kelasId)
        .order('nama', { ascending: true })

      if (error) throw error

      // Get progress for each student separately for accuracy
      const studentsWithProgress = await Promise.all(
        data.map(async (student) => {
          // Check Essential Question
          const { count: eqCount } = await supabase
            .from('essential_question_answers')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', student.id)

          // Check Survey
          const { count: surveyCount } = await supabase
            .from('survey_results')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', student.id)

          // Check Solution
          const { count: solutionCount } = await supabase
            .from('solutions')
            .select('*', { count: 'exact', head: true })
            .eq('siswa_id', student.id)

          const hasEQ = (eqCount || 0) > 0
          const hasSurvey = (surveyCount || 0) > 0
          const hasSolution = (solutionCount || 0) > 0

          let status = 'not-started'
          let progress = 0

          // Calculate progress
          if (hasSolution) {
            status = 'completed'
            progress = 100
          } else if (hasSurvey) {
            status = 'in-progress'
            progress = 66
          } else if (hasEQ) {
            status = 'in-progress'
            progress = 33
          }

          return {
            ...student,
            status,
            progress,
            hasEQ,
            hasSurvey,
            hasSolution
          }
        })
      )

      console.log('Students with progress:', studentsWithProgress)
      setStudents(studentsWithProgress)
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Gagal memuat data siswa: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Statistics
  const stats = {
    total: students.length,
    completed: students.filter(s => s.status === 'completed').length,
    inProgress: students.filter(s => s.status === 'in-progress').length,
    notStarted: students.filter(s => s.status === 'not-started').length,
  }

  const getStatusBadge = (status) => {
    const badges = {
      'completed': {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: 'Selesai'
      },
      'in-progress': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        text: 'Sedang Berjalan'
      },
      'not-started': {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        text: 'Belum Mulai'
      }
    }
    
    const badge = badges[status]
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.text}
      </span>
    )
  }

  if (!kelasId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Masuk ke kelas terlebih dahulu untuk melihat data siswa</p>
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
          <p className="text-ink-600 font-medium">Memuat data siswa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard-guru')}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary-600" />
              Data Siswa
            </h1>
            <p className="text-ink-600 mt-1">
              Kelas: <span className="font-semibold">{namaKelas}</span> ({kodeKelas})
            </p>
          </div>
          <button
            onClick={loadStudents}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Refresh Data
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Siswa</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Selesai</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Sedang Berjalan</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.inProgress}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">Belum Mulai</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.notStarted}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-gray-400 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">
                {filterStatus === 'all' && `Semua (${stats.total})`}
                {filterStatus === 'completed' && `Selesai (${stats.completed})`}
                {filterStatus === 'in-progress' && `Sedang Berjalan (${stats.inProgress})`}
                {filterStatus === 'not-started' && `Belum Mulai (${stats.notStarted})`}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showFilterDropdown && (
              <>
                {/* Backdrop untuk close dropdown */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterDropdown(false)}
                />
                
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilterStatus('all')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        filterStatus === 'all' ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="font-medium">Semua</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        filterStatus === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {stats.total}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilterStatus('completed')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        filterStatus === 'completed' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Selesai</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        filterStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {stats.completed}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilterStatus('in-progress')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        filterStatus === 'in-progress' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">Sedang Berjalan</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        filterStatus === 'in-progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {stats.inProgress}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilterStatus('not-started')
                        setShowFilterDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        filterStatus === 'not-started' ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">Belum Mulai</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        filterStatus === 'not-started' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {stats.notStarted}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Detail Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Tidak ada siswa yang sesuai dengan filter'
                        : 'Belum ada siswa di kelas ini'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-sm">
                            {student.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">{student.nama}</p>
                          <p className="text-xs text-gray-500">
                            Bergabung: {new Date(student.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{student.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              student.progress === 100
                                ? 'bg-green-500'
                                : student.progress > 0
                                ? 'bg-yellow-500'
                                : 'bg-gray-400'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            student.hasEQ
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          title="Essential Question"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          EQ
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            student.hasSurvey
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          title="Survey"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          Survey
                        </div>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            student.hasSolution
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          title="Solution (Diagram Pencar)"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          Solution
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowDetailModal(true)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
      />
    </div>
  )
}
