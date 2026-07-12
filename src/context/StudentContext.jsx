import { createContext, useState, useEffect } from 'react'
import { clearAllAIChatHistory } from '../components/ai/AIChatPanel'

export const StudentContext = createContext()

export function StudentProvider({ children }) {
  const [studentId, setStudentId] = useState(null)
  const [kelasId, setKelasId] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [kodeKelas, setKodeKelas] = useState('')
  const [namaKelas, setNamaKelas] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage if exists
    const storedStudentId = localStorage.getItem('mentalytics_student_id')
    const storedKelasId = localStorage.getItem('mentalytics_kelas_id')
    const storedStudentName = localStorage.getItem('mentalytics_student_name')
    const storedKodeKelas = localStorage.getItem('mentalytics_kode_kelas')
    const storedNamaKelas = localStorage.getItem('mentalytics_nama_kelas')

    if (storedStudentId && storedKelasId) {
      setStudentId(storedStudentId)
      setKelasId(storedKelasId)
      setStudentName(storedStudentName || '')
      setKodeKelas(storedKodeKelas || '')
      setNamaKelas(storedNamaKelas || '')
    }
    
    setLoading(false)
  }, [])

  const isInClass = !!studentId && !!kelasId

  const leaveClass = () => {
    // Clear AI chat history
    clearAllAIChatHistory()
    
    // Clear localStorage
    localStorage.removeItem('mentalytics_student_id')
    localStorage.removeItem('mentalytics_kelas_id')
    localStorage.removeItem('mentalytics_student_name')
    localStorage.removeItem('mentalytics_kode_kelas')
    localStorage.removeItem('mentalytics_nama_kelas')
    
    // Reset state
    setStudentId(null)
    setKelasId(null)
    setStudentName('')
    setKodeKelas('')
    setNamaKelas('')
    
    console.log('✅ Logged out from class - All data cleared')
    
    // Redirect to home
    window.location.href = '/'
  }

  const value = {
    studentId,
    kelasId,
    studentName,
    kodeKelas,
    namaKelas,
    isInClass,
    loading,
    leaveClass
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink-600 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  )
}
