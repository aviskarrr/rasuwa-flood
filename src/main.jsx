import React from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { fromUrl } from 'geotiff'
import { ArrowDownRight, ArrowUpRight, ChevronDown, ExternalLink, Layers, MapPin, Menu, Minus, Plus, Radio, Satellite, X } from 'lucide-react'
import './styles.css'
import './imagery.css'
import 'leaflet/dist/leaflet.css'

const datasetUrl = 'https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26'
const dataDatasetUrl = datasetUrl.replace('https://source.coop', 'https://data.source.coop')
const preCollectionRoot = `${dataDatasetUrl}/pre-event/planetscope-2026-05-27`
const postCollectionRoot = `${dataDatasetUrl}/post-event/planetscope-2026-08-26`
const preEventImage = `${preCollectionRoot}/items/20260527_053226_41_254a/20260527_053226_41_254a_thumbnail.png`
const postEventImage = `${postCollectionRoot}/items/20260826_054456_67_251f/20260826_054456_67_251f_thumbnail.png`
const preCollectionUrl = `${preCollectionRoot}/collection.json`
const postCollectionUrl = `${postCollectionRoot}/collection.json`
const sentinelSearchUrl = 'https://earth-search.aws.element84.com/v1/search?collections=sentinel-2-l2a&bbox=85.25,28.15,85.55,28.55&datetime=2026-08-01T00:00:00Z/2026-08-31T23:59:59Z&limit=31&sortby=-properties.datetime'
const casualtySourceUrl = 'https://nirajbhusal.github.io/rasuwa-flood-bulletin/'
const vantorCollectionUrl = 'https://vantor-opendata.s3.amazonaws.com/events/Nepal-Flooding-Aug-2026/collection.json'
const fallbackScenes = [
  { id: '20260527_053226_41_254a', phase: 'PRE-EVENT', date: '27 MAY 2026', time: '05:32:26 UTC', nepaliTime: '11:17:26 NPT', platform: '254a', cloud: 5, thumbnail: preEventImage },
  { id: '20260826_054456_67_251f', phase: 'POST-EVENT', date: '26 AUG 2026', time: '05:44:56 UTC', nepaliTime: '11:29:56 NPT', platform: '251f', cloud: 72, thumbnail: postEventImage },
  { id: '20260826_050135_34_255f', phase: 'POST-EVENT', date: '26 AUG 2026', time: '05:01:35 UTC', nepaliTime: '10:46:35 NPT', platform: '255f', cloud: 89, thumbnail: `${postCollectionRoot}/items/20260826_050135_34_255f/20260826_050135_34_255f_thumbnail.png` }
]

function formatNepalTime(datetime) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(datetime)) + ' NPT'
}

function SectionLabel({ children, number }) {
  return <div className="section-label"><span>{number}</span>{children}</div>
}

function MapGraphic({ satellite }) {
  const [zoom, setZoom] = useState(1)
  const [showOverlays, setShowOverlays] = useState(true)
  return <div className={`map-graphic ${satellite ? 'satellite-map' : ''}`}>
    <img className="real-satellite-image" style={{ transform: `scale(${zoom})` }} src={satellite ? postEventImage : preEventImage} alt={satellite ? 'PlanetScope post-event thumbnail, 26 August 2026' : 'PlanetScope pre-event thumbnail, 27 May 2026'} />
    <div className="map-grid" />
    <svg className={`map-lines ${showOverlays ? '' : 'hidden'}`} viewBox="0 0 1000 500" preserveAspectRatio="none" aria-label="Stylized Bhote Koshi and Trishuli observation map">
      <path className="ridge ridge-one" d="M0 135 C160 72 265 160 420 90 S680 85 1000 20" />
      <path className="ridge ridge-two" d="M-30 270 C150 180 220 315 390 215 S710 230 1030 120" />
      <path className="ridge ridge-three" d="M-20 420 C200 315 310 435 505 325 S780 360 1020 260" />
      <path className="river river-koshi" d="M190 -10 C235 90 190 145 265 205 S280 300 360 360 S350 450 420 520" />
      <path className="river river-trishuli" d="M680 -10 C650 75 700 135 625 195 S650 280 560 335 S600 435 500 520" />
      <path className="road" d="M540 0 C500 120 580 155 520 240 S470 360 500 510" />
      <path className="road road-alt" d="M130 0 C180 110 120 225 220 290 S190 405 240 510" />
      <path className="observation" d="M300 65 L755 65 L805 395 L420 445 Z" />
    </svg>
    {showOverlays && <><div className="map-label label-river-one">B H O T E  K O S H I</div>
    <div className="map-label label-river-two">T R I S H U L I</div>
    <div className="map-pin pin-rasuwa"><MapPin size={14} /> Rasuwagadhi</div>
    <div className="map-pin pin-syab"><span /> Syabrubesi</div>
    <div className="map-pin pin-dhun"><span /> Dhunche</div>
    <div className="map-pin pin-border"><span /> Nepal–China border</div>
    <div className="observation-tag"><span className="tag-dot" /> Observation area<br /><small>not confirmed flood extent</small></div></>}
    <div className="map-tools">
      <button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(1.8, value + .2))}><Plus size={17} /></button><button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(1, value - .2))}><Minus size={17} /></button>
      <button aria-label="Toggle map overlays" aria-pressed={showOverlays} onClick={() => setShowOverlays(value => !value)}><Layers size={17} /></button>
    </div>
    <div className="map-scale">N <span>━━━━</span> 10 km</div>
    <div className="map-source">PlanetScope / conceptual basemap</div>
  </div>
}

function Compare() {
  const [position, setPosition] = useState(52)
  return <div className="compare-wrap">
    <div className="compare-frame">
      <div className="compare-after"><img className="real-compare-image" src={postEventImage} alt="PlanetScope post-event thumbnail" /><span className="compare-date after-date">26 AUG 2026 <b>POST-EVENT</b></span></div>
      <div className="compare-before" style={{ width: `${position}%` }}><img className="real-compare-image" src={preEventImage} alt="PlanetScope pre-event thumbnail" /><span className="compare-date before-date">27 MAY 2026 <b>PRE-EVENT</b></span></div>
      <div className="compare-divider" style={{ left: `${position}%` }}><div className="drag-handle">← →</div></div>
      <input className="compare-input" type="range" min="8" max="92" value={position} onChange={e => setPosition(e.target.value)} aria-label="Compare pre and post-event imagery" />
      <div className="compare-note">Visual comparison preview · Planet disaster-response imagery</div>
    </div>
    <div className="compare-meta"><div><span>PRE-EVENT</span><strong>27 May 2026</strong><small>PlanetScope · Surface Reflectance</small></div><div><span>POST-EVENT</span><strong>26 August 2026</strong><small>PlanetScope · TOA Radiance</small></div></div>
  </div>
}

function SceneBrowser() {
  const [scenes, setScenes] = useState(fallbackScenes)
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(true)
  const [catalogStatus, setCatalogStatus] = useState('LOADING STAC CATALOGS')

  useEffect(() => {
    let cancelled = false
    async function loadScenes() {
      try {
        const collections = await Promise.all([preCollectionUrl, postCollectionUrl].map(async url => {
          const response = await fetch(url)
          if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`)
          return response.json()
        }))
        const results = await Promise.allSettled(collections.flatMap(collection => collection.links.filter(link => link.rel === 'item').map(async link => {
          const collectionUrl = collection.links.find(parent => parent.rel === 'self').href
          const response = await fetch(new URL(link.href, collectionUrl).href)
          if (!response.ok) throw new Error(`Scene request failed: ${response.status}`)
          const item = await response.json()
          const thumbnail = item.assets?.thumbnail?.href || item.assets?.visual?.href
          const selfUrl = item.links?.find(itemLink => itemLink.rel === 'self')?.href
          if (!item.id || !thumbnail || !selfUrl || !item.properties?.datetime) return null
          return { id: item.id, phase: item.collection.startsWith('pre') ? 'PRE-EVENT' : 'POST-EVENT', date: item.properties.datetime.slice(0, 10).split('-').reverse().join(' '), time: new Date(item.properties.datetime).toISOString().slice(11, 19) + ' UTC', nepaliTime: formatNepalTime(item.properties.datetime), platform: item.properties.platform, cloud: item.properties['eo:cloud_cover'], thumbnail: new URL(thumbnail, selfUrl).href, selfUrl }
        })))
        const items = results.filter(result => result.status === 'fulfilled').map(result => result.value).filter(Boolean).map(scene => ({ ...scene, time: `${scene.time} · ${scene.nepaliTime}` }))
        if (!cancelled && items.length) {
          setScenes(items)
          setSelected(0)
          setCatalogStatus(`${items.length} SCENES LOADED FROM STAC`)
        }
      } catch {
        if (!cancelled) setCatalogStatus('CATALOG UNAVAILABLE · SHOWING CACHED SCENES')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadScenes()
    return () => { cancelled = true }
  }, [])

  const scene = scenes[selected]
  return <section className="scene-browser section"><div className="scene-browser-head"><div><SectionLabel number="02A">SCENE INDEX</SectionLabel><h2>BROWSE THE<br /><em>COLLECTION</em></h2></div><div className="scene-status"><span className={loading ? 'loader' : 'loaded'} /> {catalogStatus}<small>Public STAC metadata · Planet Disaster Data</small></div></div><div className="scene-browser-grid"><div className="scene-viewer"><img src={scene.thumbnail} alt={`${scene.phase} PlanetScope scene ${scene.id}`} /><div className="scene-viewer-overlay"><span>{scene.phase}</span><strong>{scene.id}</strong><small>{scene.platform} · {scene.cloud}% cloud cover</small></div><div className="scene-counter">{String(selected + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}</div></div><div className="scene-info"><div className="scene-info-top"><span>SELECTED SCENE</span><strong>{scene.date}</strong><small>{scene.time}</small></div><div className="scene-facts"><div><span>SCENE ID</span><b>{scene.id}</b></div><div><span>SATELLITE / STRIP</span><b>PlanetScope · {scene.platform}</b></div><div><span>CLOUD COVER</span><b>{scene.cloud}%</b></div><div><span>PRODUCT</span><b>{scene.phase === 'PRE-EVENT' ? 'Visual · analytic_sr' : 'Visual · analytic'}</b></div></div>{scene.selfUrl && <a className="dataset-link" href={scene.selfUrl} target="_blank" rel="noreferrer">OPEN STAC ITEM <ExternalLink size={14} /></a>}</div></div><div className="scene-strip">{scenes.map((item, index) => <button className={`scene-thumb ${index === selected ? 'selected' : ''}`} key={item.id} onClick={() => setSelected(index)}><img src={item.thumbnail} alt="" /><span>{String(index + 1).padStart(2, '0')}</span><small>{item.phase === 'PRE-EVENT' ? 'PRE' : 'POST'} · {item.platform}</small></button>)}</div></section>
}

const sentinelFallback = [
  { id: 'S2A_MSIL2A_20260827T044651_N0511_R033_T45RVM', date: '27 AUG 2026', time: '04:46:51 UTC', cloud: 48, thumbnail: '', source: '', center: [28.08, 85.32] },
  { id: 'S2A_MSIL2A_20260822T044651_N0511_R033_T45RVM', date: '22 AUG 2026', time: '04:46:51 UTC', cloud: 36, thumbnail: '', source: '', center: [28.08, 85.32] },
  { id: 'S2A_MSIL2A_20260817T044651_N0511_R033_T45RVM', date: '17 AUG 2026', time: '04:46:51 UTC', cloud: 62, thumbnail: '', source: '', center: [28.08, 85.32] },
  { id: 'S2A_MSIL2A_20260812T044651_N0511_R033_T45RVM', date: '12 AUG 2026', time: '04:46:51 UTC', cloud: 19, thumbnail: '', source: '', center: [28.08, 85.32] }
]

function sceneCenter(scene, index) {
  if (scene.center) return scene.center
  if (scene.bbox) return [(scene.bbox[1] + scene.bbox[3]) / 2, (scene.bbox[0] + scene.bbox[2]) / 2]
  const coordinates = scene.geometry?.coordinates?.[0]
  if (coordinates?.length) return [coordinates.reduce((sum, point) => sum + point[1], 0) / coordinates.length, coordinates.reduce((sum, point) => sum + point[0], 0) / coordinates.length]
  return [28.08 - (index * .07), 85.32 - (index * .04)]
}

async function renderSentinelCog(url, bbox) {
  const tiff = await fromUrl(url)
  const image = await tiff.getImage()
  const scale = Math.min(1, 1400 / image.getWidth())
  const width = Math.max(1, Math.round(image.getWidth() * scale))
  const height = Math.max(1, Math.round(image.getHeight() * scale))
  const rasters = await image.readRasters({ samples: [0, 1, 2], width, height, interleave: false })
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const pixels = context.createImageData(width, height)
  for (let index = 0; index < width * height; index += 1) {
    pixels.data[index * 4] = rasters[0][index]
    pixels.data[index * 4 + 1] = rasters[1][index]
    pixels.data[index * 4 + 2] = rasters[2][index]
    pixels.data[index * 4 + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  return { url: canvas.toDataURL('image/jpeg', .9), bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] }
}

function SentinelBrowser() {
  const [scenes, setScenes] = useState(sentinelFallback)
  const [selected, setSelected] = useState(0)
  const [status, setStatus] = useState('SEARCHING EARTH SEARCH STAC')
  const [rasterUrl, setRasterUrl] = useState('')
  const [rasterBounds, setRasterBounds] = useState(null)
  const mapNode = useRef(null)
  const mapInstance = useRef(null)
  const markerLayer = useRef(null)

  useEffect(() => {
    if (!mapNode.current || mapInstance.current) return
    const map = L.map(mapNode.current, { zoomControl: false, scrollWheelZoom: true, minZoom: 9, maxBounds: [[28.15, 85.25], [28.55, 85.55]], maxBoundsViscosity: 1 }).setView([28.35, 85.40], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    L.rectangle([[28.15, 85.25], [28.55, 85.55]], { color: '#8bd8d0', weight: 1, fillColor: '#8bd8d0', fillOpacity: .06, dashArray: '5 5' }).addTo(map)
    markerLayer.current = L.layerGroup().addTo(map)
    mapInstance.current = map
    setTimeout(() => map.invalidateSize(), 0)
    return () => { map.remove(); mapInstance.current = null }
  }, [])

  useEffect(() => {
    if (!markerLayer.current) return
    markerLayer.current.clearLayers()
    scenes.forEach((scene, index) => {
      const point = sceneCenter(scene, index)
      const marker = L.circleMarker(point, { radius: index === selected ? 9 : 6, color: '#f0a35b', weight: 2, fillColor: index === selected ? '#8bd8d0' : '#f0a35b', fillOpacity: .9 })
        .bindTooltip(`${String(index + 1).padStart(2, '0')} · ${scene.date}`, { direction: 'top', offset: [0, -8] })
        .on('click', () => setSelected(index))
      marker.addTo(markerLayer.current)
      if (index === selected) marker.openTooltip()
    })
  }, [scenes, selected])

  useEffect(() => {
    const visual = scenes[selected]?.visual
    if (!visual) { setRasterUrl(''); setRasterBounds(null); return undefined }
    let cancelled = false
    renderSentinelCog(visual, scenes[selected].bbox).then(result => {
      if (!cancelled) { setRasterUrl(result.url); setRasterBounds(result.bounds) }
    }).catch(() => { if (!cancelled) { setRasterUrl(''); setRasterBounds(null) } })
    return () => { cancelled = true }
  }, [scenes, selected])

  useEffect(() => {
    if (!mapInstance.current || !rasterUrl || !rasterBounds) return undefined
    const overlay = L.imageOverlay(rasterUrl, rasterBounds, { opacity: .82, interactive: false }).addTo(mapInstance.current)
    return () => { mapInstance.current?.removeLayer(overlay) }
  }, [rasterUrl, rasterBounds])

  useEffect(() => {
    let cancelled = false
    fetch(sentinelSearchUrl)
      .then(response => { if (!response.ok) throw new Error('Sentinel catalog request failed'); return response.json() })
      .then(data => {
        const items = (data.features || []).map(item => ({
          id: item.id,
          date: item.properties.datetime.slice(0, 10).split('-').reverse().join(' '),
          time: new Date(item.properties.datetime).toISOString().slice(11, 19) + ' UTC',
          cloud: Math.round(item.properties['eo:cloud_cover'] ?? 0),
          thumbnail: item.assets?.thumbnail?.href || '',
          visual: item.assets?.visual?.href || '',
          source: item.links?.find(link => link.rel === 'self')?.href || '',
          geometry: item.geometry,
          bbox: item.bbox
        })).filter(item => item.id)
        if (!cancelled && items.length) { setScenes(items); setSelected(0); setStatus(`${items.length} SENTINEL-2 SCENES FOUND`) }
        else if (!cancelled) setStatus('NO MATCHING SCENES · SHOWING EXAMPLES')
      })
      .catch(() => { if (!cancelled) setStatus('CATALOG UNAVAILABLE · SHOWING EXAMPLES') })
    return () => { cancelled = true }
  }, [])

  const scene = scenes[selected]
  return <section className="sentinel-section section" id="sentinel"><div className="section-top"><div><SectionLabel number="02B">TIMURE / RASUWA BORDER ARCHIVE</SectionLabel><h2>BROWSE<br /><em>SENTINEL-2A</em></h2></div><div className="section-intro"><p>Sentinel-2 scenes are queried for one fixed block around Timure, the Rasuwa border, and a small section of Tibet across August 2026. Pan and zoom only within this event area, then toggle acquisition dates.</p><span className="verified-chip"><i /> TIMURE · RASUWA · TIBET EDGE</span></div></div><div className="sentinel-map-shell"><div ref={mapNode} className="sentinel-map" /><div className="sentinel-date-toggle" role="group" aria-label="Sentinel-2 acquisition dates"><span>DATE</span>{scenes.map((item, index) => <button className={index === selected ? 'active' : ''} key={item.id} onClick={() => setSelected(index)}>{item.date.replace(' AUG 2026', '')}</button>)}</div><div className="sentinel-map-key"><span><i className="map-key-dot active" /> SELECTED SCENE</span><span><i className="map-key-dot" /> OTHER SCENE</span><small>OpenStreetMap basemap · real Sentinel-2 TCI overlay when available</small></div></div><div className="sentinel-browser"><div className="sentinel-preview">{rasterUrl ? <img src={rasterUrl} alt={`Sentinel-2 true color scene ${scene.id}`} /> : scene.thumbnail ? <img src={scene.thumbnail} alt={`Sentinel-2 scene ${scene.id}`} /> : <div className="sentinel-empty"><Satellite size={30} /><strong>LOADING 10 M RASTER</strong><small>Reading the Sentinel-2 COG asset</small></div>}<div className="scene-viewer-overlay"><span>SENTINEL-2 / {scene.date}</span><strong>{scene.id}</strong><small>{scene.cloud}% cloud cover · {scene.time}</small></div></div><div className="sentinel-details"><span className="catalog-label">{status}</span><div className="scene-facts"><div><span>ACQUISITION DATE</span><b>{scene.date}</b></div><div><span>SCENE ID</span><b>{scene.id}</b></div><div><span>PLATFORM</span><b>{scene.platform || 'Sentinel-2'}</b></div><div><span>CLOUD COVER</span><b>{scene.cloud}%</b></div></div>{scene.source && <a className="dataset-link" href={scene.source} target="_blank" rel="noreferrer">OPEN STAC ITEM <ExternalLink size={14} /></a>}<p className="sentinel-note">The map and preview read the scene's real Sentinel-2 Level-2A true-color COG asset. Resolution is 10 m at source; display resampling and cloud cover can affect appearance.</p></div></div><div className="scene-strip">{scenes.map((item, index) => <button className={`scene-thumb ${index === selected ? 'selected' : ''}`} key={item.id} onClick={() => setSelected(index)}>{item.thumbnail ? <img src={item.thumbnail} alt="" /> : <span className="thumb-placeholder"><Satellite size={15} /></span>}<span>{String(index + 1).padStart(2, '0')}</span><small>{item.date} · {item.cloud}%</small></button>)}</div><div className="sentinel-credit">True-color raster from <a href="https://sentinel-cogs.s3.us-west-2.amazonaws.com/" target="_blank" rel="noreferrer">Sentinel COGs on AWS</a> · metadata via <a href="https://earth-search.aws.element84.com/" target="_blank" rel="noreferrer">Earth Search / Element 84</a> · Sentinel-2 data by <a href="https://scihub.copernicus.eu/" target="_blank" rel="noreferrer">Copernicus Sentinel</a></div></section>
}

function formatVantorDate(datetime) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(datetime)).toUpperCase()
}

// Choose a substantial internal overview rather than the tiny thumbnail pyramid
// level. It remains sharp through normal Leaflet zoom while avoiding a full COG.
async function renderVantorCog(url, bbox) {
  const tiff = await fromUrl(url)
  const imageCount = await tiff.getImageCount()
  let image = await tiff.getImage(imageCount - 1)
  // Vantor's COG pyramid steps down from full-resolution imagery. The first
  // overview no wider than 3,072 px gives a practical 2.7K-ish raster here.
  for (let index = 1; index < imageCount; index += 1) {
    const candidate = await tiff.getImage(index)
    if (candidate.getWidth() <= 3072) { image = candidate; break }
  }
  const width = image.getWidth()
  const height = image.getHeight()
  // readRGB applies TIFF photometric interpretation (including WhiteIsZero and
  // colour maps), avoiding the inverted-looking output produced by raw bands.
  const rgb = await image.readRGB({ width, height, interleave: true })
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const pixels = context.createImageData(width, height)
  for (let index = 0; index < width * height; index += 1) {
    pixels.data[index * 4] = rgb[index * 3]
    pixels.data[index * 4 + 1] = rgb[index * 3 + 1]
    pixels.data[index * 4 + 2] = rgb[index * 3 + 2]
    pixels.data[index * 4 + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  return { url: canvas.toDataURL('image/jpeg', .88), bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] }
}

function VantorImagery() {
  const [scenes, setScenes] = useState([])
  const [visible, setVisible] = useState([])
  const [status, setStatus] = useState('LOADING VANTOR STAC COLLECTION')
  const [loadingIds, setLoadingIds] = useState([])
  const mapNode = useRef(null)
  const mapInstance = useRef(null)
  const rasterLayers = useRef(new Map())
  const footprintLayers = useRef(new Map())

  useEffect(() => {
    if (!mapNode.current || mapInstance.current) return undefined
    const map = L.map(mapNode.current, { zoomControl: false, minZoom: 8 }).setView([28.23, 85.30], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    mapInstance.current = map
    setTimeout(() => map.invalidateSize(), 0)
    return () => { map.remove(); mapInstance.current = null }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadCatalog() {
      try {
        const response = await fetch(vantorCollectionUrl)
        if (!response.ok) throw new Error('Collection request failed')
        const collection = await response.json()
        const scenes = await Promise.all((collection.links || []).filter(link => link.rel === 'item').map(async link => {
          const itemResponse = await fetch(new URL(link.href, vantorCollectionUrl).href)
          if (!itemResponse.ok) throw new Error('Item request failed')
          const item = await itemResponse.json()
          const cog = Object.values(item.assets || {}).find(asset => /cloud-optimized|cog/i.test(`${asset.type || ''} ${asset.title || ''}`))
          if (!item.id || !item.properties?.datetime || !item.bbox || !cog?.href) return null
          return { id: item.id, datetime: item.properties.datetime, date: formatVantorDate(item.properties.datetime), time: new Date(item.properties.datetime).toISOString().slice(11, 19) + ' UTC', bbox: item.bbox, geometry: item.geometry, visual: new URL(cog.href, link.href).href, thumbnail: item.assets?.thumbnail?.href ? new URL(item.assets.thumbnail.href, link.href).href : '', cloud: item.properties['eo:cloud_cover'], gsd: item.properties.multispectral_gsd, platform: item.properties.vehicle_name, itemUrl: link.href }
        }))
        const validScenes = scenes.filter(Boolean).sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
        if (!cancelled) { setScenes(validScenes); setStatus(`${validScenes.length} COG SCENES LOADED FROM VANTOR STAC`) }
      } catch {
        if (!cancelled) setStatus('VANTOR CATALOG UNAVAILABLE')
      }
    }
    loadCatalog()
    return () => { cancelled = true }
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
    const thumbnailLayer = L.imageOverlay(scene.thumbnail, bounds, { opacity: .94, interactive: false }).addTo(map)
    const footprint = L.geoJSON(scene.geometry, { style: { color: '#85d3c6', weight: 1.5, fill: false, dashArray: '4 4' } }).addTo(map)
    rasterLayers.current.set(scene.id, thumbnailLayer)
    footprintLayers.current.set(scene.id, footprint)
    setVisible(ids => [...ids, scene.id])
    setLoadingIds(ids => [...ids, scene.id])
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 })
    try {
      const rendered = await renderVantorCog(scene.visual, scene.bbox)
      if (!rasterLayers.current.has(scene.id)) return
      map.removeLayer(rasterLayers.current.get(scene.id))
      rasterLayers.current.set(scene.id, L.imageOverlay(rendered.url, rendered.bounds, { opacity: .97, interactive: false }).addTo(map))
    } catch {
      // Keep the STAC thumbnail visible if a browser cannot make COG range requests.
    } finally {
      setLoadingIds(ids => ids.filter(id => id !== scene.id))
    }
  }

  return <section className="vantor-section section" id="vantor"><div className="section-top"><div><SectionLabel number="02C">HIGH-RESOLUTION EVENT IMAGERY</SectionLabel><h2>VANTOR<br /><em>IMAGERY</em></h2></div><div className="section-intro"><p>Public Vantor/Maxar STAC scenes, including post-event WorldView-3 coverage. Toggle one or more acquisition dates to compare their footprints and imagery.</p><span className="verified-chip"><i /> COGS · ON-DEMAND · VANTOR OPEN DATA</span></div></div><div className="vantor-map-shell"><div ref={mapNode} className="vantor-map" /><div className="vantor-map-key"><span className={loadingIds.length ? 'loader' : 'loaded'} /> {loadingIds.length ? `READING ${loadingIds.length} COG OVERVIEW${loadingIds.length > 1 ? 'S' : ''}` : status}<small>OpenStreetMap basemap · dashed outlines show STAC footprints</small></div></div><div className="vantor-controls" role="group" aria-label="Vantor scene overlays"><div className="vantor-controls-head"><span>ACQUISITION TIMELINE</span><small>Toggle multiple layers for comparison</small></div>{scenes.map(scene => <label className={`vantor-scene ${visible.includes(scene.id) ? 'active' : ''}`} key={scene.id}><input type="checkbox" checked={visible.includes(scene.id)} onChange={() => toggleScene(scene)} /><span className="vantor-check" /><span className="vantor-date">{scene.date}<small>{scene.time}</small></span><span className="vantor-scene-meta">{scene.platform || 'Vantor'} · {scene.gsd ? `${scene.gsd} m` : 'GSD n/a'}<small>{scene.cloud ?? 'n/a'}% cloud · COG</small></span><a href={scene.itemUrl} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()} aria-label={`Open STAC item ${scene.id}`}><ExternalLink size={14} /></a>{loadingIds.includes(scene.id) && <span className="vantor-loading">LOADING</span>}</label>)}</div><p className="vantor-note">Direct browser-side COG overview reads use geotiff.js and HTTP range requests; thumbnails appear during loading. The source COGs are approximately 287 MB–1.6 GB, so this view intentionally avoids full-resolution downloads. A COG tile service is recommended for high-zoom analysis.</p></section>
}

function ImpactNotice() {
  return <section className="impact-data-section section" id="impact"><div className="impact-head"><div><SectionLabel number="05">CASUALTY &amp; RESPONSE REPORT</SectionLabel><h2>IMPACT<br /><em>DETAILS</em></h2></div><div className="awaiting notice-source"><span className="awaiting-dot" /> SOURCE: RASUWA FLOOD BULLETIN</div></div><div className="notice-time">Situation as of 11 Bhadra 2083 · 27 August 2026 · figures are dated and may change</div><div className="impact-grid"><div className="impact-item"><span>DEATHS RECORDED</span><strong>270</strong><small>District total reported by Nepal Police</small></div><div className="impact-item"><span>OFFICIALLY MISSING</span><strong>245</strong><small>NDRRMA SitRep-3</small></div><div className="impact-item"><span>INJURED</span><strong>75</strong><small>Rasuwa 43 · Nuwakot 29 · Dhading 3</small></div><div className="impact-item"><span>AIR RESCUES</span><strong>123</strong><small>Army update · Timure 95 · Haku tunnel 7</small></div><div className="impact-item"><span>GROUND RESCUES</span><strong>93</strong><small>Rasuwa 43 · Nuwakot 47 · Dhading 3</small></div><div className="impact-item"><span>TOURISTS UNACCOUNTED FOR</span><strong>484</strong><small>Foreign 391 · Nepali 93 · not a death count</small></div></div><div className="notice-summary"><div><span>DEATHS BY DISTRICT</span><strong>Chitwan 64 · Gorkha 19 · Dhading 18</strong><small>Nuwakot 11 · Tanahun 9 · Rasuwa 1 · Nawalparasi East 1</small></div><div><span>SECURITY PERSONNEL MISSING</span><strong>83</strong><small>Army 44 · Nepal Police 26 · APF 13</small></div><div><span>INFRASTRUCTURE DAMAGE</span><strong>80 bridges · 40 km paved road</strong><small>35 motorable · 45 suspension bridges · 7 power facilities / 276 MW</small></div></div><p className="impact-note">Credit and primary reference: <a href={casualtySourceUrl} target="_blank" rel="noreferrer">Rasuwa–Bhotekoshi Flood Bulletin by Niraj Bhusal</a>. The bulletin cites NDRRMA SitRep-3, Nepal Police, the Nepal Army, district administrations, NEA, and other sources. Its public missing-person reports are separate from the official 245 figure and must not be added to it.</p></section>
}

function DataQuality() {
  return <section className="data-quality-section section" id="quality"><div className="section-top"><div><SectionLabel number="03">SCENE QUALITY BY SOURCE</SectionLabel><h2>WHAT CAN<br /><em>WE SEE?</em></h2></div><p className="section-copy">Cloud-cover percentages describe how much of a satellite scene is obscured. They are a useful warning, not a substitute for inspecting the image itself.</p></div><div className="quality-grid"><article className="quality-card"><span>VANTOR / MAXAR</span><strong>1.25–1.97 m</strong><b>POST-EVENT RESOLUTION</b><p>Six post-event scenes from 27–28 August 2026. Their catalog cloud cover is 71–79%, so each footprint still needs visual review. Their finer resolution can reveal more local detail where ground is visible.</p><small>Pre-event reference scenes: 15–46% catalog cloud cover · 1.71–2.29 m</small></article><article className="quality-card"><span>PLANET LABS</span><strong>62–93%</strong><b>POST-EVENT CLOUD COVER</b><p>PlanetScope provides useful event-day context across the corridor, but the monsoon cloud cover means it should be read as partial observation rather than a complete flood map.</p><small>Approx. 2–14% clear ground per post-event scene · ~3.8 m imagery</small></article></div></section>
}

function UnderstandingData() {
  return <section className="understanding-section section" id="understanding"><div className="section-top"><div><SectionLabel number="04">PLAIN-LANGUAGE GUIDE</SectionLabel><h2>UNDERSTANDING<br /><em>THE DATA</em></h2></div><p className="section-copy">These images are evidence from satellites, not a complete map of flood damage. Use the source, date, footprint, and cloud conditions together.</p></div><div className="understanding-grid"><article><h3>Why are there several sources?</h3><p>Different satellites pass over the same place at different times. They also see different-sized details and may face different cloud conditions, so no one image tells the whole story.</p></article><article><h3>What does cloud cover mean?</h3><p>It is the part of a scene the satellite estimates is hidden by cloud. A high value can make an image less useful, although clear patches can still show important detail.</p></article><article><h3>What is a GeoTIFF / COG?</h3><p>It is a map image file that includes its real-world location. A COG is organised so map tools can request only the part they need instead of downloading the entire file.</p></article><article><h3>What are the Planet image types?</h3><p><b>Visual imagery</b> is made to look like a familiar colour photograph. <b>Surface reflectance</b> is adjusted to better represent light at the ground. <b>TOA radiance</b> shows light measured at the satellite, including effects from the atmosphere.</p></article><article><h3>How should I use the controls?</h3><p>Select a date to inspect one acquisition, or turn on multiple Vantor layers to compare coverage. The timeline helps place each image before or after the event; it does not confirm damage on its own.</p></article><article><h3>What does “resolution” mean?</h3><p>Resolution is the ground size represented by one pixel. A smaller number of metres means finer detail, but it does not guarantee a cloud-free or complete view.</p></article></div></section>
}

function DataMethods() {
  return <section className="data-section section" id="data"><div className="data-copy"><SectionLabel number="07">OPEN METHODS &amp; SOURCES</SectionLabel><h2>DATA &amp;<br /><em>METHODS</em></h2><p>This tracker combines public Planet disaster-response imagery with Vantor’s public STAC collection. Each source remains separately browsable so their different dates, resolution, and limitations stay visible.</p><a className="dataset-link" href={vantorCollectionUrl} target="_blank" rel="noreferrer">OPEN VANTOR STAC <ExternalLink size={14} /></a><a className="dataset-link secondary-link" href={datasetUrl} target="_blank" rel="noreferrer">OPEN PLANET DATASET <ExternalLink size={14} /></a></div><div className="method-list"><div><span>VANTOR COG IMAGERY</span><p>Vantor provides georeferenced visual GeoTIFFs as Cloud-Optimized GeoTIFFs (COGs). The site reads their STAC catalog from public S3, then requests imagery only when a layer is selected.</p></div><div><span>VANTOR COVERAGE</span><p>The collection includes pre-event reference scenes and post-event WV02/WV03 scenes from 27–28 August 2026. Post-event resolution is 1.25–1.97 m; cloud metadata is retained with every scene.</p></div><div><span>PLANET VISUAL IMAGERY</span><p>Rendered imagery designed for visual inspection of the landscape and flood corridor.</p></div><div><span>PLANET SURFACE REFLECTANCE</span><p>Pixel values adjusted to better represent conditions at the ground; used for the pre-event product.</p></div><div><span>PLANET TOA RADIANCE</span><p>Light measured at the satellite, before atmospheric adjustment; used for the post-event product and not directly comparable numerically with reflectance.</p></div><div><span>PLANET UDM2 MASKS</span><p>Quality masks that flag clouds and other unusable pixels.</p></div><div><span>STAC METADATA</span><p>Structured records that describe scene dates, geographic footprints, asset links, and quality fields. Both collections use STAC metadata to populate the browsers.</p></div></div></section>
}

function App() {
  const [satellite, setSatellite] = useState(true)
  const [mobileNav, setMobileNav] = useState(false)
  const [openTimeline, setOpenTimeline] = useState(1)
  return <div className="app">
    <nav className="nav"><a className="brand" href="#overview"><span className="brand-mark"><Satellite size={16} /></span><span>FIELDNOTE<br /><i>NEPAL / 01</i></span></a><div className={`nav-links ${mobileNav ? 'is-open' : ''}`}><a href="#overview" onClick={() => setMobileNav(false)}>OVERVIEW</a><a href="#map" onClick={() => setMobileNav(false)}>MAP</a><a href="#vantor" onClick={() => setMobileNav(false)}>VANTOR</a><a href="#satellite" onClick={() => setMobileNav(false)}>PLANET</a><a href="#sentinel" onClick={() => setMobileNav(false)}>SENTINEL-2</a><a href="#understanding" onClick={() => setMobileNav(false)}>GUIDE</a><a href="#data" onClick={() => setMobileNav(false)}>DATA</a></div><div className="nav-right"><span className="event-badge"><i /> EVENT: 26 AUG 2026</span><button className="menu-btn" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation" aria-expanded={mobileNav} aria-controls="primary-navigation">{mobileNav ? <X size={19} /> : <Menu size={19} />}</button></div></nav>

    <main>
      <section className="hero" id="overview"><div className="hero-map"><MapGraphic satellite={satellite} /></div><div className="hero-content"><div className="eyebrow"><span className="live-dot" /> SATELLITE OBSERVATION / NEPAL</div><h1>BHOTE KOSHI–<br /><em>TRISHULI</em><br />FLOOD</h1><div className="hero-bottom"><p className="hero-sub">Satellite-based visualisation and verified information about the <strong>26 August 2026</strong> disaster event.</p><div className="hero-actions"><a className="button button-primary" href="#map">EXPLORE SATELLITE IMAGERY <ArrowDownRight size={16} /></a><a className="button button-ghost" href="#timeline">VIEW EVENT TIMELINE <ArrowDownRight size={16} /></a></div></div></div><div className="hero-meta"><div><span>EVENT</span><strong>Outburst / flash flood</strong></div><div><span>LOCATION</span><strong>Bhote Koshi–Trishuli corridor, Nepal</strong></div><div><span>DATE</span><strong>26 August 2026</strong></div><div><span>SATELLITE DATA</span><strong>PlanetScope</strong></div><div><span>RESOLUTION</span><strong>~3.8 m</strong></div></div><div className="scroll-cue"><span>SCROLL TO INVESTIGATE</span><ArrowDownRight size={16} /></div></section>

      <section className="map-section section" id="map"><div className="section-top"><div><SectionLabel number="01">GEOGRAPHIC CONTEXT</SectionLabel><h2>THE AFFECTED<br /><em>CORRIDOR</em></h2></div><div className="section-intro"><p>From the high border crossing at Rasuwagadhi, the Bhote Koshi joins the Trishuli through a narrow, steep-sided corridor.</p><span className="verified-chip"><i /> GEOGRAPHIC REFERENCE</span></div></div><div className="map-card"><div className="map-card-head"><span><Radio size={14} /> OBSERVATION AREA</span><div className="toggle-group"><button className={!satellite ? 'active' : ''} onClick={() => setSatellite(false)}>BASE</button><button className={satellite ? 'active' : ''} onClick={() => setSatellite(true)}>SATELLITE</button></div></div><MapGraphic satellite={satellite} /><div className="legend"><span><i className="legend-line cyan" /> SATELLITE IMAGERY</span><span><i className="legend-dot red" /> EVENT LOCATION</span><span><i className="legend-line blue" /> RIVER</span><span><i className="legend-dot white" /> SETTLEMENT</span><span><i className="legend-line yellow" /> ROAD / INFRASTRUCTURE</span></div></div></section>

      <VantorImagery />
      <section className="satellite-section section" id="satellite"><div className="section-top"><div><SectionLabel number="02">PLANET LABS / SUPPLEMENTARY CONTEXT</SectionLabel><h2>THE SATELLITE<br /><em>VIEW</em></h2></div><p className="section-copy">Planet released imagery from before and after the event through its disaster response program. It remains useful context alongside the finer-resolution Vantor collection, but its post-event scenes are heavily cloud-obstructed.</p></div><div className="metrics"><div className="metric"><strong>14</strong><span>TOTAL SCENES</span><small>PlanetScope collection</small></div><div className="metric"><strong>5</strong><span>PRE-EVENT SCENES</span><small>Acquired 27 May 2026</small></div><div className="metric"><strong>9</strong><span>POST-EVENT SCENES</span><small>Acquired 26 Aug 2026</small></div><div className="metric"><strong>~3.8 <sup>m</sup></strong><span>IMAGERY RESOLUTION</span><small>PlanetScope</small></div></div><Compare /><div className="caveat"><span className="caveat-icon">!</span><p><strong>READ WITH CARE</strong> Planet’s post-event imagery was acquired under substantial monsoon cloud cover. It should be interpreted as <em>partial observation</em> rather than a complete flood map.</p></div></section>

      <SceneBrowser />
      <SentinelBrowser />
      <ImpactNotice />

      <DataQuality />
      <UnderstandingData />

      <section className="timeline-section section" id="timeline"><div className="section-top"><div><SectionLabel number="04">SEQUENCE OF EVENTS</SectionLabel><h2>EVENT<br /><em>TIMELINE</em></h2></div><p className="section-copy">A longer reconstruction of the flood, warnings, response, and later updates. Times are Nepal Time unless marked approximate.</p></div><div className="timeline"><div className="timeline-line" />{[['26 AUGUST 2026 · 08:37','EARTHQUAKE REPORTED IN TIBET','The bulletin records a magnitude 4.4 earthquake in the upper catchment before the flood sequence.','PRELIMINARY'],['26 AUGUST 2026 · ~08:40','UPSTREAM BLOCKAGE / FLOOD TRIGGER','Initial accounts describe an ice avalanche or landslide forming and breaching a temporary blockage in Tibet. The cause was not scientifically confirmed as a GLOF.','UNDER ASSESSMENT'],['26 AUGUST 2026 · ~09:00','FLOOD ENTERS NEPAL AT TIMURE','The sudden flood is reported entering Nepal from Tibet at Timure, then moving through the Lende Khola and Bhote Koshi.','REPORTED'],['26 AUGUST 2026 · 09:00','FIRST LOCAL ALERTS','The first flood information reaches local authorities and communities along the corridor.','REPORTED'],['26 AUGUST 2026 · 09:10','PUBLIC RISK WARNING','Risk information begins circulating through media and local channels.','WARNING'],['26 AUGUST 2026 · 09:35','SMS ALERTS SENT','Provincial, district, and local authorities are alerted; Nepal Telecom and Ncell messages warn people in the threatened corridor.','WARNING'],['26 AUGUST 2026 · 09:45+','AERIAL RESCUE BEGINS','Army and private helicopters begin search and rescue operations around Rasuwa and Nuwakot.','RESCUE'],['26 AUGUST 2026 · 10:28','FLOOD REACHES GHALCHI','The Flood Forecasting Division reports the flood at Galchhi, Dhading, with further downstream travel expected.','RIVER PROGRESSION'],['26 AUGUST 2026 · 11:26','FURKE GAUGE PASSES ALERT LEVEL','The Trishuli at Furke rises above the warning level and the downstream corridor is placed on high alert.','DHM OBSERVATION'],['26 AUGUST 2026 · 11:43','FURKE PASSES DANGER LEVEL','The water level at Furke is reported above danger level and rising rapidly; riverside residents are urged to move to safety.','DHM OBSERVATION'],['26 AUGUST 2026 · 11:50','FLOOD REACHES MALEKHU','The bulletin reports the flood reaching Malekhu. The Furke station and a suspension bridge are swept away after a reported 10.8 m reading.','RIVER PROGRESSION'],['26 AUGUST 2026 · ~12:58','FLOOD APPROACHES CHITWAN','Chitwan officials report the flood near the district and around Fishling; coastal settlements begin moving residents.','EVACUATION'],['26 AUGUST 2026 · 13:23','MAJOR HIGHWAYS CLOSED','Police close the Prithvi Highway and Muglin–Narayanghat road until further notice while river-side travel is discouraged.','RESPONSE'],['26 AUGUST 2026 · 15:20','FLOOD REACHES DEVGHAT','The Flood Forecasting Division reports the flood reaching Narayani–Devghat. The day’s high level is later recorded at 6.57 m around 16:00.','DHM OBSERVATION'],['26 AUGUST 2026 · ~15:45','SUSTA RESIDENTS RELOCATED','Around 70% of residents in Susta are reported moved to safer locations; the bulletin notes that flood arrival there was not confirmed.','EVACUATION'],['26 AUGUST 2026 · 19:00','NATIONAL RESPONSE BRIEFING','The Prime Minister’s Office reports 484 tourists unaccounted for and coordinates search, rescue, relief, and support across six affected districts.','GOVERNMENT RESPONSE'],['26 AUGUST 2026 · 22:00','NDRRMA SITREP-3 PUBLISHED','Situation Report 3 records 245 officially missing, 75 injured, 116 aerial rescues, 93 ground rescues, 80 bridges damaged, and 40 km of paved road destroyed.','OFFICIAL UPDATE'],['27 AUGUST 2026 · 13:00','INDIAN CITIZENS RESCUED','The bulletin records 21 Indian citizens rescued by this update; rescue lists remain separate and are not subtracted from missing-person lists automatically.','RESCUE'],['27 AUGUST 2026 · 13:30–13:40','KATHMANDU HELICOPTER TRANSFERS','Prabhu Air brings five people from Syabrubesi and Augusta Air brings six from Dhunche to Kathmandu.','RESCUE'],['27 AUGUST 2026 · MORNING','ARMY RESCUE UPDATE','The Nepal Army reports 123 helicopter rescues, including 95 from Timure and seven people alive from the Haku hydropower tunnel.','OFFICIAL UPDATE']].map((item, i) => <button className={`timeline-item ${openTimeline === i ? 'open' : ''}`} key={item[1]} onClick={() => setOpenTimeline(openTimeline === i ? -1 : i)}><span className="timeline-dot" /><div className="timeline-date">{item[0]}</div><div className="timeline-main"><strong>{item[1]}</strong><span className="timeline-tag">{item[3]}</span>{openTimeline === i && <p>{item[2]}</p>}</div><ChevronDown size={18} className="timeline-chevron" /></button>)}</div><p className="timeline-source">Timeline compiled from the <a href={casualtySourceUrl} target="_blank" rel="noreferrer">Rasuwa–Bhotekoshi Flood Bulletin by Niraj Bhusal</a>, including DHM, NDRRMA, Nepal Police, Nepal Army, district administration, and government updates. Some times are approximate or represent later reporting of an earlier event.</p></section>

      <DataMethods />
    </main>
    <footer><div className="footer-brand"><span className="brand-mark"><Satellite size={16} /></span><strong>FIELDNOTE <i>NEPAL / 01</i></strong></div><div><span>Satellite imagery: Planet Labs PBC / Planet Disaster Data</span><span>Dataset distribution: Source Cooperative</span></div><a href={datasetUrl} target="_blank" rel="noreferrer">SOURCE.COOP <ExternalLink size={13} /></a></footer>
  </div>
}

export default App

createRoot(document.getElementById('root')).render(<App />)
