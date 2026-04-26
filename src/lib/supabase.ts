import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const isVercelHosted =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    /**
     * Keep local/dev sessions persistent, but avoid carrying a browser session
     * across shared Vercel links so the deployed demo opens cleanly.
     */
    persistSession: !isVercelHosted,
  },
})
