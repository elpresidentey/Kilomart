import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    /**
     * Keep sessions persistent across payment redirects and page reloads.
     * The checkout flow depends on the user still being signed in when Paystack
     * sends the browser back to the success page.
     */
    persistSession: true,
  },
})
