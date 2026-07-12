import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, BarChart3, ArrowRight, Lightbulb, Info, Eye, AlertTriangle, GripVertical, CheckCircle2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import LearningLayout from '../../components/layout/LearningLayout'
import { useChallenge } from '../../context/ChallengeContext'

export default function GuidingResource() {
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [correlationType, setCorrelationType] = useState('positif')
  const { setChallengeText } = useChallenge()

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [selectedWord, setSelectedWord] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [selectedDefinition, setSelectedDefinition] = useState(null)
  const [selectedDescription, setSelectedDescription] = useState(null)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get siswa_id for localStorage keys (dari localStorage karena lazy init)
  const getSiswaId = () => {
    try {
      const stored = localStorage.getItem('mentalytics_student_id')
      if (stored) {
        return stored
      }
    } catch (e) {
      console.error('Error getting siswa_id:', e)
    }
    return 'guest'
  }

  const siswaId = getSiswaId()

  // Helper functions for localStorage with siswa_id
  const getStorage = (key) => {
    return localStorage.getItem(`${key}_${siswaId}`)
  }

  const setStorage = (key, value) => {
    localStorage.setItem(`${key}_${siswaId}`, value)
  }

  // Section A - Challenge states
  const [sectionAProgress, setSectionAProgress] = useState(() => {
    const saved = getStorage('guiding_resource_progress_sectionA')
    if (saved) {
      try {
        console.log('📂 Loading progress from localStorage:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved progress:', e)
      }
    }
    return {
      step1Complete: false,
      step2Complete: false,
      step3Complete: false,
      allComplete: false
    }
  })
  
  const [draggedWord, setDraggedWord] = useState(null)
  const [answers, setAnswers] = useState(() => {
    const saved = getStorage('guiding_resource_answers_sectionA')
    if (saved) {
      try {
        console.log('📂 Loading answers from localStorage:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved answers:', e)
      }
    }
    return {
      diagramName: '',
      diagramEnglish: '',
      dataBivariat: '',
      biMeaning: ''
    }
  })

  // Section B - Challenge states
  const [sectionBProgress, setSectionBProgress] = useState(() => {
    const saved = getStorage('guiding_resource_progress_sectionB')
    if (saved) {
      try {
        console.log('📂 Loading Section B progress:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section B progress:', e)
      }
    }
    return {
      independenComplete: false,
      dependenComplete: false,
      allComplete: false
    }
  })

  const [sectionBAnswers, setSectionBAnswers] = useState(() => {
    const saved = getStorage('guiding_resource_answers_sectionB')
    if (saved) {
      try {
        console.log('📂 Loading Section B answers:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section B answers:', e)
      }
    }
    return {
      independen: '',
      dependen: ''
    }
  })

  const [draggedDefinition, setDraggedDefinition] = useState(null)

  // Section C - Challenge states
  const [sectionCProgress, setSectionCProgress] = useState(() => {
    const saved = getStorage('guiding_resource_progress_sectionC')
    if (saved) {
      try {
        console.log('📂 Loading Section C progress:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section C progress:', e)
      }
    }
    return {
      definitionComplete: false,
      positifComplete: false,
      negatifComplete: false,
      tidakAdaComplete: false,
      allComplete: false
    }
  })

  const [sectionCAnswers, setSectionCAnswers] = useState(() => {
    const saved = getStorage('guiding_resource_answers_sectionC')
    if (saved) {
      try {
        console.log('📂 Loading Section C answers:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section C answers:', e)
      }
    }
    return {
      definition: '',
      positif: '',
      negatif: '',
      tidakAda: ''
    }
  })

  const [draggedDescription, setDraggedDescription] = useState(null)

  // Section D - Challenge states
  const [sectionDProgress, setSectionDProgress] = useState(() => {
    const saved = getStorage('guiding_resource_progress_sectionD')
    if (saved) {
      try {
        console.log('📂 Loading Section D progress:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section D progress:', e)
      }
    }
    return {
      kuatComplete: false,
      lemahComplete: false,
      linearComplete: false,
      nonLinearComplete: false,
      allComplete: false
    }
  })

  const [sectionDAnswers, setSectionDAnswers] = useState(() => {
    const saved = getStorage('guiding_resource_answers_sectionD')
    if (saved) {
      try {
        console.log('📂 Loading Section D answers:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section D answers:', e)
      }
    }
    return {
      kuat: '',
      lemah: '',
      linear: '',
      nonLinear: ''
    }
  })

  // Section E - Outlier interactive state
  const [sectionEProgress, setSectionEProgress] = useState(() => {
    const saved = getStorage('guiding_resource_progress_sectionE')
    if (saved) {
      try {
        console.log('📂 Loading Section E progress:', saved)
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved Section E progress:', e)
      }
    }
    return {
      selectedPoints: [],
      completed: false
    }
  })

  const [hoveredPoint, setHoveredPoint] = useState(null)

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Saving progress to localStorage:', sectionAProgress)
    setStorage('guiding_resource_progress_sectionA', JSON.stringify(sectionAProgress))
  }, [sectionAProgress])

  // Save answers to localStorage whenever they change
  useEffect(() => {
    console.log('💾 Saving answers to localStorage:', answers)
    setStorage('guiding_resource_answers_sectionA', JSON.stringify(answers))
  }, [answers])

  // Save Section B progress
  useEffect(() => {
    console.log('💾 Saving Section B progress:', sectionBProgress)
    setStorage('guiding_resource_progress_sectionB', JSON.stringify(sectionBProgress))
  }, [sectionBProgress])

  // Save Section B answers
  useEffect(() => {
    console.log('💾 Saving Section B answers:', sectionBAnswers)
    setStorage('guiding_resource_answers_sectionB', JSON.stringify(sectionBAnswers))
  }, [sectionBAnswers])

  // Save Section C progress
  useEffect(() => {
    console.log('💾 Saving Section C progress:', sectionCProgress)
    setStorage('guiding_resource_progress_sectionC', JSON.stringify(sectionCProgress))
  }, [sectionCProgress])

  // Save Section C answers
  useEffect(() => {
    console.log('💾 Saving Section C answers:', sectionCAnswers)
    setStorage('guiding_resource_answers_sectionC', JSON.stringify(sectionCAnswers))
  }, [sectionCAnswers])

  // Save Section D progress
  useEffect(() => {
    console.log('💾 Saving Section D progress:', sectionDProgress)
    setStorage('guiding_resource_progress_sectionD', JSON.stringify(sectionDProgress))
  }, [sectionDProgress])

  // Save Section D answers
  useEffect(() => {
    console.log('💾 Saving Section D answers:', sectionDAnswers)
    setStorage('guiding_resource_answers_sectionD', JSON.stringify(sectionDAnswers))
  }, [sectionDAnswers])

  // Save Section E progress
  useEffect(() => {
    console.log('💾 Saving Section E progress:', sectionEProgress)
    setStorage('guiding_resource_progress_sectionE', JSON.stringify(sectionEProgress))
  }, [sectionEProgress])

  // Set challenge text if not already set
  useEffect(() => {
    const challengeDescription = `THE CHALLENGE

Setiap sekolah punya tanggung jawab memastikan muridnya merasa aman dan nyaman saat belajar. Namun, tidak semua murid mengalaminya. Sebagian pernah mengalami perlakuan tidak menyenangkan dari teman yang lama-kelamaan dapat menimbulkan rasa cemas dan mengganggu proses belajar.

BAGAIMANA DENGAN DI SEKOLAHMU?

Untuk mengetahuinya, kita akan menggunakan data dari kelasmu sendiri. Setiap murid akan mengisi survei singkat dan anonim tentang bullying dan kecemasan yang dirasakan.

Hasilnya akan diolah menjadi diagram pencar, lalu kita selidiki bersama:

• Benarkah ada hubungan antara bullying dan kecemasan di sekolahmu?
• Apa yang bisa dilakukan sekolah agar skor kecemasan murid bisa turun?

INSTRUKSI:
1. Buatlah kelompok yang beranggotakan 3-4 orang murid
2. Simak tantangan berikut lalu kerjakan secara berkelompok`

    setChallengeText(challengeDescription)
  }, [setChallengeText])

  // Sample data points for scatter plot - screentime vs anxiety
  // Data real dari tabel penelitian (18 murid)
  // Scale: x = (screentime / 7) * 100, y = ((anxiety - 20) / 50) * 100
  const dataPoints = {
    positif: [
      { id: 1, x: 14.3, y: 4, screentime: 1, anxiety: 22, label: 'Murid 1' },
      { id: 2, x: 21.4, y: 14, screentime: 1.5, anxiety: 27, label: 'Murid 2' },
      { id: 3, x: 28.6, y: 20, screentime: 2, anxiety: 30, label: 'Murid 3' },
      { id: 4, x: 28.6, y: 4, screentime: 2, anxiety: 22, label: 'Murid 4' },
      { id: 5, x: 35.7, y: 30, screentime: 2.5, anxiety: 35, label: 'Murid 5' },
      { id: 6, x: 42.9, y: 36, screentime: 3, anxiety: 38, label: 'Murid 6' },
      { id: 7, x: 42.9, y: 20, screentime: 3, anxiety: 30, label: 'Murid 7' },
      { id: 8, x: 50, y: 48, screentime: 3.5, anxiety: 44, label: 'Murid 8' },
      { id: 9, x: 57.1, y: 40, screentime: 4, anxiety: 40, label: 'Murid 9' },
      { id: 10, x: 57.1, y: 56, screentime: 4, anxiety: 48, label: 'Murid 10' },
      { id: 11, x: 64.3, y: 60, screentime: 4.5, anxiety: 50, label: 'Murid 11' },
      { id: 12, x: 71.4, y: 52, screentime: 5, anxiety: 46, label: 'Murid 12' },
      { id: 13, x: 71.4, y: 70, screentime: 5, anxiety: 55, label: 'Murid 13' },
      { id: 14, x: 78.6, y: 76, screentime: 5.5, anxiety: 58, label: 'Murid 14' },
      { id: 15, x: 85.7, y: 80, screentime: 6, anxiety: 60, label: 'Murid 15' },
      { id: 16, x: 85.7, y: 64, screentime: 6, anxiety: 52, label: 'Murid 16' },
      { id: 17, x: 92.9, y: 92, screentime: 6.5, anxiety: 66, label: 'Murid 17' },
      { id: 18, x: 100, y: 100, screentime: 7, anxiety: 70, label: 'Murid 18' },
    ],
    negatif: [
      { id: 1, x: 14.3, y: 96, screentime: 1, anxiety: 68, label: 'Murid 1' },
      { id: 2, x: 21.4, y: 88, screentime: 1.5, anxiety: 64, label: 'Murid 2' },
      { id: 3, x: 28.6, y: 76, screentime: 2, anxiety: 58, label: 'Murid 3' },
      { id: 4, x: 35.7, y: 68, screentime: 2.5, anxiety: 54, label: 'Murid 4' },
      { id: 5, x: 42.9, y: 60, screentime: 3, anxiety: 50, label: 'Murid 5' },
      { id: 6, x: 50, y: 48, screentime: 3.5, anxiety: 44, label: 'Murid 6' },
      { id: 7, x: 57.1, y: 40, screentime: 4, anxiety: 40, label: 'Murid 7' },
      { id: 8, x: 64.3, y: 32, screentime: 4.5, anxiety: 36, label: 'Murid 8' },
      { id: 9, x: 71.4, y: 24, screentime: 5, anxiety: 32, label: 'Murid 9' },
      { id: 10, x: 78.6, y: 20, screentime: 5.5, anxiety: 30, label: 'Murid 10' },
      { id: 11, x: 85.7, y: 12, screentime: 6, anxiety: 26, label: 'Murid 11' },
      { id: 12, x: 92.9, y: 8, screentime: 6.5, anxiety: 24, label: 'Murid 12' },
    ],
    tidakAda: [
      { id: 1, x: 14.3, y: 44, screentime: 1, anxiety: 42, label: 'Murid 1' },
      { id: 2, x: 28.6, y: 68, screentime: 2, anxiety: 54, label: 'Murid 2' },
      { id: 3, x: 35.7, y: 24, screentime: 2.5, anxiety: 32, label: 'Murid 3' },
      { id: 4, x: 50, y: 52, screentime: 3.5, anxiety: 46, label: 'Murid 4' },
      { id: 5, x: 57.1, y: 76, screentime: 4, anxiety: 58, label: 'Murid 5' },
      { id: 6, x: 64.3, y: 36, screentime: 4.5, anxiety: 38, label: 'Murid 6' },
      { id: 7, x: 71.4, y: 60, screentime: 5, anxiety: 50, label: 'Murid 7' },
      { id: 8, x: 78.6, y: 12, screentime: 5.5, anxiety: 26, label: 'Murid 8' },
      { id: 9, x: 85.7, y: 84, screentime: 6, anxiety: 62, label: 'Murid 9' },
      { id: 10, x: 92.9, y: 48, screentime: 6.5, anxiety: 44, label: 'Murid 10' },
    ],
  }

  const currentData = dataPoints[correlationType]

  // Mobile click handlers for Section A
  const handleWordClick = (word) => {
    if (!isMobile) return
    setSelectedWord(word)
    setSelectedTarget(null)
  }

  const handleTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedWord) {
      // Place selected word in target
      setAnswers(prev => ({
        ...prev,
        [targetField]: selectedWord
      }))
      checkAnswer(targetField, selectedWord)
      setSelectedWord(null)
    } else {
      // Mark this as the target
      setSelectedTarget(targetField)
    }
  }

  // Drag and Drop handlers (Desktop)
  const handleDragStart = (e, word) => {
    setDraggedWord(word)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetField) => {
    e.preventDefault()
    if (!draggedWord) return

    // Update answer
    setAnswers(prev => ({
      ...prev,
      [targetField]: draggedWord
    }))

    // Check if correct and update progress
    checkAnswer(targetField, draggedWord)
    setDraggedWord(null)
  }

  const checkAnswer = (field, value) => {
    const correctAnswers = {
      diagramName: 'diagram pencar',
      diagramEnglish: 'scatter plot',
      dataBivariat: 'bivariat',
      biMeaning: 'dua'
    }

    if (value === correctAnswers[field]) {
      // Check which step is complete
      if (field === 'diagramName' || field === 'diagramEnglish') {
        // Step 1: Both diagram name and english must be correct
        if (answers.diagramName === correctAnswers.diagramName || field === 'diagramName') {
          if (answers.diagramEnglish === correctAnswers.diagramEnglish || field === 'diagramEnglish') {
            setSectionAProgress(prev => ({ ...prev, step1Complete: true }))
          }
        }
      } else if (field === 'dataBivariat') {
        // Step 2: bivariat
        setSectionAProgress(prev => ({ ...prev, step2Complete: true }))
      } else if (field === 'biMeaning') {
        // Step 3: bi meaning
        setSectionAProgress(prev => ({ ...prev, step3Complete: true, allComplete: true }))
      }
    } else {
      // Wrong answer - animate shake and clear
      setTimeout(() => {
        setAnswers(prev => ({
          ...prev,
          [field]: ''
        }))
      }, 500)
    }
  }

  const removeAnswer = (field) => {
    setAnswers(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Section B handlers
  const handleDefinitionClick = (definition) => {
    if (!isMobile) return
    setSelectedDefinition(definition)
  }

  const handleDefinitionTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedDefinition) {
      setSectionBAnswers(prev => ({
        ...prev,
        [targetField]: selectedDefinition
      }))
      checkSectionBAnswer(targetField, selectedDefinition)
      setSelectedDefinition(null)
    }
  }

  const handleDefinitionDragStart = (e, definition) => {
    setDraggedDefinition(definition)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDefinitionDrop = (e, targetField) => {
    e.preventDefault()
    if (!draggedDefinition) return

    // Update answer
    setSectionBAnswers(prev => ({
      ...prev,
      [targetField]: draggedDefinition
    }))

    // Check if correct
    checkSectionBAnswer(targetField, draggedDefinition)
    setDraggedDefinition(null)
  }

  const checkSectionBAnswer = (field, value) => {
    const correctAnswers = {
      independen: 'variabel yang digunakan untuk memprediksi variabel lainnya sebagai faktor yang memengaruhi atau menjadi penyebab perubahan. Variabel ini digambarkan pada sumbu X',
      dependen: 'variabel yang nilainya dipengaruhi oleh variabel independen sebagai faktor yang diamati untuk melihat adanya perubahan akibat dari variabel independen. Variabel ini digambarkan pada sumbu Y'
    }

    if (value === correctAnswers[field]) {
      if (field === 'independen') {
        setSectionBProgress(prev => ({ ...prev, independenComplete: true }))
      } else if (field === 'dependen') {
        setSectionBProgress(prev => ({ ...prev, dependenComplete: true }))
      }

      // Check if both complete
      if (field === 'independen' && sectionBAnswers.dependen === correctAnswers.dependen) {
        setSectionBProgress(prev => ({ ...prev, allComplete: true }))
      } else if (field === 'dependen' && sectionBAnswers.independen === correctAnswers.independen) {
        setSectionBProgress(prev => ({ ...prev, allComplete: true }))
      }
    } else {
      // Wrong answer
      setTimeout(() => {
        setSectionBAnswers(prev => ({
          ...prev,
          [field]: ''
        }))
      }, 500)
    }
  }

  const removeSectionBAnswer = (field) => {
    setSectionBAnswers(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Definitions for Section B
  const definitions = [
    'variabel yang digunakan untuk memprediksi variabel lainnya sebagai faktor yang memengaruhi atau menjadi penyebab perubahan. Variabel ini digambarkan pada sumbu X',
    'variabel yang nilainya dipengaruhi oleh variabel independen sebagai faktor yang diamati untuk melihat adanya perubahan akibat dari variabel independen. Variabel ini digambarkan pada sumbu Y'
  ]

  // Section C handlers
  const handleDescriptionClick = (description) => {
    if (!isMobile) return
    setSelectedDescription(description)
  }

  const handleDescriptionTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedDescription) {
      setSectionCAnswers(prev => ({
        ...prev,
        [targetField]: selectedDescription
      }))
      checkSectionCAnswer(targetField, selectedDescription)
      setSelectedDescription(null)
    }
  }

  const handleDescriptionDragStart = (e, description) => {
    setDraggedDescription(description)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDescriptionDrop = (e, targetField) => {
    e.preventDefault()
    
    // Get the dragged text
    let droppedText = ''
    if (draggedDescription) {
      droppedText = draggedDescription
    } else {
      droppedText = e.dataTransfer.getData('text/plain')
    }
    
    if (!droppedText) return

    setSectionCAnswers(prev => ({
      ...prev,
      [targetField]: droppedText
    }))

    checkSectionCAnswer(targetField, droppedText)
    setDraggedDescription(null)
  }

  const checkSectionCAnswer = (field, value) => {
    const correctAnswers = {
      definition: 'kecenderungan hubungan antara dua variabel',
      positif: 'Nilai: 0 sampai +1 | Titik-titik cenderung naik dari kiri bawah ke kanan atas. Semakin besar X, semakin besar Y. | Contoh: Semakin lama screentime, semakin tinggi kecemasan',
      negatif: 'Nilai: -1 sampai 0 | Titik-titik cenderung turun dari kiri atas ke kanan bawah. Semakin besar X, semakin kecil Y. | Contoh: Semakin sering olahraga, semakin rendah kecemasan',
      tidakAda: 'Nilai: mendekati 0 | Titik-titik tersebar begitu saja, tanpa arah yang jelas. Tidak ada hubungan yang berarti. | Contoh: Screentime tidak mempengaruhi kecemasan'
    }

    if (value === correctAnswers[field]) {
      if (field === 'definition') {
        setSectionCProgress(prev => ({ ...prev, definitionComplete: true }))
      } else if (field === 'positif') {
        setSectionCProgress(prev => ({ ...prev, positifComplete: true }))
      } else if (field === 'negatif') {
        setSectionCProgress(prev => ({ ...prev, negatifComplete: true }))
      } else if (field === 'tidakAda') {
        setSectionCProgress(prev => ({ ...prev, tidakAdaComplete: true }))
      }

      // Check if all matching complete
      const currentAnswers = { ...sectionCAnswers, [field]: value }
      if (currentAnswers.positif === correctAnswers.positif &&
          currentAnswers.negatif === correctAnswers.negatif &&
          currentAnswers.tidakAda === correctAnswers.tidakAda) {
        setSectionCProgress(prev => ({ ...prev, allComplete: true }))
      }
    } else {
      // Wrong answer
      setTimeout(() => {
        setSectionCAnswers(prev => ({
          ...prev,
          [field]: ''
        }))
      }, 500)
    }
  }

  const removeSectionCAnswer = (field) => {
    setSectionCAnswers(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Definitions for Section C - Step 1
  const correlationDefinitions = [
    'kecenderungan hubungan antara dua variabel',
    'perbedaan nilai antara dua variabel',
    'jumlah total dari dua variabel'
  ]

  // Descriptions for Section C - Step 2 (Matching)
  const correlationDescriptions = [
    {
      key: 'positif',
      text: 'Nilai: 0 sampai +1 | Titik-titik cenderung naik dari kiri bawah ke kanan atas. Semakin besar X, semakin besar Y. | Contoh: Semakin lama screentime, semakin tinggi kecemasan'
    },
    {
      key: 'negatif',
      text: 'Nilai: -1 sampai 0 | Titik-titik cenderung turun dari kiri atas ke kanan bawah. Semakin besar X, semakin kecil Y. | Contoh: Semakin sering olahraga, semakin rendah kecemasan'
    },
    {
      key: 'tidakAda',
      text: 'Nilai: mendekati 0 | Titik-titik tersebar begitu saja, tanpa arah yang jelas. Tidak ada hubungan yang berarti. | Contoh: Screentime tidak mempengaruhi kecemasan'
    }
  ]

  // Section D handlers
  const handleSectionDClick = (text) => {
    if (!isMobile) return
    setSelectedDescription(text) // Reuse selectedDescription for Section D
  }

  const handleSectionDTargetClick = (targetField) => {
    if (!isMobile) return
    
    if (selectedDescription) {
      setSectionDAnswers(prev => ({
        ...prev,
        [targetField]: selectedDescription
      }))
      checkSectionDAnswer(targetField, selectedDescription)
      setSelectedDescription(null)
    }
  }

  const handleSectionDDrop = (e, targetField) => {
    e.preventDefault()
    
    const droppedText = e.dataTransfer.getData('text/plain')
    
    if (!droppedText) return

    setSectionDAnswers(prev => ({
      ...prev,
      [targetField]: droppedText
    }))

    checkSectionDAnswer(targetField, droppedText)
  }

  const checkSectionDAnswer = (field, value) => {
    const correctAnswers = {
      kuat: 'Jika titik-titik terkumpul rapat dan hampir membentuk garis lurus, korelasinya disebut kuat. Kita bisa cukup yakin bahwa kedua variabel benar-benar berkaitan. | Nilai korelasi: mendekati +1 atau -1 (misalnya 0.9)',
      lemah: 'Jika titik-titik masih memperlihatkan arah tertentu tetapi tersebar cukup jauh dari garis kecenderungannya, korelasinya disebut lemah. Hubungannya masih ada, tetapi tidak terlalu kuat. | Nilai korelasi: mendekati 0 (misalnya 0.3)',
      linear: 'Titik-titik mengikuti garis lurus (seperti pada contoh screentime dan kecemasan di atas).',
      nonLinear: 'Titik-titik melengkung atau membentuk pola tertentu yang tidak bisa digambarkan dengan garis lurus saja.'
    }

    if (value === correctAnswers[field]) {
      if (field === 'kuat') {
        setSectionDProgress(prev => ({ ...prev, kuatComplete: true }))
      } else if (field === 'lemah') {
        setSectionDProgress(prev => ({ ...prev, lemahComplete: true }))
      } else if (field === 'linear') {
        setSectionDProgress(prev => ({ ...prev, linearComplete: true }))
      } else if (field === 'nonLinear') {
        setSectionDProgress(prev => ({ ...prev, nonLinearComplete: true }))
      }

      // Check if all complete
      const currentAnswers = { ...sectionDAnswers, [field]: value }
      if (currentAnswers.kuat === correctAnswers.kuat &&
          currentAnswers.lemah === correctAnswers.lemah &&
          currentAnswers.linear === correctAnswers.linear &&
          currentAnswers.nonLinear === correctAnswers.nonLinear) {
        setSectionDProgress(prev => ({ ...prev, allComplete: true }))
      }
    } else {
      // Wrong answer
      setTimeout(() => {
        setSectionDAnswers(prev => ({
          ...prev,
          [field]: ''
        }))
      }, 500)
    }
  }

  const removeSectionDAnswer = (field) => {
    setSectionDAnswers(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // Data for Section D
  const kekuatanDescriptions = [
    {
      key: 'kuat',
      text: 'Jika titik-titik terkumpul rapat dan hampir membentuk garis lurus, korelasinya disebut kuat. Kita bisa cukup yakin bahwa kedua variabel benar-benar berkaitan. | Nilai korelasi: mendekati +1 atau -1 (misalnya 0.9)'
    },
    {
      key: 'lemah',
      text: 'Jika titik-titik masih memperlihatkan arah tertentu tetapi tersebar cukup jauh dari garis kecenderungannya, korelasinya disebut lemah. Hubungannya masih ada, tetapi tidak terlalu kuat. | Nilai korelasi: mendekati 0 (misalnya 0.3)'
    }
  ]

  const polaDescriptions = [
    {
      key: 'linear',
      text: 'Titik-titik mengikuti garis lurus (seperti pada contoh screentime dan kecemasan di atas).'
    },
    {
      key: 'nonLinear',
      text: 'Titik-titik melengkung atau membentuk pola tertentu yang tidak bisa digambarkan dengan garis lurus saja.'
    }
  ]

  // Word banks for each step
  const wordBanks = {
    step1: ['diagram pencar', 'grafik batang', 'diagram lingkaran', 'scatter plot', 'bar chart', 'pie chart'],
    step2: ['bivariat', 'univariat', 'multivariat'],
    step3: ['dua', 'tiga', 'satu']
  }

  // Section E - Outlier data (Jam Tidur vs Skor Kecemasan)
  const outlierDataPoints = [
    // Normal pattern: lebih banyak tidur = kecemasan lebih rendah
    { id: 1, x: 15, y: 75, sleep: 5, anxiety: 55, isOutlier: false, label: 'Murid 1' },
    { id: 2, x: 25, y: 70, sleep: 5.5, anxiety: 52, isOutlier: false, label: 'Murid 2' },
    { id: 3, x: 35, y: 65, sleep: 6, anxiety: 48, isOutlier: false, label: 'Murid 3' },
    { id: 4, x: 45, y: 55, sleep: 6.5, anxiety: 42, isOutlier: false, label: 'Murid 4' },
    { id: 5, x: 55, y: 50, sleep: 7, anxiety: 38, isOutlier: false, label: 'Murid 5' },
    { id: 6, x: 65, y: 40, sleep: 7.5, anxiety: 32, isOutlier: false, label: 'Murid 6' },
    { id: 7, x: 75, y: 35, sleep: 8, anxiety: 28, isOutlier: false, label: 'Murid 7' },
    { id: 8, x: 85, y: 30, sleep: 8.5, anxiety: 25, isOutlier: false, label: 'Murid 8' },
    
    // Outliers: tidur cukup tapi kecemasan tinggi (kemungkinan bullying atau masalah keluarga)
    { id: 9, x: 70, y: 80, sleep: 7.8, anxiety: 58, isOutlier: true, label: 'Murid X', reason: 'Mungkin mengalami bullying di sekolah' },
    { id: 10, x: 60, y: 85, sleep: 7.2, anxiety: 60, isOutlier: true, label: 'Murid Y', reason: 'Mungkin ada masalah keluarga' }
  ]

  const correctOutliers = outlierDataPoints.filter(p => p.isOutlier).map(p => p.id)

  // Section E handlers
  const handlePointClick = (pointId) => {
    if (sectionEProgress.completed) return
    
    setSectionEProgress(prev => {
      const newSelected = prev.selectedPoints.includes(pointId)
        ? prev.selectedPoints.filter(id => id !== pointId)
        : [...prev.selectedPoints, pointId]
      
      // Check if all outliers are selected and no wrong points
      const isComplete = correctOutliers.every(id => newSelected.includes(id)) &&
                        newSelected.length === correctOutliers.length
      
      return {
        selectedPoints: newSelected,
        completed: isComplete
      }
    })
  }

  return (
    <LearningLayout showAI={true} aiContext="guiding_resource">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-ink-900" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-semibold text-ink-900 mb-2">
            Guiding Resource
          </h1>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto">
            Mengenal Diagram Pencar dan Data Bivariat
          </p>
        </motion.div>

        {/* Milo Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 -mt-14">
              <div className="w-24 h-24">
                <MiloCharacter pose="explain" />
              </div>
            </div>
            <MiloDialogBubble tailPosition="left" className="flex-1">
              <p className="text-base mb-2">
                Hai! Di halaman ini, kamu akan belajar tentang <span className="font-semibold">diagram pencar</span> dan bagaimana cara membaca hubungan antara dua variabel. 
                Kita akan pakai contoh screentime dan kecemasan agar mudah dipahami!
              </p>
              <p className="text-sm text-ink-700">
                💡 <span className="font-semibold">Tips:</span> Jika ada yang kurang jelas, klik tombol AI 
                di pojok kanan bawah untuk bertanya!
              </p>
            </MiloDialogBubble>
          </div>
        </motion.div>

        {/* Section A: Apa itu Diagram Pencar? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-600" />
            Bagian A. Apa itu Diagram Pencar?
          </h2>
          
          <div className="space-y-4 text-ink-700 leading-relaxed">
            <p className="text-lg">
              <span className="font-semibold text-primary-700">Bagaimana caranya</span> kita mengetahui apakah 
              waktu screentime seorang murid ada hubungannya dengan tingkat kecemasannya?
            </p>
            
            {/* Challenge Step 1: Diagram Name */}
            <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-300">
              <p className="mb-4">
                Salah satu cara termudah adalah dengan menggambarkan kedua data itu sekaligus dalam satu diagram, 
                agar kita bisa melihat langsung pola hubungannya. Diagram semacam ini disebut{' '}
                
                {/* Drop Zone 1: Diagram Name */}
                <span className="inline-flex items-center gap-2 mx-1">
                  <span
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'diagramName')}
                    onClick={() => handleTargetClick('diagramName')}
                    className={`inline-block min-w-[140px] px-3 py-1 border-2 border-dashed rounded-lg transition-all ${
                      answers.diagramName 
                        ? 'bg-primary-200 border-primary-500' 
                        : isMobile
                        ? 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-100 cursor-pointer active:scale-95'
                        : 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {answers.diagramName ? (
                      <span className="font-semibold text-primary-900 flex items-center gap-2">
                        {answers.diagramName}
                        {!sectionAProgress.step1Complete && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              removeAnswer('diagramName')
                            }}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ) : (
                      <span className="text-primary-400 text-sm">{isMobile ? 'tap di sini' : 'seret kata di sini'}</span>
                    )}
                  </span>
                </span>
                
                {' '}({' '}
                
                {/* Drop Zone 2: English Name */}
                <span className="inline-flex items-center gap-2 mx-1">
                  <span
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'diagramEnglish')}
                    onClick={() => handleTargetClick('diagramEnglish')}
                    className={`inline-block min-w-[120px] px-3 py-1 border-2 border-dashed rounded-lg transition-all ${
                      answers.diagramEnglish 
                        ? 'bg-primary-200 border-primary-500' 
                        : isMobile
                        ? 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-100 cursor-pointer active:scale-95'
                        : 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {answers.diagramEnglish ? (
                      <span className="font-semibold text-primary-900 flex items-center gap-2">
                        {answers.diagramEnglish}
                        {!sectionAProgress.step1Complete && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              removeAnswer('diagramEnglish')
                            }}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ) : (
                      <span className="text-primary-400 text-sm">{isMobile ? 'tap di sini' : 'seret kata di sini'}</span>
                    )}
                  </span>
                </span>
                
                {')'}
              </p>

              {/* Word Bank Step 1 */}
              {!sectionAProgress.step1Complete && (
                <div className="mt-4 pt-4 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-primary-800 mb-3">📝 Pilih kata yang tepat:</p>
                  <div className="flex flex-wrap gap-2">
                    {wordBanks.step1.map((word) => {
                      const isUsed = answers.diagramName === word || answers.diagramEnglish === word
                      const isSelected = isMobile && selectedWord === word
                      return (
                        <div
                          key={word}
                          draggable={!isUsed && !isMobile}
                          onDragStart={(e) => !isMobile && handleDragStart(e, word)}
                          onClick={() => !isUsed && handleWordClick(word)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            isUsed 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : isSelected
                              ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700 ring-4 ring-green-300'
                              : isMobile
                              ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 active:scale-95'
                              : 'bg-primary-600 text-white cursor-move hover:bg-primary-700 hover:shadow-md active:scale-95'
                          }`}
                        >
                          {word}
                        </div>
                      )
                    })}
                  </div>
                  {isMobile && selectedWord && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3 text-sm text-green-900"
                    >
                      ✓ <span className="font-semibold">"{selectedWord}"</span> dipilih. Tap kotak yang ingin diisi.
                    </motion.div>
                  )}
                </div>
              )}

              {/* Success Message Step 1 */}
              {sectionAProgress.step1Complete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-900">Benar!</p>
                    <p className="text-sm text-green-800">Diagram pencar (scatter plot) adalah nama yang tepat!</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Step 2: Data Bivariat (unlocked after step 1) */}
            {sectionAProgress.step1Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-xl p-6 my-4 border-l-4 border-primary-500"
              >
                <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-700" />
                  Data Bivariat
                </h3>
                <p className="mb-3">
                  Diagram pencar digunakan untuk menampilkan data yang memiliki <span className="font-semibold">dua variabel sekaligus</span>, 
                  seperti pada contoh waktu screentime dan skor kecemasan di atas.
                </p>
                <p className="mb-4">
                  Data yang terdiri dari dua variabel seperti ini disebut data{' '}
                  
                  {/* Drop Zone 3: Bivariat */}
                  <span className="inline-flex items-center gap-2 mx-1">
                    <span
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'dataBivariat')}
                      onClick={() => handleTargetClick('dataBivariat')}
                      className={`inline-block min-w-[120px] px-3 py-1 border-2 border-dashed rounded-lg transition-all ${
                        answers.dataBivariat 
                          ? 'bg-primary-200 border-primary-500' 
                          : isMobile
                          ? 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-100 cursor-pointer active:scale-95'
                          : 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {answers.dataBivariat ? (
                        <span className="font-semibold text-primary-900 flex items-center gap-2">
                          {answers.dataBivariat}
                          {!sectionAProgress.step2Complete && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                removeAnswer('dataBivariat')
                              }}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ) : (
                        <span className="text-primary-400 text-sm">{isMobile ? 'tap di sini' : 'seret kata di sini'}</span>
                      )}
                    </span>
                  </span>
                </p>

                {/* Word Bank Step 2 */}
                {!sectionAProgress.step2Complete && (
                  <div className="mt-4 pt-4 border-t-2 border-primary-200">
                    <p className="text-sm font-semibold text-primary-800 mb-3">📝 Pilih kata yang tepat:</p>
                    <div className="flex flex-wrap gap-2">
                      {wordBanks.step2.map((word) => {
                        const isUsed = answers.dataBivariat === word
                        const isSelected = isMobile && selectedWord === word
                        return (
                          <div
                            key={word}
                            draggable={!isUsed && !isMobile}
                            onDragStart={(e) => !isMobile && handleDragStart(e, word)}
                            onClick={() => !isUsed && handleWordClick(word)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              isUsed 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : isSelected
                                ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700 ring-4 ring-green-300'
                                : isMobile
                                ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 active:scale-95'
                                : 'bg-primary-600 text-white cursor-move hover:bg-primary-700 hover:shadow-md active:scale-95'
                            }`}
                          >
                            {word}
                          </div>
                        )
                      })}
                    </div>
                    {isMobile && selectedWord && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3 text-sm text-green-900"
                      >
                        ✓ <span className="font-semibold">"{selectedWord}"</span> dipilih. Tap kotak yang ingin diisi.
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Success Message Step 2 */}
                {sectionAProgress.step2Complete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 flex items-start gap-3"
                  >
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-semibold text-green-900">Tepat sekali!</p>
                      <p className="text-sm text-green-800">Data dengan dua variabel disebut data bivariat!</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Bi Meaning (unlocked after step 2) */}
            {sectionAProgress.step2Complete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-xl p-6 border-2 border-primary-300"
              >
                <p className="mb-4">
                  Istilah <span className="italic">"bi"</span> di sini berarti{' '}
                  
                  {/* Drop Zone 4: Bi Meaning */}
                  <span className="inline-flex items-center gap-2 mx-1">
                    <span
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'biMeaning')}
                      onClick={() => handleTargetClick('biMeaning')}
                      className={`inline-block min-w-[80px] px-3 py-1 border-2 border-dashed rounded-lg transition-all ${
                        answers.biMeaning 
                          ? 'bg-primary-200 border-primary-500' 
                          : isMobile
                          ? 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-100 cursor-pointer active:scale-95'
                          : 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {answers.biMeaning ? (
                        <span className="font-semibold text-primary-900 flex items-center gap-2">
                          {answers.biMeaning}
                          {!sectionAProgress.step3Complete && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                removeAnswer('biMeaning')
                              }}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ) : (
                        <span className="text-primary-400 text-sm">{isMobile ? 'tap' : 'seret kata'}</span>
                      )}
                    </span>
                  </span>
                </p>

                {/* Blurred text - revealed after correct answer */}
                <div className={`relative transition-all duration-500 ${!sectionAProgress.step3Complete ? 'select-none' : ''}`}>
                  <p className={`${!sectionAProgress.step3Complete ? 'blur-sm filter' : ''}`}>
                    jadi data bivariat artinya data yang setiap titiknya menyimpan{' '}
                    <span className="font-semibold text-primary-700">dua</span>{' '}
                    nilai sekaligus, bukan hanya satu.
                  </p>
                  {!sectionAProgress.step3Complete && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary-200 px-4 py-2 rounded-lg border-2 border-primary-400 text-sm font-semibold text-primary-800">
                        🔒 Selesaikan tantangan untuk membuka
                      </div>
                    </div>
                  )}
                </div>

                {/* Word Bank Step 3 */}
                {!sectionAProgress.step3Complete && (
                  <div className="mt-4 pt-4 border-t-2 border-primary-200">
                    <p className="text-sm font-semibold text-primary-800 mb-3">📝 Pilih kata yang tepat:</p>
                    <div className="flex flex-wrap gap-2">
                      {wordBanks.step3.map((word) => {
                        const isUsed = answers.biMeaning === word
                        const isSelected = isMobile && selectedWord === word
                        return (
                          <div
                            key={word}
                            draggable={!isUsed && !isMobile}
                            onDragStart={(e) => !isMobile && handleDragStart(e, word)}
                            onClick={() => !isUsed && handleWordClick(word)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              isUsed 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : isSelected
                                ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700 ring-4 ring-green-300'
                                : isMobile
                                ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 active:scale-95'
                                : 'bg-primary-600 text-white cursor-move hover:bg-primary-700 hover:shadow-md active:scale-95'
                            }`}
                          >
                            {word}
                          </div>
                        )
                      })}
                    </div>
                    {isMobile && selectedWord && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3 text-sm text-green-900"
                      >
                        ✓ <span className="font-semibold">"{selectedWord}"</span> dipilih. Tap kotak yang ingin diisi.
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Success Message Step 3 */}
                {sectionAProgress.step3Complete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 flex items-start gap-3"
                  >
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-semibold text-green-900">Sempurna!</p>
                      <p className="text-sm text-green-800">"Bi" memang berarti dua! Sekarang kamu bisa lihat penjelasan lengkapnya.</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Final Section: Diagram and Reinforcement (unlocked after all complete) */}
            {sectionAProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Reinforcement Message */}
                <div className="bg-gradient-to-r from-green-50 to-primary-50 rounded-xl p-6 mb-6 border-2 border-green-400">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎉</div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-2">Luar Biasa!</h3>
                      <p className="text-ink-700 leading-relaxed">
                        Kamu sudah memahami konsep dasar <span className="font-semibold text-primary-700">diagram pencar</span> dan{' '}
                        <span className="font-semibold text-primary-700">data bivariat</span>. Diagram pencar adalah alat yang 
                        sangat berguna untuk melihat hubungan antara dua variabel sekaligus. Dengan memahami ini, kamu sudah 
                        selangkah lebih dekat untuk menganalisis data di kehidupan nyata!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagram Example */}
                <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl p-4 md:p-6">
                  <h3 className="font-semibold text-ink-900 mb-4 text-center">
                    Contoh: Diagram Pencar Waktu Screentime vs Skor Kecemasan
                  </h3>
                  <p className="text-sm text-center text-ink-600 mb-4 italic">
                    <Eye className="w-4 h-4 inline mr-1" />
                    Contoh ilustrasi sederhana untuk memahami konsep diagram pencar
                  </p>
                  
                  {/* Simplified static scatter plot preview */}
                  <div className="bg-white rounded-lg p-6 border-2 border-primary-300">
                    <div className="relative" style={{ height: '200px' }}>
                      <svg className="w-full h-full">
                        {/* Axes */}
                        <line x1="40" y1="10" x2="40" y2="170" stroke="#1f2d28" strokeWidth="2" />
                        <line x1="40" y1="170" x2="95%" y2="170" stroke="#1f2d28" strokeWidth="2" />
                        {/* Sample points - positive correlation */}
                        <circle cx="15%" cy="75%" r="4" fill="#7fd9a8" />
                        <circle cx="23%" cy="68%" r="4" fill="#7fd9a8" />
                        <circle cx="32%" cy="60%" r="4" fill="#7fd9a8" />
                        <circle cx="42%" cy="52%" r="4" fill="#7fd9a8" />
                        <circle cx="52%" cy="45%" r="4" fill="#7fd9a8" />
                        <circle cx="62%" cy="37%" r="4" fill="#7fd9a8" />
                        <circle cx="72%" cy="28%" r="4" fill="#7fd9a8" />
                        <circle cx="82%" cy="20%" r="4" fill="#7fd9a8" />
                        
                        {/* Trend line */}
                        <line x1="12%" y1="78%" x2="85%" y2="18%" stroke="#bef4d5" strokeWidth="2" opacity="0.6" />
                        
                        {/* Labels */}
                        <text x="50%" y="195" textAnchor="middle" fontSize="12" fill="#4b5f58">
                          Waktu Screentime (jam) →
                        </text>
                        <text x="15" y="90" textAnchor="middle" fontSize="12" fill="#4b5f58" transform="rotate(-90 15 90)">
                          Skor Kecemasan →
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        {/* Section B: Sumbu X dan Y */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary-600"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Bagian B. Dua Jenis Variabel dalam Diagram Pencar
          </h2>

          <div className="space-y-6">
            <p className="text-ink-700 leading-relaxed">
              Dalam sebuah diagram pencar, ada dua jenis variabel yang perlu kamu kenali, yaitu{' '}
              <span className="font-semibold text-primary-700">variabel independen</span> dan{' '}
              <span className="font-semibold text-primary-700">variabel dependen</span>.
            </p>

            {/* Challenge: Drag definitions to correct boxes */}
            <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-300">
              <p className="text-sm font-semibold text-primary-800 mb-4">🎯 Seret definisi yang tepat ke kotak yang sesuai:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Variabel Independen Drop Zone */}
                <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      X
                    </div>
                    <h3 className="font-semibold text-blue-900">Variabel Independen</h3>
                  </div>
                  
                  <p className="text-sm text-ink-700 mb-3">
                    <span className="font-semibold">Variabel independen</span> adalah{' '}
                    
                    {/* Drop Zone */}
                    <span
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDefinitionDrop(e, 'independen')}
                      onClick={() => handleDefinitionTargetClick('independen')}
                      className={`block mt-3 min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        sectionBAnswers.independen 
                          ? 'bg-blue-100 border-blue-500' 
                          : isMobile
                          ? 'bg-white border-blue-400 hover:border-blue-600 hover:bg-blue-100 cursor-pointer active:scale-95'
                          : 'bg-white border-blue-400 hover:border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {sectionBAnswers.independen ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${sectionBProgress.independenComplete ? '' : 'animate-shake'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-ink-700">{sectionBAnswers.independen}</span>
                            {!sectionBProgress.independenComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSectionBAnswer('independen')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl leading-none"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-blue-400 text-sm flex items-center justify-center h-full">
                          {isMobile ? 'Tap di sini' : 'Seret definisi di sini'}
                        </span>
                      )}
                    </span>
                  </p>

                  

                  {/* Example - shown after correct answer */}
                  {sectionBProgress.independenComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-white rounded-lg p-4 border border-blue-200"
                    >
                      <p className="text-sm text-ink-700">
                        <span className="font-semibold text-blue-700">Contoh:</span> Waktu screentime adalah 
                        variabel independen, karena kita menggunakannya untuk memprediksi seberapa tinggi kecemasan 
                        seorang murid.
                      </p>
                    </motion.div>
                  )}

                  {/* Success indicator */}
                  {sectionBProgress.independenComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                    >
                      <span className="text-lg">✅</span>
                      <span className="text-xs text-green-800 font-semibold">Benar!</span>
                    </motion.div>
                  )}

                </div>

                {/* Variabel Dependen Drop Zone */}
                <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      Y
                    </div>
                    <h3 className="font-semibold text-purple-900">Variabel Dependen</h3>
                  </div>
                  
                  <p className="text-sm text-ink-700 mb-3">
                    <span className="font-semibold">Variabel dependen</span> adalah{' '}
                    
                    {/* Drop Zone */}
                    <span
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDefinitionDrop(e, 'dependen')}
                      onClick={() => handleDefinitionTargetClick('dependen')}
                      className={`block mt-3 min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        sectionBAnswers.dependen 
                          ? 'bg-purple-100 border-purple-500' 
                          : isMobile
                          ? 'bg-white border-purple-400 hover:border-purple-600 hover:bg-purple-100 cursor-pointer active:scale-95'
                          : 'bg-white border-purple-400 hover:border-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {sectionBAnswers.dependen ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${sectionBProgress.dependenComplete ? '' : 'animate-shake'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-ink-700">{sectionBAnswers.dependen}</span>
                            {!sectionBProgress.dependenComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSectionBAnswer('dependen')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl leading-none"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-purple-400 text-sm flex items-center justify-center h-full">
                          {isMobile ? 'Tap di sini' : 'Seret definisi di sini'}
                        </span>
                      )}
                    </span>
                  </p>

                  {/* Example - shown after correct answer */}
                  {sectionBProgress.dependenComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-white rounded-lg p-4 border border-purple-200"
                    >
                      <p className="text-sm text-ink-700">
                        <span className="font-semibold text-purple-700">Contoh:</span> Skor kecemasan adalah 
                        variabel dependen, karena nilainya diduga dipengaruhi oleh waktu screentime.
                      </p>
                    </motion.div>
                  )}

                  {/* Success indicator */}
                  {sectionBProgress.dependenComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                    >
                      <span className="text-lg">✅</span>
                      <span className="text-xs text-green-800 font-semibold">Benar!</span>
                    </motion.div>
                  )}

                </div>
              </div>

              {/* Draggable Definitions */}
              {!sectionBProgress.allComplete && (
                <div className="pt-4 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-primary-800 mb-3">📝 Definisi yang tersedia:</p>
                  <div className="space-y-3">
                    {definitions.map((def, index) => {
                      const isUsed = sectionBAnswers.independen === def || sectionBAnswers.dependen === def
                      const isSelected = isMobile && selectedDefinition === def
                      // Determine which variable this definition belongs to
                      const isIndependen = def.includes('memprediksi') || def.includes('sumbu X')
                      
                      return (
                        <div
                          key={index}
                          draggable={!isUsed && !isMobile}
                          onDragStart={(e) => !isMobile && handleDefinitionDragStart(e, def)}
                          onClick={() => !isUsed && handleDefinitionClick(def)}
                          className={`rounded-lg text-sm transition-all ${
                            isUsed 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                              : isSelected
                              ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 ring-4 ring-primary-300'
                              : isMobile
                              ? 'bg-white border-2 border-gray-300 cursor-pointer hover:border-primary-500 hover:shadow-md active:scale-[0.98]'
                              : 'bg-white border-2 border-gray-300 cursor-move hover:border-primary-500 hover:shadow-md active:scale-[0.98]'
                          }`}
                        >
                          <div className="p-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                              isUsed ? 'bg-gray-100 text-gray-400' :
                              isIndependen ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {isIndependen ? (
                                <>
                                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    X
                                  </div>
                                  <span>Variabel Independen</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    Y
                                  </div>
                                  <span>Variabel Dependen</span>
                                </>
                              )}
                            </div>
                            <p className={`leading-relaxed ${
                              isUsed ? 'text-gray-400' : 
                              isSelected ? 'text-white' : 
                              'text-ink-700'
                            }`}>
                              {def}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {isMobile && selectedDefinition && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3 text-sm text-green-900"
                    >
                      ✓ Definisi dipilih. Tap kotak yang ingin diisi.
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Examples - Shown after both correct */}
            {sectionBProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Reinforcement Message */}
                <div className="bg-gradient-to-r from-green-50 to-primary-50 rounded-xl p-6 border-2 border-green-400">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎉</div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-2">Hebat!</h3>
                      <p className="text-ink-700 leading-relaxed mb-3">
                        Kamu sudah bisa membedakan <span className="font-semibold text-primary-700">variabel independen</span> dan{' '}
                        <span className="font-semibold text-primary-700">variabel dependen</span>! Pemahaman ini akan sangat membantumu 
                        dalam membuat diagram pencar yang benar dan menginterpretasikan data dengan tepat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tip Box */}
                <div className="bg-gradient-to-r from-primary-100 to-purple-100 rounded-xl p-6">
                  <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary-700" />
                    Cara Mudah Mengingat
                  </h3>
                  <p className="text-lg font-semibold text-primary-700 mb-2">
                    X memprediksi, Y dipengaruhi.
                  </p>
                </div>

                {/* Tahukah Kamu */}
                <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary-500">
                  <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary-700" />
                    Tahukah kamu?
                  </h3>
                  <p className="text-sm text-ink-700">
                    Cara membedakan mana variabel independen dan mana variabel dependen adalah dengan bertanya pada 
                    dirimu sendiri: <span className="font-semibold">"Mana yang lebih dulu terjadi atau lebih masuk akal 
                    menjadi sebab?"</span> Waktu screentime biasanya terjadi lebih dulu dalam keseharian murid, sehingga 
                    lebih masuk akal jika ia diposisikan sebagai variabel independen (sumbu X), sementara skor kecemasan 
                    sebagai variabel dependen (sumbu Y).
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        {/* Section C: Korelasi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Bagian C. Korelasi dan Pola Penyebaran Titik
          </h2>

          <div className="space-y-6">
            <p className="text-ink-700 leading-relaxed">
              Pernahkah kamu memperhatikan teman yang sering bermain gawai sampai larut malam, lalu esok harinya 
              terlihat lebih mudah cemas atau gelisah? Bisa jadi ada hubungan antara kebiasaan itu dengan perasaannya. 
              Nah, dalam statistika, hubungan semacam ini bisa kita lihat lebih jelas lewat diagram pencar.
            </p>

            <p className="text-ink-700 leading-relaxed">
              Salah satu hal penting yang bisa kita baca dari diagram pencar adalah{' '}
              <span className="font-semibold text-primary-700">korelasi</span>.
            </p>

            {/* Challenge Step 1: Definition of Korelasi */}
            <div className="bg-primary-50 rounded-xl p-6 border-l-4 border-primary-500">
              <h3 className="font-semibold text-ink-900 mb-3 text-lg">Apa itu Korelasi?</h3>
              <p className="text-ink-700 leading-relaxed mb-3">
                <span className="font-semibold text-primary-700">Korelasi</span> adalah{' '}
                
                {/* Drop Zone for Definition */}
                <span
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDescriptionDrop(e, 'definition')}
                  onClick={() => handleDescriptionTargetClick('definition')}
                  className={`inline-block min-w-[200px] px-3 py-1 mx-1 border-2 border-dashed rounded-lg transition-all ${
                    sectionCAnswers.definition 
                      ? 'bg-primary-200 border-primary-500' 
                      : isMobile
                      ? 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-100 cursor-pointer active:scale-95'
                      : 'bg-white border-primary-400 hover:border-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {sectionCAnswers.definition ? (
                    <span className="font-semibold text-primary-900 inline-flex items-center gap-2">
                      {sectionCAnswers.definition}
                      {!sectionCProgress.definitionComplete && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSectionCAnswer('definition')
                          }}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ) : (
                    <span className="text-primary-400 text-sm">{isMobile ? 'tap di sini' : 'seret definisi di sini'}</span>
                  )}
                </span>
              </p>

              {/* Word Bank for Definition */}
              {!sectionCProgress.definitionComplete && (
                <div className="mt-4 pt-4 border-t-2 border-primary-200">
                  <p className="text-sm font-semibold text-primary-800 mb-3">📝 Pilih definisi yang tepat:</p>
                  <div className="flex flex-wrap gap-2">
                    {correlationDefinitions.map((def, index) => {
                      const isUsed = sectionCAnswers.definition === def
                      const isSelected = isMobile && selectedDescription === def
                      return (
                        <div
                          key={index}
                          draggable={!isUsed && !isMobile}
                          onDragStart={(e) => {
                            if (!isMobile) {
                              e.dataTransfer.effectAllowed = 'move'
                              e.dataTransfer.setData('text/plain', def)
                            }
                          }}
                          onClick={() => !isUsed && handleDescriptionClick(def)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            isUsed 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : isSelected
                              ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700 ring-4 ring-green-300'
                              : isMobile
                              ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 active:scale-95'
                              : 'bg-primary-600 text-white cursor-move hover:bg-primary-700 hover:shadow-md active:scale-95'
                          }`}
                        >
                          {def}
                        </div>
                      )
                    })}
                  </div>
                  {isMobile && selectedDescription && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3 text-sm text-green-900"
                    >
                      ✓ Definisi dipilih. Tap kotak yang ingin diisi.
                    </motion.div>
                  )}
                </div>
              )}

              {/* Success Message */}
              {sectionCProgress.definitionComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-green-100 border-2 border-green-400 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-900">Benar!</p>
                    <p className="text-sm text-green-800">Korelasi memang menunjukkan kecenderungan hubungan!</p>
                  </div>
                </motion.div>
              )}

              {/* Additional explanation - shown after correct */}
              {sectionCProgress.definitionComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3"
                >
                  <p className="text-ink-700 leading-relaxed">
                    Sederhananya, korelasi menjawab pertanyaan:{' '}
                    <span className="italic">"Kalau variabel yang satu berubah, apakah variabel yang lain juga ikut berubah dengan cara tertentu?"</span>
                  </p>
                  <p className="text-sm text-ink-600 mt-3">
                    Untuk mengetahuinya, kita cukup memperhatikan <span className="font-semibold">arah kemiringan titik-titik</span> pada diagram pencar.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Challenge Step 2: Match descriptions to correlation types */}
            {sectionCProgress.definitionComplete && !sectionCProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-sm font-semibold text-primary-800">🎯 Seret deskripsi yang tepat ke jenis korelasi yang sesuai:</p>
                
                {/* Jenis Korelasi - Cards with Drop Zones */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Korelasi Positif */}
                  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-300">
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-green-700">↗</span>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-3 text-center">Korelasi Positif</h3>
                    
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDescriptionDrop(e, 'positif')}
                      onClick={() => handleDescriptionTargetClick('positif')}
                      className={`min-h-[180px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        sectionCAnswers.positif 
                          ? 'bg-green-100 border-green-500' 
                          : isMobile
                          ? 'bg-white border-green-400 hover:border-green-600 hover:bg-green-100 cursor-pointer active:scale-95'
                          : 'bg-white border-green-400 hover:border-green-600 hover:bg-green-50'
                      }`}
                    >
                      {sectionCAnswers.positif ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${sectionCProgress.positifComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="space-y-2 flex-1">
                              {sectionCAnswers.positif.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className="bg-green-50 rounded p-2">
                                    <p className="text-xs text-green-800 font-semibold">{part}</p>
                                  </div>
                                ) : i === 1 ? (
                                  <p key={i} className="text-ink-700">{part}</p>
                                ) : (
                                  <p key={i} className="text-xs text-ink-600 italic">{part}</p>
                                )
                              ))}
                            </div>
                            {!sectionCProgress.positifComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSectionCAnswer('positif')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-green-400 text-sm">
                          {isMobile ? 'Tap di sini' : 'Seret deskripsi di sini'}
                        </div>
                      )}
                    </div>

                    {sectionCProgress.positifComplete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-xs text-green-800 font-semibold">Benar!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Tidak Ada Korelasi */}
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-gray-700">•••</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-center">Tidak Ada Korelasi</h3>
                    
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDescriptionDrop(e, 'tidakAda')}
                      onClick={() => handleDescriptionTargetClick('tidakAda')}
                      className={`min-h-[180px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        sectionCAnswers.tidakAda 
                          ? 'bg-gray-100 border-gray-500' 
                          : isMobile
                          ? 'bg-white border-gray-400 hover:border-gray-600 hover:bg-gray-100 cursor-pointer active:scale-95'
                          : 'bg-white border-gray-400 hover:border-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {sectionCAnswers.tidakAda ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${sectionCProgress.tidakAdaComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="space-y-2 flex-1">
                              {sectionCAnswers.tidakAda.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className="bg-gray-50 rounded p-2">
                                    <p className="text-xs text-gray-800 font-semibold">{part}</p>
                                  </div>
                                ) : i === 1 ? (
                                  <p key={i} className="text-ink-700">{part}</p>
                                ) : (
                                  <p key={i} className="text-xs text-ink-600 italic">{part}</p>
                                )
                              ))}
                            </div>
                            {!sectionCProgress.tidakAdaComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSectionCAnswer('tidakAda')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          {isMobile ? 'Tap di sini' : 'Seret deskripsi di sini'}
                        </div>
                      )}
                    </div>

                    {sectionCProgress.tidakAdaComplete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-xs text-green-800 font-semibold">Benar!</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Korelasi Negatif */}
                  <div className="bg-red-50 rounded-xl p-6 border-2 border-red-300">
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-red-700">↘</span>
                    </div>
                    <h3 className="font-semibold text-red-900 mb-3 text-center">Korelasi Negatif</h3>
                    
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDescriptionDrop(e, 'negatif')}
                      onClick={() => handleDescriptionTargetClick('negatif')}
                      className={`min-h-[180px] p-4 border-2 border-dashed rounded-lg transition-all ${
                        sectionCAnswers.negatif 
                          ? 'bg-red-100 border-red-500' 
                          : isMobile
                          ? 'bg-white border-red-400 hover:border-red-600 hover:bg-red-100 cursor-pointer active:scale-95'
                          : 'bg-white border-red-400 hover:border-red-600 hover:bg-red-50'
                      }`}
                    >
                      {sectionCAnswers.negatif ? (
                        <div className={`bg-white rounded-lg p-4 border border-gray-200 text-sm ${sectionCProgress.negatifComplete ? '' : 'animate-shake'}`}>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="space-y-2 flex-1">
                              {sectionCAnswers.negatif.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className="bg-red-50 rounded p-2">
                                    <p className="text-xs text-red-800 font-semibold">{part}</p>
                                  </div>
                                ) : i === 1 ? (
                                  <p key={i} className="text-ink-700">{part}</p>
                                ) : (
                                  <p key={i} className="text-xs text-ink-600 italic">{part}</p>
                                )
                              ))}
                            </div>
                            {!sectionCProgress.negatifComplete && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeSectionCAnswer('negatif')
                                }}
                                className="text-red-500 hover:text-red-700 flex-shrink-0 text-xl"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-red-400 text-sm">
                          {isMobile ? 'Tap di sini' : 'Seret deskripsi di sini'}
                        </div>
                      )}
                    </div>

                    {sectionCProgress.negatifComplete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 bg-green-100 border border-green-400 rounded-lg p-2 flex items-center gap-2"
                      >
                        <span className="text-lg">✅</span>
                        <span className="text-xs text-green-800 font-semibold">Benar!</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Draggable Descriptions */}
                {!sectionCProgress.allComplete && (
                  <div className="bg-primary-50 rounded-xl p-4 border-2 border-primary-300">
                    <p className="text-sm font-semibold text-primary-800 mb-3">📝 Deskripsi yang tersedia:</p>
                    <div className="space-y-3">
                      {correlationDescriptions.map((desc) => {
                        const isUsed = sectionCAnswers.positif === desc.text || 
                                      sectionCAnswers.negatif === desc.text || 
                                      sectionCAnswers.tidakAda === desc.text
                        const isSelected = isMobile && selectedDescription === desc.text
                        return (
                          <div
                            key={desc.key}
                            draggable={!isUsed && !isMobile}
                            onDragStart={(e) => !isMobile && handleDescriptionDragStart(e, desc.text)}
                            onClick={() => !isUsed && handleDescriptionClick(desc.text)}
                            className={`rounded-lg text-sm transition-all ${
                              isUsed 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                                : isSelected
                                ? 'bg-primary-600 text-white cursor-pointer hover:bg-primary-700 ring-4 ring-primary-300'
                                : isMobile
                                ? 'bg-white border-2 border-gray-300 cursor-pointer hover:border-primary-500 hover:shadow-md active:scale-[0.98]'
                                : 'bg-white border-2 border-gray-300 cursor-move hover:border-primary-500 hover:shadow-md active:scale-[0.98]'
                            }`}
                          >
                            <div className="p-4 space-y-2">
                              {desc.text.split(' | ').map((part, i) => (
                                i === 0 ? (
                                  <div key={i} className={`rounded p-2 ${
                                    desc.key === 'positif' ? 'bg-gray-50' : 
                                    desc.key === 'negatif' ? 'bg-gray-50' : 
                                    'bg-gray-50'
                                  }`}>
                                    <p className={`text-xs font-semibold ${
                                      isUsed ? 'text-gray-400' :
                                      desc.key === 'positif' ? 'text-gray-800' : 
                                      desc.key === 'negatif' ? 'text-gray-800' : 
                                      'text-gray-800'
                                    }`}>
                                      {part}
                                    </p>
                                  </div>
                                ) : (
                                  <p key={i} className={`${
                                    isUsed ? 'text-gray-400' :
                                    isSelected ? 'text-white' : 
                                    i === 1 ? 'text-ink-700' : 'text-ink-600 italic text-xs'
                                  }`}>
                                    {part}
                                  </p>
                                )
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {isMobile && selectedDescription && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 bg-green-100 border-2 border-green-400 rounded-lg p-3 text-sm text-green-900"
                      >
                        ✓ Deskripsi dipilih. Tap kotak yang ingin diisi.
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Reinforcement & Interactive Content - Unlocked after all matching complete */}
            {sectionCProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Reinforcement Message */}
                <div className="bg-gradient-to-r from-green-50 to-primary-50 rounded-xl p-6 border-2 border-green-400">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎉</div>
                    <div>
                      <h3 className="text-xl font-bold text-green-900 mb-2">Luar Biasa!</h3>
                      <p className="text-ink-700 leading-relaxed">
                        Kamu sudah menguasai konsep <span className="font-semibold text-primary-700">korelasi</span>! Sekarang kamu bisa 
                        membedakan korelasi positif, negatif, dan tidak ada korelasi. Mari kita lihat pola-pola ini lebih jelas 
                        dengan diagram pencar interaktif di bawah!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Cards - Clickable to change correlation type */}
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setCorrelationType('positif')}
                    className={`text-left bg-green-50 rounded-xl p-6 border-2 transition-all ${
                      correlationType === 'positif' ? 'border-green-500 shadow-lg ring-2 ring-green-200' : 'border-green-300 hover:border-green-400'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-green-700">↗</span>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-2 text-center">Korelasi Positif</h3>
                    <p className="text-xs text-green-800 mb-2">Nilai: 0 sampai +1</p>
                    <p className="text-sm text-ink-700 mb-2">
                      Titik-titik cenderung naik dari kiri bawah ke kanan atas. Semakin besar X, semakin besar Y.
                    </p>
                    <p className="text-xs text-ink-600 italic">
                      Contoh: Semakin lama screentime, semakin tinggi kecemasan
                    </p>
                  </button>

                  <button
                    onClick={() => setCorrelationType('tidakAda')}
                    className={`text-left bg-gray-50 rounded-xl p-6 border-2 transition-all ${
                      correlationType === 'tidakAda' ? 'border-gray-500 shadow-lg ring-2 ring-gray-200' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-gray-700">•••</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-center">Tidak Ada Korelasi</h3>
                    <p className="text-xs text-gray-800 mb-2">Nilai: mendekati 0</p>
                    <p className="text-sm text-ink-700 mb-2">
                      Titik-titik tersebar begitu saja, tanpa arah yang jelas. Tidak ada hubungan yang berarti.
                    </p>
                    <p className="text-xs text-ink-600 italic">
                      Contoh: Screentime tidak mempengaruhi kecemasan
                    </p>
                  </button>

                  <button
                    onClick={() => setCorrelationType('negatif')}
                    className={`text-left bg-red-50 rounded-xl p-6 border-2 transition-all ${
                      correlationType === 'negatif' ? 'border-red-500 shadow-lg ring-2 ring-red-200' : 'border-red-300 hover:border-red-400'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <span className="text-4xl font-bold text-red-700">↘</span>
                    </div>
                    <h3 className="font-semibold text-red-900 mb-2 text-center">Korelasi Negatif</h3>
                    <p className="text-xs text-red-800 mb-2">Nilai: -1 sampai 0</p>
                    <p className="text-sm text-ink-700 mb-2">
                      Titik-titik cenderung turun dari kiri atas ke kanan bawah. Semakin besar X, semakin kecil Y.
                    </p>
                    <p className="text-xs text-ink-600 italic">
                      Contoh: Semakin sering olahraga, semakin rendah kecemasan
                    </p>
                  </button>
                </div>

                <p className="text-sm text-center text-ink-600 italic">
                  💡 Klik salah satu kartu korelasi di atas untuk melihat pola diagram pencar yang berbeda!
                </p>
            
            {/* Interactive Scatter Plot Explorer */}
            <div className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-xl p-4 md:p-6 border-2 border-primary-400">
              <h3 className="font-semibold text-ink-900 mb-2 text-center text-lg">
                Scatter Plot Explorer (Komponen Interaktif)
              </h3>
              {correlationType === 'positif' ? (
                <p className="text-xs text-center text-ink-600 mb-4 italic">
                  <Info className="w-3 h-3 inline mr-1" />
                  Data ilustrasi bersifat simulasi, dibuat dengan pola yang disesuaikan dari temuan CDC NHIS-Teen Data Brief No. 513 (2024).
                </p>
              ) : (
                <p className="text-xs text-center text-ink-600 mb-4 italic">
                  <Info className="w-3 h-3 inline mr-1" />
                  Data simulasi untuk demonstrasi pola {correlationType === 'negatif' ? 'korelasi negatif' : 'tanpa korelasi'}.
                </p>
              )}
              
              <div className="bg-white rounded-lg p-4 md:p-8 border-2 border-primary-300 shadow-inner">
                {/* Mobile instruction */}
                <div className="md:hidden mb-4 bg-primary-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-ink-600 flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    Ketuk titik untuk melihat detail
                  </p>
                </div>

                <div className="relative">
                  {/* Chart container with responsive aspect ratio */}
                  <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                    <div className="absolute inset-0 flex">
                      {/* Y-axis label */}
                      <div className="flex items-center justify-center w-8 md:w-12">
                        <div className="transform -rotate-90 whitespace-nowrap text-xs md:text-sm font-medium text-ink-600">
                          Skor Kecemasan →
                        </div>
                      </div>
                      
                      {/* Chart area */}
                      <div className="flex-1 relative">
                        {/* Grid lines */}
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                          {[0, 25, 50, 75, 100].map((x) => (
                            <line
                              key={`v-${x}`}
                              x1={`${x}%`}
                              y1="0%"
                              x2={`${x}%`}
                              y2="100%"
                              stroke="#d4edf6"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                          ))}
                          {[0, 25, 50, 75, 100].map((y) => (
                            <line
                              key={`h-${y}`}
                              x1="0%"
                              y1={`${y}%`}
                              x2="100%"
                              y2={`${y}%`}
                              stroke="#d4edf6"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                          ))}
                        </svg>

                        {/* Axes */}
                        <div className="absolute inset-0" style={{ zIndex: 2 }}>
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ink-900"></div>
                          <div className="absolute left-0 bottom-0 right-0 h-0.5 bg-ink-900"></div>
                          
                          <div className="absolute -left-6 md:-left-8 top-0 text-xs text-ink-600">70</div>
                          <div className="absolute -left-6 md:-left-8 bottom-0 text-xs text-ink-600">20</div>
                          <div className="absolute left-0 -bottom-6 text-xs text-ink-600">0</div>
                          <div className="absolute right-0 -bottom-6 text-xs text-ink-600">7</div>
                        </div>
                        {/* Trend line based on correlation type */}
                        {correlationType === 'positif' && (
                          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 3 }}>
                            <line x1="10%" y1="85%" x2="90%" y2="10%" stroke="#bef4d5" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                          </svg>
                        )}
                        {correlationType === 'negatif' && (
                          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 3 }}>
                            <line x1="10%" y1="10%" x2="90%" y2="85%" stroke="#bef4d5" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                          </svg>
                        )}

                        {/* Data points */}
                        <div className="absolute inset-0" style={{ zIndex: 4 }}>
                          {currentData.map((point) => (
                            <motion.button
                              key={point.id}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none group"
                              style={{ 
                                left: `${point.x}%`, 
                                bottom: `${point.y}%`,
                              }}
                              onClick={() => setSelectedPoint(selectedPoint?.id === point.id ? null : point)}
                              onMouseEnter={() => setSelectedPoint(point)}
                              onMouseLeave={() => setSelectedPoint(null)}
                              whileHover={{ scale: 1.3 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: point.id * 0.1 }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-primary-400 rounded-full"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={selectedPoint?.id === point.id ? { 
                                  scale: [1, 2, 2.5], 
                                  opacity: [0.5, 0.3, 0] 
                                } : {}}
                                transition={{ 
                                  duration: 1, 
                                  repeat: selectedPoint?.id === point.id ? Infinity : 0 
                                }}
                              />
                              
                              <div 
                                className={`relative w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-200 ${
                                  selectedPoint?.id === point.id 
                                    ? 'bg-primary-700 ring-4 ring-primary-300' 
                                    : 'bg-primary-600 group-hover:bg-primary-700'
                                }`}
                              >
                                <AnimatePresence>
                                  {selectedPoint?.id === point.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 pointer-events-none"
                                      style={{ zIndex: 100 }}
                                    >
                                      <div className="bg-ink-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap">
                                        <div className="font-semibold mb-1">{point.label}</div>
                                        <div className="space-y-0.5 text-primary-200">
                                          <div>Screentime: {point.screentime}jam</div>
                                          <div>Kecemasan: {point.anxiety}</div>
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                          <div className="border-4 border-transparent border-t-ink-900"></div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center text-xs md:text-sm font-medium text-ink-600 mt-8 ml-8 md:ml-12">
                    Waktu Screentime (jam) →
                  </div>
                </div>
              </div>
              {/* Selected point info card */}
              <AnimatePresence mode="wait">
                {selectedPoint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-white rounded-lg p-4 shadow-md border-2 border-primary-400"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {selectedPoint.id}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-ink-900 mb-2">{selectedPoint.label}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="text-xs text-ink-600 mb-1">Waktu Screentime</div>
                            <div className="text-lg font-bold text-blue-700">{selectedPoint.screentime} jam</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2">
                            <div className="text-xs text-ink-600 mb-1">Skor Kecemasan</div>
                            <div className="text-lg font-bold text-purple-700">{selectedPoint.anxiety}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-primary-300">
                  <h4 className="font-semibold text-ink-900 mb-2 text-sm">Arah korelasi:</h4>
                  <p className="text-2xl font-bold text-primary-700 capitalize">{correlationType}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-primary-300">
                  <h4 className="font-semibold text-ink-900 mb-2 text-sm">Kekuatan korelasi (r):</h4>
                  <p className="text-2xl font-bold text-primary-700">
                    {correlationType === 'positif' ? '0.96' : correlationType === 'negatif' ? '-0.94' : '0.12'}
                  </p>
                  
                </div>
              </div>

              <p className="text-sm text-ink-600 mt-4 italic leading-relaxed">
                {correlationType === 'positif' && 
                  '💡 Titik-titik tersusun rapat mengikuti garis naik. Semakin tinggi screentime, semakin tinggi skor kecemasan. Ini contoh korelasi positif kuat.'
                }
                {correlationType === 'negatif' && 
                  '💡 Titik-titik tersusun rapat mengikuti garis turun. Semakin tinggi aktivitas (misalnya olahraga), semakin rendah skor kecemasan. Ini contoh korelasi negatif kuat.'
                }
                {correlationType === 'tidakAda' && 
                  '💡 Titik-titik tersebar tanpa pola jelas. Tidak ada hubungan yang konsisten antara kedua variabel. Ini menunjukkan tidak ada korelasi.'
                }
              </p>
            </div>

            {/* Tahukah Kamu - Korelasi bukan Kausalitas */}
            <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-500">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-700" />
                Tahukah kamu?
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed">
                <span className="font-semibold">Korelasi tidak selalu berarti sebab-akibat.</span> Screentime tinggi 
                belum tentu penyebab tunggal kecemasan, bisa saja ada faktor lain yang belum terlihat di data, seperti 
                tekanan sosial atau masalah di sekolah. Korelasi hanya menunjukkan bahwa dua hal saling berkaitan, 
                bukan bahwa satu hal pasti menyebabkan hal lainnya.
              </p>
            </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        {/* Section D: Kekuatan Korelasi dan Pola Penyebaran */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-primary-600"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Bagian D. Kekuatan Korelasi dan Pola Titik
          </h2>

          <div className="space-y-6">
            {/* Kekuatan Korelasi - Introduction */}
            <div>
              <h3 className="text-xl font-semibold text-ink-900 mb-4">Kekuatan Korelasi</h3>
              <p className="text-ink-700 leading-relaxed mb-4">
                Selain arah, korelasi juga punya <span className="font-semibold text-primary-700">kekuatan</span>. 
                Kekuatan korelasi menunjukkan seberapa rapat titik-titik data mengikuti pola kecenderungannya.
              </p>

              {/* Challenge 1: Match Kekuatan descriptions */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  🎯 Tantangan: Cocokkan penjelasan dengan jenis kekuatan korelasi yang tepat!
                </h4>

                {/* Drop zones for Kekuatan */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Korelasi Kuat */}
                  <div 
                    className={`bg-green-50 rounded-xl p-6 border-2 transition-all ${
                      sectionDProgress.kuatComplete ? 'border-green-500 bg-green-100' : 'border-green-300 border-dashed'
                    } ${isMobile && selectedDescription && !sectionDAnswers.kuat ? 'cursor-pointer hover:bg-green-100' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleSectionDDrop(e, 'kuat')}
                    onClick={() => isMobile && handleSectionDTargetClick('kuat')}
                  >
                    <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                      Korelasi Kuat
                    </h5>
                    
                    {sectionDAnswers.kuat ? (
                      <div className={`bg-white rounded-lg p-4 text-sm ${sectionDProgress.kuatComplete ? '' : 'animate-shake'}`}>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className="text-ink-700">
                            {sectionDAnswers.kuat.split(' | ')[0]}
                          </p>
                          {!sectionDProgress.kuatComplete && (
                            <button
                              onClick={() => removeSectionDAnswer('kuat')}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className="bg-green-50 rounded p-2 text-xs mt-2">
                          <span className="font-semibold">
                            {sectionDAnswers.kuat.split(' | ')[1]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-green-300 min-h-[100px] flex items-center justify-center">
                        <p className="text-sm text-green-700 text-center">
                          {isMobile ? 'Ketuk untuk menempatkan' : 'Tarik penjelasan ke sini'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Korelasi Lemah */}
                  <div 
                    className={`bg-orange-50 rounded-xl p-6 border-2 transition-all ${
                      sectionDProgress.lemahComplete ? 'border-orange-500 bg-orange-100' : 'border-orange-300 border-dashed'
                    } ${isMobile && selectedDescription && !sectionDAnswers.lemah ? 'cursor-pointer hover:bg-orange-100' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleSectionDDrop(e, 'lemah')}
                    onClick={() => isMobile && handleSectionDTargetClick('lemah')}
                  >
                    <h5 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm">
                        ~
                      </div>
                      Korelasi Lemah
                    </h5>
                    
                    {sectionDAnswers.lemah ? (
                      <div className={`bg-white rounded-lg p-4 text-sm ${sectionDProgress.lemahComplete ? '' : 'animate-shake'}`}>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className="text-ink-700">
                            {sectionDAnswers.lemah.split(' | ')[0]}
                          </p>
                          {!sectionDProgress.lemahComplete && (
                            <button
                              onClick={() => removeSectionDAnswer('lemah')}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className="bg-orange-50 rounded p-2 text-xs mt-2">
                          <span className="font-semibold">
                            {sectionDAnswers.lemah.split(' | ')[1]}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-orange-300 min-h-[100px] flex items-center justify-center">
                        <p className="text-sm text-orange-700 text-center">
                          {isMobile ? 'Ketuk untuk menempatkan' : 'Tarik penjelasan ke sini'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Draggable descriptions for Kekuatan */}
                {(!sectionDProgress.kuatComplete || !sectionDProgress.lemahComplete) && (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-800 font-medium">
                      {isMobile ? 'Ketuk penjelasan, lalu ketuk kotak tujuan' : 'Pilih dan tarik penjelasan yang sesuai'}:
                    </p>
                    <div className="grid gap-3">
                      {kekuatanDescriptions
                        .filter(desc => 
                          (desc.key === 'kuat' && !sectionDAnswers.kuat) || 
                          (desc.key === 'lemah' && !sectionDAnswers.lemah)
                        )
                        .map((desc) => (
                          <div
                            key={desc.key}
                            draggable={!isMobile}
                            onClick={() => handleSectionDClick(desc.text)}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', desc.text)
                              e.dataTransfer.effectAllowed = 'move'
                            }}
                            className={`bg-white rounded-lg p-4 border-2 transition-all ${
                              selectedDescription === desc.text
                                ? 'border-amber-500 bg-amber-50 shadow-lg'
                                : 'border-amber-300 hover:border-amber-500'
                            } ${isMobile ? 'cursor-pointer active:scale-95' : 'cursor-move hover:shadow-md'}`}
                          >
                            <div className="flex items-start gap-3">
                              {!isMobile && (
                                <div className="flex-shrink-0 mt-1">
                                  <GripVertical className="w-4 h-4 text-amber-600" />
                                </div>
                              )}
                              <div className="text-sm text-ink-700">
                                <p className="mb-2">{desc.text.split(' | ')[0]}</p>
                                <div className="bg-gray-50 rounded p-2 text-xs">
                                  <span className="font-semibold">{desc.text.split(' | ')[1]}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Success message for Kekuatan */}
                {sectionDProgress.kuatComplete && sectionDProgress.lemahComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-100 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      Hebat! Kamu sudah memahami perbedaan kekuatan korelasi!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Example comparison - shown after Kekuatan complete */}
              {sectionDProgress.kuatComplete && sectionDProgress.lemahComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary-50 rounded-xl p-6 mb-6"
                >
                  <h4 className="font-semibold text-ink-900 mb-3">💡 Contoh Perbandingan:</h4>
                  <p className="text-sm text-ink-700 leading-relaxed">
                    Bayangkan dua kelas yang sama-sama diminta mencatat data screentime dan skor kecemasan. 
                    Di <span className="font-semibold text-primary-700">Kelas A</span>, semua murid dengan screentime 
                    tinggi kompak memiliki skor kecemasan tinggi juga, ini <span className="font-semibold">korelasi kuat</span>. 
                    Di <span className="font-semibold text-primary-700">Kelas B</span>, murid dengan screentime tinggi ada 
                    yang skor kecemasannya tinggi, ada juga yang biasa saja, ini <span className="font-semibold">korelasi lemah</span>, 
                    karena datanya lebih "berantakan".
                  </p>
                </motion.div>
              )}
            </div>

            {/* Pola Penyebaran Titik - shown after Kekuatan complete */}
            {sectionDProgress.kuatComplete && sectionDProgress.lemahComplete && (
              <div>
                <h3 className="text-xl font-semibold text-ink-900 mb-4">Pola Penyebaran Titik</h3>
                <p className="text-ink-700 leading-relaxed mb-4">
                  Selain arah dan kekuatan, kita juga perlu memperhatikan bagaimana titik-titik itu tersebar secara keseluruhan.
                </p>

                {/* Challenge 2: Match Pola descriptions */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    🎯 Tantangan: Cocokkan penjelasan dengan pola penyebaran yang tepat!
                  </h4>

                  {/* Drop zones for Pola */}
                  <div className="space-y-4 mb-6">
                    {/* Pola Linear */}
                    <div 
                      className={`flex gap-4 items-start bg-blue-50 rounded-lg p-4 border-2 transition-all ${
                        sectionDProgress.linearComplete ? 'border-blue-500 bg-blue-100' : 'border-blue-300 border-dashed'
                      } ${isMobile && selectedDescription && !sectionDAnswers.linear ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleSectionDDrop(e, 'linear')}
                      onClick={() => isMobile && handleSectionDTargetClick('linear')}
                    >
                      <div className="flex-shrink-0 text-3xl">📏</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-ink-900 mb-2">Pola Linear</h5>
                        {sectionDAnswers.linear ? (
                          <div className={`bg-white rounded-lg p-4 text-sm ${sectionDProgress.linearComplete ? '' : 'animate-shake'}`}>
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-ink-700">{sectionDAnswers.linear}</p>
                              {!sectionDProgress.linearComplete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeSectionDAnswer('linear')
                                  }}
                                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-blue-300 min-h-[80px] flex items-center justify-center">
                            <p className="text-sm text-blue-700 text-center">
                              {isMobile ? 'Ketuk untuk menempatkan' : 'Tarik penjelasan ke sini'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pola Non-linear */}
                    <div 
                      className={`flex gap-4 items-start bg-purple-50 rounded-lg p-4 border-2 transition-all ${
                        sectionDProgress.nonLinearComplete ? 'border-purple-500 bg-purple-100' : 'border-purple-300 border-dashed'
                      } ${isMobile && selectedDescription && !sectionDAnswers.nonLinear ? 'cursor-pointer hover:bg-purple-100' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleSectionDDrop(e, 'nonLinear')}
                      onClick={() => isMobile && handleSectionDTargetClick('nonLinear')}
                    >
                      <div className="flex-shrink-0 text-3xl">〰️</div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-ink-900 mb-2">Pola Non-linear</h5>
                        {sectionDAnswers.nonLinear ? (
                          <div className={`bg-white rounded-lg p-4 text-sm ${sectionDProgress.nonLinearComplete ? '' : 'animate-shake'}`}>
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-ink-700">{sectionDAnswers.nonLinear}</p>
                              {!sectionDProgress.nonLinearComplete && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeSectionDAnswer('nonLinear')
                                  }}
                                  className="text-red-500 hover:text-red-700 flex-shrink-0"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white bg-opacity-50 rounded-lg p-4 border-2 border-dashed border-purple-300 min-h-[80px] flex items-center justify-center">
                            <p className="text-sm text-purple-700 text-center">
                              {isMobile ? 'Ketuk untuk menempatkan' : 'Tarik penjelasan ke sini'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Draggable descriptions for Pola */}
                  {(!sectionDProgress.linearComplete || !sectionDProgress.nonLinearComplete) && (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-800 font-medium">
                        {isMobile ? 'Ketuk penjelasan, lalu ketuk kotak tujuan' : 'Pilih dan tarik penjelasan yang sesuai'}:
                      </p>
                      <div className="grid gap-3">
                        {polaDescriptions
                          .filter(desc => 
                            (desc.key === 'linear' && !sectionDAnswers.linear) || 
                            (desc.key === 'nonLinear' && !sectionDAnswers.nonLinear)
                          )
                          .map((desc) => (
                            <div
                              key={desc.key}
                              draggable={!isMobile}
                              onClick={() => handleSectionDClick(desc.text)}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', desc.text)
                                e.dataTransfer.effectAllowed = 'move'
                              }}
                              className={`bg-white rounded-lg p-4 border-2 transition-all ${
                                selectedDescription === desc.text
                                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                                  : 'border-blue-300 hover:border-blue-500'
                              } ${isMobile ? 'cursor-pointer active:scale-95' : 'cursor-move hover:shadow-md'}`}
                            >
                              <div className="flex items-start gap-3">
                                {!isMobile && (
                                  <div className="flex-shrink-0 mt-1">
                                    <GripVertical className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                                <div className="text-sm text-ink-700">
                                  <p>{desc.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Success message for Pola */}
                  {sectionDProgress.linearComplete && sectionDProgress.nonLinearComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-100 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800 font-medium">
                        Sempurna! Kamu sudah memahami pola penyebaran titik!
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Final reinforcement - shown after all complete */}
            {sectionDProgress.allComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-2 border-green-400"
              >
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  Kesimpulan Bagian D
                </h4>
                <p className="text-sm text-ink-700 leading-relaxed">
                  Sekarang kamu sudah paham bahwa korelasi tidak hanya memiliki <span className="font-semibold text-primary-700">arah</span> 
                  (positif, negatif, tidak ada), tetapi juga <span className="font-semibold text-primary-700">kekuatan</span> 
                  (kuat atau lemah) dan <span className="font-semibold text-primary-700">pola</span> (linear atau non-linear). 
                  Semua ini penting untuk memahami hubungan antara dua variabel dengan lebih mendalam!
                </p>
              </motion.div>
            )}
          </div>
        </div>
        {/* Section E: Outlier */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-orange-600" />
            Memahami Outlier (Pencilan Data)
          </h2>

          <div className="space-y-6">
            <p className="text-ink-700 leading-relaxed">
              Yang juga penting untuk diperhatikan adalah <span className="font-semibold text-primary-700">outlier</span>, 
              yaitu titik data yang letaknya menyimpang jauh dari kumpulan titik lainnya.
            </p>

            <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Outlier Tidak Boleh Langsung Diabaikan!
              </h3>
              <p className="text-sm text-ink-700 leading-relaxed mb-4">
                Outlier bisa jadi tanda ada faktor lain yang belum kita pertimbangkan. Misalnya, seorang murid 
                yang tidurnya cukup tapi kec emasannya tinggi - mungkin dia mengalami bullying atau masalah keluarga.
              </p>
              <div className="bg-white rounded-lg p-4 border border-orange-300">
                <p className="text-sm text-ink-700 leading-relaxed">
                  Titik seperti ini justru bisa menjadi tanda bahwa ada murid yang{' '}
                  <span className="font-semibold text-orange-700">memerlukan perhatian lebih</span>.
                </p>
              </div>
            </div>

            {/* Interactive Challenge */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                🎯 Tantangan: Identifikasi Outlier!
              </h4>
              <p className="text-sm text-amber-800 mb-4">
                Klik pada titik-titik yang menurut kamu adalah <strong>outlier</strong> (data yang menyimpang dari pola umum).
              </p>

              {/* Interactive Scatter Plot */}
              <div className="bg-white rounded-lg p-6 border-2 border-orange-300">
                <h5 className="text-center font-semibold text-ink-900 mb-4">
                  Jam Tidur per Hari vs Skor Kecemasan
                </h5>
                <div className="relative" style={{ height: '350px' }}>
                  <svg className="w-full h-full">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Axes */}
                    <line x1="50" y1="20" x2="50" y2="300" stroke="#1f2d28" strokeWidth="2" />
                    <line x1="50" y1="300" x2="95%" y2="300" stroke="#1f2d28" strokeWidth="2" />
                    
                    {/* Axis labels */}
                    <text x="50%" y="335" textAnchor="middle" fontSize="13" fill="#4b5f58" fontWeight="600">
                      Jam Tidur per Hari →
                    </text>
                    <text x="25" y="160" textAnchor="middle" fontSize="13" fill="#4b5f58" fontWeight="600" transform="rotate(-90 25 160)">
                      Skor Kecemasan →
                    </text>
                    
                    {/* Trend line (negative correlation) */}
                    <line 
                      x1="15%" 
                      y1="78%" 
                      x2="88%" 
                      y2="28%" 
                      stroke="#bef4d5" 
                      strokeWidth="2" 
                      opacity="0.5" 
                      strokeDasharray="5 5" 
                    />
                    
                    {/* Data points */}
                    {outlierDataPoints.map(point => {
                      const isSelected = sectionEProgress.selectedPoints.includes(point.id)
                      const isHovered = hoveredPoint === point.id
                      const isCorrect = sectionEProgress.completed && point.isOutlier && isSelected
                      const isWrong = !sectionEProgress.completed && isSelected && !point.isOutlier
                      
                      return (
                        <g key={point.id}>
                          <circle
                            cx={`${point.x + 8}%`}
                            cy={`${point.y}%`}
                            r={isHovered ? "10" : isSelected ? "8" : "6"}
                            fill={
                              isCorrect ? "#10b981" : 
                              isWrong ? "#ef4444" :
                              isSelected ? "#f97316" : 
                              point.isOutlier ? "#7fd9a8" : "#7fd9a8"
                            }
                            stroke={isSelected ? "#ea580c" : isHovered ? "#4b5f58" : "none"}
                            strokeWidth={isSelected ? "3" : "2"}
                            opacity={isHovered ? "0.9" : "0.8"}
                            className="cursor-pointer transition-all"
                            onClick={() => handlePointClick(point.id)}
                            onMouseEnter={() => setHoveredPoint(point.id)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {isSelected && !sectionEProgress.completed && (
                            <circle
                              cx={`${point.x + 8}%`}
                              cy={`${point.y}%`}
                              r="14"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="2"
                              opacity="0.4"
                            />
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Tooltip on hover */}
                {hoveredPoint && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-300">
                    {(() => {
                      const point = outlierDataPoints.find(p => p.id === hoveredPoint)
                      return (
                        <div className="text-sm text-ink-700">
                          <p><strong>{point.label}:</strong></p>
                          <p>Jam tidur: {point.sleep} jam/hari</p>
                          <p>Skor kecemasan: {point.anxiety}</p>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Selected count */}
                {!sectionEProgress.completed && sectionEProgress.selectedPoints.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-amber-800">
                      Kamu sudah memilih <strong>{sectionEProgress.selectedPoints.length}</strong> titik
                    </p>
                  </div>
                )}
              </div>

              {/* Success message */}
              {sectionEProgress.completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 bg-green-100 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-800 font-medium">
                    Hebat! Kamu berhasil mengidentifikasi outlier dengan benar!
                  </p>
                </motion.div>
              )}
            </div>

            {/* Explanation after completion */}
            {sectionEProgress.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-xl p-6"
              >
                <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary-700" />
                  Penjelasan Outlier yang Kamu Temukan
                </h3>
                <div className="space-y-3">
                  {outlierDataPoints
                    .filter(p => p.isOutlier)
                    .map(point => (
                      <div key={point.id} className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                        <p className="text-sm font-semibold text-ink-900 mb-1">{point.label}</p>
                        <p className="text-sm text-ink-700 mb-2">
                          <strong>Data:</strong> Tidur {point.sleep} jam (cukup), tapi kecemasan {point.anxiety} (tinggi)
                        </p>
                        <p className="text-sm text-orange-700 italic">
                          <strong>Kemungkinan penyebab:</strong> {point.reason}
                        </p>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Key lessons */}
            {sectionEProgress.completed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6"
              >
                <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-teal-600" />
                  Pelajaran Penting tentang Outlier
                </h3>
                <ul className="space-y-2 text-sm text-ink-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Outlier bisa jadi tanda adanya <strong>faktor lain</strong> yang belum kita pertimbangkan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Dalam konteks sekolah, outlier bisa menunjukkan murid yang butuh <strong>perhatian khusus</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Jangan abaikan data yang "tidak biasa" - mereka bisa memberi <strong>insight penting</strong>!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Korelasi negatif terlihat: <strong>semakin banyak tidur, semakin rendah kecemasan</strong> (pada pola umum)</span>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
        {/* Rangkuman */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-poppins font-semibold text-ink-900 mb-6 text-center">
            📚 Rangkuman Materi
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-semibold text-ink-900 mb-2">Data Bivariat</h3>
                  <p className="text-sm text-ink-600">
                    Data yang terdiri dari dua variabel, ditampilkan dalam diagram pencar
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">↗️</span>
                <div>
                  <h3 className="font-semibold text-ink-900 mb-2">Korelasi</h3>
                  <p className="text-sm text-ink-600">
                    Hubungan antara dua variabel: positif, negatif, atau tidak ada
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📏</span>
                <div>
                  <h3 className="font-semibold text-ink-900 mb-2">Kekuatan Korelasi</h3>
                  <p className="text-sm text-ink-600">
                    Seberapa rapat titik-titik mengikuti pola: kuat atau lemah
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-ink-900 mb-2">Outlier</h3>
                  <p className="text-sm text-ink-600">
                    Titik yang menyimpang jauh, bisa jadi indikator penting
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl p-5 border-2 border-primary-400">
            <h3 className="font-semibold text-ink-900 mb-3 text-center">🎯 Yang Perlu Diingat</h3>
            <ul className="space-y-2 text-sm text-ink-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold text-lg">1.</span>
                <span><span className="font-semibold">X memprediksi, Y dipengaruhi</span> - variabel independen di sumbu X, variabel dependen di sumbu Y</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold text-lg">2.</span>
                <span><span className="font-semibold">Korelasi ≠ Kausalitas</span> - ada hubungan tidak berarti ada sebab-akibat langsung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold text-lg">3.</span>
                <span><span className="font-semibold">Perhatikan outlier</span> - titik yang menyimpang bisa memberi informasi penting</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-primary-700 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-poppins font-bold mb-3">
            Sudah Paham Konsepnya? 🎉
          </h3>
          <p className="text-primary-50 mb-6 max-w-2xl mx-auto">
            Sekarang saatnya kita bersiap mengumpulkan data dari kelasmu sendiri! Mari lanjut ke tahap berikutnya.
          </p>

          <Link
            to="/kegiatan-belajar/the-challenge/transisi-aktivitas"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-700 rounded-lg font-poppins font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Lanjut ke Guiding Activities
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
    </LearningLayout>
  )
}
