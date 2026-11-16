import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function StudentPasswordModal({ 
  isOpen, 
  mode, // 'create' or 'login'
  studentName,
  onSubmit, 
  onClose,
  error
}) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (mode === 'create') {
      // Validate password creation
      if (password.length < 4) {
        return
      }
      if (password !== confirmPassword) {
        return
      }
    }
    // Login mode: no validation needed, allow empty for NULL password users

    setIsSubmitting(true)
    try {
      await onSubmit(password)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    onClose()
    alert('💡 Jika lupa password, hubungi guru kamu untuk reset password.\n\nGuru dapat mereset password dari Dashboard Guru.')
  }

  if (!isOpen) return null

  const passwordMismatch = mode === 'create' && confirmPassword && password !== confirmPassword
  const passwordTooShort = mode === 'create' && password && password.length < 4

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
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {mode === 'create' ? 'Buat Password' : 'Masukkan Password'}
                  </h2>
                  <p className="text-sm text-primary-100">
                    Untuk: <span className="font-semibold">{studentName}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {mode === 'create' && (
                <div className="bg-primary-50 border-l-4 border-primary-500 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-ink-700">
                      <p className="font-semibold mb-1">Ini adalah login pertama kamu!</p>
                      <p className="text-xs text-ink-600 leading-relaxed">
                        Buat password untuk melindungi data privasi kamu. 
                        <span className="font-medium"> Ingat baik-baik password ini!</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-ink-700">
                      <p className="font-semibold mb-1">💡 Tips Keamanan</p>
                      <p className="text-xs text-ink-600 leading-relaxed">
                        Jika akun kamu belum ada password, <span className="font-semibold">kosongkan isian</span> untuk masuk.<br/>
                        Atau <span className="font-semibold">isi password baru</span> untuk meningkatkan keamanan akun.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  {mode === 'create' ? 'Buat Password' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'create' ? 'Minimal 4 karakter' : 'Masukkan password (kosongkan jika belum ada)'}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:ring-2 focus:ring-primary-200 transition-all ${
                      passwordTooShort 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-primary-200 focus:border-primary-500'
                    }`}
                    required={mode === 'create'}
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

              {/* Confirm Password (only for create mode) */}
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password kamu"
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:ring-2 focus:ring-primary-200 transition-all ${
                        passwordMismatch 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-primary-200 focus:border-primary-500'
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
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Forgot Password Link (only for login mode) */}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Lupa password?
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border-2 border-ink-300 text-ink-700 rounded-lg font-semibold hover:bg-ink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (mode === 'create' && (passwordTooShort || passwordMismatch || !confirmPassword || !password.trim()))
                  }
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mode === 'create' ? 'Membuat...' : 'Masuk...'}
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? 'Buat & Masuk' : 'Masuk'}
                    </>
                  )}
                </button>
              </div>

              {/* Tips for create mode */}
              {mode === 'create' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                  <p className="font-semibold mb-1">💡 Tips:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                    <li>Gunakan password yang mudah kamu ingat</li>
                    <li>Jangan bagikan password ke teman</li>
                    <li>Jika lupa, minta guru untuk reset</li>
                  </ul>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
