import { createContext, useContext, useState } from 'react'

const ChallengeContext = createContext()

export function ChallengeProvider({ children }) {
  const [challengeText, setChallengeText] = useState('')

  return (
    <ChallengeContext.Provider
      value={{
        challengeText,
        setChallengeText,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  )
}

export function useChallenge() {
  const context = useContext(ChallengeContext)
  if (!context) {
    throw new Error('useChallenge must be used within ChallengeProvider')
  }
  return context
}
