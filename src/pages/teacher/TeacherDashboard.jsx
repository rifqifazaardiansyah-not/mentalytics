import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, 
  BarChart3, 
  FileText, 
  TrendingUp, 
  LogOut,
  School,
  Calendar,
  Plus,
  ArrowLeft,
  BookOpen
} from 'lucide-react'
import { TeacherContext } from '../../context/TeacherContext'
import { supabase } from '../../lib/supabaseClient'
import { useConfirm } from '../../components/ui/ConfirmDialog'
import CreateClassModal from '../../components/teacher/CreateClassModal'
import JoinClassModal from '../../components/teacher/JoinClassModal'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { 
    teacherId,
    teacherName, 
    email, 
    kelasId,
    kodeKelas,
    namaKelas,
    isInClass,
    joinClass,
    leaveClass,
    logout
  } = useContext(TeacherContext)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [teacherClasses, setTeacherClasses] = useState([]) // List of all classes guru owns
  const [loadingClasses, setLoadingClasses] = useState(false)

  // Load all classes owned by this teacher
  useEffect(() => {
    if (teacherId) {
      loadTeacherClasses()
    }
  }, [teacherId])

  const loadTeacherClasses = async () => {
    try {
      setLoadingClasses(true)
      const { data, error } = await supabase
        .from('v_guru_classes')
        .select('*')
        .eq('guru_id', teacherId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTeacherClasses(data || [])
    } catch (err) {
      console.error('Error loading teacher classes:', err)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Keluar dari Dashboard',
      message: 'Apakah Anda yakin ingin keluar?',
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      variant: 'danger'
    })
    
    if (confirmed) {
      logout()
      navigate('/teacher/login')
    }
  }

  const handleLeaveClass = async () => {
    const confirmed = await confirm({
      title: 'Keluar dari Kelas',
      message: `Keluar dari kelas "${namaKelas}"? Anda bisa masuk kembali kapan saja.`,
      confirmText: 'Ya, Keluar',
      cancelText: 'Batal',
      variant: 'primary'
    })
    
    if (confirmed) {
      leaveClass()
    }
  }

  const handleJoinClass = (classData) => {
    // Join class using data from modal
    joinClass(classData.kelas_id, classData.kode_kelas, classData.nama_kelas)
    loadTeacherClasses() // Refresh list
  }

  const handleJoinExistingClass = (classData) => {
    // Join from list of existing classes
    joinClass(classData.kelas_id, classData.kode_kelas, classData.nama_kelas)
  }

  const menuItems = [
    {
      title: 'Data Siswa',
      description: 'Lihat daftar siswa dan informasi detail',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      path: '/dashboard-guru/students',
      available: true
    },
    {
      title: 'Hasil Survei',
      description: 'Analisis hasil survei bullying & kecemasan',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      path: '/dashboard-guru/surveys',
      available: true // ✅ Ready!
    },
    {
      title: 'Statistik Kelas',
      description: 'Visualisasi data dan tren kelas',
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      path: '/dashboard-guru/statistics',
      available: true
    },
    {
      title: 'Progress Belajar',
      description: 'Monitor aktivitas belajar siswa',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      path: '/dashboard-guru/progress',
      available: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-poppins font-bold text-ink-900">
                  Dashboard Guru
                </h1>
                <p className="text-sm text-ink-600">Monitoring Siswa MENTALYTICS</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Card - High Contrast Mental Health Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border-4 border-teal-500 rounded-2xl p-6 md:p-10 mb-8 shadow-2xl overflow-hidden"
        >
          {/* Subtle Geometric Patterns - More Visible */}
          <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 border-8 border-teal-100 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 border-8 border-purple-100 transform rotate-45 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            {/* Top Section - User Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            >
              {/* User Avatar & Status */}
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-teal-500 border-4 border-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                    <School className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 border-2 border-white rounded-full shadow-md"
                  />
                </div>
                <div>
                  <div className="text-xs md:text-sm font-bold uppercase tracking-wide mb-1 bg-teal-600 text-white px-3 py-1 rounded">
                    Dashboard Guru
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-gray-800 uppercase">ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Date - Hidden on small mobile, shown on sm+ */}
              <div className="hidden sm:flex items-center gap-2 bg-teal-50 border-2 border-teal-500 rounded-lg px-4 py-2 shadow-sm">
                <Calendar className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span className="text-xs md:text-sm font-bold text-gray-800">
                  {new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </motion.div>

            {/* Main Content - Responsive Layout */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Content */}
              <div className="flex-1 w-full">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight text-gray-900"
                >
                  Selamat Datang! 👋
                  <br />
                  <span className="inline-block mt-2 bg-purple-600 text-white px-3 py-1 md:px-4 md:py-2 border-4 border-purple-800 text-xl md:text-2xl lg:text-3xl shadow-lg">
                    {teacherName}
                  </span>
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  {/* Email */}
                  <div className="flex items-center gap-3 bg-teal-50 border-2 border-teal-500 rounded-lg px-3 py-3 md:px-4 md:py-3 shadow-sm">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-teal-500 border-2 border-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <School className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="text-sm md:text-base font-bold text-gray-900 break-all">{email}</span>
                  </div>
                  
                  {/* Date - Shown on mobile only */}
                  <div className="flex sm:hidden items-center gap-3 bg-teal-50 border-2 border-teal-500 rounded-lg px-3 py-3 shadow-sm">
                    <div className="w-9 h-9 bg-teal-500 border-2 border-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {new Date().toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Right Illustration - Hidden on mobile, shown on lg+ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:block relative flex-shrink-0"
              >
                <div className="relative w-40 h-40 xl:w-48 xl:h-48">
                  {/* Animated Border Frame */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="w-full h-full rounded-2xl border-4 border-dashed border-teal-500" />
                  </motion.div>
                  
                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 xl:w-32 xl:h-32 bg-purple-600 border-4 border-purple-800 rounded-2xl flex items-center justify-center shadow-2xl">
                      <BarChart3 className="w-14 h-14 xl:w-16 xl:h-16 text-white" />
                    </div>
                  </div>

                  {/* Floating Icons */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-2 -right-2 w-12 h-12 xl:w-14 xl:h-14 bg-teal-500 border-4 border-teal-700 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <Users className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-2 -left-2 w-12 h-12 xl:w-14 xl:h-14 bg-rose-500 border-4 border-rose-700 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <FileText className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    className="absolute top-1/2 -right-2 w-10 h-10 xl:w-12 xl:h-12 bg-amber-400 border-4 border-amber-600 rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-amber-900" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Stats Bar (if in class) */}
            {isInClass && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative z-10 mt-6 md:mt-8 pt-6 border-t-4 border-teal-500"
              >
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-teal-500 border-4 border-teal-700 rounded-lg p-3 md:p-4 text-center shadow-lg">
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">
                      {teacherClasses.length}
                    </div>
                    <div className="text-[10px] md:text-xs font-bold text-teal-50 uppercase tracking-wide leading-tight">Total Kelas</div>
                  </div>
                  <div className="bg-purple-600 border-4 border-purple-800 rounded-lg p-3 md:p-4 text-center shadow-lg">
                    <div className="text-2xl md:text-3xl font-black text-white mb-1">
                      {teacherClasses.find(k => k.kelas_id === kelasId)?.jumlah_siswa || 0}
                    </div>
                    <div className="text-[10px] md:text-xs font-bold text-purple-50 uppercase tracking-wide leading-tight">Siswa Aktif</div>
                  </div>
                  <div className="bg-amber-400 border-4 border-amber-600 rounded-lg p-3 md:p-4 text-center shadow-lg">
                    <div className="flex items-center justify-center text-2xl md:text-3xl font-black text-amber-900 mb-1">
                      <BookOpen className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <div className="text-[10px] md:text-xs font-bold text-amber-900 uppercase tracking-wide leading-tight">Monitoring</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Current Class Card or Select Class */}
        {isInClass ? (
          <>
            {/* Currently in Class - Show Class Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-green-300 rounded-xl p-6 mb-8 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-ink-900">{namaKelas}</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Kelas Aktif
                      </span>
                    </div>
                    <p className="text-ink-600 mb-3">
                      Kode Kelas: <span className="font-mono font-semibold text-primary-600">{kodeKelas}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Anda sedang monitoring kelas ini. Gunakan menu di bawah untuk melihat data siswa dan statistik.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLeaveClass}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar Kelas</span>
                </button>
              </div>
            </motion.div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <button
                    onClick={() => item.available && navigate(item.path)}
                    disabled={!item.available}
                    className={`w-full text-left bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 ${
                      item.available 
                        ? 'hover:-translate-y-1 cursor-pointer' 
                        : 'opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <item.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-ink-900">
                            {item.title}
                          </h3>
                          {!item.available && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              Segera
                            </span>
                          )}
                        </div>
                        <p className="text-ink-600 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Not in Class - Show Class Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-primary-300 rounded-xl p-8 mb-8 text-center"
            >
              <h3 className="text-2xl font-bold text-ink-900 mb-4">
                Pilih Kelas untuk Monitoring
              </h3>
              <p className="text-ink-600 mb-6">
                Anda perlu masuk ke kelas terlebih dahulu untuk memulai monitoring siswa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Buat Kelas Baru
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                >
                  <School className="w-5 h-5" />
                  Gabung Kelas Existing
                </button>
              </div>
            </motion.div>

            {/* List of Classes Owned by Teacher */}
            {teacherClasses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-ink-900">Kelas yang Anda Miliki</h3>
                  {loadingClasses && (
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Klik kelas di bawah untuk masuk dan mulai monitoring:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teacherClasses.map((kelas) => (
                    <button
                      key={kelas.kelas_id}
                      onClick={() => handleJoinExistingClass(kelas)}
                      className="text-left p-4 border-2 border-gray-200 hover:border-primary-500 rounded-lg transition-all hover:shadow-md bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-ink-900">{kelas.nama_kelas}</h4>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
                          {kelas.kode_kelas}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {kelas.jumlah_siswa} siswa
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {kelas.teacher_role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>MENTALYTICS • Platform Pembelajaran Interaktif Statistika</p>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateClassModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teacherId={teacherId}
        onClassCreated={handleJoinClass}
      />

      <JoinClassModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        teacherId={teacherId}
        onClassJoined={handleJoinClass}
      />
    </div>
  )
}
