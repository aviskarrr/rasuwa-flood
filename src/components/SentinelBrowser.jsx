import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { ExternalLink, RefreshCw, Satellite } from 'lucide-react'
import { useData } from '../context/DataContext'
import { renderSentinelCog } from '../lib/cogRenderer'
import { sceneCenter } from '../lib/stac'
import { SectionLabel } from './SectionLabel'

export function SentinelBrowser() {
  const {
    sentinelScenes,
    sentinelSelected,
    setSentinelSelected,
    sentinelStatus,
    sentinelLoading,
    sentinelError,
    sentinelIsFallback,
    loadSentinelScenes,
    retrySentinel
  } = useData()

  const [rasterUrl, setRasterUrl] = useState('')
  const [rasterBounds, setRasterBounds] = useState(null)
  const [rasterLoading, setRasterLoading] = useState(false)
  const mapNode = useRef(null)
  const mapInstance = useRef(null)
  const markerLayer = useRef(null)

  // Lazy load STAC data on mount
  useEffect(() => {
    loadSentinelScenes()
  }, [])

  // Initialize Leaflet map with clean lifecycle management
  useEffect(() => {
    if (!mapNode.current || mapInstance.current) return
    const map = L.map(mapNode.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      minZoom: 9,
      maxBounds: [[28.15, 85.25], [28.55, 85.55]],
      maxBoundsViscosity: 1
    }).setView([28.35, 85.40], 10)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)
    L.rectangle([[28.15, 85.25], [28.55, 85.55]], {
      color: '#8bd8d0',
      weight: 1,
      fillColor: '#8bd8d0',
      fillOpacity: 0.06,
      dashArray: '5 5'
    }).addTo(map)

    markerLayer.current = L.layerGroup().addTo(map)
    mapInstance.current = map
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  // Update map markers
  useEffect(() => {
    if (!markerLayer.current) return
    markerLayer.current.clearLayers()
    sentinelScenes.forEach((scene, index) => {
      const point = sceneCenter(scene, index)
      const isCurrent = index === sentinelSelected
      const marker = L.circleMarker(point, {
        radius: isCurrent ? 9 : 6,
        color: '#f0a35b',
        weight: 2,
        fillColor: isCurrent ? '#8bd8d0' : '#f0a35b',
        fillOpacity: 0.9
      })
        .bindTooltip(`${String(index + 1).padStart(2, '0')} · ${scene.date}`, {
          direction: 'top',
          offset: [0, -8]
        })
        .on('click', () => setSentinelSelected(index))

      marker.addTo(markerLayer.current)
      if (isCurrent) marker.openTooltip()
    })
  }, [sentinelScenes, sentinelSelected, setSentinelSelected])

  // Decode Sentinel COG via Web Worker
  useEffect(() => {
    const activeScene = sentinelScenes[sentinelSelected]
    const visual = activeScene?.visual
    if (!visual || !activeScene?.bbox) {
      setRasterUrl('')
      setRasterBounds(null)
      setRasterLoading(false)
      return undefined
    }

    let cancelled = false
    setRasterLoading(true)

    renderSentinelCog(visual, activeScene.bbox)
      .then(result => {
        if (!cancelled) {
          setRasterUrl(result.url)
          setRasterBounds(result.bounds)
          setRasterLoading(false)
        }
      })
      .catch(err => {
        console.warn('Sentinel COG decode failed:', err)
        if (!cancelled) {
          setRasterUrl('')
          setRasterBounds(null)
          setRasterLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [sentinelScenes, sentinelSelected])

  // Update image overlay on Leaflet map
  useEffect(() => {
    if (!mapInstance.current || !rasterUrl || !rasterBounds) return undefined
    const overlay = L.imageOverlay(rasterUrl, rasterBounds, {
      opacity: 0.82,
      interactive: false
    }).addTo(mapInstance.current)

    return () => {
      mapInstance.current?.removeLayer(overlay)
    }
  }, [rasterUrl, rasterBounds])

  const scene = sentinelScenes[sentinelSelected] || sentinelScenes[0]

  return (
    <section className="sentinel-section section" id="sentinel" aria-labelledby="sentinel-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="02B">TIMURE / RASUWA BORDER ARCHIVE</SectionLabel>
          <h2 id="sentinel-heading">
            BROWSE
            <br />
            <em>SENTINEL-2A</em>
          </h2>
        </div>
        <div className="section-intro">
          <p>
            Sentinel-2 scenes are queried for one fixed block around Timure, the Rasuwa border, and a small section of Tibet across August 2026.
          </p>
          <span className="verified-chip">
            <i aria-hidden="true" /> TIMURE · RASUWA · TIBET EDGE
          </span>
        </div>
      </div>

      {/* Accessible data table for screen reader users */}
      <table className="sr-only">
        <caption>Sentinel-2 satellite observation scenes for August 2026</caption>
        <thead>
          <tr>
            <th>Scene ID</th>
            <th>Acquisition Date</th>
            <th>UTC Time</th>
            <th>Cloud Cover</th>
            <th>Coordinates (Lat, Lng)</th>
          </tr>
        </thead>
        <tbody>
          {sentinelScenes.map((s, i) => {
            const center = sceneCenter(s, i)
            return (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.date}</td>
                <td>{s.time}</td>
                <td>{s.cloud}%</td>
                <td>{center[0].toFixed(3)}, {center[1].toFixed(3)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="sentinel-map-shell">
        <div ref={mapNode} className="sentinel-map" aria-label="Interactive Sentinel-2 Map" />

        <div className="sentinel-date-toggle" role="group" aria-label="Sentinel-2 acquisition dates">
          <span>DATE</span>
          {sentinelScenes.map((item, index) => (
            <button
              className={index === sentinelSelected ? 'active' : ''}
              key={item.id}
              onClick={() => setSentinelSelected(index)}
              aria-pressed={index === sentinelSelected}
            >
              {item.date.replace(' AUG 2026', '')}
            </button>
          ))}
        </div>

        <div className="sentinel-map-key">
          <span>
            <i className="map-key-dot active" aria-hidden="true" /> SELECTED SCENE
          </span>
          <span>
            <i className="map-key-dot" aria-hidden="true" /> OTHER SCENE
          </span>
          <small>OpenStreetMap basemap · Worker-decoded Sentinel-2 TCI overlay</small>
        </div>
      </div>

      <div className="sentinel-browser">
        <div className="sentinel-preview">
          {rasterUrl ? (
            <img src={rasterUrl} alt={`Sentinel-2 true color scene ${scene.id}`} loading="lazy" />
          ) : scene.thumbnail ? (
            <img src={scene.thumbnail} alt={`Sentinel-2 scene ${scene.id}`} loading="lazy" />
          ) : (
            <div className="sentinel-empty">
              <Satellite size={30} className={rasterLoading ? 'spin' : ''} />
              <strong>{rasterLoading ? 'DECODING COG IN WORKER' : '10 M RASTER PREVIEW'}</strong>
              <small>{rasterLoading ? 'Reading Level-2A GeoTIFF bands' : 'Select scene or toggle date'}</small>
            </div>
          )}

          <div className="scene-viewer-overlay">
            <span>SENTINEL-2 / {scene.date}</span>
            <strong>{scene.id}</strong>
            <small>{scene.cloud}% cloud cover · {scene.time}</small>
          </div>
        </div>

        <div className="sentinel-details">
          <div className="catalog-header-row">
            <span className="catalog-label">{sentinelStatus}</span>
            {(sentinelError || sentinelIsFallback) && (
              <button
                className="catalog-retry-btn"
                onClick={retrySentinel}
                disabled={sentinelLoading}
                title="Retry Earth Search STAC query"
              >
                <RefreshCw size={11} className={sentinelLoading ? 'spin' : ''} />
                <span>RETRY</span>
              </button>
            )}
          </div>

          <div className="scene-facts">
            <div>
              <span>ACQUISITION DATE</span>
              <b>{scene.date}</b>
            </div>
            <div>
              <span>SCENE ID</span>
              <b>{scene.id}</b>
            </div>
            <div>
              <span>PLATFORM</span>
              <b>{scene.platform || 'Sentinel-2A'}</b>
            </div>
            <div>
              <span>CLOUD COVER</span>
              <b>{scene.cloud}%</b>
            </div>
          </div>

          {scene.source && (
            <a
              className="dataset-link"
              href={scene.source}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open Sentinel-2 STAC record for ${scene.id}`}
            >
              OPEN STAC ITEM <ExternalLink size={14} aria-hidden="true" />
            </a>
          )}

          <p className="sentinel-note">
            The map and preview read the scene&apos;s real Sentinel-2 Level-2A true-color COG asset via non-blocking Web Worker decoding. Resolution is 10 m at source.
          </p>
        </div>
      </div>

      <div className="scene-strip" role="tablist" aria-label="Sentinel-2 scenes">
        {sentinelScenes.map((item, index) => (
          <button
            className={`scene-thumb ${index === sentinelSelected ? 'selected' : ''}`}
            key={item.id}
            role="tab"
            aria-selected={index === sentinelSelected}
            aria-label={`Select Sentinel scene ${item.date}`}
            onClick={() => setSentinelSelected(index)}
          >
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="" loading="lazy" />
            ) : (
              <span className="thumb-placeholder">
                <Satellite size={15} />
              </span>
            )}
            <span>{String(index + 1).padStart(2, '0')}</span>
            <small>{item.date} · {item.cloud}%</small>
          </button>
        ))}
      </div>

      <div className="sentinel-credit">
        True-color raster from <a href="https://sentinel-cogs.s3.us-west-2.amazonaws.com/" target="_blank" rel="noreferrer">Sentinel COGs on AWS</a> · metadata via <a href="https://earth-search.aws.element84.com/" target="_blank" rel="noreferrer">Earth Search / Element 84</a> · Sentinel-2 data by <a href="https://scihub.copernicus.eu/" target="_blank" rel="noreferrer">Copernicus Sentinel</a>
      </div>
    </section>
  )
}
export default SentinelBrowser
