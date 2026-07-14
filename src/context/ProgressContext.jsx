import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StudentContext } from './StudentContext'

export const ProgressContext = createContext()

const LEARNING_STEPS = [
  { id: 'cp', name: 'Capaian Pembelajaran', path: '/kegiatan-belajar/cp' },
  { id: 'tp', name: 'Tujuan Pembelajaran', path: '/kegiatan-belajar/tp' },
  { id: 'big-idea', name: 'Big Idea & EQ', path: '/kegiatan-belajar/big-idea' },
  { id: 'forum-diskusi', name: 'Forum Diskusi', path: '/kegiatan-belajar/big-idea/forum-diskusi' },
  { id: 'the-challenge', name: 'The Challenge', path: '/kegiatan-belajar/the-challenge' },
  { id: 'guiding-resource', name: 'Guiding Resource', path: '/kegiatan-belajar/the-challenge/guiding-resource' },
  { id: 'transisi', name: 'Transisi', path: '/kegiatan-belajar/the-challenge/transisi-aktivitas' },
  { id: 'survey', name: 'Survey', path: '/kegiatan-belajar/the-challenge/guiding-activities' },
  { id: 'hasil-survey', name: 'Hasil Survey', path: '/kegiatan-belajar/the-challenge/hasil-guiding-activities' },
  { id: 'guiding-question', name: 'Guiding Questions', path: '/kegiatan-belajar/the-challenge/guiding-question' },
  { id: 'solution', name: 'Solution', path: '/kegiatan-belajar/the-challenge/solution' },
  { id: 'hasil-tes', name: 'Hasil Tes', path: '/kegiatan-belajar/the-challenge/hasil-tes' },
]

export function ProgressProvider({ children }) {
  const { studentId, isInClass } = useContext(StudentContext)
  const [completedSteps, setCompletedSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isInClass && studentId) {
      loadProgress()
    } else {
      setLoading(false)
    }
  }, [studentId, isInClass])

  const loadProgress = async () => {
    try {
      // Check which steps are completed based on database records
      const progress = []

      // Check if EQ answered - this is the main milestone
      const { data: eqData, error: eqError } = await supabase
        .from('essential_question_answers')
        .select('id')
        .eq('siswa_id', studentId)
        .maybeSingle()
      
      if (eqData && !eqError) {
        // If EQ answered, user has completed: CP → TP → Big Idea
        progress.push('cp', 'tp', 'big-idea')
      }

      // Check if survey completed
      const { data: surveyData, error: surveyError } = await supabase
        .from('survey_results')
        .select('id')
        .eq('siswa_id', studentId)
        .maybeSingle()
      
      if (surveyData && !surveyError) {
        // If survey done, user has completed forum and the-challenge steps
        if (!progress.includes('forum-diskusi')) progress.push('forum-diskusi')
        progress.push('the-challenge', 'guiding-resource', 'transisi', 'survey', 'hasil-survey')
      } else if (eqData && !eqError) {
        // If only EQ done (no survey yet), forum is accessible
        progress.push('forum-diskusi')
      }

      // Check if guiding questions answered
      const { data: gqData } = await supabase
        .from('guiding_question_answers')
        .select('id')
        .eq('siswa_id', studentId)
        .limit(1)
      
      if (gqData && gqData.length > 0) {
        progress.push('guiding-question')
      }

      // Check if solution submitted
      const { data: solutionData, error: solutionError } = await supabase
        .from('solutions')
        .select('id')
        .eq('siswa_id', studentId)
        .maybeSingle()
      
      if (solutionData && !solutionError) {
        progress.push('solution', 'hasil-tes')
      }

      setCompletedSteps(progress)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const isStepCompleted = (stepId) => {
    return completedSteps.includes(stepId)
  }

  const markStepCompleted = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const getNextStep = (currentStepId) => {
    const currentIndex = LEARNING_STEPS.findIndex(s => s.id === currentStepId)
    if (currentIndex < LEARNING_STEPS.length - 1) {
      return LEARNING_STEPS[currentIndex + 1]
    }
    return null
  }

  const canAccessStep = (stepId) => {
    const stepIndex = LEARNING_STEPS.findIndex(s => s.id === stepId)
    if (stepIndex === -1) return false
    
    // CP & TP always accessible
    if (stepId === 'cp' || stepId === 'tp') return true
    
    // Check if previous step is completed
    if (stepIndex > 0) {
      const previousStep = LEARNING_STEPS[stepIndex - 1]
      return isStepCompleted(previousStep.id)
    }
    
    return true
  }

  const getProgressPercentage = () => {
    return Math.round((completedSteps.length / LEARNING_STEPS.length) * 100)
  }

  const getProgressStats = () => {
    return {
      completed: completedSteps.length,
      total: LEARNING_STEPS.length,
      percentage: getProgressPercentage()
    }
  }

  const value = {
    completedSteps,
    loading,
    isStepCompleted,
    markStepCompleted,
    canAccessStep,
    getNextStep,
    getProgressPercentage,
    getProgressStats,
    refreshProgress: loadProgress,
    LEARNING_STEPS
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}
