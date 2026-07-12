import { useContext } from 'react'
import { ProgressContext } from '../context/ProgressContext'
import { CheckCircle2, Circle } from 'lucide-react'

export default function ProgressBar() {
  const { getProgressStats, loading } = useContext(ProgressContext)

  if (loading) return null

  const { completed, total, percentage } = getProgressStats()

  return (
    <div className="flex items-center gap-2">
      {/* Progress circles (mobile - just show count) */}
      <div className="md:hidden flex items-center gap-1 bg-primary-100 px-2 py-1 rounded-full">
        <CheckCircle2 className="w-3 h-3 text-primary-600" />
        <span className="text-xs font-semibold text-primary-700">
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar (desktop) */}
      <div className="hidden md:flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-full">
        {/* Bar */}
        <div className="w-20 h-2 bg-white rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Text */}
        <span className="text-xs font-semibold text-primary-700 min-w-[3rem]">
          {completed}/{total}
        </span>
      </div>
    </div>
  )
}
