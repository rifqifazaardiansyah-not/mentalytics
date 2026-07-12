import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { StudentContext } from '../context/StudentContext'
import { AlertCircle } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isInClass, loading } = useContext(StudentContext)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isInClass) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <h2 className="text-2xl font-poppins font-bold text-ink-900 mb-3">
            Akses Terbatas
          </h2>
          <p className="text-ink-600 mb-6">
            Kamu harus bergabung ke kelas terlebih dahulu untuk mengakses halaman ini.
          </p>
          <div className="space-y-3">
            <a
              href="/kelas"
              className="block w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Bergabung ke Kelas
            </a>
            <a
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-ink-900 rounded-lg font-medium transition-all"
            >
              Kembali ke Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return children
}
