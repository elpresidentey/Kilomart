type BenchmarkSummary = {
  navigation: {
    domContentLoaded?: number
    domInteractive?: number
    duration?: number
    loadEventEnd?: number
    responseEnd?: number
  }
  metrics: {
    cls: number
    fcp?: number
    lcp?: number
  }
}

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean
  value: number
}

function formatMs(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'n/a'
  return `${Math.round(value)} ms`
}

export function startAppBenchmarking() {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const shouldLog = import.meta.env.DEV || params.has('bench') || params.has('perf')
  if (!shouldLog) return

  const summary: BenchmarkSummary = {
    navigation: {},
    metrics: { cls: 0 },
  }
  let logged = false

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (nav) {
    summary.navigation = {
      domContentLoaded: nav.domContentLoadedEventEnd,
      domInteractive: nav.domInteractive,
      duration: nav.duration,
      loadEventEnd: nav.loadEventEnd,
      responseEnd: nav.responseEnd,
    }
  }

  const finalLog = () => {
    if (logged) return
    logged = true
    console.info('[benchmark] navigation', {
      responseEnd: formatMs(summary.navigation.responseEnd),
      domInteractive: formatMs(summary.navigation.domInteractive),
      domContentLoaded: formatMs(summary.navigation.domContentLoaded),
      loadEventEnd: formatMs(summary.navigation.loadEventEnd),
      duration: formatMs(summary.navigation.duration),
    })
    console.info('[benchmark] metrics', {
      fcp: formatMs(summary.metrics.fcp),
      lcp: formatMs(summary.metrics.lcp),
      cls: Number(summary.metrics.cls.toFixed(4)),
    })
  }

  try {
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          summary.metrics.fcp = entry.startTime
        }
      }
    })
    paintObserver.observe({ type: 'paint', buffered: true })

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1] as PerformanceEntry | undefined
      if (last) summary.metrics.lcp = last.startTime
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          summary.metrics.cls += entry.value
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })

    window.addEventListener(
      'pagehide',
      () => {
        paintObserver.disconnect()
        lcpObserver.disconnect()
        clsObserver.disconnect()
        finalLog()
      },
      { once: true }
    )
  } catch {
    finalLog()
  }

  window.setTimeout(finalLog, 5000)
}
