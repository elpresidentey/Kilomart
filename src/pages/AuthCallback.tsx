import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { safeRedirectPath } from '../lib/redirect'
import { repairText } from '../i18n/repairText'
import { useI18n } from '../i18n/useI18n'

/**
 * Handles email confirmation and OAuth redirects from Supabase.
 * Configure the same URL in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 */
export function AuthCallback() {
  const navigate = useNavigate()
  const { language } = useI18n()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'working' | 'error'>('working')
  const copy = repairText(
    language === 'ha'
      ? {
          confirming: 'Ana tabbatar da imel din ka...',
          couldNotConfirm: 'Ba a iya tabbatar da imel ba',
          fallbackError:
            'Ba mu iya kammala shiga daga wannan mahada ba. Wata kila ta kare ko URL din ba a yarda da shi ba.',
          genericError: 'Wani abu ya faru ba daidai ba.',
          backToSignIn: 'Komawa shiga',
        }
      : language === 'yo'
        ? {
            confirming: 'N je rii daju imeeli rẹ...',
            couldNotConfirm: 'A ko le jẹrisi imeeli',
            fallbackError:
              'A ko le pari iwọle lati inu ọna asopọ yii. O le ti pari tabi URL redirect ko gba laaye.',
            genericError: 'Nkankan lo ṣẹlẹ.',
            backToSignIn: 'Pada si iwọle',
          }
        : language === 'ig'
          ? {
              confirming: 'Na-akwado email gị...',
              couldNotConfirm: 'Enweghi ike ikwenye email',
              fallbackError:
                'Anyi enweghi ike mezue nbanye site na njikọ a. O nwere ike ịgafeela ma ọ bụ redirect URL adịghị ekwe.',
              genericError: 'Ihe adịghị mma mere.',
              backToSignIn: 'Laghachi na nbanye',
            }
          : {
              confirming: 'Confirming your email...',
              couldNotConfirm: 'Could not confirm email',
              fallbackError:
                'We could not complete sign-in from this link. It may have expired, or the redirect URL may not be allowed in Supabase.',
              genericError: 'Something went wrong.',
              backToSignIn: 'Back to sign in',
            },
  )
  const [message, setMessage] = useState(copy.confirming)

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
          const { error } = await supabase.auth.exchangeCodeForSession(code)
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
          copy.fallbackError
        )
      } catch (e) {
        if (!cancelled) {
          setStatus('error')
          setMessage(e instanceof Error ? e.message : copy.genericError)
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
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <p className="text-stone-700">{message}</p>
          </>
        ) : (
          <>
            <p className="text-stone-900 font-medium mb-2">{copy.couldNotConfirm}</p>
            <p className="text-sm text-stone-600 mb-6">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="text-sm font-medium text-primary-700 hover:text-primary-800"
            >
              {copy.backToSignIn}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
