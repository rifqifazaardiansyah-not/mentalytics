import { anxietyEmoticons } from '../../data/surveyQuestions'

export default function AnxietyCategoryCard({ category, checkedSymptoms, emoticonScore, onSymptomChange, onEmoticonChange }) {
  const isComplete = checkedSymptoms.length > 0 && emoticonScore !== null
  const needsSymptoms = checkedSymptoms.length === 0
  const needsEmoticon = emoticonScore === null
  
  return (
    <div className={`bg-white rounded-xl p-6 transition-all ${
      isComplete 
        ? 'border-2 border-green-300 shadow-sm' 
        : 'border-2 border-primary-200 hover:border-primary-400'
    }`}>
      {/* Category Header */}
      <div className="flex gap-4 mb-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isComplete ? 'bg-green-500' : 'bg-primary-500'
        }`}>
          {isComplete ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-ink-900 font-poppins font-semibold text-lg">{category.no}</span>
          )}
        </div>
        <div className="flex-1 pt-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-poppins font-semibold text-ink-900 mb-1">
              {category.category}
            </h3>
            {isComplete && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                ✓ Lengkap
              </span>
            )}
          </div>
          <p className="text-xs text-ink-600 italic">
            Centang gejala yang kamu alami, lalu pilih seberapa sering
          </p>
        </div>
      </div>

      {/* Symptoms Checkboxes */}
      <div className="ml-14 mb-6">
        <div className={`rounded-lg p-4 border ${
          needsSymptoms && checkedSymptoms.length === 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-ink-700 uppercase tracking-wide">
              Gejala yang dialami:
            </p>
            {needsSymptoms && checkedSymptoms.length === 0 && (
              <span className="text-xs text-red-600 font-medium">⚠️ Pilih minimal 1</span>
            )}
          </div>
          <div className="space-y-2">
            {category.symptoms.map((symptom, idx) => (
              <label
                key={idx}
                className="flex items-start gap-2 cursor-pointer hover:bg-primary-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedSymptoms.includes(symptom)}
                  onChange={(e) => onSymptomChange(category.no, symptom, e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary-600 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm text-ink-800 leading-relaxed">{symptom}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Emoticon Scale */}
      <div className="ml-14">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-ink-700 uppercase tracking-wide">
            Seberapa sering gejala ini muncul?
          </p>
          {needsEmoticon && emoticonScore === null && (
            <span className="text-xs text-red-600 font-medium">⚠️ Pilih emotikon</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {anxietyEmoticons.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onEmoticonChange(category.no, option.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                emoticonScore === option.value
                  ? 'bg-primary-500 border-primary-600 shadow-md scale-105'
                  : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className={`text-xs font-medium text-center leading-tight ${
                emoticonScore === option.value ? 'text-ink-900' : 'text-ink-600'
              }`}>
                {option.label.split(' / ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
