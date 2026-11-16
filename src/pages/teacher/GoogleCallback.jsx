import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TeacherContext } from '../../context/TeacherContext'
import { supabase } from '../../lib/supabaseClient'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const { login } = useContext(TeacherContext)
  const [status, setStatus] = useState('processing') // processing, success, error
  const [message, setMessage] = useState('Memproses login Google...')

  useEffect(() => {
    handleGoogleCallback()
  }, [])

  const handleGoogleCallback = async () => {
    try {
      // Get the session from Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        setStatus('error')
        setMessage('Gagal mendapatkan sesi. Silakan coba lagi.')
        setTimeout(() => navigate('/teacher/login'), 3000)
        return
      }

      const { user } = session

      // Extract user info from Google
      const googleId = user.id
      const email = user.email
      const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

      // Call our database function to upsert teacher
      const { data: teacherData, error: upsertError } = await supabase
        .rpc('upsert_teacher_google_oauth', {
          p_google_id: googleId,
          p_email: email,
          p_nama: name,
          p_avatar_url: avatarUrl
        })

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        setStatus('error')
        setMessage('Gagal menyimpan data. Silakan coba lagi.')
        setTimeout(() => navigate('/teacher/login'), 3000)
        return
      }

      if (!teacherData || teacherData.length === 0) {
        setStatus('error')
        setMessage('Gagal mendapatkan data guru. Silakan coba lagi.')
        setTimeout(() => navigate('/teacher/login'), 3000)
        return
      }

      const teacher = teacherData[0]

      // Store in TeacherContext
      login(teacher.id, teacher.nama, teacher.email)

      // Success
      setStatus('success')
      setMessage(teacher.is_new_user 
        ? 'Akun berhasil dibuat! Mengalihkan ke dashboard...' 
        : 'Login berhasil! Mengalihkan ke dashboard...'
      )

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard-guru')
      }, 2000)

    } catch (error) {
      console.error('Google callback error:', error)
      setStatus('error')
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
      setTimeout(() => navigate('/teacher/login'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-ink-900 mb-2">Memproses Login</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">Berhasil!</h2>
            <p className="text-gray-600">{message}</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Gagal</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/teacher/login')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Kembali ke Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
