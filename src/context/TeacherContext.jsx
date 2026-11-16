import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const TeacherContext = createContext()

export function TeacherProvider({ children }) {
  const [teacherId, setTeacherId] = useState(null)
  const [teacherName, setTeacherName] = useState('')
  const [email, setEmail] = useState('')
  const [kelasId, setKelasId] = useState(null)
  const [kodeKelas, setKodeKelas] = useState('')
  const [namaKelas, setNamaKelas] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage if exists
    const storedTeacherId = localStorage.getItem('mentalytics_teacher_id')
    const storedKelasId = localStorage.getItem('mentalytics_teacher_kelas_id')
    const storedTeacherName = localStorage.getItem('mentalytics_teacher_name')
    const storedEmail = localStorage.getItem('mentalytics_teacher_email')
    const storedKodeKelas = localStorage.getItem('mentalytics_teacher_kode_kelas')
    const storedNamaKelas = localStorage.getItem('mentalytics_teacher_nama_kelas')

    if (storedTeacherId) {
      setTeacherId(storedTeacherId)
      setTeacherName(storedTeacherName || '')
      setEmail(storedEmail || '')
      
      if (storedKelasId) {
        setKelasId(storedKelasId)
        setKodeKelas(storedKodeKelas || '')
        setNamaKelas(storedNamaKelas || '')
      }
    }
    
    setLoading(false)
  }, [])

  const isAuthenticated = !!teacherId
  const isInClass = !!teacherId && !!kelasId

  const login = (id, name, emailAddress) => {
    setTeacherId(id)
    setTeacherName(name)
    setEmail(emailAddress)
    
    localStorage.setItem('mentalytics_teacher_id', id)
    localStorage.setItem('mentalytics_teacher_name', name)
    localStorage.setItem('mentalytics_teacher_email', emailAddress)
    
    console.log('✅ Teacher logged in:', name)
  }

  const joinClass = (classId, classCode, className) => {
    setKelasId(classId)
    setKodeKelas(classCode)
    setNamaKelas(className)
    
    localStorage.setItem('mentalytics_teacher_kelas_id', classId)
    localStorage.setItem('mentalytics_teacher_kode_kelas', classCode)
    localStorage.setItem('mentalytics_teacher_nama_kelas', className)
    
    console.log('✅ Teacher joined class:', className)
  }

  const leaveClass = () => {
    // Clear class data only, keep teacher login
    localStorage.removeItem('mentalytics_teacher_kelas_id')
    localStorage.removeItem('mentalytics_teacher_kode_kelas')
    localStorage.removeItem('mentalytics_teacher_nama_kelas')
    
    setKelasId(null)
    setKodeKelas('')
    setNamaKelas('')
    
    console.log('✅ Teacher left class')
  }

  const logout = () => {
    // Clear all data
    localStorage.removeItem('mentalytics_teacher_id')
    localStorage.removeItem('mentalytics_teacher_name')
    localStorage.removeItem('mentalytics_teacher_email')
    localStorage.removeItem('mentalytics_teacher_kelas_id')
    localStorage.removeItem('mentalytics_teacher_kode_kelas')
    localStorage.removeItem('mentalytics_teacher_nama_kelas')
    
    setTeacherId(null)
    setTeacherName('')
    setEmail('')
    setKelasId(null)
    setKodeKelas('')
    setNamaKelas('')
    
    console.log('✅ Teacher logged out - All data cleared')
  }

  const value = {
    teacherId,
    teacherName,
    email,
    kelasId,
    kodeKelas,
    namaKelas,
    isAuthenticated,
    isInClass,
    loading,
    login,
    joinClass,
    leaveClass,
    logout
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
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  )
}
