import { bullyingScaleOptions } from '../../data/surveyQuestions'

export default function BullyingQuestionCard({ question, value, onChange }) {
  return (
    <div className="bg-white border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 transition-colors">
      {/* Question Number & Text */}
      <div className="flex gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
          <span className="text-ink-900 font-poppins font-semibold text-lg">{question.no}</span>
        </div>
        <p className="text-ink-900 leading-relaxed pt-2">{question.text}</p>
      </div>

      {/* Scale Options */}
      <div className="space-y-2 ml-14">
        {bullyingScaleOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              value === option.value
                ? 'bg-primary-500 border-2 border-primary-600 shadow-sm'
                : 'bg-gray-50 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            <input
              type="radio"
              name={`bullying-${question.no}`}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(question.no, option.value)}
              className="w-5 h-5 text-primary-600 focus:ring-primary-500 focus:ring-2"
            />
            <span className={`text-sm font-medium ${
              value === option.value ? 'text-ink-900' : 'text-ink-700'
            }`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
