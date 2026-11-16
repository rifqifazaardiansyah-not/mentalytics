import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { TeacherContext } from '../context/TeacherContext'

export default function ProtectedTeacherRoute({ children }) {
  const { isAuthenticated, loading } = useContext(TeacherContext)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/teacher/login" replace />
  }

  return children
}
