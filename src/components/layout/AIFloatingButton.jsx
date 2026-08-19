import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AIChatPanel from '../ai/AIChatPanel'
import { supabase } from '../../lib/supabaseClient'

export default function AIFloatingButton({ context }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [surveyScores, setSurveyScores] = useState(null)
  const [classSurveyData, setClassSurveyData] = useState(null)

  // Fetch survey data based on context
  useEffect(() => {
    async function fetchSurveyData() {
      try {
        const siswaId = localStorage.getItem('mentalytics_student_id')
        const kelasId = localStorage.getItem('mentalytics_kelas_id')
        if (!siswaId || !kelasId) return

        // For hasil_tes context: fetch individual scores
        if (context === 'hasil_tes') {
          const { data, error } = await supabase
            .from('survey_results')
            .select('skor_bullying, skor_anxiety')
            .eq('siswa_id', siswaId)
            .single()

          if (data && !error) {
            const getBullyingCategory = (score) => {
              return score >= 22 ? 'Terindikasi korban bullying' : 'Tidak terindikasi'
            }
            
            const getAnxietyCategory = (score) => {
              if (score < 14) return 'Tidak ada kecemasan'
              if (score <= 20) return 'Kecemasan ringan'
              if (score <= 27) return 'Kecemasan sedang'
              if (score <= 41) return 'Kecemasan berat'
              return 'Kecemasan panik'
            }

            setSurveyScores({
              bullying: data.skor_bullying,
              anxiety: data.skor_anxiety,
              bullyingCategory: getBullyingCategory(data.skor_bullying),
              anxietyCategory: getAnxietyCategory(data.skor_anxiety)
            })
            console.log('📊 Fetched survey scores for AI context:', data)
          }
        }
        
        // For solution context: fetch class survey data
        if (context === 'solution') {
          // Get all students in the class
          const { data: students, error: studentsError } = await supabase
            .from('siswa')
            .select('id')
            .eq('kelas_id', kelasId)

          if (studentsError) throw studentsError
          
          const studentIds = students.map(s => s.id)

          // Get survey results for all students
          const { data: results, error: resultsError } = await supabase
            .from('survey_results')
            .select('skor_bullying, skor_anxiety')
            .in('siswa_id', studentIds)

          if (resultsError) throw resultsError

          if (results && results.length > 0) {
            // Calculate statistics
            const totalResponses = results.length
            const bullyingScores = results.map(r => r.skor_bullying)
            const anxietyScores = results.map(r => r.skor_anxiety)
            
            const avgBullying = Math.round(bullyingScores.reduce((a, b) => a + b, 0) / totalResponses)
            const avgAnxiety = Math.round(anxietyScores.reduce((a, b) => a + b, 0) / totalResponses)
            
            const maxBullying = Math.max(...bullyingScores)
            const minBullying = Math.min(...bullyingScores)
            const maxAnxiety = Math.max(...anxietyScores)
            const minAnxiety = Math.min(...anxietyScores)
            
            // Count categories
            const bullyingVictims = bullyingScores.filter(s => s >= 22).length
            
            const anxietyCategories = {
              none: anxietyScores.filter(s => s < 14).length,
              mild: anxietyScores.filter(s => s >= 14 && s <= 20).length,
              moderate: anxietyScores.filter(s => s >= 21 && s <= 27).length,
              severe: anxietyScores.filter(s => s >= 28 && s <= 41).length,
              panic: anxietyScores.filter(s => s >= 42).length
            }

            // Calculate correlation (Pearson's r)
            const meanBullying = bullyingScores.reduce((a, b) => a + b, 0) / totalResponses
            const meanAnxiety = anxietyScores.reduce((a, b) => a + b, 0) / totalResponses
            
            let numerator = 0
            let sumSqBullying = 0
            let sumSqAnxiety = 0
            
            for (let i = 0; i < totalResponses; i++) {
              const diffBullying = bullyingScores[i] - meanBullying
              const diffAnxiety = anxietyScores[i] - meanAnxiety
              numerator += diffBullying * diffAnxiety
              sumSqBullying += diffBullying * diffBullying
              sumSqAnxiety += diffAnxiety * diffAnxiety
            }
            
            const correlation = numerator / Math.sqrt(sumSqBullying * sumSqAnxiety)
            
            // Determine correlation strength
            let correlationStrength = ''
            const absCorr = Math.abs(correlation)
            if (absCorr >= 0.7) correlationStrength = 'sangat kuat'
            else if (absCorr >= 0.5) correlationStrength = 'kuat'
            else if (absCorr >= 0.3) correlationStrength = 'sedang'
            else if (absCorr >= 0.1) correlationStrength = 'lemah'
            else correlationStrength = 'sangat lemah'
            
            const correlationDirection = correlation > 0 ? 'positif' : 'negatif'

            setClassSurveyData({
              totalResponses,
              avgBullying,
              avgAnxiety,
              maxBullying,
              minBullying,
              maxAnxiety,
              minAnxiety,
              bullyingVictims,
              bullyingVictimsPercent: Math.round((bullyingVictims / totalResponses) * 100),
              anxietyCategories,
              correlation: correlation.toFixed(3),
              correlationStrength,
              correlationDirection,
              rawData: results
            })
            
            console.log('📊 Fetched class survey data for AI context:', {
              totalResponses,
              avgBullying,
              avgAnxiety,
              correlation: correlation.toFixed(3)
            })
          }
        }
      } catch (err) {
        console.error('Error fetching survey data:', err)
      }
    }

    fetchSurveyData()
  }, [context])

  return (
    <>
      {/* Floating Button with Icon - NO PULSE ANIMATION */}
      <motion.button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-28 right-6 group z-40"
        aria-label="Tanya AI"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Button container - White background, NO pulse */}
        <div className="relative bg-white hover:bg-gray-50 p-3 rounded-full shadow-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
          {!imageError ? (
            <img 
              src="/assets/icon/ai-icon.png" 
              alt="AI Helper"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-purple-600" />
          )}
        </div>

        {/* Label tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-ink-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
            >
              Tanya AI
              <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-px">
                <div className="border-4 border-transparent border-l-ink-900"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* AI Chat Panel */}
      {isOpen && (
        <AIChatPanel
          context={context}
          onClose={() => setIsOpen(false)}
          surveyScores={surveyScores}
          classSurveyData={classSurveyData}
        />
      )}
    </>
  )
}
