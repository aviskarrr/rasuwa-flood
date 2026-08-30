import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  checkBulletinStatus,
  computeCloudStats,
  fallbackPlanetScenes,
  fallbackSentinelScenes,
  fallbackVantorScenes,
  formatNepalTime,
  formatVantorDate,
  intersectsAoi,
  postCollectionUrl,
  preCollectionUrl,
  sentinelSearchUrl,
  vantorCollectionUrl
} from '../lib/stac'
import { fetchCachedJson } from '../lib/stacCache'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  // PlanetScope state
  const [planetScenes, setPlanetScenes] = useState(fallbackPlanetScenes)
  const [planetSelected, setPlanetSelected] = useState(0)
  const [planetStatus, setPlanetStatus] = useState('READY')
  const [planetLoading, setPlanetLoading] = useState(false)
  const [planetError, setPlanetError] = useState(null)
  const [planetIsFallback, setPlanetIsFallback] = useState(true)
  const planetFetched = useRef(false)

  // Sentinel state
  const [sentinelScenes, setSentinelScenes] = useState(fallbackSentinelScenes)
  const [sentinelSelected, setSentinelSelected] = useState(0)
  const [sentinelStatus, setSentinelStatus] = useState('READY')
  const [sentinelLoading, setSentinelLoading] = useState(false)
  const [sentinelError, setSentinelError] = useState(null)
  const [sentinelIsFallback, setSentinelIsFallback] = useState(true)
  const sentinelFetched = useRef(false)

  // Vantor state
  const [vantorScenes, setVantorScenes] = useState(fallbackVantorScenes)
  const [vantorStatus, setVantorStatus] = useState('READY')
  const [vantorLoading, setVantorLoading] = useState(false)
  const [vantorError, setVantorError] = useState(null)
  const [vantorIsFallback, setVantorIsFallback] = useState(true)
  const vantorFetched = useRef(false)

  // Bulletin verification state
  const [bulletinStatus, setBulletinStatus] = useState({
    reachable: true,
    verified: true,
    message: 'Verified snapshot: 30 August 2026, 09:00 NPT — NDRRMA / Home Ministry',
    lastChecked: null
  })

  // Compare sync state
  const [compareLinkActive, setCompareLinkActive] = useState(true)

  // Fetch PlanetScope catalogs (with sessionStorage caching)
  const loadPlanetScenes = async () => {
    planetFetched.current = true
    setPlanetLoading(true)
    setPlanetError(null)
    setPlanetStatus('FETCHING PLANET STAC...')

    try {
      const collections = await Promise.all(
        [preCollectionUrl, postCollectionUrl].map(url => fetchCachedJson(url))
      )

      const results = await Promise.allSettled(
        collections.flatMap(collection =>
          collection.links
            .filter(link => link.rel === 'item')
            .map(async link => {
              const collectionSelf =
                collection.links.find(parent => parent.rel === 'self')?.href || preCollectionUrl
              const itemUrl = new URL(link.href, collectionSelf).href
              const item = await fetchCachedJson(itemUrl)
              const thumbnail = item.assets?.thumbnail?.href || item.assets?.visual?.href
              const selfUrl = item.links?.find(itemLink => itemLink.rel === 'self')?.href
              if (!item.id || !thumbnail || !selfUrl || !item.properties?.datetime) return null

              const isPre = (item.collection || '').startsWith('pre')
              return {
                id: item.id,
                phase: isPre ? 'PRE-EVENT' : 'POST-EVENT',
                date: item.properties.datetime.slice(0, 10).split('-').reverse().join(' '),
                rawDate: item.properties.datetime,
                time: `${new Date(item.properties.datetime).toISOString().slice(11, 19)} UTC · ${formatNepalTime(item.properties.datetime)}`,
                nepaliTime: formatNepalTime(item.properties.datetime),
                platform: item.properties.platform || 'PlanetScope',
                cloud: Math.round(item.properties['eo:cloud_cover'] ?? 0),
                thumbnail: new URL(thumbnail, selfUrl).href,
                selfUrl
              }
            })
        )
      )

      const validItems = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value)

      if (validItems.length > 0) {
        setPlanetScenes(validItems)
        setPlanetIsFallback(false)
        setPlanetStatus(`${validItems.length} SCENES LOADED FROM STAC`)
      } else {
        setPlanetStatus('NO PLANET SCENES FOUND · USING CACHED SET')
      }
    } catch (err) {
      console.warn('Planet STAC load failed:', err)
      setPlanetError(err.message || 'Planet catalog unavailable')
      setPlanetStatus('CATALOG UNAVAILABLE · SHOWING CACHED SCENES')
      setPlanetIsFallback(true)
    } finally {
      setPlanetLoading(false)
    }
  }

  // Fetch Sentinel catalog (with AOI bounding box filtering & caching)
  const loadSentinelScenes = async () => {
    sentinelFetched.current = true
    setSentinelLoading(true)
    setSentinelError(null)
    setSentinelStatus('SEARCHING EARTH SEARCH STAC...')

    try {
      const data = await fetchCachedJson(sentinelSearchUrl)
      const items = (data.features || [])
        .filter(item => item.id && (!item.bbox || intersectsAoi(item.bbox)))
        .map(item => ({
          id: item.id,
          date: item.properties.datetime.slice(0, 10).split('-').reverse().join(' '),
          rawDate: item.properties.datetime,
          time: new Date(item.properties.datetime).toISOString().slice(11, 19) + ' UTC',
          cloud: Math.round(item.properties['eo:cloud_cover'] ?? 0),
          thumbnail: item.assets?.thumbnail?.href || '',
          visual: item.assets?.visual?.href || '',
          source: item.links?.find(link => link.rel === 'self')?.href || '',
          geometry: item.geometry,
          bbox: item.bbox,
          platform: item.properties.platform || 'Sentinel-2A'
        }))

      if (items.length > 0) {
        setSentinelScenes(items)
        setSentinelIsFallback(false)
        setSentinelStatus(`${items.length} SENTINEL-2 SCENES FOUND`)
      } else {
        setSentinelStatus('NO MATCHING SCENES · SHOWING EXAMPLES')
      }
    } catch (err) {
      console.warn('Sentinel catalog load failed:', err)
      setSentinelError(err.message || 'Earth Search catalog unavailable')
      setSentinelStatus('CATALOG UNAVAILABLE · SHOWING EXAMPLES')
      setSentinelIsFallback(true)
    } finally {
      setSentinelLoading(false)
    }
  }

  // Fetch Vantor catalog (with caching)
  const loadVantorScenes = async () => {
    vantorFetched.current = true
    setVantorLoading(true)
    setVantorError(null)
    setVantorStatus('LOADING VANTOR STAC COLLECTION...')

    try {
      const collection = await fetchCachedJson(vantorCollectionUrl)
      const scenes = await Promise.all(
        (collection.links || [])
          .filter(link => link.rel === 'item')
          .map(async link => {
            const itemUrl = new URL(link.href, vantorCollectionUrl).href
            const item = await fetchCachedJson(itemUrl)
            const cog = Object.values(item.assets || {}).find(asset =>
              /cloud-optimized|cog/i.test(`${asset.type || ''} ${asset.title || ''}`)
            )
            if (!item.id || !item.properties?.datetime || !item.bbox || !cog?.href) return null

            return {
              id: item.id,
              datetime: item.properties.datetime,
              date: formatVantorDate(item.properties.datetime),
              time: new Date(item.properties.datetime).toISOString().slice(11, 19) + ' UTC',
              bbox: item.bbox,
              geometry: item.geometry,
              visual: new URL(cog.href, link.href).href,
              thumbnail: item.assets?.thumbnail?.href
                ? new URL(item.assets.thumbnail.href, link.href).href
                : '',
              cloud: Math.round(item.properties['eo:cloud_cover'] ?? 0),
              gsd: item.properties.multispectral_gsd || item.properties.gsd || null,
              platform: item.properties.vehicle_name || 'Vantor / Maxar',
              itemUrl: link.href
            }
          })
      )

      const validScenes = scenes.filter(Boolean).sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
      if (validScenes.length > 0) {
        setVantorScenes(validScenes)
        setVantorIsFallback(false)
        setVantorStatus(`${validScenes.length} COG SCENES LOADED FROM VANTOR STAC`)
      } else {
        setVantorStatus('NO VANTOR SCENES PARSED')
      }
    } catch (err) {
      console.warn('Vantor STAC load failed:', err)
      setVantorError(err.message || 'Vantor catalog unavailable')
      setVantorStatus('VANTOR CATALOG UNAVAILABLE · SHOWING CACHED FOOTPRINTS')
      setVantorIsFallback(true)
    } finally {
      setVantorLoading(false)
    }
  }

  // Initial lightweight verification check
  useEffect(() => {
    checkBulletinStatus().then(status => {
      setBulletinStatus(prev => ({ ...prev, ...status, lastChecked: new Date().toISOString() }))
    })
  }, [])

  // Derived statistics computed dynamically from actual loaded states
  const planetPreScenes = useMemo(() => planetScenes.filter(s => s.phase === 'PRE-EVENT'), [planetScenes])
  const planetPostScenes = useMemo(() => planetScenes.filter(s => s.phase === 'POST-EVENT'), [planetScenes])

  const planetTotalCount = planetScenes.length
  const planetPreCount = planetPreScenes.length
  const planetPostCount = planetPostScenes.length

  const planetPostCloudStats = useMemo(() => computeCloudStats(planetPostScenes), [planetPostScenes])
  const planetPreCloudStats = useMemo(() => computeCloudStats(planetPreScenes), [planetPreScenes])

  // Vantor stats
  const vantorPostScenes = useMemo(
    () => vantorScenes.filter(s => new Date(s.datetime) >= new Date('2026-08-26T00:00:00Z')),
    [vantorScenes]
  )
  const vantorPreScenes = useMemo(
    () => vantorScenes.filter(s => new Date(s.datetime) < new Date('2026-08-26T00:00:00Z')),
    [vantorScenes]
  )

  const vantorPostCloudStats = useMemo(() => computeCloudStats(vantorPostScenes), [vantorPostScenes])
  const vantorPreCloudStats = useMemo(() => computeCloudStats(vantorPreScenes), [vantorPreScenes])

  const value = {
    // PlanetScope
    planetScenes,
    planetSelected,
    setPlanetSelected,
    planetStatus,
    planetLoading,
    planetError,
    planetIsFallback,
    loadPlanetScenes,
    retryPlanet: loadPlanetScenes,
    planetTotalCount,
    planetPreCount,
    planetPostCount,
    planetPostCloudStats,
    planetPreCloudStats,

    // Sentinel
    sentinelScenes,
    sentinelSelected,
    setSentinelSelected,
    sentinelStatus,
    sentinelLoading,
    sentinelError,
    sentinelIsFallback,
    loadSentinelScenes,
    retrySentinel: loadSentinelScenes,

    // Vantor
    vantorScenes,
    vantorStatus,
    vantorLoading,
    vantorError,
    vantorIsFallback,
    loadVantorScenes,
    retryVantor: loadVantorScenes,
    vantorPostScenes,
    vantorPreScenes,
    vantorPostCloudStats,
    vantorPreCloudStats,

    // Compare
    compareLinkActive,
    setCompareLinkActive,

    // Bulletin
    bulletinStatus
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
