import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import LearningLayout from '../../components/layout/LearningLayout'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function GuidingResourceLevel1() {
  const navigate = useNavigate()
  const { kelasId } = useContext(StudentContext)
  
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [expandedConcept, setExpandedConcept] = useState(null) // For expandable concepts
  const [highlightedTerm, setHighlightedTerm] = useState(null) // For term highlighting
  const [answers, setAnswers] = useState({
    q1: '', // Diagram yang dipakai untuk menampilkan dua variabel sekaligus disebut diagram ...
    q2: '', // Data yang setiap titiknya menyimpan dua nilai disebut data ...
    q3: '', // Dalam istilah "bivariat", kata "bi" artinya ...
    q4: '', // Pada diagram di atas, variabel yang ada di sumbu mendatar (sumbu x) adalah ...
    q5: ''  // Pada diagram di atas, variabel yang ada di sumbu tegak (sumbu y) adalah ...
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

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

  // Calculate chart dimensions and scales - adjusted for new data range
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
          .eq('level', 1)
          .single()

        if (data && !error) {
          setAnswers(data.answers || answers)
          setSubmitted(data.submitted || false)
          setShowEvaluation(data.show_evaluation || false)
        }
      } catch (e) {
        console.error('Error loading progress:', e)
      }
    }
    loadProgress()
  }, [kelasId])

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
        level: 1,
        answers,
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
    // Navigate to Level 2
    navigate('/kegiatan-belajar/the-challenge/guiding-resource-level-2')
  }

  return (
    <LearningLayout
      pageTitle="Level 1: Mengenal Diagram Pencar"
      breadcrumbs={[
        { label: 'Kegiatan Belajar', path: '/kegiatan-belajar' },
        { label: 'The Challenge', path: '/kegiatan-belajar/the-challenge' },
        { label: 'Guiding Resource Level 1' }
      ]}
      showAI={true}
      aiContext="guiding_resource_level_1"
    >
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-ink-900" />
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
                <MiloCharacter pose="happy" />
              </div>
            </div>
            <MiloDialogBubble tailPosition="" className="flex-1">
              <p className="text-base font-medium text-primary-900">
                Halo! Kita akan mulai belajar tentang diagram pencar dan data bivariat. 📊✨
              </p>
              <p className="text-sm text-ink-700 mt-2">
                Baca materi dengan seksama, lalu jawab evaluasi di akhir ya!
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
            <BookOpen className="w-5 h-5" />
            Level 1
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
            Mengenal Diagram Pencar dan Data Bivariat
          </h1>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 space-y-6"
        >
          {/* Paragraph 1 - Interactive with clickable terms */}
          <div className="space-y-4">
            <p className="text-lg text-ink-700 leading-relaxed">
              Bagaimana caranya kita mengetahui apakah{' '}
              <span 
                className="font-semibold text-primary-600 cursor-help underline decoration-dotted hover:bg-primary-50 px-1 rounded transition-all"
                onMouseEnter={() => setHighlightedTerm('bullying')}
                onMouseLeave={() => setHighlightedTerm(null)}
              >
                bullying
              </span>
              {' '}pada murid ada hubungannya dengan tingkat{' '}
              <span 
                className="font-semibold text-orange-600 cursor-help underline decoration-dotted hover:bg-orange-50 px-1 rounded transition-all"
                onMouseEnter={() => setHighlightedTerm('kecemasan')}
                onMouseLeave={() => setHighlightedTerm(null)}
              >
                kecemasannya
              </span>
              ? 
              Salah satu cara termudah adalah dengan menggambarkan kedua data itu sekaligus dalam satu diagram, 
              agar kita bisa melihat langsung pola hubungannya. Diagram semacam ini disebut{' '}
              <span 
                className="font-bold text-primary-700 cursor-pointer hover:bg-yellow-100 px-1 rounded transition-all"
                onClick={() => setExpandedConcept(expandedConcept === 'scatter' ? null : 'scatter')}
              >
                diagram pencar
              </span>
              {' '}(scatter plot).
            </p>

            {/* Expandable info boxes */}
            <AnimatePresence>
              {highlightedTerm === 'bullying' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
                >
                  <p className="text-sm text-blue-900">
                    <strong>Bullying:</strong> Perilaku berulang yang menyakitkan secara fisik atau emosional terhadap seseorang.
                  </p>
                </motion.div>
              )}

              {highlightedTerm === 'kecemasan' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg"
                >
                  <p className="text-sm text-orange-900">
                    <strong>Kecemasan:</strong> Perasaan khawatir, takut, atau tidak nyaman yang berlebihan.
                  </p>
                </motion.div>
              )}

              {expandedConcept === 'scatter' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-primary-50 border-2 border-primary-300 p-5 rounded-xl"
                >
                  <h4 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Apa itu Diagram Pencar?
                  </h4>
                  <p className="text-sm text-primary-800 leading-relaxed">
                    Diagram pencar (scatter plot) adalah grafik yang menampilkan titik-titik data untuk menunjukkan hubungan antara dua variabel. 
                    Setiap titik mewakili satu observasi dengan nilai pada sumbu X dan Y. Diagram ini sangat berguna untuk melihat pola atau korelasi.
                  </p>
                  <button 
                    onClick={() => setExpandedConcept(null)}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                  >
                    Tutup
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Interactive Scatter Plot Diagram */}
          <div className="my-8">
            <h3 className="font-semibold text-ink-900 mb-3 text-center">
              Contoh: Diagram Pencar Bullying vs Kecemasan
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
                
                {/* Axis labels - positioned further from axes */}
                <text 
                  x={chartWidth / 2} 
                  y={chartHeight - 5} 
                  textAnchor="middle" 
                  fontSize="18" 
                  fill="#374151" 
                  fontWeight="600"
                >
                  Skor Bullying (0-60)
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
                  Skor Kecemasan (0-40)
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
          </div>

          {/* Paragraph 2 - Interactive with clickable terms */}
          <div className="space-y-4">
            <p className="text-lg text-ink-700 leading-relaxed">
              Diagram pencar digunakan untuk menampilkan data yang memiliki{' '}
              <span 
                className="font-bold text-primary-700 cursor-pointer hover:bg-yellow-100 px-1 rounded transition-all"
                onClick={() => setExpandedConcept(expandedConcept === 'dua-variabel' ? null : 'dua-variabel')}
              >
                dua variabel sekaligus
              </span>
              , seperti pada contoh bullying dan skor kecemasan di atas. Data yang terdiri dari dua variabel seperti ini disebut{' '}
              <span 
                className="font-bold text-primary-700 cursor-pointer hover:bg-yellow-100 px-1 rounded transition-all"
                onClick={() => setExpandedConcept(expandedConcept === 'bivariat' ? null : 'bivariat')}
              >
                data bivariat
              </span>
              . Istilah{' '}
              <span 
                className="font-semibold cursor-help underline decoration-dotted hover:bg-blue-50 px-1 rounded transition-all"
                onMouseEnter={() => setHighlightedTerm('bi')}
                onMouseLeave={() => setHighlightedTerm(null)}
              >
                "bi"
              </span>
              {' '}di sini berarti{' '}
              <span className="font-bold">dua</span>, 
              jadi data bivariat artinya data yang setiap titiknya menyimpan dua nilai sekaligus, bukan hanya satu.
            </p>

            {/* Expandable info boxes for paragraph 2 */}
            <AnimatePresence>
              {highlightedTerm === 'bi' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg"
                >
                  <p className="text-sm text-indigo-900">
                    <strong>"Bi"</strong> berasal dari bahasa Latin yang berarti "dua". Contoh lain: bicycle (sepeda roda dua), bilingual (dua bahasa).
                  </p>
                </motion.div>
              )}

              {expandedConcept === 'dua-variabel' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border-2 border-green-300 p-5 rounded-xl"
                >
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Apa itu Variabel?
                  </h4>
                  <p className="text-sm text-green-800 leading-relaxed mb-2">
                    <strong>Variabel</strong> adalah sesuatu yang bisa berubah atau berbeda nilainya. Dalam contoh kita:
                  </p>
                  <ul className="text-sm text-green-800 space-y-1 ml-5 list-disc">
                    <li><strong>Variabel 1:</strong> Skor bullying (bisa 0, 10, 20, dst.)</li>
                    <li><strong>Variabel 2:</strong> Skor kecemasan (bisa 5, 15, 25, dst.)</li>
                  </ul>
                  <button 
                    onClick={() => setExpandedConcept(null)}
                    className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                  >
                    Tutup
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </motion.div>
              )}

              {expandedConcept === 'bivariat' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-purple-50 border-2 border-purple-300 p-5 rounded-xl"
                >
                  <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Data Bivariat
                  </h4>
                  <p className="text-sm text-purple-800 leading-relaxed mb-3">
                    <strong>Data bivariat</strong> adalah data yang terdiri dari <strong>dua variabel</strong> untuk setiap observasi.
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-2">Contoh:</p>
                    <div className="text-sm text-purple-800 space-y-1">
                      <p>• Siswa A: Bullying = 10, Kecemasan = 15</p>
                      <p>• Siswa B: Bullying = 25, Kecemasan = 28</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setExpandedConcept(null)}
                    className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    Tutup
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Key Points Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-bold text-ink-900">Poin Penting:</p>
                <ul className="space-y-1 text-ink-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><span className="font-semibold">Diagram pencar</span> = diagram untuk menampilkan 2 variabel sekaligus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><span className="font-semibold">Data bivariat</span> = data dengan 2 nilai pada setiap titik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><span className="font-semibold">"Bi"</span> = dua (dalam bahasa Latin)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Show Evaluation Button */}
        {!showEvaluation && (
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
                  <h2 className="text-2xl font-bold text-ink-900">Evaluasi Level 1</h2>
                  <p className="text-sm text-ink-600">Isi jawaban dengan kata kunci yang tepat</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {/* Question 1 */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <label className="block mb-3">
                    <span className="text-ink-900 font-semibold">1. Diagram yang dipakai untuk menampilkan dua variabel sekaligus disebut diagram ...</span>
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
                    <span className="text-ink-900 font-semibold">2. Data yang setiap titiknya menyimpan dua nilai disebut data ...</span>
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
                    <span className="text-ink-900 font-semibold">3. Dalam istilah "bivariat", kata "bi" artinya ...</span>
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
                    <span className="text-ink-900 font-semibold">4. Pada diagram di atas, variabel yang ada di sumbu mendatar (sumbu x) adalah ...</span>
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
                    <span className="text-ink-900 font-semibold">5. Pada diagram di atas, variabel yang ada di sumbu tegak (sumbu y) adalah ...</span>
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
                      Lanjut ke Level 2
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
