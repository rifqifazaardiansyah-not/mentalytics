import { useState, useRef, useEffect, useContext } from 'react'
import { X, Send, Sparkles, User, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createGuidingResourceChat, createSolutionChat, streamGeminiResponse } from '../../lib/geminiService'
import { supabase } from '../../lib/supabaseClient'
import ReactMarkdown from 'react-markdown'

// Utility function to clear all AI chat history (call on logout)
export function clearAllAIChatHistory() {
  const contexts = ['guiding_resource', 'solution', 'hasil_tes']
  contexts.forEach(context => {
    const key = `ai_chat_${context}_history`
    localStorage.removeItem(key)
  })
  console.log('🗑️ Cleared all AI chat history')
}

export default function AIChatPanel({ context, onClose, surveyScores = null }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const chatRef = useRef(null)
  const messagesEndRef = useRef(null)
  const geminiChatRef = useRef(null)

  // Storage key for chat history
  const STORAGE_KEY = `ai_chat_${context}_history`

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        setMessages(parsed)
        console.log(`✅ Loaded ${parsed.length} messages from localStorage`)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }, [STORAGE_KEY])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        console.log(`💾 Saved ${messages.length} messages to localStorage`)
      } catch (error) {
        console.error('Error saving chat history:', error)
      }
    }
  }, [messages, STORAGE_KEY])

  // Function to clear current context chat history
  const clearChat = () => {
    setMessages([])
    geminiChatRef.current = null
    localStorage.removeItem(STORAGE_KEY)
    console.log(`🗑️ Cleared chat history for ${context}`)
  }

  // Initialize Gemini chat session with optional context injection
  useEffect(() => {
    if (!geminiChatRef.current) {
      if (context === 'solution') {
        geminiChatRef.current = createSolutionChat()
      } else {
        geminiChatRef.current = createGuidingResourceChat()
      }
      
      // Inject survey scores context for hasil_tes (if provided and first time)
      if (context === 'hasil_tes' && surveyScores && messages.length === 0) {
        const contextMessage = `[CONTEXT: Siswa ini memiliki Skor Bullying ${surveyScores.bullying}/88 (${surveyScores.bullyingCategory}) dan Skor Kecemasan ${surveyScores.anxiety}/56 (${surveyScores.anxietyCategory})]`
        
        // Add context to chat session internally (not shown to user)
        geminiChatRef.current.addMessage('user', contextMessage)
        geminiChatRef.current.addMessage('model', 'Terima kasih atas informasi hasil asesmen. Aku siap membantu menjelaskan dan memberikan dukungan.')
        
        console.log('📋 Injected survey scores context to chat session')
      }
    }
  }, [context, surveyScores, messages.length])

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  // Function to save AI interaction to database
  const saveToDatabase = async (userPrompt, aiResponse) => {
    try {
      const siswaId = localStorage.getItem('mentalytics_student_id')
      if (!siswaId) {
        console.warn('No siswa_id found, skipping database save')
        return
      }

      // Map context to halaman value in database
      const halamanMap = {
        'guiding_resource': 'guiding_resource',
        'solution': 'solution',
        'hasil_tes': 'hasil_tes'
      }
      
      const halaman = halamanMap[context] || context

      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          siswa_id: siswaId,
          halaman: halaman,
          prompt: userPrompt,
          response: aiResponse,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving AI interaction to database:', error)
      } else {
        console.log('✅ AI interaction saved to database:', { halaman, prompt: userPrompt.substring(0, 50) })
      }
    } catch (err) {
      console.error('Error in saveToDatabase:', err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setStreamingMessage('')

    console.log('🎯 Current context:', context) // DEBUG LOG

    // Retry configuration
    const MAX_RETRIES = 3
    const RETRY_DELAY = 2000 // 2 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (!geminiChatRef.current) {
          if (context === 'solution') {
            geminiChatRef.current = createSolutionChat()
          } else {
            geminiChatRef.current = createGuidingResourceChat()
          }
          console.log('✅ Created new chat session for context:', context) // DEBUG LOG
        }

        console.log(`🔄 Attempt ${attempt}/${MAX_RETRIES}...`)

        // Stream response from Gemini
        let fullResponse = ''
        
        for await (const chunk of streamGeminiResponse(geminiChatRef.current, input, context)) {
          fullResponse += chunk
          setStreamingMessage(fullResponse)
        }

        // Success! Add complete AI message
        const aiMessage = {
          role: 'assistant',
          content: fullResponse
        }
        setMessages(prev => [...prev, aiMessage])
        setStreamingMessage('')
        setLoading(false)
        
        // Save to database
        await saveToDatabase(input, fullResponse)
        
        return // Exit function on success
        
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message)
        
        // Check specific error types
        const is503 = error.message.includes('503') || error.message.includes('UNAVAILABLE') || error.message.includes('high demand')
        const isQuota = error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')
        const isRateLimit = error.message.includes('429') || error.message.includes('rate limit')
        
        // If not last attempt and it's a temporary error (503), retry
        if (attempt < MAX_RETRIES && is503) {
          const waitTime = RETRY_DELAY * attempt // Exponential backoff
          console.log(`⏳ Waiting ${waitTime}ms before retry...`)
          setStreamingMessage(`Sedang mencoba lagi... (${attempt}/${MAX_RETRIES})`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue // Try again
        }
        
        // Last attempt or non-retryable error
        let errorMessage = 'Maaf, ada masalah saat menghubungi AI. Coba lagi ya! 😅'
        
        if (is503) {
          errorMessage = 'Maaf, server AI sedang penuh. Coba lagi dalam beberapa saat ya! ⏳'
        } else if (isQuota) {
          errorMessage = 'Maaf, kuota API sudah habis. Coba clear chat untuk reset history, atau tunggu beberapa saat. 🔄'
        } else if (isRateLimit) {
          errorMessage = 'Maaf, terlalu banyak request. Tunggu 1 menit ya! ⏱️'
        }
        
        console.error('🔴 Final error:', error)
        
        const errorMsg = {
          role: 'assistant',
          content: errorMessage
        }
        setMessages(prev => [...prev, errorMsg])
        setStreamingMessage('')
        setLoading(false)
        return
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[28rem] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-300 bg-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-poppins font-semibold text-ink-900">
                Tanya Milo
              </h2>
              <p className="text-xs text-ink-600">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-3 py-1.5 text-xs bg-white hover:bg-primary-200 text-ink-700 rounded-lg transition-colors border border-primary-400"
                title="Hapus riwayat chat"
              >
                Clear Chat
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-400 rounded-lg transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5 text-ink-900" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={chatRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8 space-y-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-ink-900">
                Hai! Aku Milo 👋
              </h3>
              
              {context === 'solution' ? (
                <>
                  <p className="text-sm text-ink-600 max-w-xs mx-auto">
                    Butuh bantuan untuk mengembangkan ide rekomendasi? Aku siap jadi teman brainstorming!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    <button
                      onClick={() => setInput('Bagaimana cara membuat rekomendasi yang baik?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Cara membuat rekomendasi yang baik?
                    </button>
                    <button
                      onClick={() => setInput('Apa saja yang harus dipertimbangkan dalam merancang solusi?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Yang harus dipertimbangkan?
                    </button>
                    <button
                      onClick={() => setInput('Bagaimana membedakan akar masalah dan gejala?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Akar masalah vs gejala?
                    </button>
                  </div>
                </>
              ) : context === 'hasil_tes' ? (
                <>
                  <p className="text-sm text-ink-600 max-w-xs mx-auto">
                    Ada yang ingin kamu tanyakan tentang hasil tesmu? Aku di sini untuk mendengarkan dan membantu! 💙
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    <button
                      onClick={() => setInput('Apa arti skor ini?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Apa arti skor ini?
                    </button>
                    <button
                      onClick={() => setInput('Bagaimana cara mengurangi kecemasan?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Cara mengurangi kecemasan?
                    </button>
                    <button
                      onClick={() => setInput('Apakah hasil ini normal?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Apakah ini normal?
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-ink-600 max-w-xs mx-auto">
                    Ada yang kurang jelas tentang diagram pencar? Tanya aku aja!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                    <button
                      onClick={() => setInput('Apa itu diagram pencar?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Apa itu diagram pencar?
                    </button>
                    <button
                      onClick={() => setInput('Jelaskan tentang korelasi')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Jelaskan tentang korelasi
                    </button>
                    <button
                      onClick={() => setInput('Apa bedanya variabel X dan Y?')}
                      className="px-3 py-2 text-xs bg-white border border-primary-400 rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      Apa bedanya variabel X dan Y?
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-white text-ink-900 shadow-md rounded-tl-sm border border-primary-300'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none prose-p:my-2 prose-strong:text-primary-700 prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Streaming message */}
              {streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[75%] p-3 rounded-2xl bg-white text-ink-900 shadow-md rounded-tl-sm border border-primary-300">
                    <div className="text-sm prose prose-sm max-w-none prose-p:my-2 prose-strong:text-primary-700 prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                      <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                      <span className="inline-block w-1 h-4 bg-primary-600 ml-1 animate-pulse"></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Loading indicator */}
              {loading && !streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-md rounded-tl-sm border border-primary-300">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pertanyaanmu di sini..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
              aria-label="Kirim"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-ink-600 mt-2 text-center">
            Powered by Gemini AI ✨
          </p>
        </div>
      </motion.div>
    </>
  )
}

