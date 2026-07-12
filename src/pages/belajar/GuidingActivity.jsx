import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import LearningLayout from '../../components/layout/LearningLayout'
import MiloCharacter from '../../components/milo/MiloCharacter'
import MiloDialogBubble from '../../components/milo/MiloDialogBubble'
import BullyingQuestionCard from '../../components/survey/BullyingQuestionCard'
import AnxietyCategoryCard from '../../components/survey/AnxietyCategoryCard'
import SurveyProgress from '../../components/survey/SurveyProgress'
import { StudentContext } from '../../context/StudentContext'
import { supabase } from '../../lib/supabaseClient'
import { bullyingQuestions, anxietyCategories } from '../../data/surveyQuestions'

export default function GuidingActivity() {
  const navigate = useNavigate()
  const { studentId, studentName, kelasId } = useContext(StudentContext)
  
  // Survey state
  const [currentSurvey, setCurrentSurvey] = useState('intro') // intro | identity | bullying | anxiety | saving
  const [usia, setUsia] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('')
  const [bullyingAnswers, setBullyingAnswers] = useState({})
  const [anxietyAnswers, setAnxietyAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [draftLoaded, setDraftLoaded] = useState(false)

  // Draft save keys
  const DRAFT_KEY_SURVEY = `survey_draft_${studentId}_survey`
  const DRAFT_KEY_IDENTITY = `survey_draft_${studentId}_identity`
  const DRAFT_KEY_BULLYING = `survey_draft_${studentId}_bullying`
  const DRAFT_KEY_ANXIETY = `survey_draft_${studentId}_anxiety`

  // Load draft on mount
  useEffect(() => {
    if (!studentId || draftLoaded) return

    try {
      const savedSurvey = localStorage.getItem(DRAFT_KEY_SURVEY)
      const savedIdentity = localStorage.getItem(DRAFT_KEY_IDENTITY)
      const savedBullying = localStorage.getItem(DRAFT_KEY_BULLYING)
      const savedAnxiety = localStorage.getItem(DRAFT_KEY_ANXIETY)

      if (savedSurvey) {
        setCurrentSurvey(savedSurvey)
        console.log('📄 Loaded draft survey state:', savedSurvey)
      }

      if (savedIdentity) {
        const parsed = JSON.parse(savedIdentity)
        setUsia(parsed.usia || '')
        setJenisKelamin(parsed.jenisKelamin || '')
        console.log('📄 Loaded identity draft')
      }

      if (savedBullying) {
        const parsed = JSON.parse(savedBullying)
        setBullyingAnswers(parsed)
        console.log('📄 Loaded bullying draft:', Object.keys(parsed).length, 'answers')
      }

      if (savedAnxiety) {
        const parsed = JSON.parse(savedAnxiety)
        setAnxietyAnswers(parsed)
        console.log('📄 Loaded anxiety draft:', Object.keys(parsed).length, 'answers')
      }

      setDraftLoaded(true)
    } catch (err) {
      console.error('Error loading draft:', err)
    }
  }, [studentId, draftLoaded, DRAFT_KEY_SURVEY, DRAFT_KEY_IDENTITY, DRAFT_KEY_BULLYING, DRAFT_KEY_ANXIETY])

  // Auto-save identity to localStorage
  useEffect(() => {
    if (!studentId || !draftLoaded) return
    
    if (usia || jenisKelamin) {
      localStorage.setItem(DRAFT_KEY_IDENTITY, JSON.stringify({ usia, jenisKelamin }))
      console.log('💾 Auto-saved identity draft')
    }
  }, [usia, jenisKelamin, studentId, draftLoaded, DRAFT_KEY_IDENTITY])

  // Auto-save bullying answers to localStorage
  useEffect(() => {
    if (!studentId || !draftLoaded) return
    
    if (Object.keys(bullyingAnswers).length > 0) {
      localStorage.setItem(DRAFT_KEY_BULLYING, JSON.stringify(bullyingAnswers))
      console.log('💾 Auto-saved bullying draft:', Object.keys(bullyingAnswers).length, 'answers')
    }
  }, [bullyingAnswers, studentId, draftLoaded, DRAFT_KEY_BULLYING])

  // Auto-save anxiety answers to localStorage
  useEffect(() => {
    if (!studentId || !draftLoaded) return
    
    if (Object.keys(anxietyAnswers).length > 0) {
      localStorage.setItem(DRAFT_KEY_ANXIETY, JSON.stringify(anxietyAnswers))
      console.log('💾 Auto-saved anxiety draft:', Object.keys(anxietyAnswers).length, 'answers')
    }
  }, [anxietyAnswers, studentId, draftLoaded, DRAFT_KEY_ANXIETY])

  // Auto-save current survey state
  useEffect(() => {
    if (!studentId || !draftLoaded) return
    
    if (currentSurvey !== 'intro') {
      localStorage.setItem(DRAFT_KEY_SURVEY, currentSurvey)
      console.log('💾 Auto-saved survey state:', currentSurvey)
    }
  }, [currentSurvey, studentId, draftLoaded, DRAFT_KEY_SURVEY])

  // Clear draft after successful submission
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY_SURVEY)
    localStorage.removeItem(DRAFT_KEY_IDENTITY)
    localStorage.removeItem(DRAFT_KEY_BULLYING)
    localStorage.removeItem(DRAFT_KEY_ANXIETY)
    console.log('🗑️ Cleared survey draft')
  }

  // Check if already submitted
  useEffect(() => {
    async function checkExisting() {
      if (!studentId) {
        console.log('⚠️ No studentId found in context')
        return
      }
      
      console.log('✅ Student ID:', studentId)
      console.log('✅ Student Name:', studentName)
      
      // Don't redirect - let TransisiAktivitas handle the decision
      // Just log for debugging
      const { data } = await supabase
        .from('survey_results')
        .select('*')
        .eq('siswa_id', studentId)
        .single()
      
      if (data) {
        console.log('ℹ️ Existing submission found - will be updated if user retakes')
      } else {
        console.log('ℹ️ No existing submission - new entry will be created')
      }
    }
    checkExisting()
  }, [studentId, studentName])

  // Handle bullying answer
  const handleBullyingAnswer = (questionNo, score) => {
    setBullyingAnswers(prev => ({
      ...prev,
      [questionNo]: score
    }))
  }

  // Handle anxiety symptom checkbox
  const handleAnxietySymptom = (categoryNo, symptom, checked) => {
    setAnxietyAnswers(prev => {
      const current = prev[categoryNo] || { symptoms: [], emoticon: null }
      const symptoms = checked
        ? [...current.symptoms, symptom]
        : current.symptoms.filter(s => s !== symptom)
      
      return {
        ...prev,
        [categoryNo]: { ...current, symptoms }
      }
    })
  }

  // Handle anxiety emoticon
  const handleAnxietyEmoticon = (categoryNo, score) => {
    setAnxietyAnswers(prev => {
      const current = prev[categoryNo] || { symptoms: [], emoticon: null }
      return {
        ...prev,
        [categoryNo]: { ...current, emoticon: score }
      }
    })
  }

  // Calculate scores
  const calculateScores = () => {
    // Bullying score
    const bullyingScore = Object.values(bullyingAnswers).reduce((sum, val) => sum + val, 0)
    
    // Anxiety score
    const anxietyScore = Object.values(anxietyAnswers).reduce((sum, answer) => {
      return sum + (answer.emoticon || 0)
    }, 0)
    
    return { bullyingScore, anxietyScore }
  }

  // Check completion
  const isBullyingComplete = () => {
    return Object.keys(bullyingAnswers).length === bullyingQuestions.length
  }

  const isAnxietyComplete = () => {
    return Object.keys(anxietyAnswers).length === anxietyCategories.length &&
      Object.values(anxietyAnswers).every(answer => 
        answer.symptoms.length > 0 && answer.emoticon !== null
      )
  }

  // Get incomplete categories for user feedback
  const getIncompleteCategories = () => {
    return anxietyCategories.filter(cat => {
      const answer = anxietyAnswers[cat.no]
      return !answer || answer.symptoms.length === 0 || answer.emoticon === null
    })
  }

  // Save to database
  const handleSubmit = async () => {
    console.log('🔍 DEBUG - Starting submit...')
    console.log('🔍 Student ID from context:', studentId)
    console.log('🔍 Student Name from context:', studentName)
    console.log('🔍 Kelas ID from context:', kelasId)
    console.log('🔍 Usia:', usia)
    console.log('🔍 Jenis Kelamin:', jenisKelamin)
    
    if (!studentId) {
      setError('Student ID tidak ditemukan. Silakan login ulang.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // 1. Update student identity (usia & jenis_kelamin)
      console.log('🔍 Updating student identity...')
      const { error: updateError } = await supabase
        .from('siswa')
        .update({
          usia: parseInt(usia),
          jenis_kelamin: jenisKelamin
        })
        .eq('id', studentId)

      if (updateError) {
        console.error('❌ Failed to update identity:', updateError)
        throw updateError
      }

      console.log('✅ Identity updated successfully')

      // 2. Verify student exists in database
      console.log('🔍 Verifying student in database...')
      const { data: studentCheck, error: studentError } = await supabase
        .from('siswa')
        .select('id, nama, kelas_id')
        .eq('id', studentId)
        .single()

      console.log('🔍 Student check result:', studentCheck)
      console.log('🔍 Student check error:', studentError)

      if (studentError || !studentCheck) {
        console.error('❌ Student not found in database')
        console.error('StudentError details:', studentError)
        setError('Data siswa tidak ditemukan di database. Silakan join kelas terlebih dahulu.')
        setSaving(false)
        return
      }

      console.log('✅ Student verified:', studentCheck.nama)

      const { bullyingScore, anxietyScore } = calculateScores()
      console.log('📊 Calculated scores - Bullying:', bullyingScore, 'Anxiety:', anxietyScore)

      // Check if already has submission (shouldn't happen if TransisiAktivitas works correctly)
      const { data: existing } = await supabase
        .from('survey_results')
        .select('id')
        .eq('siswa_id', studentId)
        .single()

      if (existing) {
        // This should not happen in normal flow, but handle it gracefully
        console.warn('⚠️ Duplicate submission detected - user bypassed TransisiAktivitas check')
        setError('Data sudah tersimpan sebelumnya. Silakan kembali ke menu utama.')
        setSaving(false)
        return
      }

      console.log('➕ Creating new submission...')

      // 3. Save bullying answers raw
      for (const [questionNo, score] of Object.entries(bullyingAnswers)) {
        const { error: rawError } = await supabase.from('survey_answers_raw').insert({
          siswa_id: studentId,
          tipe: 'bullying',
          no_pertanyaan: parseInt(questionNo),
          skor: score
        })
        if (rawError) {
          console.error('Error saving bullying raw:', rawError)
          throw rawError
        }
      }

      // 4. Save anxiety answers detail (optional - skip if table doesn't exist)
      try {
        for (const [categoryNo, answer] of Object.entries(anxietyAnswers)) {
          await supabase.from('anxiety_answers_detail').insert({
            siswa_id: studentId,
            category_no: parseInt(categoryNo),
            symptoms_checked: answer.symptoms,
            emoticon_score: answer.emoticon
          })
        }
        console.log('✅ Anxiety detail saved')
      } catch (detailError) {
        console.warn('⚠️ Anxiety detail table not found, skipping...', detailError)
        // Continue anyway, detail is optional
      }

      // 5. Insert survey results
      const { error: resultsError } = await supabase
        .from('survey_results')
        .insert({
          siswa_id: studentId,
          skor_bullying: bullyingScore,
          skor_anxiety: anxietyScore,
          waktu_selesai: new Date().toISOString()
        })

      if (resultsError) throw resultsError

      console.log('✅ Survey saved successfully!')

      // Clear draft after successful save
      clearDraft()

      // Success! Navigate to results page
      setTimeout(() => {
        navigate('/kegiatan-belajar/the-challenge/hasil-guiding-activities')
      }, 1500)

    } catch (err) {
      console.error('Error saving survey:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      setError(`Gagal menyimpan data: ${err.message || 'Silakan coba lagi.'}`)
      setSaving(false)
    }
  }

  // Render intro
  if (currentSurvey === 'intro') {
    const hasDraft = usia || jenisKelamin || Object.keys(bullyingAnswers).length > 0 || Object.keys(anxietyAnswers).length > 0
    
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center mb-8">
            <MiloCharacter pose="explain" className="mb-4" />
            <MiloDialogBubble className="max-w-2xl">
              <p className="font-medium text-ink-900 mb-2">
                Selamat datang di Guiding Activities! 📋
              </p>
              <p className="text-sm text-ink-700">
                Kamu akan mengisi <strong>2 angket</strong> secara berurutan. Bacalah setiap pertanyaan dengan saksama 
                dan jawablah dengan jujur sesuai pengalamanmu. Tidak ada jawaban benar atau salah. 
                Semua data bersifat anonim dan aman! 🔒
              </p>
            </MiloDialogBubble>
          </div>

          {/* Draft Resume Notice */}
          {hasDraft && draftLoaded && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-primary-50 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">
                    💾 Draft Tersimpan!
                  </p>
                  <p className="text-sm text-blue-800">
                    Kami menemukan progress pengisian sebelumnya. Kamu bisa melanjutkan dari terakhir kali!
                  </p>
                  {(usia || jenisKelamin) && (
                    <p className="text-xs text-blue-700 mt-2">
                      📝 Identitas: {usia && `Usia ${usia} tahun`} {jenisKelamin && `• ${jenisKelamin}`}
                    </p>
                  )}
                  {Object.keys(bullyingAnswers).length > 0 && (
                    <p className="text-xs text-blue-700 mt-1">
                      📝 Angket Bullying: {Object.keys(bullyingAnswers).length}/22 dijawab
                    </p>
                  )}
                  {Object.keys(anxietyAnswers).length > 0 && (
                    <p className="text-xs text-blue-700">
                      📝 Angket Anxiety: {Object.keys(anxietyAnswers).length}/14 dijawab
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Angket 1 Card */}
            <div className="bg-white border-2 border-primary-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-ink-900 font-poppins font-bold text-xl">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-2">
                    Angket Pengalaman Bullying
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    22 pernyataan tentang pengalaman di sekolah
                  </p>
                  <div className="flex items-center gap-2 text-xs text-ink-600">
                    <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    <span>Skala: Tidak pernah → 7 kali atau lebih</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Angket 2 Card */}
            <div className="bg-white border-2 border-primary-300 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-ink-900 font-poppins font-bold text-xl">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-semibold text-ink-900 mb-2">
                    Angket Tingkat Kecemasan
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    14 kategori gejala kecemasan dengan emotikon
                  </p>
                  <div className="flex items-center gap-2 text-xs text-ink-600">
                    <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    <span>Centang gejala yang dialami, pilih emotikon frekuensi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentSurvey('identity')}
              className="inline-flex items-center gap-3 bg-primary-700 hover:from-primary-700 hover:to-primary-600 text-white font-poppins font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span>{hasDraft && draftLoaded ? 'Lanjutkan Mengisi' : 'Mulai Mengisi Angket'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            {hasDraft && draftLoaded && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin menghapus draft dan mulai dari awal? Progress akan hilang.')) {
                      clearDraft()
                      setUsia('')
                      setJenisKelamin('')
                      setBullyingAnswers({})
                      setAnxietyAnswers({})
                      setCurrentSurvey('intro')
                    }
                  }}
                  className="text-sm text-ink-600 hover:text-red-600 underline transition-colors"
                >
                  🗑️ Mulai dari Awal (Hapus Draft)
                </button>
              </div>
            )}
          </div>
        </div>
      </LearningLayout>
    )
  }

  // Render identity form
  if (currentSurvey === 'identity') {
    const isIdentityComplete = usia && jenisKelamin
    
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center">
            <MiloCharacter pose="thinking" className="mb-4" />
            <MiloDialogBubble tailPosition="top" className="max-w-2xl">
              <p className="font-medium text-ink-900 mb-2">
                Identitas Responden
              </p>
              <p className="text-sm text-ink-700">
                Sebelum memulai angket, mohon isi data berikut. Data ini bersifat <strong>rahasia</strong> dan 
                <strong> tidak akan ditampilkan</strong> dalam hasil survey. Data hanya digunakan untuk keperluan 
                analisis penelitian dan pembelajaran statistika.
              </p>
            </MiloDialogBubble>
          </div>

          {/* Privacy Notice */}
          <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  🔒 Data Aman & Rahasia
                </p>
                <p className="text-sm text-blue-800">
                  Usia dan jenis kelamin kamu tidak akan ditampilkan di hasil survey manapun. 
                  Data ini hanya disimpan untuk keperluan analisis data agregat dan pembelajaran statistika.
                </p>
              </div>
            </div>
          </div>

          {/* Identity Form */}
          <div className="bg-white border-2 border-primary-300 rounded-xl p-6 shadow-sm space-y-6">
            {/* Usia */}
            <div>
              <label htmlFor="usia" className="block text-sm font-semibold text-ink-900 mb-2">
                Usia <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="usia"
                min="10"
                max="25"
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
                placeholder="Contoh: 15"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-lg"
              />
              <p className="mt-1 text-xs text-ink-600">
                Masukkan usia dalam tahun (10-25)
              </p>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-3">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-all">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="Laki-laki"
                    checked={jenisKelamin === 'Laki-laki'}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-lg text-ink-900">Laki-laki</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-primary-50 hover:border-primary-400 transition-all">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="Perempuan"
                    checked={jenisKelamin === 'Perempuan'}
                    onChange={(e) => setJenisKelamin(e.target.value)}
                    className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-lg text-ink-900">Perempuan</span>
                </label>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentSurvey('intro')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-ink-900 font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>

            <button
              onClick={() => setCurrentSurvey('bullying')}
              disabled={!isIdentityComplete}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-poppins font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Lanjut ke Angket 1</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {!isIdentityComplete && (
            <p className="mt-4 text-center text-sm text-ink-600">
              Lengkapi usia dan jenis kelamin untuk melanjutkan
            </p>
          )}
        </div>
      </LearningLayout>
    )
  }

  // Render bullying survey
  if (currentSurvey === 'bullying') {
    const answeredCount = Object.keys(bullyingAnswers).length
    
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-2">
              Angket 1: Pengalaman Bullying
            </h1>
            <p className="text-ink-600">
              Jawab setiap pertanyaan sesuai dengan pengalamanmu
            </p>
          </div>

          {/* Progress */}
          <SurveyProgress
            current={answeredCount}
            total={bullyingQuestions.length}
            label="Progres Angket Bullying"
          />

          {/* Questions */}
          <div className="mt-6 space-y-6">
            {bullyingQuestions.map((question) => (
              <BullyingQuestionCard
                key={question.no}
                question={question}
                value={bullyingAnswers[question.no]}
                onChange={handleBullyingAnswer}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentSurvey('identity')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-ink-900 font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>

            <button
              onClick={() => setCurrentSurvey('anxiety')}
              disabled={!isBullyingComplete()}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-poppins font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Lanjut ke Angket 2</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {!isBullyingComplete() && (
            <p className="mt-4 text-center text-sm text-ink-600">
              Jawab semua pertanyaan untuk melanjutkan ({answeredCount}/{bullyingQuestions.length})
            </p>
          )}
        </div>
      </LearningLayout>
    )
  }

  // Render anxiety survey
  if (currentSurvey === 'anxiety') {
    const answeredCount = Object.keys(anxietyAnswers).length
    const incompleteCategories = getIncompleteCategories()
    
    return (
      <LearningLayout showAI={false}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-poppins font-semibold text-ink-900 mb-2">
              Angket 2: Tingkat Kecemasan
            </h1>
            <p className="text-ink-600">
              Centang gejala yang kamu alami, lalu pilih seberapa sering
            </p>
          </div>

          {/* Progress */}
          <SurveyProgress
            current={answeredCount}
            total={anxietyCategories.length}
            label="Progres Angket Kecemasan"
          />

          {/* Incomplete Warning */}
          {!isAnxietyComplete() && answeredCount > 0 && (
            <div className="mt-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Perhatian: {incompleteCategories.length} kategori belum lengkap
                  </p>
                  <p className="text-xs text-yellow-800">
                    Setiap kategori harus: ✓ Minimal 1 gejala di-check & 😊 Emotikon dipilih
                  </p>
                  {incompleteCategories.length <= 5 && (
                    <ul className="mt-2 space-y-1">
                      {incompleteCategories.map(cat => (
                        <li key={cat.no} className="text-xs text-yellow-700">
                          • Kategori {cat.no}: {cat.category}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="mt-6 space-y-6">
            {anxietyCategories.map((category) => (
              <AnxietyCategoryCard
                key={category.no}
                category={category}
                checkedSymptoms={anxietyAnswers[category.no]?.symptoms || []}
                emoticonScore={anxietyAnswers[category.no]?.emoticon}
                onSymptomChange={handleAnxietySymptom}
                onEmoticonChange={handleAnxietyEmoticon}
              />
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentSurvey('bullying')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-ink-900 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isAnxietyComplete() || saving}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:from-primary-700 hover:to-primary-600 text-white font-poppins font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Selesai & Simpan</span>
                </>
              )}
            </button>
          </div>

          {!isAnxietyComplete() && !saving && (
            <p className="mt-4 text-center text-sm text-ink-600">
              Lengkapi semua kategori untuk menyimpan ({answeredCount}/{anxietyCategories.length})
            </p>
          )}

          {saving && (
            <div className="mt-6 bg-primary-50 border-2 border-primary-300 rounded-xl p-4">
              <p className="text-sm text-center text-ink-700">
                ⏳ Sedang menyimpan data ke server... Jangan tutup halaman ini!
              </p>
            </div>
          )}
        </div>
      </LearningLayout>
    )
  }

  return null
}
