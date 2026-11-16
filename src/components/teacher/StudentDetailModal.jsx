import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Calendar, CheckCircle, Clock, FileText, BarChart3, TrendingUp, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function StudentDetailModal({ isOpen, onClose, student }) {
  const [detailData, setDetailData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && student) {
      loadDetailData()
    }
  }, [isOpen, student])

  const loadDetailData = async () => {
    try {
      setLoading(true)

      // Get detailed student data
      const [eqResponse, surveyResponse, solutionResponse, gqResponse, aiResponse, reflectionResponse] = await Promise.all([
        // Essential Question
        supabase
          .from('essential_question_answers')
          .select('*')
          .eq('siswa_id', student.id)
          .order('created_at', { ascending: false })
          .limit(1),
        
        // Survey Results
        supabase
          .from('survey_results')
          .select('*')
          .eq('siswa_id', student.id)
          .single(),
        
        // Solution
        supabase
          .from('solutions')
          .select('*')
          .eq('siswa_id', student.id)
          .single(),
        
        // Guiding Questions
        supabase
          .from('guiding_question_answers')
          .select('*')
          .eq('siswa_id', student.id)
          .order('no_pertanyaan', { ascending: true }),
        
        // AI Interactions
        supabase
          .from('ai_interactions')
          .select('*')
          .eq('siswa_id', student.id)
          .order('created_at', { ascending: false })
          .limit(5),

        // Reflection (check if exists)
        supabase
          .from('guiding_question_answers')
          .select('*')
          .eq('siswa_id', student.id)
          .gte('no_pertanyaan', 11) // Reflection questions are 11-15
      ])

      setDetailData({
        essentialQuestion: eqResponse.data?.[0] || null,
        survey: surveyResponse.data || null,
        solution: solutionResponse.data || null,
        guidingQuestions: gqResponse.data || [],
        aiInteractions: aiResponse.data || [],
        reflections: reflectionResponse.data || []
      })
    } catch (error) {
      console.error('Error loading student detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!student) return null

  return (
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-ink-900">{student.nama}</h2>
                    <p className="text-sm text-gray-600">
                      Bergabung: {new Date(student.created_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Memuat detail...</p>
                    </div>
                  </div>
                ) : detailData ? (
                  <>
                    {/* Progress Overview */}
                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
                      <h3 className="text-lg font-bold text-ink-900 mb-4">Progress Pembelajaran</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ProgressCard
                          icon={FileText}
                          title="Essential Question"
                          completed={!!detailData.essentialQuestion}
                          color="blue"
                        />
                        <ProgressCard
                          icon={BarChart3}
                          title="Survey"
                          completed={!!detailData.survey}
                          color="purple"
                        />
                        <ProgressCard
                          icon={TrendingUp}
                          title="Solution"
                          completed={!!detailData.solution}
                          color="green"
                        />
                      </div>
                    </div>

                    {/* Essential Question */}
                    {detailData.essentialQuestion && (
                      <DetailSection
                        icon={FileText}
                        title="Essential Question"
                        color="blue"
                      >
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {detailData.essentialQuestion.jawaban}
                          </p>
                          <p className="text-xs text-gray-500 mt-3">
                            Dijawab: {new Date(detailData.essentialQuestion.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </DetailSection>
                    )}

                    {/* Survey Results */}
                    {detailData.survey && (
                      <DetailSection
                        icon={BarChart3}
                        title="Hasil Survei"
                        color="purple"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700 font-medium mb-1">Skor Bullying</p>
                            <p className="text-3xl font-bold text-red-900">{detailData.survey.skor_bullying}</p>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-700 font-medium mb-1">Skor Kecemasan</p>
                            <p className="text-3xl font-bold text-yellow-900">{detailData.survey.skor_anxiety}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Diselesaikan: {new Date(detailData.survey.waktu_selesai).toLocaleString('id-ID')}
                        </p>
                      </DetailSection>
                    )}

                    {/* Guiding Questions */}
                    {detailData.guidingQuestions.length > 0 && (
                      <DetailSection
                        icon={MessageSquare}
                        title="Guiding Questions"
                        color="green"
                      >
                        <div className="space-y-3">
                          {detailData.guidingQuestions.filter(gq => gq.no_pertanyaan <= 10).map((gq, idx) => (
                            <div key={gq.id} className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Pertanyaan {gq.no_pertanyaan}
                              </p>
                              <p className="text-gray-800 leading-relaxed">
                                {gq.jawaban}
                              </p>
                            </div>
                          ))}
                        </div>
                      </DetailSection>
                    )}

                    {/* Solution */}
                    {detailData.solution && (
                      <DetailSection
                        icon={TrendingUp}
                        title="Solution (Diagram Pencar)"
                        color="green"
                      >
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Pola Hubungan</p>
                            <p className="text-lg font-bold text-primary-700 capitalize">
                              {detailData.solution.pola_hubungan || 'Tidak ada'}
                            </p>
                          </div>
                          {detailData.solution.siswa_perlu_perhatian && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-sm font-semibold text-yellow-800 mb-2">
                                Siswa yang Perlu Perhatian
                              </p>
                              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {detailData.solution.siswa_perlu_perhatian}
                              </p>
                            </div>
                          )}
                          {detailData.solution.rekomendasi && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm font-semibold text-blue-800 mb-2">Rekomendasi</p>
                              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {detailData.solution.rekomendasi}
                              </p>
                            </div>
                          )}
                        </div>
                      </DetailSection>
                    )}

                    {/* Reflections */}
                    {detailData.reflections.length > 0 && (
                      <DetailSection
                        icon={MessageSquare}
                        title="Refleksi Pembelajaran"
                        color="indigo"
                      >
                        <div className="space-y-3">
                          {detailData.reflections.map((ref, idx) => (
                            <div key={ref.id} className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Refleksi {ref.no_pertanyaan - 10}
                              </p>
                              <p className="text-gray-800 leading-relaxed">
                                {ref.jawaban}
                              </p>
                            </div>
                          ))}
                        </div>
                      </DetailSection>
                    )}

                    {/* AI Interactions */}
                    {detailData.aiInteractions.length > 0 && (
                      <DetailSection
                        icon={MessageSquare}
                        title="Interaksi dengan AI (Milo)"
                        color="purple"
                      >
                        <div className="space-y-3">
                          {detailData.aiInteractions.map((ai, idx) => (
                            <div key={ai.id} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                              <p className="text-xs text-purple-700 font-medium mb-2">
                                {ai.halaman} • {new Date(ai.created_at).toLocaleString('id-ID')}
                              </p>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Pertanyaan:</p>
                                  <p className="text-sm text-gray-800">{ai.prompt}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Jawaban Milo:</p>
                                  <p className="text-sm text-gray-800">{ai.response}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DetailSection>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Data tidak tersedia</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function ProgressCard({ icon: Icon, title, completed, color }) {
  const colors = {
    blue: completed ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-500',
    purple: completed ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-gray-100 border-gray-300 text-gray-500',
    green: completed ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500',
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5" />
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <p className="text-xs font-medium">
        {completed ? '✓ Selesai' : '○ Belum'}
      </p>
    </div>
  )
}

function DetailSection({ icon: Icon, title, color, children }) {
  const colors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    indigo: 'text-indigo-600',
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors[color]}`} />
        </div>
        <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}
