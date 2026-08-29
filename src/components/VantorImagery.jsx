import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'
import { renderVantorCog } from '../lib/cogRenderer'
import { SectionLabel } from './SectionLabel'

export function VantorImagery() {
  const {
    vantorScenes,
    vantorStatus,
    vantorLoading,
    vantorError,
    vantorIsFallback,
    loadVantorScenes,
    retryVantor
  } = useData()

  const [visible, setVisible] = useState([])
  const [loadingIds, setLoadingIds] = useState([])
  const mapNode = useRef(null)
  const mapInstance = useRef(null)
  const rasterLayers = useRef(new Map())
  const footprintLayers = useRef(new Map())

  // Lazy load STAC data on mount
  useEffect(() => {
    loadVantorScenes()
  }, [])

  // Initialize Leaflet map with clean lifecycle management
  useEffect(() => {
    if (!mapNode.current || mapInstance.current) return undefined
    const map = L.map(mapNode.current, { zoomControl: false, minZoom: 8 }).setView([28.23, 85.30], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    mapInstance.current = map
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapInstance.current = null
      rasterLayers.current.clear()
      footprintLayers.current.clear()
    }
  }, [])

  function removeScene(id) {
    const map = mapInstance.current
    const raster = rasterLayers.current.get(id)
    const footprint = footprintLayers.current.get(id)
    if (raster && map) map.removeLayer(raster)
    if (footprint && map) map.removeLayer(footprint)
    rasterLayers.current.delete(id)
    footprintLayers.current.delete(id)
  }

  async function toggleScene(scene) {
    if (visible.includes(scene.id)) {
      removeScene(scene.id)
      setVisible(ids => ids.filter(id => id !== scene.id))
      return
    }

    const map = mapInstance.current
    if (!map) return

    const bounds = [[scene.bbox[1], scene.bbox[0]], [scene.bbox[3], scene.bbox[2]]]
    const thumbnailLayer = scene.thumbnail
      ? L.imageOverlay(scene.thumbnail, bounds, { opacity: 0.94, interactive: false }).addTo(map)
      : null

    const footprint = scene.geometry
      ? L.geoJSON(scene.geometry, {
          style: { color: '#85d3c6', weight: 1.5, fill: false, dashArray: '4 4' }
        }).addTo(map)
      : null

    if (thumbnailLayer) rasterLayers.current.set(scene.id, thumbnailLayer)
    if (footprint) footprintLayers.current.set(scene.id, footprint)

    setVisible(ids => [...ids, scene.id])
    setLoadingIds(ids => [...ids, scene.id])
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 })

    try {
      const rendered = await renderVantorCog(scene.visual, scene.bbox)
      if (rasterLayers.current.has(scene.id) || visible.includes(scene.id)) {
        if (thumbnailLayer) map.removeLayer(thumbnailLayer)
        const cogOverlay = L.imageOverlay(rendered.url, rendered.bounds, {
          opacity: 0.97,
          interactive: false
        }).addTo(map)
        rasterLayers.current.set(scene.id, cogOverlay)
      }
    } catch {
      // Keep thumbnail layer active if COG range read fails
    } finally {
      setLoadingIds(ids => ids.filter(id => id !== scene.id))
    }
  }

  return (
    <section className="vantor-section section" id="vantor" aria-labelledby="vantor-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="02C">HIGH-RESOLUTION EVENT IMAGERY</SectionLabel>
          <h2 id="vantor-heading">
            VANTOR
            <br />
            <em>IMAGERY</em>
          </h2>
        </div>
        <div className="section-intro">
          <p>
            Public Vantor/Maxar STAC scenes, including post-event WorldView-3 coverage. Toggle one or more acquisition dates to compare their footprints and imagery.
          </p>
          <span className="verified-chip">
            <i aria-hidden="true" /> COGS · WORKER-DECODED · VANTOR OPEN DATA
          </span>
        </div>
      </div>

      {/* Accessible data table for screen reader users */}
      <table className="sr-only">
        <caption>Vantor/Maxar high-resolution satellite imagery collection</caption>
        <thead>
          <tr>
            <th>Scene ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Platform</th>
            <th>GSD Resolution</th>
            <th>Cloud Cover</th>
            <th>Item URL</th>
          </tr>
        </thead>
        <tbody>
          {vantorScenes.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.date}</td>
              <td>{s.time}</td>
              <td>{s.platform}</td>
              <td>{s.gsd ? `${s.gsd} m` : 'n/a'}</td>
              <td>{s.cloud ?? 'n/a'}%</td>
              <td><a href={s.itemUrl}>STAC</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="vantor-map-shell">
        <div ref={mapNode} className="vantor-map" aria-label="Vantor STAC Leaflet Map" />
        <div className="vantor-map-key">
          <span className={loadingIds.length ? 'loader' : 'loaded'} aria-hidden="true" />
          <span>
            {loadingIds.length
              ? `READING ${loadingIds.length} COG OVERVIEW${loadingIds.length > 1 ? 'S IN WORKER' : ' IN WORKER'}`
              : vantorStatus}
          </span>
          <small>OpenStreetMap basemap · dashed outlines show STAC footprints</small>

          {(vantorError || vantorIsFallback) && (
            <button
              className="catalog-retry-btn-inline"
              onClick={retryVantor}
              disabled={vantorLoading}
              title="Retry Vantor STAC query"
            >
              <RefreshCw size={11} className={vantorLoading ? 'spin' : ''} />
              <span>RETRY</span>
            </button>
          )}
        </div>
      </div>

      <div className="vantor-controls" role="group" aria-label="Vantor scene overlays">
        <div className="vantor-controls-head">
          <span>ACQUISITION TIMELINE</span>
          <small>Toggle multiple layers for comparison</small>
        </div>

        {vantorScenes.map(scene => (
          <label
            className={`vantor-scene ${visible.includes(scene.id) ? 'active' : ''}`}
            key={scene.id}
          >
            <input
              type="checkbox"
              checked={visible.includes(scene.id)}
              onChange={() => toggleScene(scene)}
              aria-label={`Toggle scene ${scene.date}, platform ${scene.platform}`}
            />
            <span className="vantor-check" aria-hidden="true" />
            <span className="vantor-date">
              {scene.date}
              <small>{scene.time}</small>
            </span>
            <span className="vantor-scene-meta">
              {scene.platform || 'Vantor'} · {scene.gsd ? `${scene.gsd} m` : 'GSD n/a'}
              <small>{scene.cloud ?? 'n/a'}% cloud · COG</small>
            </span>
            {scene.itemUrl && (
              <a
                href={scene.itemUrl}
                target="_blank"
                rel="noreferrer"
                onClick={event => event.stopPropagation()}
                aria-label={`Open STAC item ${scene.id}`}
              >
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            {loadingIds.includes(scene.id) && <span className="vantor-loading">DECODING</span>}
          </label>
        ))}
      </div>

      <p className="vantor-note">
        Browser-side COG overview reads use geotiff.js inside a dedicated Web Worker via HTTP range requests. The source COGs are approximately 287 MB–1.6 GB, so this view intentionally avoids full-resolution downloads.
      </p>
    </section>
  )
}
export default VantorImagery
