import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, HelpCircle, BarChart3, ArrowRight, AlertCircle, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function GuidingQuestion() {
  const navigate = useNavigate()
  const { kelasId, studentName } = useContext(StudentContext)
  
  const [loading, setLoading] = useState(true)
  const [surveyData, setSurveyData] = useState([])
  const [correlationScore, setCorrelationScore] = useState(null)
  const [error, setError] = useState(null)
  const [siswaId, setSiswaId] = useState(null)
  const [saveStatus, setSaveStatus] = useState('') // 'saving' | 'saved' | 'error'
  
  // Data change detection
  const [dataHasChanged, setDataHasChanged] = useState(false)
  const [savedRespondentCount, setSavedRespondentCount] = useState(0)
  const [currentRespondentCount, setCurrentRespondentCount] = useState(0)
  
  // Data from eksplorasi diagram pencar
  const [eksplorasiData, setEksplorasiData] = useState(null)
  const [inputtedPoints, setInputtedPoints] = useState([])
  const [xAxisVar, setXAxisVar] = useState('bullying')
  const [yAxisVar, setYAxisVar] = useState('anxiety')
  const [xScale, setXScale] = useState(100)
  const [yScale, setYScale] = useState(100)

  // Answers state
  const [answers, setAnswers] = useState({
    q1: [], // Multiple choice
    q2: '', // Single choice
    q3: '', // Essay
    q4: '', // Essay
    q5Choice: '', // Ya/Tidak
    q5Essay: '', // Essay
    q6Choice: '', // Ya/Tidak
    q6Essay: '' // Essay
  })

  // Progress tracking
  const [completedQuestions, setCompletedQuestions] = useState([])

  // Chart dimensions
  const chartWidth = 500
  const chartHeight = 500
  const padding = 50

  // Fetch survey data and load existing answers
  useEffect(() => {
    async function fetchData() {
      if (!kelasId) {
        setError('Data kelas tidak ditemukan')
        setLoading(false)
        return
      }

      try {
        // Get siswa_id from localStorage
        const storedSiswaId = localStorage.getItem('mentalytics_student_id')
        if (!storedSiswaId) {
          setError('Data siswa tidak ditemukan. Silakan login ulang.')
          setLoading(false)
          return
        }
        setSiswaId(storedSiswaId)

        // Load eksplorasi diagram pencar progress FROM DATABASE (not localStorage)
        // This ensures we always get the student's actual saved work, not stale localStorage
        const { data: progressData, error: progressError } = await supabase
          .from('eksplorasi_diagram_progress')
          .select('*')
          .eq('siswa_id', storedSiswaId)
          .eq('kelas_id', kelasId)
          .single()

        if (progressData && !progressError) {
          console.log('📂 Loading diagram progress from DATABASE:', progressData)
          setEksplorasiData(progressData)
          
          // Use data from database
          if (progressData.inputted_points && progressData.inputted_points.length > 0) {
            setSavedRespondentCount(progressData.inputted_points.length)
            setInputtedPoints(progressData.inputted_points)
          }
          if (progressData.correlation_score !== undefined) {
            setCorrelationScore(progressData.correlation_score)
          }
          if (progressData.x_axis_var) setXAxisVar(progressData.x_axis_var)
          if (progressData.y_axis_var) setYAxisVar(progressData.y_axis_var)
          if (progressData.x_scale) setXScale(progressData.x_scale)
          if (progressData.y_scale) setYScale(progressData.y_scale)
        } else {
          console.log('📝 No diagram progress found in database')
        }

        // Fetch survey data (as fallback if no eksplorasi data)
        const { data: allStudents, error: studentsError } = await supabase
          .from('siswa')
          .select('id')
          .eq('kelas_id', kelasId)

        if (studentsError) throw studentsError

        const studentIds = allStudents.map(s => s.id)

        const { data: results, error: resultsError } = await supabase
          .from('survey_results')
          .select('*')
          .in('siswa_id', studentIds)
          .order('skor_bullying', { ascending: true })

        if (resultsError) throw resultsError

        if (!results || results.length === 0) {
          setError('Belum ada data survei dari kelas')
          setLoading(false)
          return
        }

        const formattedData = results.map((item, idx) => ({
          id: item.id,
          label: `Murid ${idx + 1}`,
          bullying: item.skor_bullying,
          anxiety: item.skor_anxiety
        }))

        setSurveyData(formattedData)
        setCurrentRespondentCount(formattedData.length)
        
        // Detect if data has changed
        if (progressData && formattedData.length !== savedRespondentCount) {
          setDataHasChanged(true)
          console.log(`⚠️ Data changed! Saved: ${savedRespondentCount}, Current: ${formattedData.length}`)
        }

        // Only calculate correlation if not loaded from database
        if (!progressData && formattedData.length > 0) {
          const xValues = formattedData.map(d => d.bullying)
          const yValues = formattedData.map(d => d.anxiety)
        
        const n = xValues.length
        const sumX = xValues.reduce((a, b) => a + b, 0)
        const sumY = yValues.reduce((a, b) => a + b, 0)
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
        const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
        const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0)
        
        const numerator = n * sumXY - sumX * sumY
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
        
        const correlation = numerator / denominator
        setCorrelationScore(correlation)
        }

        // Load existing answers
        const { data: existingAnswers, error: answersError } = await supabase
          .from('guiding_question_answers')
          .select('*')
          .eq('siswa_id', storedSiswaId)

        if (answersError) {
          console.error('Error loading answers:', answersError)
        } else if (existingAnswers && existingAnswers.length > 0) {
          // Parse and set existing answers
          const loadedAnswers = { ...answers }
          existingAnswers.forEach(item => {
            try {
              const parsedAnswer = JSON.parse(item.jawaban)
              if (item.no_pertanyaan === 1) loadedAnswers.q1 = parsedAnswer
              else if (item.no_pertanyaan === 2) loadedAnswers.q2 = parsedAnswer
              else if (item.no_pertanyaan === 3) loadedAnswers.q3 = parsedAnswer
              else if (item.no_pertanyaan === 4) loadedAnswers.q4 = parsedAnswer
              else if (item.no_pertanyaan === 5) {
                loadedAnswers.q5Choice = parsedAnswer.choice
                loadedAnswers.q5Essay = parsedAnswer.essay
              }
              else if (item.no_pertanyaan === 6) {
                loadedAnswers.q6Choice = parsedAnswer.choice
                loadedAnswers.q6Essay = parsedAnswer.essay
              }
            } catch (e) {
              console.error('Error parsing answer:', e)
            }
          })
          setAnswers(loadedAnswers)
        }

      } catch (err) {
        console.error('Error:', err)
        setError('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [kelasId])

  // Check question completion
  useEffect(() => {
    const completed = []
    
    if (answers.q1.length > 0) completed.push(1)
    if (answers.q2) completed.push(2)
    if (answers.q3.trim()) completed.push(3)
    if (answers.q4.trim()) completed.push(4)
    if (answers.q5Choice && answers.q5Essay.trim()) completed.push(5)
    if (answers.q6Choice && answers.q6Essay.trim()) completed.push(6)
    
    setCompletedQuestions(completed)
  }, [answers])

  // Auto-save answers to database with debounce
  useEffect(() => {
    if (!siswaId || loading) return

    const saveTimer = setTimeout(() => {
      saveAnswersToDatabase()
    }, 2000) // Debounce 2 detik

    return () => clearTimeout(saveTimer)
  }, [answers, siswaId, loading])

  const saveAnswersToDatabase = async () => {
    if (!siswaId) return

    setSaveStatus('saving')

    try {
      // Prepare answers data
      const answersToSave = [
        { no_pertanyaan: 1, jawaban: JSON.stringify(answers.q1) },
        { no_pertanyaan: 2, jawaban: JSON.stringify(answers.q2) },
        { no_pertanyaan: 3, jawaban: JSON.stringify(answers.q3) },
        { no_pertanyaan: 4, jawaban: JSON.stringify(answers.q4) },
        { no_pertanyaan: 5, jawaban: JSON.stringify({ choice: answers.q5Choice, essay: answers.q5Essay }) },
        { no_pertanyaan: 6, jawaban: JSON.stringify({ choice: answers.q6Choice, essay: answers.q6Essay }) }
      ]

      // Delete existing answers for this student
      await supabase
        .from('guiding_question_answers')
        .delete()
        .eq('siswa_id', siswaId)

      // Insert new answers
      const { error: insertError } = await supabase
        .from('guiding_question_answers')
        .insert(
          answersToSave.map(item => ({
            siswa_id: siswaId,
            no_pertanyaan: item.no_pertanyaan,
            jawaban: item.jawaban
          }))
        )

      if (insertError) throw insertError

      console.log('✅ Answers auto-saved successfully')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(''), 3000) // Clear status after 3s
    } catch (err) {
      console.error('❌ Error saving answers:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const valueToCoord = (value, max, dimension) => {
    return padding + (value / max) * (dimension - 2 * padding)
  }

  // Q1 Options
  const q1Options = [
    { id: 'a', text: 'Setiap titik pada diagram mewakili satu murid di kelas', correct: true },
    { id: 'b', text: 'Sumbu X menunjukkan skor pengalaman bullying murid', correct: true },
    { id: 'c', text: 'Sumbu Y menunjukkan skor pengalaman bullying murid', correct: false },
    { id: 'd', text: 'Sumbu Y menunjukkan skor kecemasan murid', correct: true }
  ]

  const handleQ1Change = (optionId) => {
    setAnswers(prev => ({
      ...prev,
      q1: prev.q1.includes(optionId)
        ? prev.q1.filter(id => id !== optionId)
        : [...prev.q1, optionId]
    }))
  }

  const allQuestionsComplete = completedQuestions.length === 6

  if (loading) {
    return (
      <LearningLayout showAI={true}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ink-600">Memuat data...</p>
          </div>
        </div>
      </LearningLayout>
    )
  }

  if (error) {
    return (
      <LearningLayout showAI={true}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <HelpCircle className="w-16 h-16 text-orange-500 mb-4" />
            <p className="text-lg text-ink-900 font-semibold mb-2">{error}</p>
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge/eksplorasi-diagram-pencar')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              Kembali ke Eksplorasi
            </button>
          </div>
        </div>
      </LearningLayout>
    )
  }

  return (
    <LearningLayout showAI={true}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <MiloCharacter pose="thinking" className="mb-3" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900 mb-1">
              Mari Analisis Diagram Kelompokmu! 🔍
            </p>
            <p className="text-sm text-ink-700">
              Jawab pertanyaan-pertanyaan berikut berdasarkan diagram pencar dari data kelasmu.
            </p>
          </MiloDialogBubble>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-2">
            Guiding Questions
          </h1>
          <p className="text-ink-600">
            Setelah diagram pencar kelompokmu terbentuk, jawablah pertanyaan berikut secara berurutan.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-primary-50 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-ink-900">Progress</p>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-primary-700">{completedQuestions.length}/6 Pertanyaan</p>
              {/* Save Status Indicator */}
              {saveStatus === 'saving' && (
                <span className="text-xs text-ink-600 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Tersimpan
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  ⚠️ Gagal menyimpan
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedQuestions.length / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Right: Diagram Pencar - tampil pertama di mobile */}
          <div className="lg:order-2">
            <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-gray-300 lg:sticky lg:top-8">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-ink-900">
                  Diagram Pencar Kelasmu
                </h3>
              </div>
              
              {/* Compact Data change warning - ONLY shown in diagram card */}
              {dataHasChanged && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900 mb-1">
                        ⚠️ Data Berubah!
                      </p>
                      <p className="text-xs text-orange-800 mb-3">
                        Responden pada diagram dibawah ini masih {savedRespondentCount} orang, 
                        sedangkan sekarang ada {currentRespondentCount} orang. 
                        Diagram ini masih pakai data lama.
                      </p>
                      <p className="text-xs text-red-600 mb-3">
                        Segera update diagram kamu!
                      </p>
                      <button
                        onClick={() => navigate('/kegiatan-belajar/the-challenge/eksplorasi-diagram')}
                        className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Update Diagram
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Simple correlation info card */}
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-ink-600 mb-1">Nilai Korelasi (r):</p>
                <p className="text-3xl font-bold text-primary-700">
                  {correlationScore !== null ? correlationScore.toFixed(3) : '—'}
                </p>
              </div>

              {/* Scatter plot - from student's eksplorasi */}
              <svg
                width="100%"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="border-2 border-gray-400 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
              >
                {/* Grid lines */}
                {Array.from({ length: 11 }, (_, i) => i * (xScale / 10)).map((val, i) => (
                  <g key={`grid-x-${i}`}>
                    <line
                      x1={valueToCoord(val, xScale, chartWidth)}
                      y1={padding}
                      x2={valueToCoord(val, xScale, chartWidth)}
                      y2={chartHeight - padding}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  </g>
                ))}
                {Array.from({ length: 11 }, (_, i) => i * (yScale / 10)).map((val, i) => (
                  <g key={`grid-y-${i}`}>
                    <line
                      x1={padding}
                      y1={valueToCoord(yScale - val, yScale, chartHeight)}
                      x2={chartWidth - padding}
                      y2={valueToCoord(yScale - val, yScale, chartHeight)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  </g>
                ))}

                {/* Main Axes with arrows */}
                {/* X-axis line */}
                <line
                  x1={padding}
                  y1={chartHeight - padding}
                  x2={chartWidth - padding - 15}
                  y2={chartHeight - padding}
                  stroke="#1f2937"
                  strokeWidth="3"
                />
                {/* X-axis arrow → */}
                <polygon
                  points={`${chartWidth - padding - 15},${chartHeight - padding - 6} ${chartWidth - padding},${chartHeight - padding} ${chartWidth - padding - 15},${chartHeight - padding + 6}`}
                  fill="#1f2937"
                />
                
                {/* Y-axis line */}
                <line
                  x1={padding}
                  y1={chartHeight - padding}
                  x2={padding}
                  y2={padding + 15}
                  stroke="#1f2937"
                  strokeWidth="3"
                />
                {/* Y-axis arrow ↑ */}
                <polygon
                  points={`${padding - 6},${padding + 15} ${padding},${padding} ${padding + 6},${padding + 15}`}
                  fill="#1f2937"
                />

                {/* Axis labels */}
                <text
                  x={chartWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#1f2937"
                  fontWeight="600"
                >
                  {xAxisVar === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'}
                  {xScale && ` (0-${xScale})`}
                </text>
                <text
                  x={20}
                  y={chartHeight / 2}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#1f2937"
                  fontWeight="600"
                  transform={`rotate(-90, 20, ${chartHeight / 2})`}
                >
                  {yAxisVar === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'}
                  {yScale && ` (0-${yScale})`}
                </text>

                {/* Scale markers */}
                {Array.from({ length: 6 }, (_, i) => i * (xScale / 5)).map((val) => (
                  <text
                    key={`x-${val}`}
                    x={valueToCoord(val, xScale, chartWidth)}
                    y={chartHeight - padding + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#374151"
                  >
                    {Math.round(val)}
                  </text>
                ))}
                {Array.from({ length: 6 }, (_, i) => i * (yScale / 5)).map((val) => (
                  <text
                    key={`y-${val}`}
                    x={padding - 20}
                    y={valueToCoord(yScale - val, yScale, chartHeight) + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#374151"
                  >
                    {Math.round(val)}
                  </text>
                ))}

                {/* Data points from student's input */}
                {inputtedPoints.map((point, idx) => {
                  const cx = valueToCoord(point.x, xScale, chartWidth)
                  const cy = valueToCoord(yScale - point.y, yScale, chartHeight)
                  
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="5"
                      fill="#3b82f6"
                      stroke="#1e40af"
                      strokeWidth="2"
                    />
                  )
                })}
              </svg>

              <p className="text-xs text-ink-500 mt-3 text-center">
                📊 Gunakan diagram ini untuk menjawab pertanyaan
              </p>
            </div>
          </div>

          {/* Left: Questions - tampil kedua di mobile */}
          <div className="space-y-6 lg:order-1">
            
            {/* Question 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedQuestions.includes(1) ? 'bg-green-500' : 'bg-primary-600'
                }`}>
                  {completedQuestions.includes(1) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">1</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">
                    Pilihan Ganda Jamak
                  </h3>
                  <p className="text-ink-700 mb-4">
                    Perhatikan diagram pencar hasil survei kelompokmu. <strong>Pilih semua pernyataan yang benar!</strong>
                  </p>
                  
                  <div className="space-y-3">
                    {q1Options.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers.q1.includes(option.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={answers.q1.includes(option.id)}
                          onChange={() => handleQ1Change(option.id)}
                          className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-ink-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Question 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedQuestions.includes(2) ? 'bg-green-500' : 'bg-primary-600'
                }`}>
                  {completedQuestions.includes(2) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">2</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">
                    Pilihan Ganda
                  </h3>
                  <p className="text-ink-700 mb-4">
                    Berdasarkan sebaran titik-titik pada diagram kelompokmu, arah polanya paling mendekati:
                  </p>
                  
                  <div className="space-y-3">
                    {['positif', 'negatif', 'tidak ada korelasi'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers.q2 === option
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="q2"
                          checked={answers.q2 === option}
                          onChange={() => setAnswers(prev => ({ ...prev, q2: option }))}
                          className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-ink-700 capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Question 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedQuestions.includes(3) ? 'bg-green-500' : 'bg-primary-600'
                }`}>
                  {completedQuestions.includes(3) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">3</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">
                    Esai Singkat
                  </h3>
                  <p className="text-ink-700 mb-4">
                    Seberapa kuat pola tersebut, dan apakah ada titik yang menyimpang jauh dari pola umum (outlier)? 
                    Jelaskan alasannya berdasarkan tampilan diagram kelompokmu.
                  </p>
                  
                  <textarea
                    value={answers.q3}
                    onChange={(e) => setAnswers(prev => ({ ...prev, q3: e.target.value }))}
                    placeholder="Tuliskan jawabanmu di sini..."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    rows="5"
                  />
                  <p className="text-xs text-ink-500 mt-2">
                    {answers.q3.length} karakter
                  </p>
                </div>
              </div>
            </div>

            {/* Question 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedQuestions.includes(4) ? 'bg-green-500' : 'bg-primary-600'
                }`}>
                  {completedQuestions.includes(4) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">4</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">
                    Esai Singkat
                  </h3>
                  <p className="text-ink-700 mb-4">
                    Lihat nilai r pada kartu ringkasan. Apakah nilainya mendekati 0, atau mendekati 1 atau -1? 
                    Apa artinya angka itu bagi hubungan antara bullying dan kecemasan di kelompokmu? 
                    Menurut kalian, kenapa bullying bisa berkaitan dengan tingkat kecemasan murid?
                  </p>
                  
                  <textarea
                    value={answers.q4}
                    onChange={(e) => setAnswers(prev => ({ ...prev, q4: e.target.value }))}
                    placeholder="Tuliskan jawabanmu di sini..."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    rows="5"
                  />
                  <p className="text-xs text-ink-500 mt-2">
                    {answers.q4.length} karakter
                  </p>
                </div>
              </div>
            </div>

            {/* Question 5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedQuestions.includes(5) ? 'bg-green-500' : 'bg-primary-600'
                }`}>
                  {completedQuestions.includes(5) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">5</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">
                    Pilihan Ya/Tidak + Esai Singkat
                  </h3>
                  <p className="text-ink-700 mb-4">
                    Apakah data yang kalian kumpulkan sudah cukup mewakili kondisi seluruh kelas?
                  </p>
                  
                  <div className="flex gap-4 mb-4">
                    {['ya', 'tidak'].map((option) => (
                      <label
                        key={option}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers.q5Choice === option
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="q5choice"
                          checked={answers.q5Choice === option}
                          onChange={() => setAnswers(prev => ({ ...prev, q5Choice: option }))}
                          className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-ink-700 font-medium capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  
                  <textarea
                    value={answers.q5Essay}
                    onChange={(e) => setAnswers(prev => ({ ...prev, q5Essay: e.target.value }))}
                    placeholder="Jelaskan alasanmu..."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    rows="4"
                  />
                  <p className="text-xs text-ink-500 mt-2">
                    {answers.q5Essay.length} karakter
                  </p>
                </div>
              </div>
            </div>

            {/* Question 6 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  completedQuestions.includes(6) ? 'bg-green-500' : 'bg-primary-600'
                }`}>
                  {completedQuestions.includes(6) ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold">6</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-2">
                    Pilihan Ya/Tidak + Esai Singkat
                  </h3>
                  <p className="text-ink-700 mb-4">
                    Apakah hubungan yang kalian temukan ini pasti berarti bullying menyebabkan kecemasan?
                  </p>
                  
                  <div className="flex gap-4 mb-4">
                    {['ya', 'tidak'].map((option) => (
                      <label
                        key={option}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          answers.q6Choice === option
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="q6choice"
                          checked={answers.q6Choice === option}
                          onChange={() => setAnswers(prev => ({ ...prev, q6Choice: option }))}
                          className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-ink-700 font-medium capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                  
                  <textarea
                    value={answers.q6Essay}
                    onChange={(e) => setAnswers(prev => ({ ...prev, q6Essay: e.target.value }))}
                    placeholder="Jelaskan alasanmu..."
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    rows="4"
                  />
                  <p className="text-xs text-ink-500 mt-2">
                    {answers.q6Essay.length} karakter
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {allQuestionsComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-400"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Semua Pertanyaan Terjawab!
                    </h3>
                    <p className="text-sm text-green-700">
                      Kamu sudah menyelesaikan semua guiding questions dengan baik!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/kegiatan-belajar/the-challenge/solution')}
                  className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Lanjut ke Solution
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

          </div>

          {/* End of questions column */}

        </div>

      </div>
    </LearningLayout>
  )
}

