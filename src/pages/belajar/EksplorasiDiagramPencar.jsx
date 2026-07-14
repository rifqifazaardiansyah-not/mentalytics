import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RotateCcw, CheckCircle2, AlertCircle, Table, PenTool, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'

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
  
  // Step 2: Input data points
  const [inputtedPoints, setInputtedPoints] = useState([])
  const [currentInputIndex, setCurrentInputIndex] = useState(0)
  const [inputX, setInputX] = useState('')
  const [inputY, setInputY] = useState('')
  
  // Step 3: Draw regression line
  const [regressionLine, setRegressionLine] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPoint, setDragPoint] = useState(null) // 'start' or 'end'
  
  // Step 4: Calculate correlation
  const [correlationScore, setCorrelationScore] = useState(null)
  
  // Tooltip for clicked data point
  const [selectedPoint, setSelectedPoint] = useState(null)
  
  // Manual checklist for table rows
  const [checkedRows, setCheckedRows] = useState({})
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  // Chart dimensions
  const chartWidth = 600
  const chartHeight = 600
  const padding = 60

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
        inputted_points: inputtedPoints,
        current_input_index: currentInputIndex,
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
        if (data.inputted_points) setInputtedPoints(data.inputted_points)
        if (data.current_input_index !== undefined) setCurrentInputIndex(data.current_input_index)
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
  }, [currentStep, inputtedPoints, regressionLine, correlationScore, checkedRows, kelasId])

  // Auto-navigate to the correct page when inputting data
  useEffect(() => {
    if (currentStep === 2 && currentInputIndex >= 0) {
      const targetPage = Math.floor(currentInputIndex / itemsPerPage) + 1
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage)
      }
    }
  }, [currentStep, currentInputIndex])

  // Helper: Convert value to coordinate
  const valueToCoord = (value, max, dimension) => {
    return padding + (value / max) * (dimension - 2 * padding)
  }

  // Step 1: Handle axis selection and auto-generate scales
  const handleAxisSelection = (axis, variable) => {
    if (axis === 'x') {
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
      setCurrentInputIndex(0)
    }
  }
  // Step 2: Handle data input
  const handleDataInput = () => {
    const x = parseFloat(inputX)
    const y = parseFloat(inputY)
    
    if (isNaN(x) || isNaN(y)) {
      alert('Masukkan angka yang valid!')
      return
    }
    
    if (x < 0 || x > xScale || y < 0 || y > yScale) {
      alert(`Nilai harus dalam range 0-${xScale} untuk X dan 0-${yScale} untuk Y!`)
      return
    }
    
    const newPoint = {
      no: surveyData[currentInputIndex].no,
      x: x,
      y: y,
      actualX: surveyData[currentInputIndex][xAxisVar],
      actualY: surveyData[currentInputIndex][yAxisVar]
    }
    
    setInputtedPoints([...inputtedPoints, newPoint])
    setInputX('')
    setInputY('')
    
    if (currentInputIndex + 1 < surveyData.length) {
      setCurrentInputIndex(currentInputIndex + 1)
    } else {
      setCurrentStep(3)
      // Initialize regression line di tengah
      setRegressionLine({
        x1: padding + 50,
        y1: chartHeight - padding - 50,
        x2: chartWidth - padding - 50,
        y2: padding + 50
      })
    }
  }

  // Step 3: Handle regression line drawing
  const handleLineMouseDown = (e, point) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragPoint(point)
  }

  const handleLineTouchStart = (e, point) => {
    e.preventDefault()
    e.stopPropagation()
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
    e.preventDefault()
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
    const xValues = inputtedPoints.map(p => p.x)
    const yValues = inputtedPoints.map(p => p.y)
    
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
    setCurrentStep(1)
    setXAxisVar(null)
    setYAxisVar(null)
    setXScale(null)
    setYScale(null)
    setInputtedPoints([])
    setCurrentInputIndex(0)
    setInputX('')
    setInputY('')
    setRegressionLine(null)
    setCorrelationScore(null)
    setSelectedPoint(null)
    setCheckedRows({})
    await clearProgressFromDB()
  }

  const getStepMessage = () => {
    switch(currentStep) {
      case 1:
        return 'Langkah 1: Tentukan variabel untuk sumbu X dan Y! 📊'
      case 2:
        return 'Langkah 2: Input data dari tabel ke diagram! ✏️'
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
          <div className="flex items-center justify-center gap-2 text-sm text-ink-600 flex-wrap">
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
        </div>

        {/* Main Content - akan saya lanjutkan di bagian berikutnya karena sangat panjang */}
        
        <div className="grid lg:grid-cols-[1fr_600px] gap-8">
          
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

            {/* Step 2: Data Input */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-400"
              >
                <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-4">
                  ✏️ Input Data Titik
                </h3>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-ink-700 mb-2">
                    Input data :
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-ink-600 block mb-1">
                        Nilai X ({xAxisVar === 'bullying' ? 'Bullying' : 'Kecemasan'})
                      </label>
                      <input
                        type="number"
                        value={inputX}
                        onChange={(e) => setInputX(e.target.value)}
                        placeholder="0"
                        min="0"
                        max={xScale}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-600 block mb-1">
                        Nilai Y ({yAxisVar === 'bullying' ? 'Bullying' : 'Kecemasan'})
                      </label>
                      <input
                        type="number"
                        value={inputY}
                        onChange={(e) => setInputY(e.target.value)}
                        placeholder="0"
                        min="0"
                        max={yScale}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-800">
                    Progress: {inputtedPoints.length} / {surveyData.length} data sudah diinput
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(inputtedPoints.length / surveyData.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={handleDataInput}
                  disabled={!inputX || !inputY}
                  className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                    inputX && inputY
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentInputIndex + 1 < surveyData.length ? 'Input & Lanjut ke Data Berikutnya' : 'Input Data Terakhir & Lanjut'}
                </button>
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
                    {Math.abs(correlationScore) <= 0.3 
                      ? 'Tidak Berkorelasi' 
                      : correlationScore > 0 
                        ? 'Korelasi Positif' 
                        : 'Korelasi Negatif'}
                  </p>
                  <p className="text-sm text-ink-500">
                    Kekuatan: {Math.abs(correlationScore) <= 0.3 
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

          {/* Right Panel: Chart */}
          <div className="lg:order-2">
            <div className="bg-white rounded-xl p-6 shadow-xl border-2 border-gray-300 lg:sticky lg:top-8">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">
                📈 Diagram Kartesius
              </h3>
              
              {/* SVG Chart - akan dilengkapi */}
              <div 
                className="relative"
                onMouseMove={currentStep === 3 ? handleChartMouseMove : undefined}
                onMouseUp={currentStep === 3 ? handleChartMouseUp : undefined}
                onMouseLeave={currentStep === 3 ? handleChartMouseUp : undefined}
                onTouchMove={currentStep === 3 ? handleChartTouchMove : undefined}
                onTouchEnd={currentStep === 3 ? handleChartMouseUp : undefined}
                onTouchCancel={currentStep === 3 ? handleChartMouseUp : undefined}
              >
                <svg
                  width="100%"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="border-2 border-gray-400 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
                  style={currentStep === 3 ? { touchAction: 'none' } : undefined}
                >
                  {/* Grid lines - only if scale selected */}
                  {xScale && yScale && (
                    <>
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
                    </>
                  )}

                  {/* Main Axes with manual arrows */}
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

                  {/* Scale markers */}
                  {xScale && yScale && (
                    <>
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
                    </>
                  )}

                  {/* Data points */}
                  {inputtedPoints.map((point, idx) => {
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
                      {currentStep === 3 && (
                        <>
                          {/* Start point - larger touch target */}
                          <circle
                            cx={regressionLine.x1}
                            cy={regressionLine.y1}
                            r="20"
                            fill="transparent"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => handleLineMouseDown(e, 'start')}
                            onTouchStart={(e) => handleLineTouchStart(e, 'start')}
                          />
                          <circle
                            cx={regressionLine.x1}
                            cy={regressionLine.y1}
                            r="10"
                            fill="#dc2626"
                            stroke="#fff"
                            strokeWidth="3"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => handleLineMouseDown(e, 'start')}
                            onTouchStart={(e) => handleLineTouchStart(e, 'start')}
                          />
                          {/* End point - larger touch target */}
                          <circle
                            cx={regressionLine.x2}
                            cy={regressionLine.y2}
                            r="20"
                            fill="transparent"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => handleLineMouseDown(e, 'end')}
                            onTouchStart={(e) => handleLineTouchStart(e, 'end')}
                          />
                          <circle
                            cx={regressionLine.x2}
                            cy={regressionLine.y2}
                            r="10"
                            fill="#dc2626"
                            stroke="#fff"
                            strokeWidth="3"
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => handleLineMouseDown(e, 'end')}
                            onTouchStart={(e) => handleLineTouchStart(e, 'end')}
                          />
                        </>
                      )}
                    </g>
                  )}
                </svg>
              </div>

              {currentStep === 3 && (
                <p className="text-xs text-ink-500 mt-3 text-center">
                  💡 Tarik titik merah untuk mengatur garis regresi
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </LearningLayout>
  )
}

