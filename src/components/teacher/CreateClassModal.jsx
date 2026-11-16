import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import ClassCreatedSuccessModal from './ClassCreatedSuccessModal'

export default function CreateClassModal({ isOpen, onClose, teacherId, onClassCreated }) {
  const [formData, setFormData] = useState({
    namaKelas: '',
    tahunAjaran: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdClass, setCreatedClass] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call create_class_by_teacher function
      const { data, error: dbError } = await supabase
        .rpc('create_class_by_teacher', {
          p_guru_id: teacherId,
          p_nama_kelas: formData.namaKelas.trim(),
          p_tahun_ajaran: formData.tahunAjaran.trim()
        })

      if (dbError) throw dbError

      if (data && data.length > 0) {
        const newClass = data[0]
        setCreatedClass(newClass)
        
        // Reset form
        setFormData({ namaKelas: '', tahunAjaran: '' })
        
        // Close create modal and show success modal
        onClose()
        setShowSuccessModal(true)
        
        // Callback to parent to reload classes
        onClassCreated(newClass)
      }
    } catch (err) {
      console.error('Error creating class:', err)
      setError(err.message || 'Gagal membuat kelas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setCreatedClass(null)
  }

  return (
    <>
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
                    <Plus className="w-6 h-6 text-green-600" />
                    Buat Kelas Baru
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
                    <label htmlFor="namaKelas" className="block text-sm font-medium text-ink-700 mb-2">
                      Nama Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="namaKelas"
                      name="namaKelas"
                      type="text"
                      required
                      value={formData.namaKelas}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Contoh: Kelas X-1 SMAN 1 Jakarta"
                    />
                  </div>

                  <div>
                    <label htmlFor="tahunAjaran" className="block text-sm font-medium text-ink-700 mb-2">
                      Tahun Ajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="tahunAjaran"
                      name="tahunAjaran"
                      type="text"
                      required
                      value={formData.tahunAjaran}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Contoh: 2024/2025"
                    />
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
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Membuat...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Buat Kelas
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tips:</strong> Setelah kelas dibuat, Anda akan mendapatkan kode kelas 6 digit yang bisa dibagikan kepada siswa.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <ClassCreatedSuccessModal 
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        classData={createdClass}
      />
    </>
  )
}
