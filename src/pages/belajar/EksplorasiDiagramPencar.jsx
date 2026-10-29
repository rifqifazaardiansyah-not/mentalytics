import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Table, PenTool, TrendingUp, Maximize2, X, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

// Data untuk Interactive Scatter Plot Explorer (Step 5)
const scatterPlotData = {
  positif: [
    { id: 1, label: 'Remaja A', screentime: 0.5, anxiety: 23, x: 7, y: 23 },
    { id: 2, label: 'Remaja B', screentime: 1, anxiety: 28, x: 14, y: 36 },
    { id: 3, label: 'Remaja C', screentime: 1.5, anxiety: 31, x: 21, y: 46 },
    { id: 4, label: 'Remaja D', screentime: 2, anxiety: 35, x: 28, y: 54 },
    { id: 5, label: 'Remaja E', screentime: 2.5, anxiety: 39, x: 35, y: 62 },
    { id: 6, label: 'Remaja F', screentime: 3, anxiety: 44, x: 42, y: 72 },
    { id: 7, label: 'Remaja G', screentime: 3.5, anxiety: 48, x: 50, y: 80 },
    { id: 8, label: 'Remaja H', screentime: 4, anxiety: 52, x: 57, y: 88 },
    { id: 9, label: 'Remaja I', screentime: 5, anxiety: 58, x: 71, y: 98 },
    { id: 10, label: 'Remaja J', screentime: 6, anxiety: 64, x: 85, y: 106 }
  ],
  tidakAda: [
    { id: 1, label: 'Remaja A', screentime: 0.5, anxiety: 45, x: 7, y: 50 },
    { id: 2, label: 'Remaja B', screentime: 1, anxiety: 32, x: 14, y: 24 },
    { id: 3, label: 'Remaja C', screentime: 1.5, anxiety: 51, x: 21, y: 62 },
    { id: 4, label: 'Remaja D', screentime: 2, anxiety: 28, x: 28, y: 16 },
    { id: 5, label: 'Remaja E', screentime: 2.5, anxiety: 48, x: 35, y: 56 },
    { id: 6, label: 'Remaja F', screentime: 3, anxiety: 35, x: 42, y: 30 },
    { id: 7, label: 'Remaja G', screentime: 3.5, anxiety: 42, x: 50, y: 44 },
    { id: 8, label: 'Remaja H', screentime: 4, anxiety: 39, x: 57, y: 38 },
    { id: 9, label: 'Remaja I', screentime: 5, anxiety: 46, x: 71, y: 52 },
    { id: 10, label: 'Remaja J', screentime: 6, anxiety: 31, x: 85, y: 22 }
  ],
  negatif: [
    { id: 1, label: 'Remaja A', screentime: 0.5, anxiety: 62, x: 7, y: 92 },
    { id: 2, label: 'Remaja B', screentime: 1, anxiety: 58, x: 14, y: 84 },
    { id: 3, label: 'Remaja C', screentime: 1.5, anxiety: 54, x: 21, y: 76 },
    { id: 4, label: 'Remaja D', screentime: 2, anxiety: 49, x: 28, y: 66 },
    { id: 5, label: 'Remaja E', screentime: 2.5, anxiety: 45, x: 35, y: 58 },
    { id: 6, label: 'Remaja F', screentime: 3, anxiety: 40, x: 42, y: 48 },
    { id: 7, label: 'Remaja G', screentime: 3.5, anxiety: 36, x: 50, y: 40 },
    { id: 8, label: 'Remaja H', screentime: 4, anxiety: 32, x: 57, y: 32 },
    { id: 9, label: 'Remaja I', screentime: 5, anxiety: 27, x: 71, y: 22 },
    { id: 10, label: 'Remaja J', screentime: 6, anxiety: 23, x: 85, y: 14 }
  ]
}

export default function EksplorasiDiagramPencar() {
  const navigate = useNavigate()
  const { kelasId } = useContext(StudentContext)
  
  const [loading, setLoading] = useState(true)
  const [surveyData, setSurveyData] = useState([])
  const [error, setError] = useState(null)
  
  // Multi-step flow (4 steps - removed scale selection)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Step 1: Pilih variabel untuk sumbu
  const [xAxisVar, setXAxisVar] = useState(null) // 'bullying' or 'anxiety'
  const [yAxisVar, setYAxisVar] = useState(null)
  
  // Auto-generated scales (no longer user-selectable)
  const [xScale, setXScale] = useState(null)
  const [yScale, setYScale] = useState(null)
  
  // Step 2: Place data points on grid (NEW SYSTEM)
  const [placedPoints, setPlacedPoints] = useState([])
  const [currentDataIndex, setCurrentDataIndex] = useState(0)
  const [attemptFeedback, setAttemptFeedback] = useState(null) // success/error message
  
  // Zoom/Pan for mobile
  const [zoomLevel, setZoomLevel] = useState(1) // DEPRECATED - tidak dipakai lagi
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  
  // Visual zoom for Step 2 & 3 (CSS transform, not dimensions)
  const [visualZoom, setVisualZoom] = useState(1)
  const [visualZoomStep2, setVisualZoomStep2] = useState(1) // Separate zoom for Step 2
  
  // Pan/drag state for scrollable chart
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  // Mobile fullscreen for chart only
  const [isMobileChartFullscreen, setIsMobileChartFullscreen] = useState(false)
  
  // Desktop fullscreen for chart (same feature as mobile)
  const [isDesktopChartFullscreen, setIsDesktopChartFullscreen] = useState(false)
  
  // Highlighted grid lines when clicking axis numbers
  const [highlightedX, setHighlightedX] = useState(null)
  const [highlightedY, setHighlightedY] = useState(null)
  
  // Toggle UI visibility in fullscreen modal
  const [isUIVisible, setIsUIVisible] = useState(true)
  
  // Step 3: Draw regression line
  const [regressionLine, setRegressionLine] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPoint, setDragPoint] = useState(null) // 'start' or 'end'
  
  // Step 4: Calculate correlation
  const [correlationScore, setCorrelationScore] = useState(null)
  
  // Step 5: Interactive Scatter Plot Explorer (after completing Step 4)
  const [correlationMatching, setCorrelationMatching] = useState({
    positif: null,
    tidakAda: null,
    negatif: null
  })
  const [selectedScatterType, setSelectedScatterType] = useState('positif') // 'positif', 'tidakAda', 'negatif'
  
  // Custom Alert Modal
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '' })
  
  // Tooltip for clicked data point
  const [selectedPoint, setSelectedPoint] = useState(null)
  
  // Manual checklist for table rows
  const [checkedRows, setCheckedRows] = useState({})
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  // Chart dimensions - RECTANGULAR: wider for X-axis spacing
  const baseChartWidth = 1600  // ← Lebih lebar untuk X spacing
  const baseChartHeight = 1200
  // Both Step 2 and Step 3 use base size with CSS zoom (transform: scale)
  const chartWidth = baseChartWidth
  const chartHeight = baseChartHeight
  const padding = 80

  // Database functions for progress persistence
  const saveProgressToDB = async () => {
    try {
      const siswaId = localStorage.getItem('mentalytics_student_id')
      if (!siswaId || !kelasId) {
        console.warn('Cannot save progress: missing siswaId or kelasId')
        return
      }

      const progressData = {
        siswa_id: siswaId,
        kelas_id: kelasId,
        current_step: currentStep,
        x_axis_var: xAxisVar,
        y_axis_var: yAxisVar,
        x_scale: xScale,
        y_scale: yScale,
        inputted_points: placedPoints,
        current_input_index: currentDataIndex,
        regression_line: regressionLine,
        correlation_score: correlationScore,
        checked_rows: checkedRows,
        updated_at: new Date().toISOString()
      }

      // Upsert: insert or update if already exists
      const { error } = await supabase
        .from('eksplorasi_diagram_progress')
        .upsert(progressData, {
          onConflict: 'siswa_id,kelas_id'
        })

      if (error) {
        console.error('Error saving progress to DB:', error)
      } else {
        console.log('✅ Progress saved to database')
      }
    } catch (e) {
      console.error('Error in saveProgressToDB:', e)
    }
  }

  const loadProgressFromDB = async () => {
    try {
      const siswaId = localStorage.getItem('mentalytics_student_id')
      if (!siswaId || !kelasId) {
        console.warn('Cannot load progress: missing siswaId or kelasId')
        return false
      }

      const { data, error } = await supabase
        .from('eksplorasi_diagram_progress')
        .select('*')
        .eq('siswa_id', siswaId)
        .eq('kelas_id', kelasId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found - this is normal for first time users
          console.log('📝 No saved progress found (starting fresh)')
        } else {
          console.error('Error loading progress from DB:', error)
        }
        return false
      }

      if (data && data.current_step >= 1) {
        console.log('📂 Loading progress from database:', data)
        setCurrentStep(data.current_step)
        if (data.x_axis_var) setXAxisVar(data.x_axis_var)
        if (data.y_axis_var) setYAxisVar(data.y_axis_var)
        if (data.x_scale) setXScale(data.x_scale)
        if (data.y_scale) setYScale(data.y_scale)
        if (data.inputted_points) setPlacedPoints(data.inputted_points)
        if (data.current_input_index !== undefined) setCurrentDataIndex(data.current_input_index)
        if (data.regression_line) setRegressionLine(data.regression_line)
        if (data.correlation_score !== undefined) setCorrelationScore(data.correlation_score)
        if (data.checked_rows) setCheckedRows(data.checked_rows)
        return true
      }
    } catch (e) {
      console.error('Error in loadProgressFromDB:', e)
    }
    return false
  }

  const clearProgressFromDB = async () => {
    try {
      const siswaId = localStorage.getItem('mentalytics_student_id')
      if (!siswaId || !kelasId) return

      const { error } = await supabase
        .from('eksplorasi_diagram_progress')
        .delete()
        .eq('siswa_id', siswaId)
        .eq('kelas_id', kelasId)

      if (error) {
        console.error('Error clearing progress from DB:', error)
      } else {
        console.log('🗑️ Progress cleared from database')
      }
    } catch (e) {
      console.error('Error in clearProgressFromDB:', e)
    }
  }

  // Fetch survey data
  useEffect(() => {
    async function fetchSurveyData() {
      if (!kelasId) {
        setError('Data kelas tidak ditemukan')
        setLoading(false)
        return
      }

      try {
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
          setError('Belum ada data survei')
          setLoading(false)
          return
        }

        const formattedData = results.map((item, idx) => ({
          id: item.id,
          no: idx + 1,
          bullying: item.skor_bullying,
          anxiety: item.skor_anxiety
        }))

        setSurveyData(formattedData)
        
        // Load saved progress from database
        await loadProgressFromDB()
        
      } catch (err) {
        console.error('Error:', err)
        setError('Gagal memuat data')
      } finally {
        setLoading(false)
      }
    }

    fetchSurveyData()
  }, [kelasId])

  // Save progress realtime on any change to database
  useEffect(() => {
    if (currentStep >= 2 && kelasId) {
      // Debounce save to avoid too many DB writes
      const timeoutId = setTimeout(() => {
        saveProgressToDB()
      }, 1000) // Save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentStep, placedPoints, regressionLine, correlationScore, checkedRows, kelasId])

  // Auto-navigate to the correct page when inputting data
  useEffect(() => {
    if (currentStep === 2 && currentDataIndex >= 0) {
      const targetPage = Math.floor(currentDataIndex / itemsPerPage) + 1
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage)
      }
    }
  }, [currentStep, currentDataIndex])

  // Helper: Convert value to coordinate
  const valueToCoord = (value, max, dimension) => {
    return padding + (value / max) * (dimension - 2 * padding)
  }

  // Render Chart SVG (reusable for main and mobile fullscreen)
  const renderChartSVG = () => (
    <svg
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="border-2 border-gray-400 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
      style={currentStep === 3 ? { touchAction: 'none' } : undefined}
    >
      {/* No transform wrapper - using actual dimensions */}
      
      {/* Grid lines - every 1 unit (with highlight) */}
      {xScale && yScale && (
        <>
          {Array.from({ length: xScale + 1 }, (_, i) => i).map((val, i) => (
            <g key={`grid-x-${i}`}>
              <line
                x1={valueToCoord(val, xScale, chartWidth)}
                y1={padding}
                x2={valueToCoord(val, xScale, chartWidth)}
                y2={chartHeight - padding}
                stroke={highlightedX === val ? "#3b82f6" : "#d1d5db"}
                strokeWidth={highlightedX === val ? "3" : "1"}
                opacity={highlightedX === val ? "1" : "0.5"}
              />
            </g>
          ))}
          {Array.from({ length: yScale + 1 }, (_, i) => i).map((val, i) => (
            <g key={`grid-y-${i}`}>
              <line
                x1={padding}
                y1={valueToCoord(yScale - val, yScale, chartHeight)}
                x2={chartWidth - padding}
                y2={valueToCoord(yScale - val, yScale, chartHeight)}
                stroke={highlightedY === val ? "#3b82f6" : "#d1d5db"}
                strokeWidth={highlightedY === val ? "3" : "1"}
                opacity={highlightedY === val ? "1" : "0.5"}
              />
            </g>
          ))}
        </>
      )}

      {/* Main Axes with manual arrows */}
      <line
        x1={padding}
        y1={chartHeight - padding}
        x2={chartWidth - padding - 15}
        y2={chartHeight - padding}
        stroke="#1f2937"
        strokeWidth="3"
      />
      <polygon
        points={`${chartWidth - padding - 15},${chartHeight - padding - 6} ${chartWidth - padding},${chartHeight - padding} ${chartWidth - padding - 15},${chartHeight - padding + 6}`}
        fill="#1f2937"
      />
      
      <line
        x1={padding}
        y1={chartHeight - padding}
        x2={padding}
        y2={padding + 15}
        stroke="#1f2937"
        strokeWidth="3"
      />
      <polygon
        points={`${padding - 6},${padding + 15} ${padding},${padding} ${padding + 6},${padding + 15}`}
        fill="#1f2937"
      />

      {/* Axis labels */}
      {xAxisVar && (
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
      )}
      {yAxisVar && (
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
      )}

      {/* Scale markers - CLICKABLE, NORMAL orientation (no rotation) */}
      {xScale && yScale && (
        <>
          {/* X-axis labels - NORMAL horizontal (enough space now) */}
          {Array.from({ length: xScale + 1 }, (_, i) => i).map((val) => (
            <text
              key={`x-${val}`}
              x={valueToCoord(val, xScale, chartWidth)}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="11"
              fill={highlightedX === val ? "#3b82f6" : "#374151"}
              fontWeight={highlightedX === val ? "bold" : "normal"}
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleAxisNumberClick('x', val, e)}
            >
              {val}
            </text>
          ))}
          {/* Y-axis labels - NORMAL */}
          {Array.from({ length: yScale + 1 }, (_, i) => i).map((val) => (
            <text
              key={`y-${val}`}
              x={padding - 20}
              y={valueToCoord(yScale - val, yScale, chartHeight) + 4}
              textAnchor="middle"
              fontSize="11"
              fill={highlightedY === val ? "#3b82f6" : "#374151"}
              fontWeight={highlightedY === val ? "bold" : "normal"}
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleAxisNumberClick('y', val, e)}
            >
              {val}
            </text>
          ))}
        </>
      )}

      {/* Clickable zones - only if scale selected */}
      {currentStep === 2 && xScale && yScale && (
        <>
          {Array.from({ length: (xScale + 1) * (yScale + 1) }, (_, idx) => {
            const xVal = idx % (xScale + 1)
            const yVal = Math.floor(idx / (xScale + 1))
            const cx = valueToCoord(xVal, xScale, chartWidth)
            const cy = valueToCoord(yScale - yVal, yScale, chartHeight)
            
            return (
              <circle
                key={`zone-${xVal}-${yVal}`}
                cx={cx}
                cy={cy}
                r="8"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleGridClick(xVal, yVal, e)}
                onMouseEnter={(e) => e.target.style.fill = 'rgba(59, 130, 246, 0.2)'}
                onMouseLeave={(e) => e.target.style.fill = 'transparent'}
              />
            )
          })}
        </>
      )}

      {/* Data points */}
      {placedPoints.map((point, idx) => {
        const cx = valueToCoord(point.x, xScale, chartWidth)
        const cy = valueToCoord(yScale - point.y, yScale, chartHeight)
        
        return (
          <g key={idx}>
            {/* Clickable area (larger invisible circle for easier tapping) */}
            <circle
              cx={cx}
              cy={cy}
              r="12"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPoint(selectedPoint === idx ? null : idx)}
            />
            {/* Visible point */}
            <circle
              cx={cx}
              cy={cy}
              r="5"
              fill={selectedPoint === idx ? '#f59e0b' : '#3b82f6'}
              stroke={selectedPoint === idx ? '#d97706' : '#1e40af'}
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPoint(selectedPoint === idx ? null : idx)}
            />
            {/* Tooltip when point is selected */}
            {selectedPoint === idx && (
              <g>
                <rect
                  x={cx + 10}
                  y={cy - 35}
                  width="120"
                  height="30"
                  rx="6"
                  fill="#1f2937"
                  fillOpacity="0.9"
                />
                <polygon
                  points={`${cx + 10},${cy - 10} ${cx + 18},${cy - 5} ${cx + 18},${cy - 15}`}
                  fill="#1f2937"
                  fillOpacity="0.9"
                />
                <text
                  x={cx + 70}
                  y={cy - 16}
                  textAnchor="middle"
                  fontSize="12"
                  fill="white"
                  fontWeight="600"
                >
                  #{point.no} ({point.x}, {point.y})
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* Regression line */}
      {regressionLine && currentStep >= 3 && (
        <g>
          <line
            x1={regressionLine.x1}
            y1={regressionLine.y1}
            x2={regressionLine.x2}
            y2={regressionLine.y2}
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Draggable control points for Step 3 - BIGGER & MORE COMFORTABLE */}
          {currentStep === 3 && (
            <>
              {/* Start point - larger touch target */}
              <circle
                cx={regressionLine.x1}
                cy={regressionLine.y1}
                r="25"
                fill="transparent"
                style={{ cursor: 'grab', touchAction: 'none' }}
                onMouseDown={(e) => handleLineMouseDown(e, 'start')}
                onTouchStart={(e) => handleLineTouchStart(e, 'start')}
              />
              <circle
                cx={regressionLine.x1}
                cy={regressionLine.y1}
                r="15"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="4"
                style={{ cursor: 'grab', pointerEvents: 'none' }}
              />
              {/* End point - larger touch target */}
              <circle
                cx={regressionLine.x2}
                cy={regressionLine.y2}
                r="25"
                fill="transparent"
                style={{ cursor: 'grab', touchAction: 'none' }}
                onMouseDown={(e) => handleLineMouseDown(e, 'end')}
                onTouchStart={(e) => handleLineTouchStart(e, 'end')}
              />
              <circle
                cx={regressionLine.x2}
                cy={regressionLine.y2}
                r="15"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="4"
                style={{ cursor: 'grab', pointerEvents: 'none' }}
              />
            </>
          )}
        </g>
      )}
      
    </svg>
  )

  // Step 1: Handle axis selection and auto-generate scales
  const handleAxisSelection = (axis, variable) => {
    if (axis === 'x') {
      // Validation: X-axis HARUS bullying
      if (variable === 'anxiety') {
        setAlertMessage({
          title: '❌ Sumbu X Harus Variabel Bullying!',
          message: 'Dalam diagram pencar, variabel independen (X) adalah Bullying, dan variabel dependen (Y) adalah Kecemasan.'
        })
        setShowAlert(true)
        return // Reject selection
      }
      
      setXAxisVar(variable)
      setYAxisVar(variable === 'bullying' ? 'anxiety' : 'bullying')
    }
  }

  const confirmAxisSelection = () => {
    if (xAxisVar && yAxisVar && surveyData.length > 0) {
      // Auto-generate scales based on data
      const xValues = surveyData.map(d => d[xAxisVar])
      const yValues = surveyData.map(d => d[yAxisVar])
      
      const maxX = Math.max(...xValues)
      const maxY = Math.max(...yValues)
      
      // Round up to nearest 10
      const xScaleValue = Math.ceil(maxX / 10) * 10
      const yScaleValue = Math.ceil(maxY / 10) * 10
      
      setXScale(xScaleValue)
      setYScale(yScaleValue)
      
      // Go directly to step 2 (input data)
      setCurrentStep(2)
      setCurrentDataIndex(0)
    }
  }
  // Step 2: Handle grid click to place point (NEW SYSTEM)
  const handleGridClick = (clickedX, clickedY, e) => {
    if (e) {
      e.stopPropagation() // Prevent toggle UI
    }
    if (currentDataIndex >= surveyData.length) return
    
    const currentData = surveyData[currentDataIndex]
    const correctX = currentData[xAxisVar]
    const correctY = currentData[yAxisVar]
    
    // Validation: exact match required
    if (clickedX === correctX && clickedY === correctY) {
      // ✅ Correct placement
      const newPoint = {
        no: currentData.no,
        x: correctX,
        y: correctY,
        bullying: currentData.bullying,
        anxiety: currentData.anxiety
      }
      
      setPlacedPoints([...placedPoints, newPoint])
      setAttemptFeedback({ type: 'success', message: '✅ Benar! Titik berhasil ditempatkan!' })
      
      // Mark row as checked
      setCheckedRows(prev => ({ ...prev, [currentData.id]: true }))
      
      // Move to next data
      setTimeout(() => {
        if (currentDataIndex + 1 < surveyData.length) {
          setCurrentDataIndex(currentDataIndex + 1)
          setAttemptFeedback(null)
        } else {
          // All data placed, move to step 3
          setCurrentStep(3)
          setAttemptFeedback(null)
          // Initialize regression line di tengah
          setRegressionLine({
            x1: padding + 50,
            y1: chartHeight - padding - 50,
            x2: chartWidth - padding - 50,
            y2: padding + 50
          })
        }
      }, 1000)
      
    } else {
      // ❌ Wrong placement
      setAttemptFeedback({ 
        type: 'error', 
        message: `❌ Salah! Coba lagi.` 
      })
      
      // Clear feedback after 2 seconds
      setTimeout(() => setAttemptFeedback(null), 2000)
    }
  }

  // Zoom controls for mobile
  const handleZoomIn = () => {
    if (currentStep === 2) {
      setVisualZoomStep2(prev => Math.min(prev + 0.2, 3)) // Max 3x zoom (CSS scale)
    } else if (currentStep === 3) {
      setVisualZoom(prev => Math.min(prev + 0.2, 2)) // Max 2x visual zoom
    }
  }

  const handleZoomOut = () => {
    if (currentStep === 2) {
      setVisualZoomStep2(prev => Math.max(prev - 0.2, 0.5)) // Min 0.5x zoom (50%) - CSS scale!
    } else if (currentStep === 3) {
      setVisualZoom(prev => Math.max(prev - 0.2, 0.5)) // Min 0.5x (zoom out!)
    }
  }

  const handleResetZoom = () => {
    if (currentStep === 2) {
      setVisualZoomStep2(1)
      setPanOffset({ x: 0, y: 0 })
    } else if (currentStep === 3) {
      setVisualZoom(1)
    }
  }

  // Handle axis number click to highlight grid
  const handleAxisNumberClick = (axis, value, e) => {
    if (e) {
      e.stopPropagation() // Prevent toggle UI
    }
    if (axis === 'x') {
      setHighlightedX(highlightedX === value ? null : value) // Toggle
    } else {
      setHighlightedY(highlightedY === value ? null : value) // Toggle
    }
  }

  // Toggle UI visibility in fullscreen modal
  const handleToggleUI = (e) => {
    // Prevent toggle during drag
    if (isDragging) return
    setIsUIVisible(prev => !prev)
  }

  const handleChartContainerClick = (e) => {
    // Only toggle if clicking directly on non-interactive elements
    const target = e.target
    const tagName = target.tagName.toLowerCase()
    
    // Check if it's an interactive element (has onClick, cursor pointer, etc)
    const isInteractive = target.style.cursor === 'pointer' || target.onclick
    
    // Only toggle on background elements (div, svg background rect) that are NOT interactive
    if (!isDragging && !isInteractive && (tagName === 'div' || tagName === 'svg' || (tagName === 'rect' && !target.onclick))) {
      handleToggleUI(e)
    }
  }

  // Step 3: Handle regression line drawing
  const handleLineMouseDown = (e, point) => {
    e.preventDefault()
    e.stopPropagation() // Prevent toggle UI
    setIsDragging(true)
    setDragPoint(point)
  }

  const handleLineTouchStart = (e, point) => {
    // Don't call preventDefault here - use CSS touch-action instead
    e.stopPropagation() // Prevent toggle UI
    setIsDragging(true)
    setDragPoint(point)
  }

  const getPointerPosition = (e, rect) => {
    let clientX, clientY
    if (e.touches) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    // Convert to SVG coordinates
    const scaleX = chartWidth / rect.width
    const scaleY = chartHeight / rect.height
    const svgX = x * scaleX
    const svgY = y * scaleY
    
    // Constrain to chart area
    return {
      x: Math.max(padding, Math.min(chartWidth - padding, svgX)),
      y: Math.max(padding, Math.min(chartHeight - padding, svgY))
    }
  }

  const handleChartMouseMove = (e) => {
    if (!isDragging || !dragPoint) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = getPointerPosition(e, rect)
    
    setRegressionLine(prev => ({
      ...prev,
      [dragPoint === 'start' ? 'x1' : 'x2']: pos.x,
      [dragPoint === 'start' ? 'y1' : 'y2']: pos.y
    }))
  }

  const handleChartTouchMove = (e) => {
    if (!isDragging || !dragPoint) return
    // Don't call preventDefault here - use CSS touch-action instead
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = getPointerPosition(e, rect)
    
    setRegressionLine(prev => ({
      ...prev,
      [dragPoint === 'start' ? 'x1' : 'x2']: pos.x,
      [dragPoint === 'start' ? 'y1' : 'y2']: pos.y
    }))
  }

  const handleChartMouseUp = () => {
    setIsDragging(false)
    setDragPoint(null)
  }

  // Block page scroll while dragging regression line on mobile
  useEffect(() => {
    if (!isDragging) return
    const preventScroll = (e) => e.preventDefault()
    document.addEventListener('touchmove', preventScroll, { passive: false })
    return () => document.removeEventListener('touchmove', preventScroll)
  }, [isDragging])

  const confirmRegressionLine = () => {
    if (regressionLine) {
      calculateCorrelation()
      setCurrentStep(4)
    }
  }

  // Step 4: Calculate correlation
  const calculateCorrelation = () => {
    const xValues = placedPoints.map(p => p.x)
    const yValues = placedPoints.map(p => p.y)
    
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

  // Reset function
  const handleReset = async () => {
    // Clear DB first
    await clearProgressFromDB()
    
    // Then reset all states (this ensures UI re-renders after DB is cleared)
    setCurrentStep(1)
    setXAxisVar(null)
    setYAxisVar(null)
    setXScale(null)
    setYScale(null)
    setPlacedPoints([])
    setCurrentDataIndex(0)
    setAttemptFeedback(null)
    setVisualZoomStep2(1)
    setPanOffset({ x: 0, y: 0 })
    setRegressionLine(null)
    setCorrelationScore(null)
    setSelectedPoint(null)
    setCheckedRows({})
  }

  const getStepMessage = () => {
    switch(currentStep) {
      case 1:
        return 'Langkah 1: Tentukan variabel untuk sumbu X dan Y! 📊'
      case 2:
        return 'Langkah 2: Klik pada diagram untuk menempatkan titik data! 🎯'
      case 3:
        return 'Langkah 3: Gambar garis regresi dengan menarik titik merah! 📈'
      case 4:
        return 'Selesai! Ini hasil korelasi dari diagram yang kalian buat! 🎉'
      default:
        return ''
    }
  }

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
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg text-ink-900 font-semibold mb-2">{error}</p>
            <button
              onClick={() => navigate('/kegiatan-belajar/the-challenge/hasil-guiding-activities')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              Kembali
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
          <MiloCharacter pose="explain" className="mb-3" />
          <MiloDialogBubble tailPosition="top" className="max-w-2xl">
            <p className="font-medium text-ink-900 mb-1">
              Mari Buat Diagram Pencar Bersama! 📊
            </p>
            <p className="text-sm text-ink-700">
              {getStepMessage()}
            </p>
          </MiloDialogBubble>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-2">
            Eksplorasi Diagram Pencar
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm text-ink-600 flex-wrap mb-4">
            <span className={`px-3 py-1 rounded-full ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              1. Pilih Variabel
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              2. Input Data
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              3. Gambar Garis
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${currentStep >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              4. Hasil
            </span>
          </div>

          {/* Skip Button - Only show if not completed
          {currentStep < 4 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 md:p-4 w-full md:max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-start gap-2 md:gap-3 text-left w-full">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-semibold text-blue-900 mb-1">
                      ⚡ Ingin Langsung ke Analisis?
                    </p>
                    <p className="text-xs text-blue-700">
                      Jika sudah paham cara membuat diagram pencar, kamu bisa langsung ke Guiding Question
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin skip eksplorasi diagram? Progress tidak akan disimpan.')) {
                      navigate('/kegiatan-belajar/the-challenge/guiding-question')
                    }
                  }}
                  className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span className="hidden md:inline">Skip ke Guiding Question</span>
                  <span className="md:hidden">Skip Eksplorasi</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )} */}
        </div>

        {/* Main Content - Chart BIGGER, Info Smaller */}
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          
          {/* Left Panel: Instructions & Controls */}
          <div className="space-y-6">
            
            {/* Data Table - Same styling as HasilGuidingActivities with Pagination */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Table className="w-5 h-5 text-primary-600" />
                <h3 className="text-base md:text-lg font-poppins font-semibold text-ink-900">
                  Data Hasil Survey Kelas ({surveyData.length} responden)
                </h3>
              </div>
              
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700">No.</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700">Bullying</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-ink-700">Kecemasan</th>
                      {currentStep >= 2 && (
                        <th className="text-center py-2 md:py-3 px-1 md:px-2 text-xs md:text-sm font-semibold text-ink-700">✓</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {surveyData
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((data, idx) => {
                        const globalIdx = (currentPage - 1) * itemsPerPage + idx
                        return (
                          <tr 
                            key={data.id} 
                            className={`border-b border-gray-200 ${checkedRows[data.id] ? 'bg-green-50' : ''}`}
                          >
                            <td className="py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm text-ink-700">
                              {data.no}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base font-bold text-ink-900">
                              {data.bullying}
                            </td>
                            <td className="py-2 md:py-3 px-2 md:px-4 text-sm md:text-base font-bold text-ink-900">
                              {data.anxiety}
                            </td>
                            {currentStep >= 2 && (
                              <td className="py-2 md:py-3 px-1 md:px-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!checkedRows[data.id]}
                                  onChange={() => setCheckedRows(prev => ({ ...prev, [data.id]: !prev[data.id] }))}
                                  className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer accent-green-600"
                                />
                              </td>
                            )}
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {surveyData.length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500'
                    }`}
                    aria-label="Halaman sebelumnya"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const totalPages = Math.ceil(surveyData.length / itemsPerPage)
                      const pages = []
                      
                      // Always show max 3 page buttons
                      if (totalPages <= 3) {
                        // Show all pages if 3 or less
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // More than 3 pages - smart display
                        if (currentPage === 1) {
                          // At first page: 1 2 3 ...
                          pages.push(1, 2, 3, '...')
                        } else if (currentPage === totalPages) {
                          // At last page: ... (n-2) (n-1) n
                          pages.push('...', totalPages - 2, totalPages - 1, totalPages)
                        } else if (currentPage === 2) {
                          // At second page: 1 2 3 ...
                          pages.push(1, 2, 3, '...')
                        } else if (currentPage === totalPages - 1) {
                          // At second to last: ... (n-2) (n-1) n
                          pages.push('...', totalPages - 2, totalPages - 1, totalPages)
                        } else {
                          // In the middle: ... (current-1) current (current+1) ...
                          pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...')
                        }
                      }

                      return pages.map((page, idx) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-ink-500">
                              ...
                            </span>
                          )
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all ${
                              currentPage === page
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white border-2 border-gray-200 text-ink-700 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })
                    })()}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(surveyData.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(surveyData.length / itemsPerPage)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      currentPage === Math.ceil(surveyData.length / itemsPerPage)
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500'
                    }`}
                    aria-label="Halaman berikutnya"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Step-specific Controls */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border-2 border-primary-300"
              >
                <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-4">
                  📊 Pilih Variabel untuk Sumbu
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-ink-700 mb-2">Sumbu X (Horizontal):</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAxisSelection('x', 'bullying')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          xAxisVar === 'bullying'
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-ink-700 border-gray-300 hover:border-primary-400'
                        }`}
                      >
                        Skor Bullying
                      </button>
                      <button
                        onClick={() => handleAxisSelection('x', 'anxiety')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                          xAxisVar === 'anxiety'
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-ink-700 border-gray-300 hover:border-primary-400'
                        }`}
                      >
                        Skor Kecemasan
                      </button>
                    </div>
                  </div>

                  {xAxisVar && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-sm font-medium text-ink-700 mb-2">Sumbu Y (Vertikal):</p>
                      <div className="px-4 py-3 rounded-lg bg-white border-2 border-primary-600 font-medium text-ink-900">
                        {yAxisVar === 'bullying' ? 'Skor Bullying' : 'Skor Kecemasan'}
                        <span className="text-xs text-ink-600 ml-2">(otomatis dipilih)</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={confirmAxisSelection}
                  disabled={!xAxisVar || !yAxisVar}
                  className={`w-full mt-4 px-4 py-3 rounded-xl font-semibold transition-all ${
                    xAxisVar && yAxisVar
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Konfirmasi & Lanjut
                </button>
              </motion.div>
            )}

            {/* Step 2: Grid-Based Data Placement */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-400"
              >
                <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-4">
                  🎯 Klik Diagram untuk Menempatkan Titik
                </h3>
                
                {/* Current data info */}
                {currentDataIndex < surveyData.length && (
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-ink-700 mb-2 font-semibold">
                      Data Responden #{surveyData[currentDataIndex].no}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-ink-600 mb-1">Bullying</p>
                        <p className="text-lg font-bold text-blue-700">{surveyData[currentDataIndex].bullying}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-xs text-ink-600 mb-1">Kecemasan</p>
                        <p className="text-lg font-bold text-orange-700">{surveyData[currentDataIndex].anxiety}</p>
                      </div>
                    </div>
                    <p className="text-xs text-ink-500 mt-2">
                      💡 Klik pada diagram sesuai koordinat (X, Y) yang benar
                    </p>
                  </div>
                )}

                {/* Attempt feedback */}
                {attemptFeedback && (
                  <div className={`rounded-lg p-3 mb-4 ${
                    attemptFeedback.type === 'success' 
                      ? 'bg-green-100 border border-green-400' 
                      : 'bg-red-100 border border-red-400'
                  }`}>
                    <p className={`text-sm font-medium ${
                      attemptFeedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {attemptFeedback.message}
                    </p>
                  </div>
                )}

                {/* Progress bar */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    Progress: {placedPoints.length} / {surveyData.length} data sudah ditempatkan
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(placedPoints.length / surveyData.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Draw Regression Line */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-400"
              >
                <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-4 flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Gambar Garis Regresi
                </h3>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-ink-700 mb-2">
                    <strong>Instruksi:</strong>
                  </p>
                  <ol className="text-sm text-ink-600 space-y-1 list-decimal list-inside">
                    <li>Tarik titik merah di diagram untuk mengatur posisi garis</li>
                    <li>Sesuaikan garis agar melewati tengah-tengah sebaran titik</li>
                    <li>Garis tidak harus tepat melewati semua titik</li>
                    <li>Usahakan jarak titik ke garis seimbang di kedua sisi</li>
                  </ol>
                </div>

                <button
                  onClick={confirmRegressionLine}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Konfirmasi Garis & Hitung Korelasi
                </button>
              </motion.div>
            )}

            {/* Step 4: Result */}
            {currentStep === 4 && correlationScore !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-400"
              >
                <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-4 text-center flex items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Hasil Korelasi
                </h3>
                
                <div className="bg-white rounded-xl p-6 text-center mb-4">
                  <p className="text-6xl font-bold text-primary-700 mb-2">
                    {correlationScore.toFixed(3)}
                  </p>
                  <p className="text-base text-ink-600 mb-1 font-medium">
                    {Math.abs(correlationScore) <= 0.19 
                      ? 'Tidak Berkorelasi' 
                      : correlationScore > 0 
                        ? 'Korelasi Positif' 
                        : 'Korelasi Negatif'}
                  </p>
                  <p className="text-sm text-ink-500">
                    Kekuatan: {Math.abs(correlationScore) <= 0.19 
                      ? 'Sangat Lemah'
                      : Math.abs(correlationScore) > 0.7 
                        ? 'Kuat' 
                        : Math.abs(correlationScore) > 0.4 
                          ? 'Sedang' 
                          : 'Lemah'}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 text-center">
                    💾 Progress otomatis tersimpan!<br/>
                    Kalian bisa presentasikan hasil ini.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/kegiatan-belajar/the-challenge/guiding-question')}
                  className="w-full px-4 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  Lanjut ke Guiding Question
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Continue to Step 2, 3, 4, 5 controls... */}
            
            {/* Reset button - always available after step 1 */}
            {currentStep > 1 && (
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-ink-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset & Mulai Ulang
              </button>
            )}

          </div>

          {/* Right Panel: Chart - CONTAINED */}
          <div className="lg:order-2 min-w-0">
            <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-gray-300 lg:sticky lg:top-8 overflow-hidden">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">
                📈 Diagram Kartesius
              </h3>
              
              {/* SVG Chart - Scrollable when zoomed (CONTAINED) */}
              <div 
                className="relative overflow-auto bg-gray-50 rounded-lg p-2"
                style={{ maxHeight: '800px', maxWidth: '100%' }}
                onMouseMove={currentStep === 3 ? handleChartMouseMove : undefined}
                onMouseUp={currentStep === 3 ? handleChartMouseUp : undefined}
                onMouseLeave={currentStep === 3 ? handleChartMouseUp : undefined}
                onTouchMove={currentStep === 3 ? handleChartTouchMove : undefined}
                onTouchEnd={currentStep === 3 ? handleChartMouseUp : undefined}
                onTouchCancel={currentStep === 3 ? handleChartMouseUp : undefined}
              >
                <div className="inline-block min-w-min">
                  {renderChartSVG()}
                </div>
              </div>

              {/* Mobile: Button to open fullscreen chart (Step 2 & 3) */}
              {(currentStep === 2 || currentStep === 3) && (
                <button
                  onClick={() => setIsMobileChartFullscreen(true)}
                  className="mt-4 lg:hidden w-full px-4 py-3 bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-5 h-5" />
                  {currentStep === 2 ? 'Perbesar Diagram' : 'Perbesar'}
                </button>
              )}

              {/* Desktop: Button to open fullscreen chart (Step 2 & 3) */}
              {(currentStep === 2 || currentStep === 3) && (
                <button
                  onClick={() => setIsDesktopChartFullscreen(true)}
                  className="mt-4 hidden lg:flex w-full px-4 py-3 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-colors items-center justify-center gap-2"
                >
                  <Maximize2 className="w-5 h-5" />
                  {currentStep === 2 ? 'Perbesar Diagram' : 'Perbesar Diagram'}
                </button>
              )}

              {currentStep === 3 && (
                <p className="text-xs text-ink-500 mt-3 text-center">
                  💡 Tarik titik merah untuk mengatur garis regresi
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Fullscreen Chart Modal (Step 2 & 3) */}
      <AnimatePresence>
        {isMobileChartFullscreen && (currentStep === 2 || currentStep === 3) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white lg:hidden"
            onClick={handleChartContainerClick}
          >
            {/* Chart Container - FULL SCREEN */}
            <div 
              className="absolute inset-0 overflow-auto"
              style={{ touchAction: isDragging ? 'none' : 'auto' }}
              onMouseMove={currentStep === 3 ? handleChartMouseMove : undefined}
              onMouseUp={currentStep === 3 ? handleChartMouseUp : undefined}
              onMouseLeave={currentStep === 3 ? handleChartMouseUp : undefined}
              onTouchMove={currentStep === 3 ? handleChartTouchMove : undefined}
              onTouchEnd={currentStep === 3 ? handleChartMouseUp : undefined}
              onTouchCancel={currentStep === 3 ? handleChartMouseUp : undefined}
            >
              <div 
                className="inline-block min-w-min"
                style={{ 
                  transform: `scale(${currentStep === 2 ? visualZoomStep2 : visualZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {renderChartSVG()}
              </div>
            </div>

            {/* Header - ABSOLUTE, ON TOP OF CHART */}
            <motion.div 
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: isUIVisible ? 0 : -200,
                opacity: isUIVisible ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 right-0 z-10 bg-primary-700 text-white px-4 py-3 flex items-center justify-between shadow-lg"
              style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1">
                <h2 className="text-lg font-bold">
                  {currentStep === 2 ? '📊 Diagram Kartesius' : '📈 Atur Garis Regresi'}
                </h2>
                <p className="text-xs text-primary-100">
                  {currentStep === 2 
                    ? 'Ketuk chart untuk minimize/maximize UI'
                    : 'Ketuk chart untuk minimize/maximize UI • Tarik garis merah'}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMobileChartFullscreen(false)
                }}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>

            {/* Current Data Info - ABSOLUTE, BELOW HEADER */}
            {currentStep === 2 && currentDataIndex < surveyData.length && (
              <motion.div 
                initial={{ y: 0, opacity: 1 }}
                animate={{ 
                  y: isUIVisible ? 0 : -200,
                  opacity: isUIVisible ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-[60px] left-0 right-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b-2 border-blue-200"
                style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-ink-600 mb-1">Responden #{surveyData[currentDataIndex].no}</p>
                    <div className="flex gap-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-blue-600">Bullying:</span>
                        <span className="text-xl font-bold text-blue-700">{surveyData[currentDataIndex].bullying}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-orange-600">Kecemasan:</span>
                        <span className="text-xl font-bold text-orange-700">{surveyData[currentDataIndex].anxiety}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-500">
                    {placedPoints.length}/{surveyData.length}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Feedback Alert - ABSOLUTE, BELOW DATA INFO OR HEADER */}
            {attemptFeedback && (
              <motion.div 
                initial={{ y: 0, opacity: 1 }}
                animate={{ 
                  y: isUIVisible ? 0 : -200,
                  opacity: isUIVisible ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`absolute ${currentStep === 2 ? 'top-[140px]' : 'top-[60px]'} left-0 right-0 z-10 px-4 py-2 text-center font-medium ${
                  attemptFeedback.type === 'success' 
                    ? 'bg-green-100 text-green-800 border-b-2 border-green-400' 
                    : 'bg-red-100 text-red-800 border-b-2 border-red-400'
                }`}
                style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                {attemptFeedback.message}
              </motion.div>
            )}

            {/* Zoom Controls - ABSOLUTE BOTTOM */}
            <motion.div 
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: isUIVisible ? 0 : 200,
                opacity: isUIVisible ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-10 left-0 right-0 z-10 bg-gray-50 px-4 py-3 border-t-2 border-gray-300 flex items-center justify-center gap-3"
              style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleZoomOut}
                disabled={currentStep === 2 ? visualZoomStep2 <= 0.5 : visualZoom <= 0.5}
                className="w-12 h-12 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center disabled:opacity-50 shadow-md"
              >
                <span className="text-2xl font-bold text-gray-700">−</span>
              </button>
              <span className="text-base font-bold text-gray-700 min-w-[60px] text-center">
                {currentStep === 2 
                  ? `${(visualZoomStep2 * 100).toFixed(0)}%`
                  : `${(visualZoom * 100).toFixed(0)}%`}
              </span>
              <button
                onClick={handleZoomIn}
                disabled={currentStep === 2 ? visualZoomStep2 >= 3 : visualZoom >= 2}
                className="w-12 h-12 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center disabled:opacity-50 shadow-md"
              >
                <span className="text-2xl font-bold text-gray-700">+</span>
              </button>
              {((currentStep === 2 && zoomLevel !== 1) || (currentStep === 3 && visualZoom !== 1)) && (
                <button
                  onClick={handleResetZoom}
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-medium shadow-md"
                >
                  Reset
                </button>
              )}
            </motion.div>

            {/* Hint - ABSOLUTE BOTTOM */}
            <motion.div 
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: isUIVisible ? 0 : 200,
                opacity: isUIVisible ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 z-10 bg-blue-50 px-4 py-2 text-center text-xs text-blue-800 border-t border-blue-200"
              style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentStep === 2 
                ? '💡 Ketuk chart untuk minimize/maximize UI • Klik angka di sumbu untuk highlight garis'
                : '💡 Ketuk chart untuk minimize/maximize UI • Zoom untuk adjust tampilan • Tarik ujung garis merah'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Fullscreen Chart Modal (Step 2 & 3) */}
      <AnimatePresence>
        {isDesktopChartFullscreen && (currentStep === 2 || currentStep === 3) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white hidden lg:block"
            onClick={handleChartContainerClick}
          >
            {/* Chart Container - FULL SCREEN */}
            <div 
              className="absolute inset-0 overflow-auto"
              style={{ touchAction: isDragging ? 'none' : 'auto' }}
              onMouseMove={currentStep === 3 ? handleChartMouseMove : undefined}
              onMouseUp={currentStep === 3 ? handleChartMouseUp : undefined}
              onMouseLeave={currentStep === 3 ? handleChartMouseUp : undefined}
              onTouchMove={currentStep === 3 ? handleChartTouchMove : undefined}
              onTouchEnd={currentStep === 3 ? handleChartMouseUp : undefined}
              onTouchCancel={currentStep === 3 ? handleChartMouseUp : undefined}
            >
              <div 
                className="inline-block min-w-min"
                style={{ 
                  transform: `scale(${currentStep === 2 ? visualZoomStep2 : visualZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {renderChartSVG()}
              </div>
            </div>

            {/* Header - ABSOLUTE, ON TOP OF CHART */}
            <motion.div 
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: isUIVisible ? 0 : -200,
                opacity: isUIVisible ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 right-0 z-10 bg-primary-700 text-white px-6 py-4 flex items-center justify-between shadow-lg"
              style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {currentStep === 2 ? '📊 Diagram Kartesius' : '📈 Atur Garis Regresi'}
                </h2>
                <p className="text-sm text-primary-100">
                  {currentStep === 2 
                    ? 'Klik chart untuk minimize/maximize UI • Klik angka di sumbu untuk highlight garis'
                    : 'Klik chart untuk minimize/maximize UI • Tarik titik merah untuk mengatur garis'}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDesktopChartFullscreen(false)
                }}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-7 h-7" />
              </button>
            </motion.div>

            {/* Current Data Info - ABSOLUTE, BELOW HEADER */}
            {currentStep === 2 && currentDataIndex < surveyData.length && (
              <motion.div 
                initial={{ y: 0, opacity: 1 }}
                animate={{ 
                  y: isUIVisible ? 0 : -200,
                  opacity: isUIVisible ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-[72px] left-0 right-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b-2 border-blue-200"
                style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 max-w-5xl mx-auto">
                  <div className="flex-1">
                    <p className="text-sm text-ink-600 mb-2 font-semibold">
                      Data Responden #{surveyData[currentDataIndex].no}
                    </p>
                    <div className="flex gap-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-blue-600 font-medium">Skor Bullying:</span>
                        <span className="text-3xl font-bold text-blue-700">{surveyData[currentDataIndex].bullying}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-orange-600 font-medium">Skor Kecemasan:</span>
                        <span className="text-3xl font-bold text-orange-700">{surveyData[currentDataIndex].anxiety}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-blue-300">
                    <p className="text-xs text-ink-500 mb-1">Progress</p>
                    <p className="text-lg font-bold text-blue-700">
                      {placedPoints.length}/{surveyData.length}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Feedback Alert - ABSOLUTE, BELOW DATA INFO OR HEADER */}
            {attemptFeedback && (
              <motion.div 
                initial={{ y: 0, opacity: 1 }}
                animate={{ 
                  y: isUIVisible ? 0 : -200,
                  opacity: isUIVisible ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`absolute ${currentStep === 2 ? 'top-[160px]' : 'top-[72px]'} left-0 right-0 z-10 px-6 py-3 text-center font-semibold text-lg ${
                  attemptFeedback.type === 'success' 
                    ? 'bg-green-100 text-green-800 border-b-2 border-green-400' 
                    : 'bg-red-100 text-red-800 border-b-2 border-red-400'
                }`}
                style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                {attemptFeedback.message}
              </motion.div>
            )}

            {/* Zoom Controls - ABSOLUTE BOTTOM */}
            <motion.div 
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: isUIVisible ? 0 : 200,
                opacity: isUIVisible ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-12 left-0 right-0 z-10 bg-gray-50 px-6 py-4 border-t-2 border-gray-300 flex items-center justify-center gap-4"
              style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleZoomOut}
                disabled={currentStep === 2 ? visualZoomStep2 <= 0.5 : visualZoom <= 0.5}
                className="w-14 h-14 rounded-full bg-white border-2 border-gray-400 hover:border-gray-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                <span className="text-3xl font-bold text-gray-700">−</span>
              </button>
              <span className="text-xl font-bold text-gray-700 min-w-[80px] text-center">
                {currentStep === 2 
                  ? `${(visualZoomStep2 * 100).toFixed(0)}%`
                  : `${(visualZoom * 100).toFixed(0)}%`}
              </span>
              <button
                onClick={handleZoomIn}
                disabled={currentStep === 2 ? visualZoomStep2 >= 3 : visualZoom >= 2}
                className="w-14 h-14 rounded-full bg-white border-2 border-gray-400 hover:border-gray-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                <span className="text-3xl font-bold text-gray-700">+</span>
              </button>
              {((currentStep === 2 && visualZoomStep2 !== 1) || (currentStep === 3 && visualZoom !== 1)) && (
                <button
                  onClick={handleResetZoom}
                  className="px-6 py-3 text-base rounded-lg bg-primary-600 text-white hover:bg-primary-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Reset Zoom
                </button>
              )}
            </motion.div>

            {/* Hint - ABSOLUTE BOTTOM */}
            <motion.div 
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: isUIVisible ? 0 : 200,
                opacity: isUIVisible ? 1 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 z-10 bg-blue-50 px-6 py-3 text-center text-sm text-blue-800 border-t border-blue-200"
              style={{ pointerEvents: isUIVisible ? 'auto' : 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentStep === 2 
                ? '💡 Klik chart untuk minimize/maximize UI • Klik angka di sumbu untuk highlight garis grid • Zoom untuk memperbesar tampilan'
                : '💡 Klik chart untuk minimize/maximize UI • Gunakan zoom untuk mempermudah pengaturan • Tarik titik merah di ujung garis'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Alert Modal */}
      <AnimatePresence>
        {showAlert && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlert(false)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              {/* Alert Bubble */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                {/* Header with gradient */}
                <div className="bg-red-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    {alertMessage.title}
                  </h3>
                </div>
                
                {/* Content */}
                <div className="px-6 py-6">
                  <p className="text-ink-700 text-base leading-relaxed">
                    {alertMessage.message}
                  </p>
                </div>
                
                {/* Footer with button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setShowAlert(false)}
                    className="w-full px-6 py-3 bg-primary-700 hover:primary-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                  >
                    Mengerti
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </LearningLayout>
  )
}

