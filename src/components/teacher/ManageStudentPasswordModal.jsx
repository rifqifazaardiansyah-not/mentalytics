import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, Loader2, Key, Trash2, CheckCircle } from 'lucide-react'

export default function ManageStudentPasswordModal({ 
  isOpen, 
  student, // { id, nama, has_password }
  onClose,
  onSuccess
}) {
  const [action, setAction] = useState(null) // 'set' or 'remove'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (password.length < 4) {
      setError('Password minimal 4 karakter')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Password tidak sama')
      return
    }

    setIsSubmitting(true)
    try {
      const { supabase } = await import('../../lib/supabaseClient')
      const { data, error: rpcError } = await supabase
        .rpc('teacher_set_student_password', {
          p_siswa_id: student.id,
          p_new_password: password
        })

      if (rpcError) throw rpcError

      if (data && data.length > 0 && data[0].success) {
        setSuccess(data[0].message)
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(data[0]?.message || 'Gagal menyimpan password')
      }
    } catch (err) {
      console.error('Error setting password:', err)
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemovePassword = async () => {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const { supabase } = await import('../../lib/supabaseClient')
      const { data, error: rpcError } = await supabase
        .rpc('teacher_remove_student_password', {
          p_siswa_id: student.id
        })

      if (rpcError) throw rpcError

      if (data && data.length > 0 && data[0].success) {
        setSuccess(data[0].message)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(data[0]?.message || 'Gagal menghapus password')
      }
    } catch (err) {
      console.error('Error removing password:', err)
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAction(null)
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(null)
  }

  if (!isOpen || !student) return null

  const passwordTooShort = password && password.length < 4
  const passwordMismatch = confirmPassword && password !== confirmPassword

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Kelola Password Siswa</h2>
                  <p className="text-sm text-purple-100">
                    <span className="font-semibold">{student.nama}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                /* Success State */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-ink-900 mb-2">Berhasil!</p>
                  <p className="text-sm text-ink-600">{success}</p>
                </motion.div>
              ) : !action ? (
                /* Action Selection */
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-ink-600 mb-2">Status Password Saat Ini:</p>
                    {student.has_password ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <Lock className="w-4 h-4" />
                        Sudah Ada Password
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                        <AlertCircle className="w-4 h-4" />
                        Belum Ada Password
                      </span>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-ink-700">
                        <p className="font-semibold mb-1">Cara Kerja Password Siswa:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-ink-600">
                          <li><span className="font-semibold">Belum ada password:</span> Siswa bisa login dengan mengosongkan isian password</li>
                          <li><span className="font-semibold">Sudah ada password:</span> Siswa harus memasukkan password yang benar</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => setAction('set')}
                      className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <Key className="w-5 h-5" />
                      {student.has_password ? 'Ubah Password' : 'Set Password Baru'}
                    </button>

                    {student.has_password && (
                      <button
                        onClick={() => setAction('remove')}
                        className="w-full px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 rounded-lg font-semibold transition-all flex items-center justify-center gap-3"
                      >
                        <Trash2 className="w-5 h-5" />
                        Hapus Password
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="w-full px-6 py-3 border-2 border-ink-300 text-ink-700 rounded-lg font-semibold hover:bg-ink-50 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : action === 'set' ? (
                /* Set Password Form */
                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 mb-4">
                    <p className="text-sm text-ink-700">
                      <span className="font-semibold">Password baru</span> akan digunakan siswa untuk login. Pastikan memberitahu siswa password yang baru di-set.
                    </p>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 4 karakter"
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all ${
                          passwordTooShort 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-purple-200 focus:border-purple-500'
                        }`}
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordTooShort && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Password minimal 4 karakter
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang password"
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:ring-2 focus:ring-purple-200 transition-all ${
                          passwordMismatch 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-purple-200 focus:border-purple-500'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Password tidak sama
                      </p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 border-2 border-ink-300 text-ink-700 rounded-lg font-semibold hover:bg-ink-50 transition-all disabled:opacity-50"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || passwordTooShort || passwordMismatch || !password || !confirmPassword}
                      className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" />
                          Simpan Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Remove Password Confirmation */
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-ink-700">
                        <p className="font-semibold mb-1">Yakin hapus password?</p>
                        <p className="text-xs text-ink-600 leading-relaxed">
                          Setelah dihapus, siswa <span className="font-semibold">{student.nama}</span> bisa login <span className="font-semibold">tanpa password</span> (dengan mengosongkan isian password).
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 border-2 border-ink-300 text-ink-700 rounded-lg font-semibold hover:bg-ink-50 transition-all disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleRemovePassword}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5" />
                          Ya, Hapus Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
