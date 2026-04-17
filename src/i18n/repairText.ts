const MOJIBAKE_PATTERN = /[ÃâÆÅÉá»�]/

export function repairMojibake(value: string): string {
  if (!MOJIBAKE_PATTERN.test(value) || typeof TextDecoder === 'undefined') return value

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff)
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    const originalNoise = (value.match(MOJIBAKE_PATTERN) ?? []).length
    const decodedNoise = (decoded.match(MOJIBAKE_PATTERN) ?? []).length

    return decodedNoise < originalNoise ? decoded : value
  } catch {
    return value
  }
}

export function repairText<T>(value: T): T {
  if (typeof value === 'string') {
    return repairMojibake(value) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => repairText(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, repairText(item)]),
    ) as T
  }

  return value
}
