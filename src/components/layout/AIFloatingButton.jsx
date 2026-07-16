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

  // Fetch survey scores if context is hasil_tes
  useEffect(() => {
    async function fetchSurveyScores() {
      if (context === 'hasil_tes') {
        try {
          const siswaId = localStorage.getItem('mentalytics_student_id')
          if (!siswaId) return

          const { data, error } = await supabase
            .from('survey_results')
            .select('skor_bullying, skor_anxiety')
            .eq('siswa_id', siswaId)
            .single()

          if (data && !error) {
            // Helper function to get category
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
        } catch (err) {
          console.error('Error fetching survey scores:', err)
        }
      }
    }

    fetchSurveyScores()
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
        />
      )}
    </>
  )
}
