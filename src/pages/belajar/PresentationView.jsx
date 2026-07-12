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

        // Load diagram data from localStorage
        const diagramKey = `eksplorasi_diagram_progress_${siswaId}`
        const diagramData = localStorage.getItem(diagramKey)
        
        let parsedDiagram = {}
        if (diagramData) {
          parsedDiagram = JSON.parse(diagramData)
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

        // Convert regression line from SVG coordinates {x1, y1, x2, y2} to data points {point1: {x, y}, point2: {x, y}}
        let convertedRegressionLine = { point1: null, point2: null }
        if (parsedDiagram.regressionLine && parsedDiagram.regressionLine.x1) {
          // Use chart dimensions from EksplorasiDiagramPencar
          const chartWidth = 600
          const chartHeight = 600
          const padding = 60
          
          // Convert SVG coords back to data values
          const coordToValue = (coord, max, dimension) => {
            return ((coord - padding) / (dimension - 2 * padding)) * max
          }
          
          const rl = parsedDiagram.regressionLine
          convertedRegressionLine = {
            point1: {
              x: coordToValue(rl.x1, xScaleMax, chartWidth),
              y: yScaleMax - coordToValue(rl.y1, yScaleMax, chartHeight) // Invert Y
            },
            point2: {
              x: coordToValue(rl.x2, xScaleMax, chartWidth),
              y: yScaleMax - coordToValue(rl.y2, yScaleMax, chartHeight) // Invert Y
            }
          }
        }

        setData({
          variableX: parsedDiagram.xAxisVar || 'bullying',
          variableY: parsedDiagram.yAxisVar || 'anxiety',
          inputtedPoints: parsedDiagram.inputtedPoints || [],
          regressionLine: convertedRegressionLine,
          correlationScore: parsedDiagram.correlationScore || null,
          scaleX: { min: 0, max: xScaleMax },
          scaleY: { min: 0, max: yScaleMax },
          recommendation: solutionData?.rekomendasi || '',
          actionStep: solutionData?.langkah_aksi || '',
          checklist: solutionData?.checklist ? JSON.parse(solutionData.checklist) : {}
        })

      } catch (err) {
        console.error('Error loading presentation data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

  // SVG dimensions
  const width = 600
  const height = 400
  const padding = 60

  // Scale functions (match EksplorasiDiagramPencar)
  const scaleXFunc = (value) => {
    return padding + (value / data.scaleX.max) * (width - 2 * padding)
  }

  const scaleYFunc = (value) => {
    return height - padding - (value / data.scaleY.max) * (height - 2 * padding)
  }

  // Determine correlation direction
  const getCorrelationLabel = () => {
    if (!data.correlationScore) return 'Belum dianalisis'
    const r = data.correlationScore
    if (Math.abs(r) <= 0.3) return 'Tidak Berkorelasi'
    return r > 0 ? 'Korelasi Positif' : 'Korelasi Negatif'
  }

  const getCorrelationStrength = () => {
    if (!data.correlationScore) return ''
    const absR = Math.abs(data.correlationScore)
    if (absR <= 0.3) return ''
    if (absR <= 0.5) return 'Lemah'
    if (absR <= 0.7) return 'Sedang'
    if (absR <= 0.9) return 'Kuat'
    return 'Sangat Kuat'
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
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="bg-white rounded-lg shadow-sm w-full h-auto"
              style={{ maxWidth: '600px' }}
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
                        strokeWidth="1"
                        strokeDasharray="4 2"
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
                        strokeWidth="1"
                        strokeDasharray="4 2"
                      />
                    </g>
                  ))}
                </>
              )}

              {/* X-axis line */}
              <line
                x1={padding}
                y1={height - padding}
                x2={width - padding - 15}
                y2={height - padding}
                stroke="#1f2937"
                strokeWidth="3"
              />
              {/* X-axis arrow → */}
              <polygon
                points={`${width - padding - 15},${height - padding - 6} ${width - padding},${height - padding} ${width - padding - 15},${height - padding + 6}`}
                fill="#1f2937"
              />
              
              {/* Y-axis line */}
              <line
                x1={padding}
                y1={height - padding}
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

              {/* Axis labels with scale range */}
              {data.variableX && data.scaleX.max > 0 && (
                <text
                  x={width / 2}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#1f2937"
                  fontWeight="600"
                >
                  {data.variableX === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'} (0-{data.scaleX.max})
                </text>
              )}
              {data.variableY && data.scaleY.max > 0 && (
                <text
                  x={20}
                  y={height / 2}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#1f2937"
                  fontWeight="600"
                  transform={`rotate(-90, 20, ${height / 2})`}
                >
                  {data.variableY === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'} (0-{data.scaleY.max})
                </text>
              )}

              {/* Scale labels */}
              {data.scaleX.max > 0 && data.scaleY.max > 0 && (
                <>
                  {Array.from({ length: 6 }, (_, i) => i * (data.scaleX.max / 5)).map((val) => (
                    <text
                      key={`x-${val}`}
                      x={scaleXFunc(val)}
                      y={height - padding + 20}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                    >
                      {Math.round(val)}
                    </text>
                  ))}
                  {Array.from({ length: 6 }, (_, i) => i * (data.scaleY.max / 5)).map((val) => (
                    <text
                      key={`y-${val}`}
                      x={padding - 20}
                      y={scaleYFunc(data.scaleY.max - val) + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                    >
                      {Math.round(val)}
                    </text>
                  ))}
                </>
              )}

              {/* Regression line */}
              {data.regressionLine.point1 && data.regressionLine.point2 && (
                <line
                  x1={scaleXFunc(data.regressionLine.point1.x)}
                  y1={scaleYFunc(data.regressionLine.point1.y)}
                  x2={scaleXFunc(data.regressionLine.point2.x)}
                  y2={scaleYFunc(data.regressionLine.point2.y)}
                  stroke="#dc2626"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                />
              )}

              {/* Data points */}
              {data.inputtedPoints.map((point, idx) => (
                <circle
                  key={idx}
                  cx={scaleXFunc(point.x)}
                  cy={scaleYFunc(point.y)}
                  r="5"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>

          {/* Correlation Info */}
          {data.correlationScore !== null && (
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
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
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
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
