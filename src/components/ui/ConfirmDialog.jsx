import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

const ConfirmDialogContext = createContext()

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback(({
    title = 'Konfirmasi',
    message,
    confirmText = 'Ya',
    cancelText = 'Batal',
    variant = 'danger' // 'danger' | 'primary'
  }) => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setDialog(null)
          resolve(true)
        },
        onCancel: () => {
          setDialog(null)
          resolve(false)
        }
      })
    })
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {dialog && <ConfirmDialogModal {...dialog} />}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider')
  }
  return context.confirm
}

function ConfirmDialogModal({ 
  title, 
  message, 
  confirmText, 
  cancelText, 
  variant,
  onConfirm, 
  onCancel 
}) {
  const variantStyles = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    primary: {
      icon: 'bg-primary-100 text-primary-600',
      button: 'bg-primary-600 hover:bg-primary-700 text-white'
    }
  }

  const styles = variantStyles[variant]

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-black/50 z-[9998]"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`w-14 h-14 ${styles.icon} rounded-full flex items-center justify-center`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-ink-900 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-ink-600 text-center mb-6 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 ${styles.button} rounded-lg font-semibold transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
