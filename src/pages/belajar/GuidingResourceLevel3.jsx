import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Lightbulb, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import LearningLayout from '../../components/layout/LearningLayout'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function GuidingResourceLevel3() {
  const navigate = useNavigate()
  const { kelasId } = useContext(StudentContext)
  
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedDescription, setSelectedDescription] = useState(null)
  const [draggedDescription, setDraggedDescription] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [correlationType, setCorrelationType] = useState('positif') // For scatter plot explorer
  
  // Interactive challenge state (2 steps)
  const [challengeProgress, setChallengeProgress] = useState({
    definitionComplete: false,
    positifComplete: false,
    negatifComplete: false,
    tidakAdaComplete: false,
    allComplete: false
  })
  
  const [challengeAnswers, setChallengeAnswers] = useState({
    definition: '',
    positif: '',
    negatif: '',
    tidakAda: ''
  })
  
  // Evaluation answers
  const [answers, setAnswers] = useState({
    q1: '', // Kecenderungan hubungan antara dua variabel disebut ...
    q2: '', // Titik-titik yang naik dari kiri bawah ke kanan atas menunjukkan korelasi ...
    q3: '', // Titik-titik yang turun dari kiri atas ke kanan bawah menunjukkan korelasi ...
    q4: '', // Titik-titik yang tersebar tanpa arah naik atau turun yang jelas berarti ... korelasi
    q5: '', // Titik-titik yang rapat dan hampir membentuk garis lurus menunjukkan korelasi yang ...
    q6: '', // Titik-titik yang punya arah tetapi tersebar jauh dari garis kecenderungan menunjukkan korelasi yang ...
    q7: ''  // Pada diagram bullying dan kecemasan di Level 1, jenis korelasinya adalah ...
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
          .eq('level', 3)
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

  const chartPadding = 60
  const chartWidth = 1200
  const chartHeight = 800
  const maxBullying = 60
  const maxAnxiety = 35

  const toSVGX = (bullying) => {
    return chartPadding + (bullying / maxBullying) * (chartWidth - chartPadding * 2)
  }

  const toSVGY = (anxiety) => {
    return chartHeight - chartPadding - (anxiety / maxAnxiety) * (chartHeight - chartPadding * 2)
  }

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

  // Data for different correlation types (for explorer)
  const dataPointsByType = {
    positif: [
      // Clear positive correlation pattern - different from main scatter plot
      { id: 1, bullying: 2, anxiety: 4 },
      { id: 2, bullying: 4, anxiety: 6 },
      { id: 3, bullying: 6, anxiety: 8 },
      { id: 4, bullying: 8, anxiety: 10 },
      { id: 5, bullying: 10, anxiety: 12 },
      { id: 6, bullying: 12, anxiety: 14 },
      { id: 7, bullying: 14, anxiety: 16 },
      { id: 8, bullying: 16, anxiety: 18 },
      { id: 9, bullying: 18, anxiety: 19 },
      { id: 10, bullying: 20, anxiety: 21 },
      { id: 11, bullying: 22, anxiety: 22 },
      { id: 12, bullying: 24, anxiety: 24 },
      { id: 13, bullying: 26, anxiety: 25 },
      { id: 14, bullying: 28, anxiety: 27 },
      { id: 15, bullying: 30, anxiety: 28 },
      { id: 16, bullying: 32, anxiety: 29 },
      { id: 17, bullying: 35, anxiety: 30 },
      { id: 18, bullying: 38, anxiety: 31 },
      { id: 19, bullying: 42, anxiety: 32 },
      { id: 20, bullying: 48, anxiety: 33 }
    ],
    negatif: [
      { id: 1, bullying: 5, anxiety: 33 },
      { id: 2, bullying: 8, anxiety: 31 },
      { id: 3, bullying: 10, anxiety: 30 },
      { id: 4, bullying: 12, anxiety: 28 },
      { id: 5, bullying: 15, anxiety: 27 },
      { id: 6, bullying: 18, anxiety: 25 },
      { id: 7, bullying: 20, anxiety: 24 },
      { id: 8, bullying: 22, anxiety: 22 },
      { id: 9, bullying: 25, anxiety: 20 },
      { id: 10, bullying: 28, anxiety: 18 },
      { id: 11, bullying: 30, anxiety: 17 },
      { id: 12, bullying: 32, anxiety: 15 },
      { id: 13, bullying: 35, anxiety: 14 },
      { id: 14, bullying: 38, anxiety: 12 },
      { id: 15, bullying: 40, anxiety: 11 },
      { id: 16, bullying: 42, anxiety: 10 },
      { id: 17, bullying: 45, anxiety: 8 },
      { id: 18, bullying: 48, anxiety: 7 },
      { id: 19, bullying: 50, anxiety: 6 },
      { id: 20, bullying: 52, anxiety: 5 }
    ],
    tidakAda: [
      { id: 1, bullying: 5, anxiety: 15 },
      { id: 2, bullying: 8, anxiety: 28 },
      { id: 3, bullying: 12, anxiety: 8 },
      { id: 4, bullying: 15, anxiety: 22 },
      { id: 5, bullying: 18, anxiety: 12 },
      { id: 6, bullying: 22, anxiety: 30 },
      { id: 7, bullying: 25, anxiety: 18 },
      { id: 8, bullying: 28, anxiety: 25 },
      { id: 9, bullying: 32, anxiety: 10 },
      { id: 10, bullying: 35, anxiety: 32 },
      { id: 11, bullying: 38, anxiety: 20 },
      { id: 12, bullying: 42, anxiety: 14 },
      { id: 13, bullying: 45, anxiety: 27 },
      { id: 14, bullying: 48, anxiety: 16 },
      { id: 15, bullying: 52, anxiety: 24 }
    ]
  }

  const currentExplorerData = dataPointsByType[correlationType]

  // Challenge Step 1: Definition matching
  const correlationDefinitions = [
    'kecenderungan hubungan antara dua variabel',
    'perbedaan nilai antara dua variabel',
    'jumlah total dari dua variabel'
  ]

  // Challenge Step 2: Correlation type descriptions
  const correlationDescriptions = [
    {
      key: 'positif',
      text: 'Nilai: 0 sampai +1 | Titik-titik cenderung naik dari kiri bawah ke kanan atas. Semakin besar X, semakin besar Y | Contoh: Semakin sering bullying, semakin tinggi kecemasan'
    },
    {
      key: 'negatif',
      text: 'Nilai: -1 sampai 0 | Titik-titik cenderung turun dari kiri atas ke kanan bawah. Semakin besar X, semakin kecil Y | Contoh: Semakin sering bersosialisasi, semakin rendah kecemasan'
    },
    {
      key: 'tidakAda',
      text: 'Nilai: mendekati 0 | Titik-titik tersebar begitu saja, tanpa arah yang jelas. Tidak ada hubungan yang berarti | Contoh: Warna baju tidak mempengaruhi kecemasan'
    }
  ]

  // Challenge handlers
  const handleDescriptionClick = (description) => {
    if (!isMobile) return
    setSelectedDescription(description)
  }

  const handleDescriptionTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedDescription) {
      setChallengeAnswers(prev => ({
        ...prev,
        [targetField]: selectedDescription
      }))
      checkChallengeAnswer(targetField, selectedDescription)
      setSelectedDescription(null)
    }
  }

  const handleDescriptionDragStart = (e, description) => {
    setDraggedDescription(description)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDescriptionDrop = (e, targetField) => {
    e.preventDefault()
    
    const droppedText = draggedDescription || e.dataTransfer.getData('text/plain')
    if (!droppedText) return

    setChallengeAnswers(prev => ({
      ...prev,
      [targetField]: droppedText
    }))

    checkChallengeAnswer(targetField, droppedText)
    setDraggedDescription(null)
  }

  const checkChallengeAnswer = (field, value) => {
    const correctAnswers = {
      definition: 'kecenderungan hubungan antara dua variabel',
      positif: 'Nilai: 0 sampai +1 | Titik-titik cenderung naik dari kiri bawah ke kanan atas. Semakin besar X, semakin besar Y | Contoh: Semakin sering bullying, semakin tinggi kecemasan',
      negatif: 'Nilai: -1 sampai 0 | Titik-titik cenderung turun dari kiri atas ke kanan bawah. Semakin besar X, semakin kecil Y | Contoh: Semakin sering bersosialisasi, semakin rendah kecemasan',
      tidakAda: 'Nilai: mendekati 0 | Titik-titik tersebar begitu saja, tanpa arah yang jelas. Tidak ada hubungan yang berarti | Contoh: Warna baju tidak mempengaruhi kecemasan'
    }

    if (value === correctAnswers[field]) {
      setChallengeProgress(prev => {
        const newProgress = {
          ...prev,
          [field + 'Complete']: true
        }
        
        // Check if all complete
        if (newProgress.positifComplete && newProgress.negatifComplete && newProgress.tidakAdaComplete) {
          newProgress.allComplete = true
        }
        
        return newProgress
      })
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
        level: 3,
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
    navigate('/kegiatan-belajar/the-challenge/guiding-resource-level-4')
  }

  return (
    <LearningLayout
      pageTitle="Level 3: Korelasi"
      breadcrumbs={[
        { label: 'Kegiatan Belajar', path: '/kegiatan-belajar' },
        { label: 'The Challenge', path: '/kegiatan-belajar/the-challenge' },
        { label: 'Guiding Resource Level 3' }
      ]}
      showAI={true}
      aiContext="guiding_resource_level_3"
    >
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-ink-900" />
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
                Kali ini kita akan belajar tentang korelasi! 📈📉
              </p>
              <p className="text-sm text-ink-700 mt-2">
                Cobalah cocokkan definisi dan deskripsi yang tepat untuk setiap jenis korelasi.
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
            <BarChart3 className="w-5 h-5" />
            Level 3
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
            Korelasi
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
              Perhatikan pola titik-titik data berikut
            </p>
            
            <div className="bg-white rounded-lg p-3 border-2 border-primary-300 relative">
              <svg 
                className="w-full" 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                style={{ maxWidth: '100%', height: 'auto' }}
              >
                {/* Grid lines */}
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
                  fontSize="18" 
                  fill="#374151" 
                  fontWeight="600"
                >
                  Skor Bullying (X)
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
                  Skor Kecemasan (Y)
                </text>
                
                {/* Tick marks - X axis */}
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
                {hoveredPoint && typeof hoveredPoint === 'number' && (
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
              Titik-titik naik dari kiri bawah ke kanan atas → menunjukkan ada <span className="font-bold text-green-600">korelasi</span>
            </p>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-lg text-ink-700 leading-relaxed">
              Pernahkah kamu memperhatikan teman yang sering di-bully terlihat lebih mudah cemas atau gelisah? 
              Bisa jadi ada hubungan antara kebiasaan itu dengan perasaannya. Nah, dalam statistika, hubungan 
              semacam ini bisa kita lihat lebih jelas lewat diagram pencar. Salah satu hal penting yang bisa 
              kita baca dari diagram pencar adalah <span className="font-bold text-primary-700">korelasi</span>.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
              <h3 className="font-bold text-blue-900 mb-2">Apa itu Korelasi?</h3>
              <p className="text-ink-700 leading-relaxed">
                <span className="font-semibold">Korelasi</span> adalah ukuran statistik untuk mengetahui sejauh 
                mana hubungan antara dua variabel atau lebih.
              </p>
            </div>

            {/* Challenge Step 1: Match definition */}
            <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-300">
              <p className="text-sm font-semibold text-primary-800 mb-4">
                🎯 {isMobile ? 'Tap definisi yang tepat' : 'Pilih definisi yang tepat untuk korelasi'}:
              </p>
              
              <div className="mb-4">
                <p className="text-ink-700 font-medium mb-3">Korelasi adalah...</p>
                
                {/* Drop Zone for definition */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDescriptionDrop(e, 'definition')}
                  onClick={() => handleDescriptionTargetClick('definition')}
                  className={`min-h-[80px] p-4 border-2 border-dashed rounded-lg transition-all ${
                    challengeAnswers.definition 
                      ? 'bg-primary-100 border-primary-500' 
                      : isMobile
                      ? 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-100 cursor-pointer active:scale-95'
                      : 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {challengeAnswers.definition ? (
                    <div className={`bg-white rounded-lg p-4 border border-gray-200 ${challengeProgress.definitionComplete ? '' : 'animate-shake'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-ink-700">{challengeAnswers.definition}</span>
                        {!challengeProgress.definitionComplete && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              removeChallengeAnswer('definition')
                            }}
                            className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl leading-none"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-primary-400 text-sm flex items-center justify-center h-full">
                      {isMobile ? 'Tap di sini' : 'Seret definisi di sini'}
                    </span>
                  )}
                </div>
              </div>

              {/* Draggable definitions */}
              {!challengeProgress.definitionComplete && (
                <div className="pt-4 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-primary-800 mb-3">📝 Pilihan:</p>
                  <div className="space-y-3">
                    {correlationDefinitions.map((def, index) => {
                      const isUsed = challengeAnswers.definition === def
                      const isSelected = isMobile && selectedDescription === def
                      
                      return (
                        <div
                          key={index}
                          draggable={!isUsed && !isMobile}
                          onDragStart={(e) => !isMobile && handleDescriptionDragStart(e, def)}
                          onClick={() => !isUsed && handleDescriptionClick(def)}
                          className={`rounded-lg p-4 text-sm transition-all ${
                            isUsed 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                              : isSelected
                              ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 ring-4 ring-primary-300'
                              : 'bg-white border-2 border-primary-300 text-ink-800 cursor-move hover:bg-primary-50 active:scale-95'
                          }`}
                        >
                          {def}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Success Message Step 1 */}
              {challengeProgress.definitionComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-900">Benar!</p>
                    <p className="text-sm text-green-800">Korelasi memang menunjukkan kecenderungan hubungan!</p>
                  </div>
                </motion.div>
              )}

              {/* Additional explanation */}
              {challengeProgress.definitionComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  <p className="text-ink-700 leading-relaxed">
                    Sederhananya, korelasi menjawab pertanyaan:{' '}
                    <span className="italic">"Kalau variabel yang satu berubah, apakah variabel yang lain juga ikut berubah dengan cara tertentu?"</span>
                  </p>
                  <p className="text-sm text-ink-600">
                    Untuk mengetahuinya, kita cukup memperhatikan <span className="font-semibold">arah kemiringan titik-titik</span> pada diagram pencar.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Challenge Step 2: Match correlation types - only show after step 1 complete */}
            {challengeProgress.definitionComplete && !challengeProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-xl p-6 border-2 border-primary-300 space-y-4"
              >
                <p className="text-sm font-semibold text-primary-800">
                  🎯 Sekarang cocokkan deskripsi dengan jenis korelasi yang tepat:
                </p>
                
                {/* 3 Correlation Type Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Korelasi Positif */}
                  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-green-700">↗</span>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-3 text-center">Korelasi Positif</h3>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDescriptionDrop(e, 'positif')}
                      onClick={() => handleDescriptionTargetClick('positif')}
                      className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        challengeAnswers.positif 
                          ? 'bg-green-100 border-green-500' 
                          : isMobile
                          ? 'bg-white border-green-400 hover:border-green-600 hover:bg-green-100 cursor-pointer active:scale-95'
                          : 'bg-white border-green-400 hover:border-green-600 hover:bg-green-50'
                      }`}
                    >
                      {challengeAnswers.positif ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${challengeProgress.positifComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="space-y-2 flex-1">
                              {challengeAnswers.positif.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className="bg-green-50 rounded p-2">
                                    <p className="text-xs text-green-800 font-semibold">{part}</p>
                                  </div>
                                ) : i === 1 ? (
                                  <p key={i} className="text-ink-700">{part}</p>
                                ) : (
                                  <p key={i} className="text-xs text-ink-600 italic">{part}</p>
                                )
                              ))}
                            </div>
                            {!challengeProgress.positifComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeChallengeAnswer('positif')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-green-400 text-sm">
                          {isMobile ? 'Tap di sini' : 'Seret deskripsi'}
                        </div>
                      )}
                    </div>

                    {challengeProgress.positifComplete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-xs text-green-800 font-semibold">Benar!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Korelasi Negatif */}
                  <div className="bg-red-50 rounded-xl p-6 border-2 border-red-300">
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-red-700">↘</span>
                    </div>
                    <h3 className="font-semibold text-red-900 mb-3 text-center">Korelasi Negatif</h3>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDescriptionDrop(e, 'negatif')}
                      onClick={() => handleDescriptionTargetClick('negatif')}
                      className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        challengeAnswers.negatif 
                          ? 'bg-red-100 border-red-500' 
                          : isMobile
                          ? 'bg-white border-red-400 hover:border-red-600 hover:bg-red-100 cursor-pointer active:scale-95'
                          : 'bg-white border-red-400 hover:border-red-600 hover:bg-red-50'
                      }`}
                    >
                      {challengeAnswers.negatif ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${challengeProgress.negatifComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="space-y-2 flex-1">
                              {challengeAnswers.negatif.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className="bg-red-50 rounded p-2">
                                    <p className="text-xs text-red-800 font-semibold">{part}</p>
                                  </div>
                                ) : i === 1 ? (
                                  <p key={i} className="text-ink-700">{part}</p>
                                ) : (
                                  <p key={i} className="text-xs text-ink-600 italic">{part}</p>
                                )
                              ))}
                            </div>
                            {!challengeProgress.negatifComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeChallengeAnswer('negatif')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-red-400 text-sm">
                          {isMobile ? 'Tap di sini' : 'Seret deskripsi'}
                        </div>
                      )}
                    </div>

                    {challengeProgress.negatifComplete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-xs text-green-800 font-semibold">Benar!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Tidak Ada Korelasi */}
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-gray-700">•••</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-center">Tidak Ada Korelasi</h3>
                    
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDescriptionDrop(e, 'tidakAda')}
                      onClick={() => handleDescriptionTargetClick('tidakAda')}
                      className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        challengeAnswers.tidakAda 
                          ? 'bg-gray-100 border-gray-500' 
                          : isMobile
                          ? 'bg-white border-gray-400 hover:border-gray-600 hover:bg-gray-100 cursor-pointer active:scale-95'
                          : 'bg-white border-gray-400 hover:border-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {challengeAnswers.tidakAda ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${challengeProgress.tidakAdaComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="space-y-2 flex-1">
                              {challengeAnswers.tidakAda.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className="bg-gray-50 rounded p-2">
                                    <p className="text-xs text-gray-800 font-semibold">{part}</p>
                                  </div>
                                ) : i === 1 ? (
                                  <p key={i} className="text-ink-700">{part}</p>
                                ) : (
                                  <p key={i} className="text-xs text-ink-600 italic">{part}</p>
                                )
                              ))}
                            </div>
                            {!challengeProgress.tidakAdaComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeChallengeAnswer('tidakAda')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          {isMobile ? 'Tap di sini' : 'Seret deskripsi'}
                        </div>
                      )}
                    </div>

                    {challengeProgress.tidakAdaComplete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-xs text-green-800 font-semibold">Benar!</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Draggable descriptions */}
                <div className="pt-4 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-primary-800 mb-3">📝 Deskripsi yang tersedia:</p>
                  <div className="space-y-3">
                    {correlationDescriptions.map((item, index) => {
                      const isUsed = challengeAnswers.positif === item.text || 
                                     challengeAnswers.negatif === item.text || 
                                     challengeAnswers.tidakAda === item.text
                      const isSelected = isMobile && selectedDescription === item.text
                      
                      return (
                        <div
                          key={index}
                          draggable={!isUsed && !isMobile}
                          onDragStart={(e) => !isMobile && handleDescriptionDragStart(e, item.text)}
                          onClick={() => !isUsed && handleDescriptionClick(item.text)}
                          className={`rounded-lg p-4 text-sm transition-all ${
                            isUsed 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                              : isSelected
                              ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 ring-4 ring-primary-300'
                              : item.key === 'positif'
                              ? 'bg-green-100 border-2 border-green-300 text-ink-800 cursor-move hover:bg-green-200 active:scale-95'
                              : item.key === 'negatif'
                              ? 'bg-red-100 border-2 border-red-300 text-ink-800 cursor-move hover:bg-red-200 active:scale-95'
                              : 'bg-gray-100 border-2 border-gray-300 text-ink-800 cursor-move hover:bg-gray-200 active:scale-95'
                          }`}
                        >
                          <div className="space-y-1">
                            {item.text.split(' | ').map((part, i) => (
                              <p key={i} className={i === 0 ? 'font-semibold' : i === 2 ? 'italic' : ''}>
                                {part}
                              </p>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Message - All Complete */}
            {challengeProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-lg font-semibold text-green-900 mb-1">Luar Biasa!</p>
                <p className="text-sm text-green-700">Kamu sudah memahami semua jenis korelasi!</p>
              </motion.div>
            )}

            {/* Interactive Scatter Plot Explorer - Show after challenge complete */}
            {challengeProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-ink-700 text-center leading-relaxed">
                  Sekarang kamu bisa membedakan korelasi positif, negatif, dan tidak ada korelasi. 
                  Mari kita lihat pola-pola ini lebih jelas dengan diagram pencar interaktif di bawah!
                </p>

                {/* Correlation Type Selector Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setCorrelationType('positif')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      correlationType === 'positif'
                        ? 'bg-green-100 border-green-500 ring-4 ring-green-200'
                        : 'bg-green-50 border-green-300 hover:bg-green-100'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-green-700">↗</span>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-2 text-center">Korelasi Positif</h3>
                    <p className="text-xs text-green-800 mb-2">Nilai: 0 sampai +1</p>
                    <p className="text-sm text-ink-700 mb-2">
                      Titik-titik naik dari kiri bawah ke kanan atas. Semakin besar X, semakin besar Y.
                    </p>
                    <p className="text-xs text-ink-600 italic">
                      Contoh: Semakin sering bullying, semakin tinggi kecemasan
                    </p>
                  </button>

                  <button
                    onClick={() => setCorrelationType('negatif')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      correlationType === 'negatif'
                        ? 'bg-red-100 border-red-500 ring-4 ring-red-200'
                        : 'bg-red-50 border-red-300 hover:bg-red-100'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-red-700">↘</span>
                    </div>
                    <h3 className="font-semibold text-red-900 mb-2 text-center">Korelasi Negatif</h3>
                    <p className="text-xs text-red-800 mb-2">Nilai: -1 sampai 0</p>
                    <p className="text-sm text-ink-700 mb-2">
                      Titik-titik turun dari kiri atas ke kanan bawah. Semakin besar X, semakin kecil Y.
                    </p>
                    <p className="text-xs text-ink-600 italic">
                      Contoh: Semakin sering bersosialisasi, semakin rendah kecemasan
                    </p>
                  </button>

                  <button
                    onClick={() => setCorrelationType('tidakAda')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      correlationType === 'tidakAda'
                        ? 'bg-gray-100 border-gray-500 ring-4 ring-gray-200'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-gray-700">•••</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-center">Tidak Ada Korelasi</h3>
                    <p className="text-xs text-gray-800 mb-2">Nilai: mendekati 0</p>
                    <p className="text-sm text-ink-700 mb-2">
                      Titik-titik tersebar tanpa arah yang jelas. Tidak ada hubungan yang berarti.
                    </p>
                    <p className="text-xs text-ink-600 italic">
                      Contoh: Warna baju tidak mempengaruhi kecemasan
                    </p>
                  </button>
                </div>

                <p className="text-sm text-center text-ink-600 italic">
                  💡 Klik salah satu kartu korelasi di atas untuk melihat pola diagram pencar yang berbeda!
                </p>

                {/* Interactive Scatter Plot Display */}
                <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl p-6 border-2 border-primary-400">
                  <h3 className="font-semibold text-ink-900 mb-3 text-center text-lg">
                    Scatter Plot Explorer: {correlationType === 'positif' ? 'Korelasi Positif' : correlationType === 'negatif' ? 'Korelasi Negatif' : 'Tidak Ada Korelasi'}
                  </h3>
                  
                  <div className="bg-white rounded-lg p-3 border-2 border-primary-300 relative">
                    <svg 
                      className="w-full" 
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    >
                      {/* Grid lines */}
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
                      
                      {/* Data points for selected correlation type */}
                      {currentExplorerData.map((point) => (
                        <g key={point.id}>
                          <circle 
                            cx={toSVGX(point.bullying)} 
                            cy={toSVGY(point.anxiety)} 
                            r={hoveredPoint === `explorer-${point.id}` ? 10 : 7}
                            fill={
                              correlationType === 'positif' ? (hoveredPoint === `explorer-${point.id}` ? "#16a34a" : "#22c55e") :
                              correlationType === 'negatif' ? (hoveredPoint === `explorer-${point.id}` ? "#dc2626" : "#ef4444") :
                              (hoveredPoint === `explorer-${point.id}` ? "#6b7280" : "#9ca3af")
                            }
                            stroke={hoveredPoint === `explorer-${point.id}` ? "#000" : "none"}
                            strokeWidth="3"
                            style={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={() => setHoveredPoint(`explorer-${point.id}`)}
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
                        Variabel X
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
                        Variabel Y
                      </text>
                      
                      {/* Tick marks - X axis */}
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
                    
                    {/* Tooltip for explorer */}
                    <AnimatePresence>
                      {hoveredPoint && String(hoveredPoint).startsWith('explorer-') && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute top-2 right-2 bg-white rounded-lg shadow-xl border-2 border-blue-500 p-3 pointer-events-none z-10"
                        >
                          {currentExplorerData.find(p => `explorer-${p.id}` === hoveredPoint) && (
                            <div className="text-sm">
                              <p className="font-semibold text-ink-900 mb-1">
                                Data #{currentExplorerData.find(p => `explorer-${p.id}` === hoveredPoint).id}
                              </p>
                              <div className="space-y-1">
                                <p className="text-blue-600">
                                  <span className="font-medium">X:</span> {currentExplorerData.find(p => `explorer-${p.id}` === hoveredPoint).bullying}
                                </p>
                                <p className="text-orange-600">
                                  <span className="font-medium">Y:</span> {currentExplorerData.find(p => `explorer-${p.id}` === hoveredPoint).anxiety}
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    {correlationType === 'positif' && '↗ Titik-titik naik dari kiri bawah ke kanan atas'}
                    {correlationType === 'negatif' && '↘ Titik-titik turun dari kiri atas ke kanan bawah'}
                    {correlationType === 'tidakAda' && '••• Titik-titik tersebar tanpa pola yang jelas'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Additional Info: Kekuatan Korelasi & Formula */}
            {challengeProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded-r-lg">
                  <h3 className="font-bold text-purple-900 mb-3">Kekuatan Korelasi</h3>
                  <p className="text-ink-700 leading-relaxed mb-3">
                    Selain arah, korelasi juga punya <span className="font-semibold">kekuatan</span>. 
                    Kekuatan korelasi menunjukkan seberapa rapat titik-titik data mengikuti pola kecenderungannya.
                  </p>
                  <ul className="space-y-2 text-ink-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><span className="font-semibold">Korelasi Kuat:</span> Titik-titik terkumpul rapat dan hampir membentuk garis lurus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><span className="font-semibold">Korelasi Lemah:</span> Titik-titik masih memperlihatkan arah tertentu tetapi tersebar cukup jauh dari garis kecenderungannya</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-lg">
                  <h3 className="font-bold text-orange-900 mb-3">Bagaimana cara mengukur korelasi?</h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Korelasi diukur dengan koefisien korelasi (r), nilainya antara -1 sampai +1:
                  </p>
                    
  <div className="bg-white rounded-lg p-5 border border-orange-200
                w-full min-w-0 overflow-x-auto">
  <div className="flex items-center justify-center gap-3
                  font-mono text-sm sm:text-base text-ink-700
                  min-w-max sm:min-w-0">

    {/* Simbol r = */}
    <span className="shrink-0">r =</span>

    {/* Pecahan */}
    <div className="flex flex-col items-center text-center shrink-0">

      {/* Pembilang */}
      <div className="whitespace-nowrap px-3 pb-2">
        n·Σxy − (Σx)(Σy)
      </div>

      {/* Garis pecahan */}
      <div className="w-full border-t-2 border-gray-700" />

      {/* Penyebut */}
      <div className="whitespace-nowrap px-3 pt-2">
        √&#123;[n·Σx² − (Σx)²] · [n·Σy² − (Σy)²]&#125;
      </div>

    </div>
  </div>
</div>
                  <div className="mt-3 text-xs text-ink-600 space-y-1">
                    <p><span className="font-semibold">n</span> = banyak pasangan data</p>
                    <p><span className="font-semibold">x</span> = variabel independen</p>
                    <p><span className="font-semibold">y</span> = variabel dependen</p>
                    <p><span className="font-semibold">Σxy</span> = jumlah hasil kali tiap pasangan (x × y)</p>
                  </div>
                  <div className="mt-3 bg-orange-100 rounded p-3">
                    <p className="text-sm font-semibold text-orange-900 mb-2">Cara membaca nilai r:</p>
                    <ul className="text-xs text-orange-800 space-y-1">
                      <li>• <span className="font-semibold">mendekati +1</span> = korelasi positif kuat</li>
                      <li>• <span className="font-semibold">mendekati −1</span> = korelasi negatif kuat</li>
                      <li>• <span className="font-semibold">mendekati 0</span> = korelasi lemah / tidak ada hubungan linear</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Show Evaluation Button */}
        {challengeProgress.allComplete && !showEvaluation && (
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
                  <h2 className="text-2xl font-bold text-ink-900">Evaluasi Level 3</h2>
                  <p className="text-sm text-ink-600">Isi jawaban dengan kata kunci yang tepat</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">1. Kecenderungan hubungan antara dua variabel disebut ...</span>
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

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">2. Titik-titik yang naik dari kiri bawah ke kanan atas menunjukkan korelasi ...</span>
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

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">3. Titik-titik yang turun dari kiri atas ke kanan bawah menunjukkan korelasi ...</span>
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

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">4. Titik-titik yang tersebar tanpa arah naik atau turun yang jelas berarti ... korelasi</span>
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

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">5. Titik-titik yang rapat dan hampir membentuk garis lurus menunjukkan korelasi yang ...</span>
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

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">6. Titik-titik yang punya arah tetapi tersebar jauh dari garis kecenderungan menunjukkan korelasi yang ...</span>
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

                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">7. Pada diagram bullying dan kecemasan di Level 1, jenis korelasinya adalah ...</span>
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
                    <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-green-900 mb-1">
                        Jawaban Berhasil Disimpan!
                      </p>
                      <p className="text-sm text-green-700">
                        Jawabanmu sudah tersimpan di database. Lanjut ke level berikutnya.
                      </p>
                    </div>

                    <button
                      onClick={handleNext}
                      className="w-full px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2"
                    >
                      Lanjut ke Level 4
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
