const CACHE_PREFIX = 'stac_cache_v1_'
const DEFAULT_TTL = 15 * 60 * 1000 // 15 minutes

export async function fetchCachedJson(url, ttlMs = DEFAULT_TTL) {
  const cacheKey = `${CACHE_PREFIX}${url}`

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const cached = window.sessionStorage.getItem(cacheKey)
      if (cached) {
        const { timestamp, data } = JSON.parse(cached)
        if (Date.now() - timestamp < ttlMs) {
          return data
        }
      }
    } catch {
      // Storage unavailable or parsing error, fallback to network
    }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`)
  }
  const data = await response.json()

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }))
    } catch {
      // Quota exceeded or private browsing restrictions
    }
  }

  return data
}
