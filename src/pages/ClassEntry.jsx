import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, UserPlus, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import MiloCharacter from '../components/milo/MiloCharacter'
import MiloDialogBubble from '../components/milo/MiloDialogBubble'
import { supabase } from '../lib/supabaseClient'

export default function ClassEntry() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // 'join' or 'create'
  
  // Join Class State
  const [joinData, setJoinData] = useState({
    nama: '',
    kodeKelas: ''
  })
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState(null)

  // Create Class State
  const [createData, setCreateData] = useState({
    namaKelas: '',
    namaGuru: '',
    tahunAjaran: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [createdClass, setCreatedClass] = useState(null)

  const handleJoinClass = async (e) => {
    e.preventDefault()
    setIsJoining(true)
    setJoinError(null)

    try {
      // Call join_class function
      const { data, error } = await supabase
        .rpc('join_class', {
          p_kode_kelas: joinData.kodeKelas.trim().toUpperCase(),
          p_nama_siswa: joinData.nama.trim()
        })

      if (error) throw error

      if (data && data.length > 0) {
        const studentData = data[0]
        
        // Store in localStorage
        localStorage.setItem('mentalytics_student_id', studentData.siswa_id)
        localStorage.setItem('mentalytics_kelas_id', studentData.kelas_id)
        localStorage.setItem('mentalytics_student_name', studentData.nama_siswa)
        localStorage.setItem('mentalytics_kode_kelas', studentData.kode_kelas)
        localStorage.setItem('mentalytics_nama_kelas', studentData.nama_kelas)

        // Force reload to reinitialize context
        window.location.href = '/tap-milo'
      }
    } catch (err) {
      console.error('Error joining class:', err)
      setJoinError(err.message || 'Gagal bergabung ke kelas. Pastikan kode kelas benar.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)

    try {
      // Call create_new_class function
      const { data, error } = await supabase
        .rpc('create_new_class', {
          p_nama_kelas: createData.namaKelas.trim(),
          p_nama_guru: createData.namaGuru.trim(),
          p_tahun_ajaran: createData.tahunAjaran.trim()
        })

      if (error) throw error

      if (data && data.length > 0) {
        setCreatedClass(data[0])
      }
    } catch (err) {
      console.error('Error creating class:', err)
      setCreateError('Gagal membuat kelas. Silakan coba lagi.')
    } finally {
      setIsCreating(false)
    }
  }

  const copyKodeKelas = () => {
    if (createdClass) {
      navigator.clipboard.writeText(createdClass.kode_kelas)
      alert('Kode kelas berhasil disalin!')
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-primary-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <MiloCharacter pose="wave" />
            </div>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-ink-900 mb-4">
              Selamat Datang di Mentalytics! 👋
            </h1>
            <p className="text-xl text-ink-600">
              Pilih salah satu untuk memulai
            </p>
          </motion.div>

          {/* Mode Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Join Class Card */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setMode('join')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-left"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="w-10 h-10 text-ink-900" />
                </div>
                <h2 className="text-2xl font-poppins font-bold text-ink-900">
                  Bergabung ke Kelas
                </h2>
                <p className="text-ink-600 leading-relaxed">
                  Untuk <span className="font-semibold text-primary-700">Siswa</span>: 
                  Masukkan nama dan kode kelas dari gurumu untuk mulai belajar
                </p>
                <div className="flex items-center gap-2 text-primary-700 font-medium group-hover:gap-3 transition-all">
                  Mulai Belajar <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.button>

            {/* Create Class Card */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setMode('create')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-left"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-poppins font-bold text-ink-900">
                  Buat Kelas Baru
                </h2>
                <p className="text-ink-600 leading-relaxed">
                  Untuk <span className="font-semibold text-blue-700">Guru</span>: 
                  Buat kelas baru dan dapatkan kode untuk dibagikan ke siswa
                </p>
                <div className="flex items-center gap-2 text-blue-700 font-medium group-hover:gap-3 transition-all">
                  Buat Kelas <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-primary-50 to-blue-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
        >
          <button
            onClick={() => setMode(null)}
            className="text-sm text-ink-500 hover:text-ink-700 mb-6"
          >
            ← Kembali
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-ink-900" />
            </div>
            <h2 className="text-3xl font-poppins font-bold text-ink-900 mb-2">
              Bergabung ke Kelas
            </h2>
            <p className="text-ink-600">
              Masukkan nama dan kode kelas dari gurumu
            </p>
          </div>

          <form onSubmit={handleJoinClass} className="space-y-5">
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-ink-700 mb-2">
                Nama Kamu
              </label>
              <input
                type="text"
                id="nama"
                value={joinData.nama}
                onChange={(e) => setJoinData({ ...joinData, nama: e.target.value })}
                placeholder="Contoh: Ahmad Rizki"
                className="w-full px-4 py-3 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="kodeKelas" className="block text-sm font-medium text-ink-700 mb-2">
                Kode Kelas
              </label>
              <input
                type="text"
                id="kodeKelas"
                value={joinData.kodeKelas}
                onChange={(e) => setJoinData({ ...joinData, kodeKelas: e.target.value.toUpperCase() })}
                placeholder="Contoh: ABC123"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all uppercase font-mono text-lg tracking-wider text-center"
                required
              />
              <p className="text-xs text-ink-500 mt-1 text-center">
                6 karakter kode dari gurumu
              </p>
            </div>

            {joinError && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-sm text-red-700">
                {joinError}
              </div>
            )}

            <button
              type="submit"
              disabled={isJoining || !joinData.nama.trim() || !joinData.kodeKelas.trim()}
              className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Bergabung...
                </>
              ) : (
                <>
                  Bergabung ke Kelas
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (mode === 'create') {
    if (createdClass) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-primary-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-poppins font-bold text-ink-900 mb-2">
                Kelas Berhasil Dibuat! 🎉
              </h2>
              <p className="text-ink-600">
                Bagikan kode berikut ke siswa-siswamu
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
                <p className="text-sm text-blue-900 mb-2 font-medium">Kode Kelas:</p>
                <div className="text-center">
                  <p className="text-5xl font-mono font-bold text-blue-700 tracking-widest mb-2">
                    {createdClass.kode_kelas}
                  </p>
                  <button
                    onClick={copyKodeKelas}
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                  >
                    📋 Salin Kode
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-600">Nama Kelas:</span>
                  <span className="font-semibold text-ink-900">{createdClass.nama_kelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-600">Guru:</span>
                  <span className="font-semibold text-ink-900">{createdClass.nama_guru}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-600">Tahun Ajaran:</span>
                  <span className="font-semibold text-ink-900">{createdClass.tahun_ajaran}</span>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 text-sm text-ink-700">
                <p className="font-semibold mb-2">💡 Langkah selanjutnya:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Bagikan kode <span className="font-mono font-bold">{createdClass.kode_kelas}</span> ke siswa</li>
                  <li>Siswa masuk ke Mentalytics menggunakan kode ini</li>
                  <li>Monitor progress siswa di dashboard guru (coming soon)</li>
                </ol>
              </div>

              <button
                onClick={() => {
                  setCreatedClass(null)
                  setMode(null)
                  setCreateData({ namaKelas: '', namaGuru: '', tahunAjaran: '' })
                }}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Buat Kelas Lain
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-primary-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8"
        >
          <button
            onClick={() => setMode(null)}
            className="text-sm text-ink-500 hover:text-ink-700 mb-6"
          >
            ← Kembali
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-poppins font-bold text-ink-900 mb-2">
              Buat Kelas Baru
            </h2>
            <p className="text-ink-600">
              Isi informasi kelas yang akan dibuat
            </p>
          </div>

          <form onSubmit={handleCreateClass} className="space-y-5">
            <div>
              <label htmlFor="namaKelas" className="block text-sm font-medium text-ink-700 mb-2">
                Nama Kelas
              </label>
              <input
                type="text"
                id="namaKelas"
                value={createData.namaKelas}
                onChange={(e) => setCreateData({ ...createData, namaKelas: e.target.value })}
                placeholder="Contoh: Kelas X-1 SMAN 1 Jakarta"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="namaGuru" className="block text-sm font-medium text-ink-700 mb-2">
                Nama Guru
              </label>
              <input
                type="text"
                id="namaGuru"
                value={createData.namaGuru}
                onChange={(e) => setCreateData({ ...createData, namaGuru: e.target.value })}
                placeholder="Contoh: Budi Santoso, S.Pd"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="tahunAjaran" className="block text-sm font-medium text-ink-700 mb-2">
                Tahun Ajaran
              </label>
              <input
                type="text"
                id="tahunAjaran"
                value={createData.tahunAjaran}
                onChange={(e) => setCreateData({ ...createData, tahunAjaran: e.target.value })}
                placeholder="Contoh: 2024/2025"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            {createError && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating || !createData.namaKelas.trim() || !createData.namaGuru.trim() || !createData.tahunAjaran.trim()}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Membuat Kelas...
                </>
              ) : (
                <>
                  Buat Kelas
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }
}
