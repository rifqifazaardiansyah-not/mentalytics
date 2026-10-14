import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Lightbulb, TrendingUp, AlertTriangle, GripVertical, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import LearningLayout from '../../components/layout/LearningLayout'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function GuidingResourceLevel4() {
  const navigate = useNavigate()
  const { kelasId, studentId } = useContext(StudentContext)
  
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedDescription, setSelectedDescription] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredOutlierPoint, setHoveredOutlierPoint] = useState(null)
  
  // Interactive challenge state for Pola Penyebaran
  const [polaProgress, setPolaProgress] = useState({
    linearComplete: false,
    nonLinearComplete: false,
    allComplete: false
  })
  
  const [polaAnswers, setPolaAnswers] = useState({
    linear: '',
    nonLinear: ''
  })
  
  // Section E - Outlier state
  const [outlierProgress, setOutlierProgress] = useState({
    selectedPoints: [],
    completed: false
  })
  
  // Evaluation answers
  const [answers, setAnswers] = useState({
    q1: '', // Titik-titik yang mengikuti garis lurus membentuk pola ...
    q2: '', // Titik-titik yang melengkung membentuk pola ...
    q3: '', // Titik yang letaknya menyimpang jauh dari kumpulan titik lainnya disebut ...
    q4: '', // Pada diagram Level 1, titik (5, 33) termasuk ...
    q5: ''  // Sebuah outlier sebaiknya tidak langsung ...
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Data for Pola Penyebaran challenge
  const polaDescriptions = [
    {
      key: 'linear',
      text: 'Titik-titik mengikuti garis lurus (seperti pada contoh bullying dan kecemasan di atas).'
    },
    {
      key: 'nonLinear',
      text: 'Titik-titik melengkung atau membentuk pola tertentu yang tidak bisa digambarkan dengan garis lurus saja.'
    }
  ]
  
  // Data for Outlier challenge (Skor Bullying vs Skor Kecemasan)
  // Pola: Semakin tinggi bullying = Kecemasan semakin tinggi (korelasi positif)
  const outlierDataPoints = [
    // Normal pattern: bullying tinggi = kecemasan tinggi
    { id: 1, bullying: 0, anxiety: 2, isOutlier: false, label: 'Murid 1' },
    { id: 2, bullying: 2, anxiety: 4, isOutlier: false, label: 'Murid 2' },
    { id: 3, bullying: 3, anxiety: 6, isOutlier: false, label: 'Murid 3' },
    { id: 4, bullying: 5, anxiety: 8, isOutlier: false, label: 'Murid 4' },
    { id: 5, bullying: 7, anxiety: 11, isOutlier: false, label: 'Murid 5' },
    { id: 6, bullying: 9, anxiety: 14, isOutlier: false, label: 'Murid 6' },
    { id: 7, bullying: 11, anxiety: 16, isOutlier: false, label: 'Murid 7' },
    { id: 8, bullying: 13, anxiety: 19, isOutlier: false, label: 'Murid 8' },
    { id: 9, bullying: 15, anxiety: 22, isOutlier: false, label: 'Murid 9' },
    { id: 10, bullying: 17, anxiety: 25, isOutlier: false, label: 'Murid 10' },
    { id: 11, bullying: 19, anxiety: 28, isOutlier: false, label: 'Murid 11' },
    { id: 12, bullying: 21, anxiety: 31, isOutlier: false, label: 'Murid 12' },
    
    // Outliers: bullying rendah tapi kecemasan tinggi (menyimpang dari pola)
    { id: 13, bullying: 3, anxiety: 35, isOutlier: true, label: 'Murid X', reason: 'Mungkin punya masalah keluarga atau tekanan akademik' },
    { id: 14, bullying: 6, anxiety: 38, isOutlier: true, label: 'Murid Y', reason: 'Mungkin mengalami gangguan kecemasan atau masalah pribadi lain' }
  ]
  
  const correctOutliers = outlierDataPoints.filter(p => p.isOutlier).map(p => p.id)

  // Scatter plot data points - Real data from class survey (same as Level 1, 2, 3)
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

  // Calculate chart dimensions and scales
  const chartPadding = 60
  const chartWidth = 1200
  const chartHeight = 800
  const maxBullying = 60  // Max bullying score (same as Level 1, 2, 3)
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
          .eq('level', 4)
          .maybeSingle() // Use maybeSingle() instead of single() to avoid error when no data

        if (data && !error) {
          setAnswers(data.answers || answers)
          setSubmitted(data.submitted || false)
          setShowEvaluation(data.show_evaluation || false)
          if (data.pola_answers) {
            setPolaAnswers(data.pola_answers)
          }
          if (data.pola_progress) {
            setPolaProgress(data.pola_progress)
          }
          if (data.outlier_progress) {
            setOutlierProgress(data.outlier_progress)
          }
        }
      } catch (e) {
        // Silently handle - user can still use the page without saved progress
        console.log('No saved progress found for Level 4')
      }
    }
    loadProgress()
  }, [kelasId])

  // Pola challenge handlers
  const handlePolaClick = (description) => {
    if (!isMobile) return
    setSelectedDescription(description)
  }

  const handlePolaTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedDescription) {
      setPolaAnswers(prev => ({
        ...prev,
        [targetField]: selectedDescription
      }))
      checkPolaAnswer(targetField, selectedDescription)
      setSelectedDescription(null)
    }
  }

  const handlePolaDrop = (e, targetField) => {
    e.preventDefault()
    
    const droppedText = e.dataTransfer.getData('text/plain')
    if (!droppedText) return

    setPolaAnswers(prev => ({
      ...prev,
      [targetField]: droppedText
    }))

    checkPolaAnswer(targetField, droppedText)
  }

  const checkPolaAnswer = (field, value) => {
    const correctAnswers = {
      linear: 'Titik-titik mengikuti garis lurus (seperti pada contoh bullying dan kecemasan di atas).',
      nonLinear: 'Titik-titik melengkung atau membentuk pola tertentu yang tidak bisa digambarkan dengan garis lurus saja.'
    }

    if (value === correctAnswers[field]) {
      setPolaProgress(prev => {
        const newProgress = {
          ...prev,
          [field + 'Complete']: true
        }
        
        // Check if all complete
        if (newProgress.linearComplete && newProgress.nonLinearComplete) {
          newProgress.allComplete = true
        }
        
        return newProgress
      })
    } else {
      // Wrong answer - shake and clear after delay
      setTimeout(() => {
        setPolaAnswers(prev => ({
          ...prev,
          [field]: ''
        }))
      }, 500)
    }
  }

  const removePolaAnswer = (field) => {
    setPolaAnswers(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Outlier challenge handlers
  const handlePointClick = (pointId) => {
    if (outlierProgress.completed) return
    
    setOutlierProgress(prev => {
      const newSelected = prev.selectedPoints.includes(pointId)
        ? prev.selectedPoints.filter(id => id !== pointId)
        : [...prev.selectedPoints, pointId]
      
      // Check if all outliers are selected and no wrong points
      const isComplete = correctOutliers.every(id => newSelected.includes(id)) &&
                        newSelected.length === correctOutliers.length
      
      return {
        selectedPoints: newSelected,
        completed: isComplete
      }
    })
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
        level: 4,
        answers,
        pola_answers: polaAnswers,
        pola_progress: polaProgress,
        outlier_progress: outlierProgress,
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

  const handleNext = async () => {
    // Check if user has completed survey
    try {
      const { data: surveyData, error } = await supabase
        .from('survey_results')
        .select('id')
        .eq('siswa_id', studentId)
        .maybeSingle()
      
      if (surveyData && !error) {
        // User has completed survey, go to transisi-aktivitas
        navigate('/kegiatan-belajar/the-challenge/transisi-aktivitas')
      } else {
        // User hasn't completed survey, go to guiding-activities
        navigate('/kegiatan-belajar/the-challenge/guiding-activities')
      }
    } catch (error) {
      console.error('Error checking survey status:', error)
      // Default to guiding-activities if error
      navigate('/kegiatan-belajar/the-challenge/guiding-activities')
    }
  }

  return (
    <LearningLayout
      pageTitle="Level 4: Pola Penyebaran Titik"
      breadcrumbs={[
        { label: 'Kegiatan Belajar', path: '/kegiatan-belajar' },
        { label: 'The Challenge', path: '/kegiatan-belajar/the-challenge' },
        { label: 'Guiding Resource Level 4' }
      ]}
      showAI={true}
      aiContext="guiding_resource_level_4"
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
                <MiloCharacter pose="thinking" />
              </div>
            </div>
            <MiloDialogBubble tailPosition="" className="flex-1">
              <p className="text-base font-medium text-primary-900">
                Sekarang kita akan belajar tentang Pola Penyebaran Titik dan Outlier! 📏⚠️
              </p>
              <p className="text-sm text-ink-700 mt-2">
                Pola penyebaran titik bisa linear atau non-linear. Ada juga outlier yang perlu diperhatikan!
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
            Level 4
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
            Pola Penyebaran Titik
          </h1>
        </motion.div>

        {/* Scatter Plot Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-lg"
        >
          <h3 className="text-lg md:text-xl font-semibold text-ink-900 mb-2 text-center">
            Diagram Pencar: Bullying vs Kecemasan
          </h3>
          <p className="text-xs md:text-sm text-center text-ink-600 mb-4 italic">
            Perhatikan pola titik-titik data berikut
          </p>
          
          <div className="bg-white rounded-lg p-3 border-2 border-primary-300 relative">
            <svg 
              className="w-full" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              {/* Grid lines */}
              {[0, 5, 10, 15, 20, 25].map((val) => (
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
              
              {/* Regression line */}
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
              
              {/* Data points */}
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
                fontSize="14" 
                fill="#374151" 
                fontWeight="600"
                className="hidden md:block"
              >
                Skor Bullying (0-60)
              </text>
              <text 
                x={chartWidth / 2} 
                y={chartHeight - 5} 
                textAnchor="middle" 
                fontSize="11" 
                fill="#374151" 
                fontWeight="600"
                className="md:hidden"
              >
                Skor Bullying
              </text>
              <text 
                x={15} 
                y={chartHeight / 2} 
                textAnchor="middle" 
                fontSize="14" 
                fill="#374151" 
                fontWeight="600"
                transform={`rotate(-90 15 ${chartHeight / 2})`}
                className="hidden md:block"
              >
                Skor Kecemasan (0-35)
              </text>
              <text 
                x={15} 
                y={chartHeight / 2} 
                textAnchor="middle" 
                fontSize="11" 
                fill="#374151" 
                fontWeight="600"
                transform={`rotate(-90 15 ${chartHeight / 2})`}
                className="md:hidden"
              >
                Kecemasan
              </text>
              
              {/* Tick marks - X axis */}
              {[0, 5, 10, 15, 20, 25].map((val) => (
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
                    y={chartHeight - chartPadding + 24} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fill="#6b7280"
                  >
                    {val}
                  </text>
                </g>
              ))}
              
              {/* Tick marks - Y axis */}
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
                    y={toSVGY(val) + 4} 
                    textAnchor="end" 
                    fontSize="12" 
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
                          <span className="font-medium">Bullying:</span> {scatterData.find(p => p.id === hoveredPoint).bullying}
                        </p>
                        <p className="text-orange-600">
                          <span className="font-medium">Kecemasan:</span> {scatterData.find(p => p.id === hoveredPoint).anxiety}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-3">
            Setiap titik <span className="text-blue-600 font-semibold">●</span> mewakili satu siswa. 
            Garis putus-putus <span className="text-red-600 font-semibold">- - -</span> menunjukkan pola hubungan (garis regresi).
          </p>
        </motion.div>

        {/* Section: Pola Penyebaran Titik */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-lg space-y-6"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-4 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            Pola Penyebaran Titik
          </h2>

          <div className="space-y-6">
            <p className="text-ink-700 leading-relaxed">
              Selain arah dan kekuatan, kita juga perlu memperhatikan bagaimana titik-titik itu tersebar secara keseluruhan.
            </p>

            {/* Show Interactive Challenge if not completed */}
            {!polaProgress.allComplete ? (
              /* Interactive Challenge for Pola */
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  🎯 Tantangan: Cocokkan penjelasan dengan pola yang tepat!
                </h4>

                {/* Drop zones for Pola */}
                <div className="space-y-4 mb-6">
                  {/* Pola Linear */}
                  <div 
                    className={`flex gap-4 items-start bg-blue-50 rounded-lg p-4 border-2 transition-all ${
                      polaProgress.linearComplete ? 'border-blue-500 bg-blue-100' : 'border-blue-300 border-dashed'
                    } ${isMobile && selectedDescription && !polaAnswers.linear ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handlePolaDrop(e, 'linear')}
                    onClick={() => isMobile && handlePolaTargetClick('linear')}
                  >
                    <div className="flex-shrink-0 text-3xl">📏</div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-ink-900 mb-2">Pola Linear</h5>
                      {polaAnswers.linear ? (
                        <div className={`bg-white rounded-lg p-4 text-sm ${polaProgress.linearComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-ink-700">{polaAnswers.linear}</p>
                            {!polaProgress.linearComplete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removePolaAnswer('linear')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-blue-300 min-h-[80px] flex items-center justify-center">
                          <p className="text-sm text-blue-700 text-center">
                            {isMobile ? 'Ketuk untuk menempatkan' : 'Tarik penjelasan ke sini'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pola Non-linear */}
                  <div 
                    className={`flex gap-4 items-start bg-purple-50 rounded-lg p-4 border-2 transition-all ${
                      polaProgress.nonLinearComplete ? 'border-purple-500 bg-purple-100' : 'border-purple-300 border-dashed'
                    } ${isMobile && selectedDescription && !polaAnswers.nonLinear ? 'cursor-pointer hover:bg-purple-100' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handlePolaDrop(e, 'nonLinear')}
                    onClick={() => isMobile && handlePolaTargetClick('nonLinear')}
                  >
                    <div className="flex-shrink-0 text-3xl">〰️</div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-ink-900 mb-2">Pola Non-linear</h5>
                      {polaAnswers.nonLinear ? (
                        <div className={`bg-white rounded-lg p-4 text-sm ${polaProgress.nonLinearComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-ink-700">{polaAnswers.nonLinear}</p>
                            {!polaProgress.nonLinearComplete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removePolaAnswer('nonLinear')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-purple-300 min-h-[80px] flex items-center justify-center">
                          <p className="text-sm text-purple-700 text-center">
                            {isMobile ? 'Ketuk untuk menempatkan' : 'Tarik penjelasan ke sini'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Draggable descriptions for Pola */}
                {(!polaProgress.linearComplete || !polaProgress.nonLinearComplete) && (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-800 font-medium">
                      {isMobile ? 'Ketuk penjelasan, lalu ketuk kotak tujuan' : 'Pilih dan tarik penjelasan yang sesuai'}:
                    </p>
                    <div className="grid gap-3">
                      {polaDescriptions
                        .filter(desc => 
                          (desc.key === 'linear' && !polaAnswers.linear) || 
                          (desc.key === 'nonLinear' && !polaAnswers.nonLinear)
                        )
                        .map((desc) => (
                          <div
                            key={desc.key}
                            draggable={!isMobile}
                            onClick={() => handlePolaClick(desc.text)}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', desc.text)
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            className={`bg-white rounded-lg p-4 border-2 transition-all ${
                              selectedDescription === desc.text
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-blue-300 hover:border-blue-500'
                            } ${isMobile ? 'cursor-pointer active:scale-95' : 'cursor-move hover:shadow-md'}`}
                          >
                            <div className="flex items-start gap-3">
                              {!isMobile && (
                                <div className="flex-shrink-0 mt-1">
                                  <GripVertical className="w-4 h-4 text-blue-600" />
                                </div>
                              )}
                              <div className="text-sm text-ink-700">
                                <p>{desc.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Success message for Pola */}
                {polaProgress.allComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      Sempurna! Kamu sudah memahami pola penyebaran titik!
                    </p>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Explanation after completion - replaces the challenge */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500"
              >
                <h3 className="font-semibold text-blue-900 mb-3">Dua Jenis Pola:</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📏</div>
                      <div>
                        <h4 className="font-semibold text-ink-900 mb-1">Pola Linear</h4>
                        <p className="text-sm text-ink-700">
                          Titik-titik mengikuti garis lurus, seperti yang kita lihat pada contoh bullying dan kecemasan.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">〰️</div>
                      <div>
                        <h4 className="font-semibold text-ink-900 mb-1">Pola Non-linear</h4>
                        <p className="text-sm text-ink-700">
                          Titik-titik melengkung atau membentuk pola tertentu yang tidak bisa digambarkan dengan garis lurus saja.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>


        {/* Section: Outlier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-lg space-y-6"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-orange-600" />
            Memahami Outlier (Pencilan Data)
          </h2>

          <div className="space-y-6">
            <p className="text-ink-700 leading-relaxed">
              Yang juga penting untuk diperhatikan adalah <span className="font-semibold text-primary-700">outlier</span>, 
              yaitu titik data yang letaknya menyimpang jauh dari kumpulan titik lainnya.
            </p>

            <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Outlier Tidak Boleh Langsung Diabaikan!
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-4">
                Outlier bisa jadi tanda ada faktor lain yang belum kita pertimbangkan. Misalnya, seorang murid 
                yang skor bullyingnya rendah tapi kecemasannya sangat tinggi - mungkin dia punya masalah keluarga atau tekanan dari sumber lain.
              </p>
              <div className="bg-white rounded-lg p-4 border border-orange-300">
                <p className="text-sm text-ink-700 leading-relaxed">
                  Titik seperti ini justru bisa menjadi tanda bahwa ada murid yang{' '}
                  <span className="font-semibold text-orange-700">memerlukan perhatian lebih</span>.
                </p>
              </div>
            </div>

            {/* Interactive Challenge - Outlier */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                🎯 Tantangan: Identifikasi Outlier!
              </h4>
              <p className="text-sm text-amber-800 mb-4">
                Klik pada titik-titik yang menurut kamu adalah <strong>outlier</strong> (data yang menyimpang dari pola umum).
              </p>

              {/* Interactive Scatter Plot */}
              <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-orange-300">
                <h5 className="text-center text-sm md:text-base font-semibold text-ink-900 mb-2 md:mb-3">
                  Skor Bullying vs Skor Kecemasan
                </h5>
                <div className="relative">
                  <svg 
                    className="w-full h-auto" 
                    viewBox="0 0 400 300"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Grid lines */}
                    {[0, 5, 10, 15, 20, 25].map((val) => (
                      <line 
                        key={`grid-v-${val}`}
                        x1={60 + (val / 25) * 300} 
                        y1={20} 
                        x2={60 + (val / 25) * 300} 
                        y2={240} 
                        stroke="#e5e7eb" 
                        strokeWidth="1"
                      />
                    ))}
                    {[0, 10, 20, 30, 40].map((val) => (
                      <line 
                        key={`grid-h-${val}`}
                        x1={60} 
                        y1={240 - (val / 40) * 220} 
                        x2={360} 
                        y2={240 - (val / 40) * 220} 
                        stroke="#e5e7eb" 
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Axes */}
                    <line 
                      x1={60} 
                      y1={20} 
                      x2={60} 
                      y2={240} 
                      stroke="#374151" 
                      strokeWidth="2" 
                    />
                    <line 
                      x1={60} 
                      y1={240} 
                      x2={360} 
                      y2={240} 
                      stroke="#374151" 
                      strokeWidth="2" 
                    />
                    
                    {/* Trend line (positive correlation: bullying tinggi -> kecemasan tinggi) */}
                    <line 
                      x1={60 + (0 / 25) * 300} 
                      y1={240 - (2 / 40) * 220} 
                      x2={60 + (21 / 25) * 300} 
                      y2={240 - (31 / 40) * 220} 
                      stroke="#ef4444" 
                      strokeWidth="2" 
                      opacity="0.5" 
                      strokeDasharray="6 6" 
                    />
                    
                    {/* Data points */}
                    {outlierDataPoints.map(point => {
                      const isSelected = outlierProgress.selectedPoints.includes(point.id)
                      const isHovered = hoveredOutlierPoint === point.id
                      const isCorrect = outlierProgress.completed && point.isOutlier && isSelected
                      const isWrong = !outlierProgress.completed && isSelected && !point.isOutlier
                      
                      const cx = 60 + (point.bullying / 25) * 300
                      const cy = 240 - (point.anxiety / 40) * 220
                      
                      return (
                        <g key={point.id}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 8 : isSelected ? 6 : 5}
                            fill={
                              isCorrect ? "#10b981" : 
                              isWrong ? "#ef4444" :
                              isSelected ? "#f97316" : 
                              "#7fd9a8"
                            }
                            stroke={isSelected ? "#ea580c" : isHovered ? "#4b5f58" : "none"}
                            strokeWidth={isSelected ? "2" : "1"}
                            opacity={isHovered ? "0.9" : "0.8"}
                            className="cursor-pointer transition-all"
                            onClick={() => handlePointClick(point.id)}
                            onMouseEnter={() => setHoveredOutlierPoint(point.id)}
                            onMouseLeave={() => setHoveredOutlierPoint(null)}
                          />
                          {isSelected && !outlierProgress.completed && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r="10"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="1.5"
                              opacity="0.4"
                            />
                          )}
                        </g>
                      )
                    })}
                    
                    {/* Tick marks - X axis */}
                    {[0, 5, 10, 15, 20, 25].map((val) => (
                      <g key={`x-tick-${val}`}>
                        <line 
                          x1={60 + (val / 25) * 300} 
                          y1={240} 
                          x2={60 + (val / 25) * 300} 
                          y2={246} 
                          stroke="#374151" 
                          strokeWidth="1.5"
                        />
                        <text 
                          x={60 + (val / 25) * 300} 
                          y={260} 
                          textAnchor="middle" 
                          fontSize="12" 
                          fill="#6b7280"
                        >
                          {val}
                        </text>
                      </g>
                    ))}
                    
                    {/* Tick marks - Y axis */}
                    {[0, 10, 20, 30, 40].map((val) => (
                      <g key={`y-tick-${val}`}>
                        <line 
                          x1={54} 
                          y1={240 - (val / 40) * 220} 
                          x2={60} 
                          y2={240 - (val / 40) * 220} 
                          stroke="#374151" 
                          strokeWidth="1.5"
                        />
                        <text 
                          x={48} 
                          y={240 - (val / 40) * 220 + 4} 
                          textAnchor="end" 
                          fontSize="11" 
                          fill="#6b7280"
                        >
                          {val}
                        </text>
                      </g>
                    ))}
                    
                    {/* Axis labels */}
                    <text 
                      x={210} 
                      y={285} 
                      textAnchor="middle" 
                      fontSize="13" 
                      fill="#374151" 
                      fontWeight="600"
                    >
                      Skor Bullying
                    </text>
                    <text 
                      x={15} 
                      y={130} 
                      textAnchor="middle" 
                      fontSize="13" 
                      fill="#374151" 
                      fontWeight="600"
                      transform="rotate(-90 15 130)"
                    >
                      Skor Kecemasan
                    </text>
                  </svg>
                </div>

                {/* Tooltip on hover */}
                {hoveredOutlierPoint && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-300">
                    {(() => {
                      const point = outlierDataPoints.find(p => p.id === hoveredOutlierPoint)
                      if (!point) return null
                      return (
                        <div className="text-sm text-ink-700">
                          <p><strong>{point.label}:</strong></p>
                          <p>Skor bullying: {point.bullying}</p>
                          <p>Skor kecemasan: {point.anxiety}</p>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Selected count */}
                {!outlierProgress.completed && outlierProgress.selectedPoints.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-amber-800">
                      Kamu sudah memilih <strong>{outlierProgress.selectedPoints.length}</strong> titik
                    </p>
                  </div>
                )}
              </div>

              {/* Success message */}
              {outlierProgress.completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-green-100 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">
                    Hebat! Kamu berhasil mengidentifikasi outlier dengan benar!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Explanation after completion */}
            {outlierProgress.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-xl p-6"
              >
                <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary-700" />
                  Penjelasan Outlier yang Kamu Temukan
                </h3>
                <div className="space-y-3">
                  {outlierDataPoints
                    .filter(p => p.isOutlier)
                    .map(point => (
                      <div key={point.id} className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                        <p className="text-sm font-semibold text-ink-900 mb-1">{point.label}</p>
                        <p className="text-sm text-ink-700 mb-2">
                          <strong>Data:</strong> Bullying {point.bullying} (rendah), tapi kecemasan {point.anxiety} (tinggi)
                        </p>
                        <p className="text-sm text-orange-700 italic">
                          <strong>Kemungkinan penyebab:</strong> {point.reason}
                        </p>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Key takeaway */}
            {outlierProgress.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 border-2 border-teal-400"
              >
                <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-teal-600" />
                  Ingat!
                </h4>
                <p className="text-sm text-ink-700 leading-relaxed">
                  Outlier tidak boleh langsung diabaikan! Justru mereka bisa memberikan informasi penting 
                  tentang faktor-faktor khusus yang memerlukan perhatian lebih.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Show Evaluation Button */}
        {(polaProgress.allComplete && outlierProgress.completed && !showEvaluation) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => setShowEvaluation(true)}
              className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all flex items-center gap-2 mx-auto"
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
                  <h2 className="text-2xl font-bold text-ink-900">Evaluasi Level 4</h2>
                  <p className="text-sm text-ink-600">Isi jawaban dengan kata kunci yang tepat</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {/* Question 1 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">1. Titik-titik yang mengikuti garis lurus membentuk pola ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q1}
                    onChange={(e) => handleInputChange('q1', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 2 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">2. Titik-titik yang melengkung membentuk pola ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q2}
                    onChange={(e) => handleInputChange('q2', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 3 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">3. Titik yang letaknya menyimpang jauh dari kumpulan titik lainnya disebut ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q3}
                    onChange={(e) => handleInputChange('q3', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 4 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">4. Pada diagram Level 1, titik (5, 33) termasuk ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q4}
                    onChange={(e) => handleInputChange('q4', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>

                {/* Question 5 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">5. Sebuah outlier sebaiknya tidak langsung ...</span>
                  </label>
                  <input
                    type="text"
                    value={answers.q5}
                    onChange={(e) => handleInputChange('q5', e.target.value)}
                    disabled={submitted}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-lg ${
                      submitted
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    placeholder="Tulis jawaban di sini..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              {!submitted && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={saving || !answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Kirim Jawaban
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Success Message */}
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-100 border-2 border-green-500 rounded-xl p-6 flex items-center gap-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">Jawaban Tersimpan!</h3>
                    <p className="text-green-800 text-sm">Terima kasih sudah menyelesaikan Level 4.</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-primary-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all flex items-center gap-2"
            >
              Lanjut ke Guiding Activity
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Navigation hint */}
        {!(polaProgress.allComplete && outlierProgress.completed) && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              💡 <strong>Petunjuk:</strong> Selesaikan tantangan Pola Penyebaran dan Outlier untuk membuka evaluasi.
            </p>
          </div>
        )}
      </div>
    </LearningLayout>
  )
}
