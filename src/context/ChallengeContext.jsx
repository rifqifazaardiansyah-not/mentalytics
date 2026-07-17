import { createContext, useContext, useState, useEffect } from 'react'

const ChallengeContext = createContext()

const CHALLENGE_STORAGE_KEY = 'mentalytics_challenge_text'

export function ChallengeProvider({ children }) {
  // Initialize from localStorage
  const [challengeText, setChallengeTextState] = useState(() => {
    try {
      const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY)
      return stored || ''
    } catch (error) {
      console.error('Error loading challenge text from localStorage:', error)
      return ''
    }
  })

  // Wrapper function that also saves to localStorage
  const setChallengeText = (text) => {
    setChallengeTextState(text)
    try {
      if (text) {
        localStorage.setItem(CHALLENGE_STORAGE_KEY, text)
        console.log('✅ Challenge text saved to localStorage')
      } else {
        localStorage.removeItem(CHALLENGE_STORAGE_KEY)
      }
    } catch (error) {
      console.error('Error saving challenge text to localStorage:', error)
    }
  }

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
