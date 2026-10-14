import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Lightbulb, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import LearningLayout from '../../components/layout/LearningLayout'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function GuidingResourceLevel2() {
  const navigate = useNavigate()
  const { kelasId } = useContext(StudentContext)
  
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedDefinition, setSelectedDefinition] = useState(null)
  const [draggedDefinition, setDraggedDefinition] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  
  // Interactive challenge state
  const [challengeProgress, setChallengeProgress] = useState({
    independenComplete: false,
    dependenComplete: false
  })
  
  const [challengeAnswers, setChallengeAnswers] = useState({
    independen: '',
    dependen: ''
  })
  
  // Evaluation answers
  const [answers, setAnswers] = useState({
    q1: '', // Variabel yang diduga memengaruhi variabel lain disebut variabel ...
    q2: '', // Variabel yang nilainya dipengaruhi variabel lain disebut variabel ...
    q3: '', // Variabel independen digambarkan pada sumbu ...
    q4: '', // Variabel dependen digambarkan pada sumbu ...
    q5: '', // Pada data bullying dan kecemasan, variabel independennya adalah ...
    q6: '', // Pada data yang sama, variabel dependennya adalah ...
    q7: ''  // Titik (12, 25) berarti skor bullying = ... dan skor kecemasan = ...
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const siswaId = localStorage.getItem('mentalytics_student_id')
        if (!siswaId || !kelasId) return

        const { data, error } = await supabase
          .from('guiding_resource_level_progress')
          .select('*')
          .eq('siswa_id', siswaId)
          .eq('kelas_id', kelasId)
          .eq('level', 2)
          .single()

        if (data && !error) {
          setAnswers(data.answers || answers)
          setSubmitted(data.submitted || false)
          setShowEvaluation(data.show_evaluation || false)
          if (data.challenge_answers) {
            setChallengeAnswers(data.challenge_answers)
          }
          if (data.challenge_progress) {
            setChallengeProgress(data.challenge_progress)
          }
        }
      } catch (e) {
        console.error('Error loading progress:', e)
      }
    }
    loadProgress()
  }, [kelasId])

  // Definitions for drag-and-drop challenge
  const definitions = [
    'variabel yang digunakan untuk memprediksi variabel lainnya sebagai faktor yang memengaruhi atau menjadi penyebab perubahan. Variabel ini digambarkan pada sumbu X',
    'variabel yang nilainya dipengaruhi oleh variabel independen sebagai faktor yang diamati untuk melihat adanya perubahan akibat dari variabel independen. Variabel ini digambarkan pada sumbu Y'
  ]

  // Challenge handlers
  const handleDefinitionClick = (definition) => {
    if (!isMobile) return
    setSelectedDefinition(definition)
  }

  const handleDefinitionTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedDefinition) {
      setChallengeAnswers(prev => ({
        ...prev,
        [targetField]: selectedDefinition
      }))
      checkChallengeAnswer(targetField, selectedDefinition)
      setSelectedDefinition(null)
    }
  }

  const handleDefinitionDragStart = (e, definition) => {
    setDraggedDefinition(definition)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDefinitionDrop = (e, targetField) => {
    e.preventDefault()
    if (!draggedDefinition) return

    setChallengeAnswers(prev => ({
      ...prev,
      [targetField]: draggedDefinition
    }))

    checkChallengeAnswer(targetField, draggedDefinition)
    setDraggedDefinition(null)
  }

  const checkChallengeAnswer = (field, value) => {
    const correctAnswers = {
      independen: 'variabel yang digunakan untuk memprediksi variabel lainnya sebagai faktor yang memengaruhi atau menjadi penyebab perubahan. Variabel ini digambarkan pada sumbu X',
      dependen: 'variabel yang nilainya dipengaruhi oleh variabel independen sebagai faktor yang diamati untuk melihat adanya perubahan akibat dari variabel independen. Variabel ini digambarkan pada sumbu Y'
    }

    if (value === correctAnswers[field]) {
      setChallengeProgress(prev => ({
        ...prev,
        [field + 'Complete']: true
      }))
    } else {
      // Wrong answer - shake and clear after delay
      setTimeout(() => {
        setChallengeAnswers(prev => ({
          ...prev,
          [field]: ''
        }))
      }, 500)
    }
  }

  const removeChallengeAnswer = (field) => {
    setChallengeAnswers(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Evaluation handlers
  const handleInputChange = (question, value) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const siswaId = localStorage.getItem('mentalytics_student_id')
      if (!siswaId || !kelasId) {
        alert('Error: Session tidak valid')
        return
      }

      const progressData = {
        siswa_id: siswaId,
        kelas_id: kelasId,
        level: 2,
        answers,
        challenge_answers: challengeAnswers,
        challenge_progress: challengeProgress,
        submitted: true,
        show_evaluation: showEvaluation,
        completed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('guiding_resource_level_progress')
        .upsert(progressData, {
          onConflict: 'siswa_id,kelas_id,level'
        })

      if (error) throw error

      setSubmitted(true)
      console.log('✅ Jawaban berhasil disimpan')
    } catch (error) {
      console.error('Error saving progress:', error)
      alert('Gagal menyimpan jawaban. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    navigate('/kegiatan-belajar/the-challenge/guiding-resource-level-3')
  }

  const allChallengeComplete = challengeProgress.independenComplete && challengeProgress.dependenComplete

  // Scatter plot data points - Real data from class survey
  const scatterData = [
    { id: 1, bullying: 0, anxiety: 1 },
    { id: 2, bullying: 0, anxiety: 2 },
    { id: 3, bullying: 0, anxiety: 4 },
    { id: 4, bullying: 1, anxiety: 4 },
    { id: 5, bullying: 1, anxiety: 7 },
    { id: 6, bullying: 3, anxiety: 6 },
    { id: 7, bullying: 5, anxiety: 4 },
    { id: 8, bullying: 5, anxiety: 1 },
    { id: 9, bullying: 5, anxiety: 15 },
    { id: 10, bullying: 5, anxiety: 33 },
    { id: 11, bullying: 6, anxiety: 11 },
    { id: 12, bullying: 7, anxiety: 3 },
    { id: 13, bullying: 8, anxiety: 9 },
    { id: 14, bullying: 9, anxiety: 13 },
    { id: 15, bullying: 12, anxiety: 11 },
    { id: 16, bullying: 12, anxiety: 25 },
    { id: 17, bullying: 18, anxiety: 22 },
    { id: 18, bullying: 21, anxiety: 13 },
    { id: 19, bullying: 25, anxiety: 12 },
    { id: 20, bullying: 26, anxiety: 16 },
    { id: 21, bullying: 28, anxiety: 11 },
    { id: 22, bullying: 28, anxiety: 33 },
    { id: 23, bullying: 41, anxiety: 22 },
    { id: 24, bullying: 42, anxiety: 12 },
    { id: 25, bullying: 57, anxiety: 27 }
  ]

  // Calculate chart dimensions and scales - adjusted for real data
  const chartPadding = 60
  const chartWidth = 1200
  const chartHeight = 800
  const maxBullying = 60  // Max bullying score
  const maxAnxiety = 35   // Max anxiety score

  // Convert data coordinates to SVG coordinates
  const toSVGX = (bullying) => {
    return chartPadding + (bullying / maxBullying) * (chartWidth - chartPadding * 2)
  }

  const toSVGY = (anxiety) => {
    return chartHeight - chartPadding - (anxiety / maxAnxiety) * (chartHeight - chartPadding * 2)
  }

  // Calculate regression line (simple linear regression)
  const calculateRegressionLine = () => {
    const n = scatterData.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    
    scatterData.forEach(point => {
      sumX += point.bullying
      sumY += point.anxiety
      sumXY += point.bullying * point.anxiety
      sumX2 += point.bullying * point.bullying
    })
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Calculate start and end points
    const x1 = 0
    const y1 = intercept
    const x2 = maxBullying
    const y2 = slope * x2 + intercept
    
    return {
      x1: toSVGX(x1),
      y1: toSVGY(y1),
      x2: toSVGX(x2),
      y2: toSVGY(y2)
    }
  }

  const regressionLine = calculateRegressionLine()

  return (
    <LearningLayout
      pageTitle="Level 2: Jenis Variabel"
      breadcrumbs={[
        { label: 'Kegiatan Belajar', path: '/kegiatan-belajar' },
        { label: 'The Challenge', path: '/kegiatan-belajar/the-challenge' },
        { label: 'Guiding Resource Level 2' }
      ]}
      showAI={true}
      aiContext="guiding_resource_level_2"
    >
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Guiding Resource
          </h1>
        </motion.div>

        {/* Milo Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-100 to-primary-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 -mt-14">
              <div className="w-24 h-24">
                <MiloCharacter pose="explain" />
              </div>
            </div>
            <MiloDialogBubble tailPosition="" className="flex-1">
              <p className="text-base font-medium text-primary-900">
                Sekarang kita akan belajar tentang dua jenis variabel dalam diagram pencar! 📊
              </p>
              <p className="text-sm text-ink-700 mt-2">
                Cobalah seret definisi yang tepat ke kotak yang sesuai.
              </p>
            </MiloDialogBubble>
          </div>
        </motion.div>

        {/* Level Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full font-semibold mb-4">
            <TrendingUp className="w-5 h-5" />
            Level 2
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
            Jenis Variabel dalam Diagram Pencar
          </h1>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 space-y-6"
        >
          {/* Scatter Plot Diagram */}
          <div className="mb-8">
            <h3 className="font-semibold text-ink-900 mb-3 text-center">
              Diagram Pencar: Bullying vs Kecemasan
            </h3>
            <p className="text-sm text-center text-ink-600 mb-3 italic">
              Arahkan kursor ke titik untuk melihat detail data
            </p>
            
            <div className="bg-white rounded-lg p-3 border-2 border-primary-300 relative">
              <svg 
                className="w-full" 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                {/* Grid lines - light gray */}
                {[0, 10, 20, 30, 40, 50, 60].map((val) => (
                  <line 
                    key={`grid-v-${val}`}
                    x1={toSVGX(val)} 
                    y1={chartPadding} 
                    x2={toSVGX(val)} 
                    y2={chartHeight - chartPadding} 
                    stroke="#e5e7eb" 
                    strokeWidth="1"
                  />
                ))}
                {[0, 5, 10, 15, 20, 25, 30, 35].map((val) => (
                  <line 
                    key={`grid-h-${val}`}
                    x1={chartPadding} 
                    y1={toSVGY(val)} 
                    x2={chartWidth - chartPadding} 
                    y2={toSVGY(val)} 
                    stroke="#e5e7eb" 
                    strokeWidth="1"
                  />
                ))}
                
                {/* Axes */}
                <line 
                  x1={chartPadding} 
                  y1={chartPadding} 
                  x2={chartPadding} 
                  y2={chartHeight - chartPadding} 
                  stroke="#374151" 
                  strokeWidth="3" 
                />
                <line 
                  x1={chartPadding} 
                  y1={chartHeight - chartPadding} 
                  x2={chartWidth - chartPadding} 
                  y2={chartHeight - chartPadding} 
                  stroke="#374151" 
                  strokeWidth="3" 
                />
                
                {/* Regression/Trend line - dotted */}
                <line 
                  x1={regressionLine.x1} 
                  y1={regressionLine.y1} 
                  x2={regressionLine.x2} 
                  y2={regressionLine.y2} 
                  stroke="#ef4444" 
                  strokeWidth="3" 
                  strokeDasharray="8,8"
                  opacity="0.7"
                />
                
                {/* Data points - interactive */}
                {scatterData.map((point) => (
                  <g key={point.id}>
                    <circle 
                      cx={toSVGX(point.bullying)} 
                      cy={toSVGY(point.anxiety)} 
                      r={hoveredPoint === point.id ? 10 : 7}
                      fill={hoveredPoint === point.id ? "#2563eb" : "#3b82f6"}
                      stroke={hoveredPoint === point.id ? "#1e40af" : "none"}
                      strokeWidth="3"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}
                
                {/* Axis labels */}
                <text 
                  x={chartWidth / 2} 
                  y={chartHeight - 5} 
                  textAnchor="middle" 
                  fontSize="18" 
                  fill="#374151" 
                  fontWeight="600"
                >
                  Skor Bullying (0-60) → Variabel Independen (X)
                </text>
                <text 
                  x={15} 
                  y={chartHeight / 2} 
                  textAnchor="middle" 
                  fontSize="18" 
                  fill="#374151" 
                  fontWeight="600"
                  transform={`rotate(-90 15 ${chartHeight / 2})`}
                >
                  Skor Kecemasan (0-40) → Variabel Dependen (Y)
                </text>
                
                {/* Tick marks and numbers - X axis */}
                {[0, 10, 20, 30, 40, 50, 60].map((val) => (
                  <g key={`x-tick-${val}`}>
                    <line 
                      x1={toSVGX(val)} 
                      y1={chartHeight - chartPadding} 
                      x2={toSVGX(val)} 
                      y2={chartHeight - chartPadding + 8} 
                      stroke="#374151" 
                      strokeWidth="2"
                    />
                    <text 
                      x={toSVGX(val)} 
                      y={chartHeight - chartPadding + 28} 
                      textAnchor="middle" 
                      fontSize="14" 
                      fill="#6b7280"
                    >
                      {val}
                    </text>
                  </g>
                ))}
                
                {/* Tick marks and numbers - Y axis */}
                {[0, 5, 10, 15, 20, 25, 30, 35].map((val) => (
                  <g key={`y-tick-${val}`}>
                    <line 
                      x1={chartPadding - 8} 
                      y1={toSVGY(val)} 
                      x2={chartPadding} 
                      y2={toSVGY(val)} 
                      stroke="#374151" 
                      strokeWidth="2"
                    />
                    <text 
                      x={chartPadding - 15} 
                      y={toSVGY(val) + 5} 
                      textAnchor="end" 
                      fontSize="14" 
                      fill="#6b7280"
                    >
                      {val}
                    </text>
                  </g>
                ))}
              </svg>
              
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredPoint && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-2 right-2 bg-white rounded-lg shadow-xl border-2 border-blue-500 p-3 pointer-events-none z-10"
                  >
                    {scatterData.find(p => p.id === hoveredPoint) && (
                      <div className="text-sm">
                        <p className="font-semibold text-ink-900 mb-1">
                          Siswa #{scatterData.find(p => p.id === hoveredPoint).id}
                        </p>
                        <div className="space-y-1">
                          <p className="text-blue-600">
                            <span className="font-medium">Bullying (X):</span> {scatterData.find(p => p.id === hoveredPoint).bullying}
                          </p>
                          <p className="text-orange-600">
                            <span className="font-medium">Kecemasan (Y):</span> {scatterData.find(p => p.id === hoveredPoint).anxiety}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-3">
              Perhatikan: <span className="text-blue-600 font-semibold">Sumbu X (mendatar)</span> = Variabel Independen, 
              {' '}<span className="text-purple-600 font-semibold">Sumbu Y (tegak)</span> = Variabel Dependen
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-lg text-ink-700 leading-relaxed">
              Dalam sebuah diagram pencar, ada dua jenis variabel yang perlu kamu kenali, yaitu{' '}
              <span className="font-semibold text-blue-700">variabel independen</span> dan{' '}
              <span className="font-semibold text-purple-700">variabel dependen</span>.
            </p>

            {/* Interactive Challenge: Drag and Drop */}
            <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-300">
              <p className="text-sm font-semibold text-primary-800 mb-4">
                🎯 {isMobile ? 'Tap definisi, lalu tap kotak yang sesuai' : 'Seret definisi yang tepat ke kotak yang sesuai'}:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Variabel Independen Drop Zone */}
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      X
                    </div>
                    <h3 className="font-semibold text-blue-900">Variabel Independen (Bebas)</h3>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-ink-700 mb-2">
                      <span className="font-semibold">Variabel independen</span> adalah:
                    </p>
                    
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDefinitionDrop(e, 'independen')}
                      onClick={() => handleDefinitionTargetClick('independen')}
                      className={`min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        challengeAnswers.independen 
                          ? 'bg-blue-100 border-blue-500' 
                          : isMobile
                          ? 'bg-white border-blue-400 hover:border-blue-600 hover:bg-blue-100 cursor-pointer active:scale-95'
                          : 'bg-white border-blue-400 hover:border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {challengeAnswers.independen ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${challengeProgress.independenComplete ? '' : 'animate-shake'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-ink-700">{challengeAnswers.independen}</span>
                            {!challengeProgress.independenComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeChallengeAnswer('independen')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl leading-none"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-blue-400 text-sm flex items-center justify-center h-full">
                          {isMobile ? 'Tap di sini' : 'Seret definisi di sini'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Example - shown after correct answer */}
                  {challengeProgress.independenComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-white rounded-lg p-4 border border-blue-200"
                    >
                      <p className="text-sm text-ink-700">
                        <span className="font-semibold text-blue-700">Contoh:</span> Bullying adalah 
                        variabel independen, karena kita menggunakannya untuk memprediksi seberapa tinggi kecemasan 
                        seorang murid.
                      </p>
                    </motion.div>
                  )}

                  {/* Success indicator */}
                  {challengeProgress.independenComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                    >
                      <span className="text-lg">✅</span>
                      <span className="text-xs text-green-800 font-semibold">Benar!</span>
                    </motion.div>
                  )}
                </div>

                {/* Variabel Dependen Drop Zone */}
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      Y
                    </div>
                    <h3 className="font-semibold text-purple-900">Variabel Dependen (Terikat)</h3>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-ink-700 mb-2">
                      <span className="font-semibold">Variabel dependen</span> adalah:
                    </p>
                    
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDefinitionDrop(e, 'dependen')}
                      onClick={() => handleDefinitionTargetClick('dependen')}
                      className={`min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        challengeAnswers.dependen 
                          ? 'bg-purple-100 border-purple-500' 
                          : isMobile
                          ? 'bg-white border-purple-400 hover:border-purple-600 hover:bg-purple-100 cursor-pointer active:scale-95'
                          : 'bg-white border-purple-400 hover:border-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {challengeAnswers.dependen ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${challengeProgress.dependenComplete ? '' : 'animate-shake'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-ink-700">{challengeAnswers.dependen}</span>
                            {!challengeProgress.dependenComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeChallengeAnswer('dependen')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl leading-none"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-purple-400 text-sm flex items-center justify-center h-full">
                          {isMobile ? 'Tap di sini' : 'Seret definisi di sini'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Example - shown after correct answer */}
                  {challengeProgress.dependenComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-white rounded-lg p-4 border border-purple-200"
                    >
                      <p className="text-sm text-ink-700">
                        <span className="font-semibold text-purple-700">Contoh:</span> Skor kecemasan adalah 
                        variabel dependen, karena nilainya diduga dipengaruhi oleh bullying.
                      </p>
                    </motion.div>
                  )}

                  {/* Success indicator */}
                  {challengeProgress.dependenComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                    >
                      <span className="text-lg">✅</span>
                      <span className="text-xs text-green-800 font-semibold">Benar!</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Draggable Definitions */}
              {!allChallengeComplete && (
                <div className="pt-4 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-primary-800 mb-3">📝 Definisi yang tersedia:</p>
                  <div className="space-y-3">
                    {definitions.map((def, index) => {
                      const isUsed = challengeAnswers.independen === def || challengeAnswers.dependen === def
                      const isSelected = isMobile && selectedDefinition === def
                      const isIndependen = def.includes('memprediksi') || def.includes('sumbu X')
                      
                      return (
                        <div
                          key={index}
                          draggable={!isUsed && !isMobile}
                          onDragStart={(e) => !isMobile && handleDefinitionDragStart(e, def)}
                          onClick={() => !isUsed && handleDefinitionClick(def)}
                          className={`rounded-lg p-4 text-sm transition-all ${
                            isUsed 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                              : isSelected
                              ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 ring-4 ring-primary-300'
                              : isIndependen
                              ? 'bg-blue-100 border-2 border-blue-300 text-ink-800 cursor-move hover:bg-blue-200 active:scale-95'
                              : 'bg-purple-100 border-2 border-purple-300 text-ink-800 cursor-move hover:bg-purple-200 active:scale-95'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {!isUsed && !isMobile && (
                              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                              </svg>
                            )}
                            <span>{def}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {allChallengeComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-lg font-semibold text-green-900 mb-1">Hebat!</p>
                  <p className="text-sm text-green-700">Kamu sudah memahami perbedaan variabel independen dan dependen!</p>
                </motion.div>
              )}
            </div>

            {/* Additional explanation */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-bold text-ink-900">Cara Mudah Mengingat:</p>
                  <p className="text-ink-700 text-lg font-semibold">
                    <span className="text-blue-600">X memengaruhi</span>, <span className="text-purple-600">Y dipengaruhi</span>
                  </p>
                  <ul className="space-y-1 text-ink-700 text-sm">
                    <li>• <span className="font-semibold">Sumbu X</span> = Variabel Independen (yang memengaruhi)</li>
                    <li>• <span className="font-semibold">Sumbu Y</span> = Variabel Dependen (yang dipengaruhi)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Show Evaluation Button */}
        {allChallengeComplete && !showEvaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => setShowEvaluation(true)}
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all flex items-center gap-2 mx-auto"
            >
              Evaluasi
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Evaluation Section */}
        <AnimatePresence>
          {showEvaluation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-orange-200 space-y-6"
            >
              <div className="flex items-center gap-3 border-b-2 border-orange-200 pb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-ink-900">Evaluasi Level 2</h2>
                  <p className="text-sm text-ink-600">Isi jawaban dengan kata kunci yang tepat</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {/* Question 1 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">1. Variabel yang diduga memengaruhi variabel lain disebut variabel ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q1}
                    onChange={(e) => handleInputChange('q1', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 2 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">2. Variabel yang nilainya dipengaruhi variabel lain disebut variabel ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q2}
                    onChange={(e) => handleInputChange('q2', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 3 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">3. Variabel independen digambarkan pada sumbu ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q3}
                    onChange={(e) => handleInputChange('q3', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 4 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">4. Variabel dependen digambarkan pada sumbu ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q4}
                    onChange={(e) => handleInputChange('q4', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 5 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">5. Pada data bullying dan kecemasan, variabel independennya adalah ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q5}
                    onChange={(e) => handleInputChange('q5', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 6 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">6. Pada data yang sama, variabel dependennya adalah ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q6}
                    onChange={(e) => handleInputChange('q6', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 7 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">7. Titik (12, 25) berarti skor bullying = ... dan skor kecemasan = ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q7}
                    onChange={(e) => handleInputChange('q7', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>
              </div>

              {/* Submit/Next Button */}
              <div className="flex justify-center pt-4">
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={saving || Object.values(answers).some(a => !a)}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Jawaban'}
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="space-y-4 w-full">
                    {/* Success Message */}
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-green-900 mb-1">
                        Jawaban Berhasil Disimpan!
                      </p>
                      <p className="text-sm text-green-700">
                        Jawabanmu sudah tersimpan. Lanjut ke level berikutnya.
                      </p>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNext}
                      className="w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2"
                    >
                      Lanjut ke Level 3
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LearningLayout>
  )
}
