import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

type SignUpData = Awaited<ReturnType<typeof supabase.auth.signUp>>['data']

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<{ data: SignUpData | null; error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function sessionStillValidFor(userId: string): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return Boolean(session?.user && session.user.id === userId)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!(await sessionStillValidFor(userId))) return

      if (error) {
        console.error('Profile fetch error:', error)
        setUser(null)
        return
      }

      if (!data) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (!(await sessionStillValidFor(userId))) return

        const { data: retryData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (!(await sessionStillValidFor(userId))) return
        setUser(retryData || null)
        return
      }

      if (!(await sessionStillValidFor(userId))) return
      setUser(data)
    } catch (e) {
      console.error('Error fetching user profile:', e)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Signin error:', error)
        return { error }
      }
      if (data?.user) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      return { error: null }
    } catch (err) {
      console.error('Signin exception:', err)
      return { error: err as Error }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: userData },
      })

      if (error) {
        console.error('Signup error:', error)
        return { data: null, error }
      }

      if (data?.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      return { data, error: null }
    } catch (err) {
      console.error('Signup exception:', err)
      return { data: null, error: err as Error }
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider (inside BrowserRouter)')
  }
  return ctx
}
