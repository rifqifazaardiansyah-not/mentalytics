import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, ArrowRight, Users, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabaseClient'
import { StudentContext } from '../../context/StudentContext'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'

export default function ForumDiskusi() {
  const { studentId } = useContext(StudentContext)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [myAnswer, setMyAnswer] = useState(null)

  // Fetch initial answers
  useEffect(() => {
    fetchAnswers()
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('essential_answers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'essential_question_answers'
        },
        (payload) => {
          // Add new answer to the list
          const newAnswer = payload.new
          setAnswers((prev) => {
            // Avoid duplicates
            if (prev.find(a => a.id === newAnswer.id)) return prev
            return [...prev, newAnswer]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAnswers = async () => {
    try {
      const kelasId = localStorage.getItem('mentalytics_kelas_id')
      
      // First get all siswa in this class
      const { data: siswaInClass, error: siswaError } = await supabase
        .from('siswa')
        .select('id')
        .eq('kelas_id', kelasId)
      
      if (siswaError) throw siswaError
      
      const siswaIds = siswaInClass.map(s => s.id)
      
      // Then get answers from those siswa
      const { data, error } = await supabase
        .from('essential_question_answers')
        .select('id, jawaban, created_at, siswa_id')
        .in('siswa_id', siswaIds)
        .order('created_at', { ascending: true })

      if (error) throw error

      setAnswers(data || [])
      
      // Find current student's answer
      const mine = data?.find(a => a.siswa_id === studentId)
      setMyAnswer(mine)
    } catch (err) {
      console.error('Error fetching answers:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Forum Diskusi
          </h1>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto">
            Lihat perspektif teman-temanmu tentang Essential Question
          </p>
        </motion.div>

        {/* Milo Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 -mt-12">
              <div className="w-20 h-20">
                <MiloCharacter pose="happy" />
              </div>
            </div>
            <MiloDialogBubble tailPosition="top" className="flex-1">
              <p className="text-base">
                Wah, banyak sudut pandang menarik nih! 🎉 Di sini kamu bisa melihat jawaban 
                teman-teman sekelasmu. Perhatikan kesamaan dan perbedaan cara berpikir kalian. 
                <span className="font-semibold text-primary-700"> Jawaban baru akan muncul secara otomatis</span> tanpa perlu refresh!
              </p>
            </MiloDialogBubble>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <div className="flex items-center justify-center gap-3 text-ink-700">
            <Users className="w-6 h-6 text-primary-600" />
            <span className="text-lg">
              <span className="font-bold text-primary-700">{answers.length}</span> siswa telah menjawab
            </span>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-primary-600" />}
          </div>
        </motion.div>

        {/* Essential Question Reminder */}
        <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary-600">
          <h3 className="font-semibold text-ink-900 mb-2">Essential Question:</h3>
          <p className="text-ink-700 leading-relaxed">
            Bagaimana kita dapat menggunakan data untuk mengetahui apakah terdapat hubungan 
            antara pengalaman bullying dan tingkat anxiety pada murid?
          </p>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600" />
            Jawaban dari Teman-teman
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : answers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-ink-600">
                Belum ada jawaban. Jadilah yang pertama!
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {answers.map((answer, index) => {
                const isMyAnswer = answer.siswa_id === studentId
                
                return (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-xl p-6 shadow-md ${
                      isMyAnswer ? 'ring-2 ring-primary-500 bg-primary-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          isMyAnswer ? 'bg-primary-600' : 'bg-gray-400'
                        }`}>
                          {isMyAnswer ? '👤' : index + 1}
                        </div>
                        <div>
                          <p className={`font-semibold ${isMyAnswer ? 'text-primary-700' : 'text-ink-900'}`}>
                            {isMyAnswer ? 'Jawaban Kamu' : `Siswa ${index + 1}`}
                          </p>
                          <p className="text-xs text-ink-500">{formatTime(answer.created_at)}</p>
                        </div>
                      </div>
                      
                      {isMyAnswer && (
                        <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Kamu
                        </span>
                      )}
                    </div>
                    
                    <p className="text-ink-700 leading-relaxed pl-13">
                      {answer.jawaban}
                    </p>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>

        {/* My Answer Highlight (if exists) */}
        {myAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-500 rounded-xl p-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-900 mb-1">Jawaban kamu sudah tersimpan! ✓</p>
                <p className="text-sm text-green-700">
                  Teruslah membaca perspektif teman-teman yang lain untuk memperkaya pemahamanmu.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pt-4"
        >
          <Link
            to="/kegiatan-belajar/the-challenge"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-poppins font-semibold text-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            Lanjut ke The Challenge
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
