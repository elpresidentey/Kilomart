/**
 * Safe in-app redirect target from `?redirect=` query params.
 * Only allows same-origin relative paths (prevents open redirects like //evil.com).
 */
export function safeRedirectPath(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw
  return '/'
}
