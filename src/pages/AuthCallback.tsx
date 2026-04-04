import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { safeRedirectPath } from '../lib/redirect'

/**
 * Handles email confirmation and OAuth redirects from Supabase.
 * Configure the same URL in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 */
export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'working' | 'error'>('working')
  const [message, setMessage] = useState('Confirming your email…')

  useEffect(() => {
    const redirectTarget = safeRedirectPath(searchParams.get('redirect'))

    const errParam =
      searchParams.get('error_description') ||
      searchParams.get('error_code') ||
      searchParams.get('error')
    if (errParam) {
      setStatus('error')
      setMessage(decodeURIComponent(errParam.replace(/\+/g, ' ')))
      return
    }

    let cancelled = false

    async function complete() {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')

        // PKCE / server-side flow: exchange ?code= for a session
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
          if (cancelled) return
          if (error) {
            setStatus('error')
            setMessage(error.message)
            return
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (cancelled) return

        if (session) {
          navigate(redirectTarget, { replace: true })
          return
        }

        // Hash fragments (#access_token=…) are parsed by the client on load; give one tick
        await new Promise((r) => setTimeout(r, 100))
        const {
          data: { session: session2 },
        } = await supabase.auth.getSession()
        if (cancelled) return

        if (session2) {
          navigate(redirectTarget, { replace: true })
          return
        }

        setStatus('error')
        setMessage(
          'We could not complete sign-in from this link. It may have expired, or the redirect URL may not be allowed in Supabase.'
        )
      } catch (e) {
        if (!cancelled) {
          setStatus('error')
          setMessage(e instanceof Error ? e.message : 'Something went wrong.')
        }
      }
    }

    void complete()
    return () => {
      cancelled = true
    }
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        {status === 'working' ? (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="text-stone-700">{message}</p>
          </>
        ) : (
          <>
            <p className="text-stone-900 font-medium mb-2">Could not confirm email</p>
            <p className="text-sm text-stone-600 mb-6">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}
