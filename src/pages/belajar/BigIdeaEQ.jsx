import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, ArrowRight, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { StudentContext } from '../../context/StudentContext'
import { ProgressContext } from '../../context/ProgressContext'
import { supabase } from '../../lib/supabaseClient'

export default function BigIdeaEQ() {
  const { studentId } = useContext(StudentContext)
  const { markStepCompleted, isStepCompleted } = useContext(ProgressContext)
  const [answer, setAnswer] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [existingAnswer, setExistingAnswer] = useState(null)

  // Check if user already answered
  useEffect(() => {
    checkExistingAnswer()
  }, [studentId])

  const checkExistingAnswer = async () => {
    try {
      const { data, error } = await supabase
        .from('essential_question_answers')
        .select('*')
        .eq('siswa_id', studentId)
        .single()

      if (data) {
        setExistingAnswer(data)
        setAnswer(data.jawaban)
        setIsSubmitted(true)
      }
    } catch (err) {
      // No existing answer, that's fine
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (answer.trim().length < 50) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (existingAnswer) {
        // Update existing answer
        const { error: updateError } = await supabase
          .from('essential_question_answers')
          .update({ jawaban: answer.trim() })
          .eq('id', existingAnswer.id)

        if (updateError) throw updateError
      } else {
        // Insert new answer
        const { error: insertError } = await supabase
          .from('essential_question_answers')
          .insert({
            siswa_id: studentId,
            jawaban: answer.trim()
          })

        if (insertError) throw insertError
      }

      setIsSubmitted(true)
      // Mark all steps up to big-idea as completed
      markStepCompleted('cp')
      markStepCompleted('tp')
      markStepCompleted('big-idea')
    } catch (err) {
      console.error('Error saving answer:', err)
      setError('Gagal menyimpan jawaban. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAnswer = () => {
    setIsSubmitted(false)
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
            <Lightbulb className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Big Idea & Essential Question
          </h1>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto">
            Mari kita eksplorasi konsep besar di balik pembelajaran ini
          </p>
        </motion.div>

        {/* Big Idea Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8 shadow-md"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-4 flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-primary-700" />
            Big Idea
          </h2>
          <p className="text-lg text-ink-900 leading-relaxed">
            <span className="font-semibold text-primary-700">Data dapat mengungkapkan pola hubungan</span> yang tidak terlihat secara kasat mata. 
            Dengan memahami hubungan antara variabel (seperti pengalaman bullying dan tingkat anxiety), 
            kita dapat <span className="font-semibold text-primary-700">membuat keputusan berbasis bukti</span> untuk 
            menciptakan lingkungan sekolah yang lebih aman dan mendukung kesehatan mental.
          </p>
        </motion.div>

        {/* Video & Milo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6">
            Tonton Video Ini 🎥
          </h2>

          <div className="grid md:grid-cols-[1fr,200px] gap-6 items-start">
            {/* Video Player */}
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl aspect-video">
                {/* Placeholder for video - will be replaced with actual video */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Video tentang Bullying & Mental Health</p>
                  <p className="text-sm text-gray-400 mt-2">Video akan tersedia di sini</p>
                </div>
                
                {/* TODO: Replace with actual video embed */}
                {/* <iframe 
                  src="VIDEO_URL_HERE"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe> */}
              </div>

              <div className="bg-primary-50 rounded-lg p-4">
                <p className="text-sm text-ink-700 leading-relaxed">
                  <span className="font-semibold">💡 Catatan:</span> Tonton video dengan seksama. 
                  Perhatikan bagaimana bullying dapat mempengaruhi kesehatan mental seseorang, 
                  terutama tingkat anxiety yang mereka alami.
                </p>
              </div>
            </div>

            {/* Milo Character */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-200/50 to-purple-200/50 rounded-full blur-xl"></div>
                <div className="relative">
                  <MiloCharacter pose="explain" />
                </div>
              </div>
              <MiloDialogBubble className="mt-4 text-sm" tailPosition="top">
                Perhatikan baik-baik ya! Video ini penting untuk memahami konteks masalah kita.
              </MiloDialogBubble>
            </motion.div>
          </div>
        </motion.div>

        {/* Essential Question Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary-600"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6">
            Essential Question 🤔
          </h2>

          <div className="bg-primary-50 rounded-xl p-6 mb-6">
            <p className="text-lg text-ink-900 font-medium leading-relaxed">
              Bagaimana kita dapat menggunakan data untuk mengetahui apakah terdapat hubungan 
              antara pengalaman <span className="text-primary-600 italic">bullying</span> dan tingkat <span className="text-primary-600 italic">anxiety</span> pada murid?
            </p>
          </div>

          {/* Answer Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-ink-700 mb-2">
                Tuliskan jawaban atau pemikiranmu di bawah ini:
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Contoh: Kita bisa mengumpulkan data tentang frekuensi bullying dan tingkat anxiety, lalu membuat scatter plot untuk melihat polanya..."
                className="w-full h-40 px-4 py-3 border-2 border-primary-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none text-ink-900"
                disabled={isSubmitted}
              />
              <p className="text-sm text-ink-500 mt-2">
                Minimal 50 karakter • {answer.length}/500
              </p>
            </div>

            {!isSubmitted ? (
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={answer.length < 50 || isSubmitting}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban'}
                </button>

                {error && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900 mb-1">
                    {existingAnswer ? 'Jawaban berhasil diperbarui! ✓' : 'Jawaban berhasil dikirim! ✓'}
                  </p>
                  <p className="text-sm text-green-700 mb-3">
                    Jawaban kamu: <span className="italic">"{answer}"</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleEditAnswer}
                    className="text-sm text-green-700 hover:text-green-900 font-medium underline"
                  >
                    Edit Jawaban
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>

        {/* Navigation */}
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Link
              to="/kegiatan-belajar/big-idea/forum-diskusi"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-poppins font-semibold text-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              Lanjut ke Forum Diskusi
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

