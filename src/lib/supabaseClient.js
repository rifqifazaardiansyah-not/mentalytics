import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔐 Supabase Config:', {
  url: supabaseUrl ? '✅ Found' : '❌ Missing',
  urlValue: supabaseUrl,
  anonKey: supabaseAnonKey ? '✅ Found' : '❌ Missing',
  anonKeyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'exists' : 'missing'
  })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
