import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      // Use maybeSingle() instead of single() to avoid 406 errors when no rows found
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        setUser(null)
      } else if (!data) {
        // User auth exists but profile doesn't exist yet
        // Wait a bit and retry
        console.log('Profile not found, retrying...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const { data: retryData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        
        setUser(retryData || null)
      } else {
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Signin error:', error)
        return { error }
      }
      // Wait for profile fetch
      if (data?.user) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      return { error: null }
    } catch (err) {
      console.error('Signin exception:', err)
      return { error: err as Error }
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
      
      if (error) {
        console.error('Signup error:', error)
        return { data: null, error }
      }

      // Wait for database trigger to create profile
      if (data?.user) {
        console.log('Waiting for profile creation...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Signup exception:', err)
      return { data: null, error: err as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    // Send users to home after logout (they may be on /profile, /orders, etc.)
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.replace('/')
    }
  }

  return { user, loading, signIn, signUp, signOut }
}
