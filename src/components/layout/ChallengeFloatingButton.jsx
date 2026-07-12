import { useState, useEffect } from 'react'
import { useChallenge } from '../../context/ChallengeContext'
import { X, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChallengeFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { challengeText } = useChallenge()

  // Debug log
  useEffect(() => {
    console.log('ChallengeFloatingButton - challengeText:', challengeText ? 'EXISTS' : 'NULL')
  }, [challengeText])

  if (!challengeText) {
    console.log('ChallengeFloatingButton - NOT RENDERING (no challengeText)')
    return null
  }

  console.log('ChallengeFloatingButton - RENDERING')

  return (
    <>
      {/* Floating Button with Icon - NO PULSE ANIMATION */}
      <motion.button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 group z-40"
        aria-label="Lihat deskripsi tantangan"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Button container - Green gradient */}
        <div className="relative bg-white hover:bg-gray-50 p-3 rounded-full shadow-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
          {!imageError ? (
            <img 
              src="/assets/icon/the-challenge-icon.png" 
              alt="The Challenge"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Target className="w-10 h-10 md:w-12 md:h-12 text-white" />
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
              Lihat The Challenge
              <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-px">
                <div className="border-4 border-transparent border-l-ink-900"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal Content - Centered with flexbox, wider and higher */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] pointer-events-auto"
              >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary-200 bg-gradient-to-r from-primary-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-poppins font-semibold text-ink-900">
                    The Challenge
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5 text-ink-900" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="prose prose-sm max-w-none text-ink-900 whitespace-pre-wrap leading-relaxed">
                  {challengeText}
                </div>
              </div>

              {/* Footer with gradient border */}
              <div className="h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500"></div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
