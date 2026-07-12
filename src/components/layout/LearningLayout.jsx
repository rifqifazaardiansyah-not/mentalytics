import ChallengeFloatingButton from './ChallengeFloatingButton'
import AIFloatingButton from './AIFloatingButton'

export default function LearningLayout({ children, showAI = false, aiContext = '' }) {
  return (
    <div className="relative">
      {children}
      
      {/* Challenge floating button - always shown in learning flow */}
      <ChallengeFloatingButton />
      
      {/* AI floating button - conditional */}
      {showAI && aiContext && <AIFloatingButton context={aiContext} />}
    </div>
  )
}
