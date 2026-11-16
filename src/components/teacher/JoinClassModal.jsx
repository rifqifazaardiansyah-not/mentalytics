import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../ui/Toast'

export default function JoinClassModal({ isOpen, onClose, teacherId, onClassJoined }) {
  const toast = useToast()
  const [kodeKelas, setKodeKelas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call link_teacher_to_class function
      const { data, error: dbError } = await supabase
        .rpc('link_teacher_to_class', {
          p_guru_id: teacherId,
          p_kode_kelas: kodeKelas.trim().toUpperCase()
        })

      if (dbError) throw dbError

      if (data && data.length > 0) {
        const joinedClass = data[0]
        
        // Show success message with Toast
        toast.success(`Berhasil bergabung ke kelas ${joinedClass.nama_kelas}!`)
        
        // Reset form
        setKodeKelas('')
        
        // Callback to parent
        onClassJoined(joinedClass)
        onClose()
      }
    } catch (err) {
      console.error('Error joining class:', err)
      if (err.message.includes('sudah terhubung')) {
        setError('Anda sudah terhubung dengan kelas ini.')
      } else if (err.message.includes('tidak valid')) {
        setError('Kode kelas tidak valid atau kelas sudah tidak aktif.')
      } else {
        setError(err.message || 'Gagal bergabung ke kelas. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    // Only allow alphanumeric, max 6 characters, auto uppercase
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setKodeKelas(value)
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
                  <LogIn className="w-6 h-6 text-blue-600" />
                  Gabung Kelas
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="kodeKelas" className="block text-sm font-medium text-ink-700 mb-2">
                    Kode Kelas (6 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="kodeKelas"
                    name="kodeKelas"
                    type="text"
                    required
                    value={kodeKelas}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-2xl font-mono font-bold tracking-wider"
                    placeholder="ABC123"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Masukkan kode kelas yang dibuat oleh guru lain atau dari sistem
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || kodeKelas.length !== 6}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Bergabung...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Gabung
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  📝 <strong>Catatan:</strong> Bergabung ke kelas sebagai <strong>co-teacher</strong> (observer). Anda akan bisa melihat data siswa di kelas tersebut.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
