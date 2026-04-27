import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { startAppBenchmarking } from './lib/performance'

const EXTENSION_MESSAGE =
  'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received'

function getErrorMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message
  if (typeof reason === 'string') return reason
  if (reason && typeof reason === 'object' && 'message' in reason) {
    const message = (reason as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return ''
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const message = getErrorMessage(event.reason)

    if (message.includes(EXTENSION_MESSAGE)) {
      event.preventDefault()
    }
  })

  window.addEventListener('error', (event) => {
    if (typeof event.message === 'string' && event.message.includes(EXTENSION_MESSAGE)) {
      event.preventDefault()
    }
  })
}

startAppBenchmarking()

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
