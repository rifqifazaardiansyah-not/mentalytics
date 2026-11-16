import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ClassCreatedSuccessModal({ isOpen, onClose, classData }) {
  const [copied, setCopied] = useState(false)

  if (!classData) return null

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classData.kode_kelas)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareMessage = `Bergabung ke kelas ${classData.nama_kelas} di MENTALYTICS!\n\nKode Kelas: ${classData.kode_kelas}\n\nAkses: https://mentalytics.my.id/kelas`

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Kode Kelas MENTALYTICS',
        text: shareMessage
      }).catch((err) => console.log('Error sharing:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareMessage)
      alert('Link telah disalin ke clipboard!')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-ink-900 mb-2">
                  🎉 Kelas Berhasil Dibuat!
                </h2>
                <p className="text-sm text-ink-600">
                  Bagikan kode kelas ini kepada siswa Anda
                </p>
              </div>

              {/* Class Info Card */}
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4 mb-4 border-2 border-primary-200">
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Nama Kelas</p>
                  <p className="text-base font-semibold text-ink-900">{classData.nama_kelas}</p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Tahun Ajaran</p>
                  <p className="text-base font-semibold text-ink-900">{classData.tahun_ajaran}</p>
                </div>
                <div className="border-t-2 border-primary-200 pt-3">
                  <p className="text-xs text-gray-600 mb-2">Kode Kelas</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 border-2 border-primary-300">
                      <p className="text-2xl font-bold text-center text-primary-700 font-mono tracking-wider">
                        {classData.kode_kelas}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 bg-white hover:bg-gray-50 rounded-lg border-2 border-gray-200 transition-colors"
                      title="Copy kode"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Cara bergabung untuk siswa:</strong><br/>
                  1. Buka <span className="font-mono text-xs bg-white px-1 rounded">mentalytics.my.id/kelas</span><br/>
                  2. Klik "Gabung Kelas"<br/>
                  3. Masukkan nama dan kode: <strong>{classData.kode_kelas}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  Bagikan
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
