import { useCallback, useEffect, useState } from 'react'

export function useStacCatalog(url, { fallback = [], parseItem, autoFetch = true } = {}) {
  const [items, setItems] = useState(fallback)
  const [status, setStatus] = useState('INITIALIZING')
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [isFallback, setIsFallback] = useState(true)

  const fetchCatalog = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setErrorType(null)
    setStatus('REQUESTING STAC DATA...')

    try {
      const response = await fetch(url)
      if (!response.ok) {
        const err = new Error(`HTTP Error ${response.status}: ${response.statusText}`)
        err.type = 'HTTP_ERROR'
        err.statusCode = response.status
        throw err
      }

      let data
      try {
        data = await response.json()
      } catch (parseErr) {
        const err = new Error('Failed to parse STAC JSON response')
        err.type = 'PARSE_ERROR'
        throw err
      }

      if (parseItem) {
        const parsed = await parseItem(data)
        if (parsed && parsed.length > 0) {
          setItems(parsed)
          setIsFallback(false)
          setStatus(`${parsed.length} SCENES LOADED FROM STAC`)
          setLoading(false)
          return
        }
      }

      // Default feature collection parsing if no custom parseItem
      const featureList = data.features || (Array.isArray(data) ? data : [])
      if (featureList.length > 0) {
        setItems(featureList)
        setIsFallback(false)
        setStatus(`${featureList.length} SCENES LOADED FROM STAC`)
      } else {
        setStatus('NO MATCHING SCENES · SHOWING FALLBACK')
      }
    } catch (err) {
      console.warn('STAC catalog fetch failed:', err)
      const isNetwork = err.name === 'TypeError' || /fetch|network/i.test(err.message)
      const type = err.type || (isNetwork ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR')
      setError(err)
      setErrorType(type)
      setIsFallback(true)

      if (type === 'NETWORK_ERROR') {
        setStatus('NETWORK ERROR · SHOWING CACHED SCENES')
      } else if (type === 'HTTP_ERROR') {
        setStatus(`CATALOG UNAVAILABLE (${err.statusCode || 'ERROR'}) · SHOWING CACHED SCENES`)
      } else if (type === 'PARSE_ERROR') {
        setStatus('INVALID STAC FORMAT · SHOWING CACHED SCENES')
      } else {
        setStatus('CATALOG UNAVAILABLE · SHOWING CACHED SCENES')
      }
    } finally {
      setLoading(false)
    }
  }, [url, parseItem])

  useEffect(() => {
    if (autoFetch) {
      fetchCatalog()
    }
  }, [fetchCatalog, autoFetch])

  return {
    items,
    status,
    loading,
    error,
    errorType,
    isFallback,
    retry: fetchCatalog,
    setItems,
    setStatus
  }
}
