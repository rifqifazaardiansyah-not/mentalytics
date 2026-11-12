import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

export default function PresentationView() {
  const navigate = useNavigate()
  const { studentName } = useContext(StudentContext)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    // Diagram data
    variableX: '',
    variableY: '',
    inputtedPoints: [],
    regressionLine: { point1: null, point2: null },
    correlationScore: null,
    scaleX: { min: 0, max: 0 },
    scaleY: { min: 0, max: 0 },
    
    // Solution data
    recommendation: '',
    actionStep: '',
    checklist: {}
  })

  useEffect(() => {
    async function loadData() {
      try {
        const siswaId = localStorage.getItem('mentalytics_student_id')
        if (!siswaId) {
          alert('Data siswa tidak ditemukan. Silakan login ulang.')
          navigate('/kelas')
          return
        }

        // Load diagram data from DATABASE (not localStorage for consistency)
        const { data: diagramData, error: diagramError } = await supabase
          .from('eksplorasi_diagram_progress')
          .select('*')
          .eq('siswa_id', siswaId)
          .single()
        
        let parsedDiagram = {}
        if (diagramData && !diagramError) {
          console.log('📂 Loading diagram from DATABASE for presentation:', diagramData)
          parsedDiagram = {
            xAxisVar: diagramData.x_axis_var,
            yAxisVar: diagramData.y_axis_var,
            inputtedPoints: diagramData.inputted_points,
            regressionLine: diagramData.regression_line,
            correlationScore: diagramData.correlation_score,
            xScale: diagramData.x_scale,
            yScale: diagramData.y_scale
          }
        } else {
          console.log('📝 No diagram data found in database')
        }

        // Load solution data from database
        const { data: solutionData, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('siswa_id', siswaId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading solution:', error)
        }

        // Convert scale from number to { min, max } structure
        const xScaleMax = parsedDiagram.xScale || 200
        const yScaleMax = parsedDiagram.yScale || 100

        // Use regression line directly from database (already in SVG coordinates)
        // No need to convert - it's saved and loaded as-is
        const convertedRegressionLine = parsedDiagram.regressionLine || { x1: null, y1: null, x2: null, y2: null }

        setData({
          variableX: parsedDiagram.xAxisVar || 'bullying',
          variableY: parsedDiagram.yAxisVar || 'anxiety',
          inputtedPoints: parsedDiagram.inputtedPoints || [],
          regressionLine: convertedRegressionLine,  // Use SVG coords directly
          correlationScore: parsedDiagram.correlationScore || null,
          scaleX: { min: 0, max: xScaleMax },
          scaleY: { min: 0, max: yScaleMax },
          recommendation: solutionData?.rekomendasi || '',
          actionStep: solutionData?.langkah_aksi || '',
          checklist: solutionData?.checklist ? JSON.parse(solutionData.checklist) : {}
        })

        console.log('✅ Presentation data loaded:', {
          correlationScore: parsedDiagram.correlationScore,
          hasRegressionLine: !!(convertedRegressionLine.x1 !== null),
          regressionLine: convertedRegressionLine,
          regressionLineRaw: parsedDiagram.regressionLine,
          pointsCount: parsedDiagram.inputtedPoints?.length || 0,
          scales: { xScale: xScaleMax, yScale: yScaleMax }
        })

      } catch (err) {
        console.error('Error loading presentation data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

  // SVG dimensions - MUST EXACTLY MATCH EksplorasiDiagramPencar
  const width = 1600   // CRITICAL: Must match baseChartWidth in EksplorasiDiagramPencar
  const height = 1200  // CRITICAL: Must match baseChartHeight in EksplorasiDiagramPencar
  const padding = 80   // CRITICAL: Must match padding in EksplorasiDiagramPencar

  // Scale functions (match EksplorasiDiagramPencar)
  const scaleXFunc = (value) => {
    return padding + (value / data.scaleX.max) * (width - 2 * padding)
  }

  const scaleYFunc = (value) => {
    return height - padding - (value / data.scaleY.max) * (height - 2 * padding)
  }

  // Determine correlation direction (correct threshold: |r| <= 0.19 for no correlation)
  const getCorrelationLabel = () => {
    if (data.correlationScore === null || data.correlationScore === undefined) return 'Belum dianalisis'
    const r = data.correlationScore
    if (Math.abs(r) <= 0.19) return 'Tidak Berkorelasi'
    return r > 0 ? 'Korelasi Positif' : 'Korelasi Negatif'
  }

  const getCorrelationStrength = () => {
    if (data.correlationScore === null || data.correlationScore === undefined) return ''
    const absR = Math.abs(data.correlationScore)
    if (absR <= 0.19) return 'Sangat Lemah'
    if (absR > 0.7) return 'Kuat'
    if (absR > 0.4) return 'Sedang'
    return 'Lemah'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-600 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-ink-900 mb-3">
              Presentasi Kelompok
            </h1>
            <p className="text-lg text-ink-600">
              Hasil Analisis & Rekomendasi Kelompok {studentName}
            </p>
          </div>
        </motion.div>

        {/* Diagram Pencar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-poppins font-semibold text-ink-900">
              Diagram Pencar: {data.variableX === 'bullying' ? 'Bullying' : 'Kecemasan'} vs {data.variableY === 'bullying' ? 'Bullying' : 'Kecemasan'}
            </h2>
          </div>

          {/* SVG Diagram */}
          <div className="flex justify-center mb-6 bg-gray-50 rounded-xl p-4 md:p-6">
            <div className="w-full max-w-3xl">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="bg-white rounded-lg shadow-sm w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                  aspectRatio: '4 / 3',  // Force 4:3 aspect ratio to match 1600x1200
                  maxHeight: '500px'      // Prevent too tall on mobile
                }}
              >
              {/* Grid lines - lighter and dashed */}
              {data.scaleX.max > 0 && data.scaleY.max > 0 && (
                <>
                  {Array.from({ length: 11 }, (_, i) => i * (data.scaleX.max / 10)).map((val, i) => (
                    <g key={`grid-x-${i}`}>
                      <line
                        x1={scaleXFunc(val)}
                        y1={padding}
                        x2={scaleXFunc(val)}
                        y2={height - padding}
                        stroke="#e5e7eb"
                        strokeWidth="2"  // Increased from 1 to 2
                        strokeDasharray="10 5"  // Increased from 4,2
                      />
                    </g>
                  ))}
                  {Array.from({ length: 11 }, (_, i) => i * (data.scaleY.max / 10)).map((val, i) => (
                    <g key={`grid-y-${i}`}>
                      <line
                        x1={padding}
                        y1={scaleYFunc(data.scaleY.max - val)}
                        x2={width - padding}
                        y2={scaleYFunc(data.scaleY.max - val)}
                        stroke="#e5e7eb"
                        strokeWidth="2"  // Increased from 1 to 2
                        strokeDasharray="10 5"  // Increased from 4,2
                      />
                    </g>
                  ))}
                </>
              )}

              {/* X-axis line */}
              <line
                x1={padding}
                y1={height - padding}
                x2={width - padding - 40}  // Increased from 15 to 40
                y2={height - padding}
                stroke="#1f2937"
                strokeWidth="8"  // Increased from 3 to 8
              />
              {/* X-axis arrow → */}
              <polygon
                points={`${width - padding - 40},${height - padding - 15} ${width - padding},${height - padding} ${width - padding - 40},${height - padding + 15}`}
                fill="#1f2937"
              />
              
              {/* Y-axis line */}
              <line
                x1={padding}
                y1={height - padding}
                x2={padding}
                y2={padding + 40}  // Increased from 15 to 40
                stroke="#1f2937"
                strokeWidth="8"  // Increased from 3 to 8
              />
              {/* Y-axis arrow ↑ */}
              <polygon
                points={`${padding - 15},${padding + 40} ${padding},${padding} ${padding + 15},${padding + 40}`}
                fill="#1f2937"
              />

              {/* Axis labels with scale range */}
              {data.variableX && data.scaleX.max > 0 && (
                <text
                  x={width / 2}
                  y={height - padding + 85}  // Below the scale numbers
                  textAnchor="middle"
                  fontSize="36"
                  fill="#1f2937"
                  fontWeight="600"
                >
                  {data.variableX === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'} (0-{data.scaleX.max})
                </text>
              )}
              {data.variableY && data.scaleY.max > 0 && (
                <text
                  x={15}  // Far left edge, clear of everything
                  y={height / 2}
                  textAnchor="middle"
                  fontSize="36"
                  fill="#1f2937"
                  fontWeight="600"
                  transform={`rotate(-90, 15, ${height / 2})`}
                >
                  {data.variableY === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'} (0-{data.scaleY.max})
                </text>
              )}

              {/* Scale labels */}
              {data.scaleX.max > 0 && data.scaleY.max > 0 && (
                <>
                  {/* X-axis scale numbers (below the axis) */}
                  {Array.from({ length: 6 }, (_, i) => i * (data.scaleX.max / 5)).map((val) => (
                    <text
                      key={`x-${val}`}
                      x={scaleXFunc(val)}
                      y={height - 20}  // Close to bottom, above the X-axis label
                      textAnchor="middle"
                      fontSize="28"
                      fill="#374151"
                    >
                      {Math.round(val)}
                    </text>
                  ))}
                  {/* Y-axis scale numbers (left of the axis) */}
                  {Array.from({ length: 6 }, (_, i) => i * (data.scaleY.max / 5)).map((val) => (
                    <text
                      key={`y-${val}`}
                      x={padding + 35}  // Position inside the chart area (right of Y-axis line)
                      y={scaleYFunc(val) + 10}
                      textAnchor="start"  // Changed from middle to start (left-align)
                      fontSize="28"
                      fill="#374151"
                    >
                      {Math.round(val)}
                    </text>
                  ))}
                </>
              )}

              {/* Regression line - use SVG coordinates directly from database */}
              {data.regressionLine && data.regressionLine.x1 !== null && data.regressionLine.x1 !== undefined && (
                <line
                  x1={data.regressionLine.x1}
                  y1={data.regressionLine.y1}
                  x2={data.regressionLine.x2}
                  y2={data.regressionLine.y2}
                  stroke="#dc2626"
                  strokeWidth="8"  // Increased from 3 to 8 (thicker for visibility)
                  strokeDasharray="20,10"  // Increased from 8,4 to 20,10
                />
              )}

              {/* Data points - LARGER for 1600x1200 viewBox */}
              {data.inputtedPoints.map((point, idx) => (
                <circle
                  key={idx}
                  cx={scaleXFunc(point.x)}
                  cy={scaleYFunc(point.y)}
                  r="12"  // Increased from 5 to 12 (2.4x scale for 1600x1200 vs 600x600)
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="4"  // Increased from 2 to 4
                />
              ))}
            </svg>
            </div>
          </div>

          {/* Correlation Info */}
          {data.correlationScore !== null && data.correlationScore !== undefined && !isNaN(data.correlationScore) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-300">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Jenis Korelasi</p>
                  <p className="text-xl font-bold text-blue-900">{getCorrelationLabel()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Kekuatan</p>
                  <p className="text-xl font-bold text-blue-900">{getCorrelationStrength()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Koefisien (r)</p>
                  <p className="text-xl font-bold text-blue-900">{data.correlationScore.toFixed(3)}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Rekomendasi Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-poppins font-semibold text-ink-900">
              Rekomendasi Solusi
            </h2>
          </div>

          {data.recommendation ? (
            <div className="prose prose-lg max-w-none">
              <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">
                {data.recommendation}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada rekomendasi yang ditulis.</p>
              <button
                onClick={() => navigate('/kegiatan-belajar/the-challenge/solution')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Tulis Rekomendasi
              </button>
            </div>
          )}
        </motion.div>

        {/* Langkah Aksi Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-poppins font-semibold text-ink-900">
              Langkah Aksi Konkret
            </h2>
          </div>

          {data.actionStep ? (
            <div className="prose prose-lg max-w-none">
              <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">
                {data.actionStep}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada langkah aksi yang ditulis.</p>
              <button
                onClick={() => navigate('/kegiatan-belajar/the-challenge/solution')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Tulis Langkah Aksi
              </button>
            </div>
          )}
        </motion.div>

        {/* Tips Presentasi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl border-2 border-amber-300 mb-8"
        >
          <h3 className="text-xl font-poppins font-semibold text-amber-900 mb-4">
            💡 Tips Presentasi
          </h3>
          <ul className="space-y-2 text-amber-900">
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[20px]">1.</span>
              <span>Jelaskan diagram pencar kalian dengan jelas: variabel apa yang dipilih dan mengapa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[20px]">2.</span>
              <span>Tunjukkan pola korelasi yang kalian temukan dan apa artinya</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[20px]">3.</span>
              <span>Jelaskan KENAPA kalian memilih rekomendasi tersebut berdasarkan data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[20px]">4.</span>
              <span>Paparkan langkah aksi konkret yang realistis untuk dilakukan minggu ini</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold min-w-[20px]">5.</span>
              <span>Siap menjawab pertanyaan dari kelompok lain!</span>
            </li>
          </ul>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/kegiatan-belajar/the-challenge/solution')}
            className="px-8 py-4 bg-white border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Solution
          </button>
        
        </motion.div>

      </div>
    </div>
  )
}
