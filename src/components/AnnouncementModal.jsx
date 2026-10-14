import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react'

export default function AnnouncementModal() {
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  
  // Version key untuk tracking announcement yang sudah dilihat
  const ANNOUNCEMENT_VERSION = 'v2024-update-guiding-resource'
  
  useEffect(() => {
    // Cek apakah user sudah pernah lihat announcement ini
    const hasSeenAnnouncement = localStorage.getItem(`announcement_seen_${ANNOUNCEMENT_VERSION}`)
    
    if (!hasSeenAnnouncement) {
      // Delay sedikit agar tidak langsung muncul (better UX)
      const timer = setTimeout(() => {
        setShowAnnouncement(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])
  
  const handleClose = () => {
    // Simpan bahwa user sudah lihat announcement ini
    localStorage.setItem(`announcement_seen_${ANNOUNCEMENT_VERSION}`, 'true')
    setShowAnnouncement(false)
  }

  return (
    <AnimatePresence>
      {showAnnouncement && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Announcement Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
              >
                <X className="w-5 h-5 text-ink-600 group-hover:text-ink-900" />
              </button>

              {/* Header with gradient - sesuai design token */}
              <div className="bg-primary-700 px-8 py-10 text-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 20 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 relative z-10"
                >
                  <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-poppins font-bold text-ink-900 mb-2 relative z-10">
                  Ada yang Baru! ✨
                </h2>
                <p className="text-ink-700 text-sm md:text-base font-medium relative z-10">
                  Update terbaru untuk pengalaman belajar yang lebih baik
                </p>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <div className="space-y-4">
                  {/* Feature 1 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-primary-700" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-ink-900 mb-1">
                        Guiding Resource 4 Level
                      </h3>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        Materi pembelajaran diagram pencar kini dibagi menjadi 4 level progresif: Pengantar & Variabel → Diagram Pencar → Membaca Hubungan → Pola & Outlier
                      </p>
                    </div>
                  </motion.div>

                  {/* Feature 2 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-primary-700" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-ink-900 mb-1">
                        Eksplorasi Diagram Pencar Lebih Interaktif
                      </h3>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        Sekarang diagram pencar dapat lebih interaktif, bukan hanya sekedar input nilai variabel!
                      </p>
                    </div>
                  </motion.div>

                  {/* Feature 3 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-primary-700" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-ink-900 mb-1">
                        UI/UX Lebih Baik
                      </h3>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        Alert yang lebih indah, animasi smooth, dan feedback visual yang lebih jelas di setiap interaksi
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-4 bg-primary-700 hover:primary-800 text-white font-poppins font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    <span>Mulai Belajar Sekarang</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                {/* Footer note */}
                <p className="text-center text-xs text-ink-500 mt-4">
                  Update: Desember 2024 • v2.0
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
