import { useState, useEffect } from 'react'
import { Cloud } from 'lucide-react'

export default function SurveyProgress({ current, total, label, showAutoSave = true }) {
  const percentage = (current / total) * 100
  const [showSaved, setShowSaved] = useState(false)

  // Show "saved" indicator briefly when progress changes
  useEffect(() => {
    if (current > 0 && showAutoSave) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [current, showAutoSave])

  return (
    <div className="bg-white border-2 border-primary-300 rounded-xl p-4 shadow-sm sticky top-4 z-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <div className="flex items-center gap-3">
          {showAutoSave && showSaved && (
            <span className="text-xs text-green-600 flex items-center gap-1 animate-fade-in">
              <Cloud className="w-3 h-3" />
              Tersimpan
            </span>
          )}
          <p className="text-sm font-semibold text-primary-700">
            {current} / {total}
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-600 to-primary-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-ink-600 mt-2 text-center">
        {percentage.toFixed(0)}% selesai
      </p>
    </div>
  )
}
