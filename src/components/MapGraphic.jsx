import React, { useState } from 'react'
import { Layers, MapPin, Minus, Plus } from 'lucide-react'
import { postEventImage, preEventImage } from '../lib/stac'

export function MapGraphic({ satellite = false }) {
  const [zoom, setZoom] = useState(1)
  const [showOverlays, setShowOverlays] = useState(true)

  return (
    <div className={`map-graphic ${satellite ? 'satellite-map' : ''}`} role="region" aria-label="Conceptual corridor map">
      <img
        className="real-satellite-image"
        style={{ transform: `scale(${zoom})` }}
        src={satellite ? postEventImage : preEventImage}
        alt={satellite ? 'PlanetScope post-event thumbnail, 26 August 2026' : 'PlanetScope pre-event thumbnail, 27 May 2026'}
      />
      <div className="map-grid" aria-hidden="true" />
      <svg
        className={`map-lines ${showOverlays ? '' : 'hidden'}`}
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        aria-label="Stylized Bhote Koshi and Trishuli observation map"
      >
        <path className="ridge ridge-one" d="M0 135 C160 72 265 160 420 90 S680 85 1000 20" />
        <path className="ridge ridge-two" d="M-30 270 C150 180 220 315 390 215 S710 230 1030 120" />
        <path className="ridge ridge-three" d="M-20 420 C200 315 310 435 505 325 S780 360 1020 260" />
        <path className="river river-koshi" d="M190 -10 C235 90 190 145 265 205 S280 300 360 360 S350 450 420 520" />
        <path className="river river-trishuli" d="M680 -10 C650 75 700 135 625 195 S650 280 560 335 S600 435 500 520" />
        <path className="road" d="M540 0 C500 120 580 155 520 240 S470 360 500 510" />
        <path className="road road-alt" d="M130 0 C180 110 120 225 220 290 S190 405 240 510" />
        <path className="observation" d="M300 65 L755 65 L805 395 L420 445 Z" />
      </svg>

      {showOverlays && (
        <>
          <div className="map-label label-river-one">B H O T E  K O S H I</div>
          <div className="map-label label-river-two">T R I S H U L I</div>
          <div className="map-pin pin-rasuwa"><MapPin size={14} aria-hidden="true" /> Rasuwagadhi</div>
          <div className="map-pin pin-syab"><span aria-hidden="true" /> Syabrubesi</div>
          <div className="map-pin pin-dhun"><span aria-hidden="true" /> Dhunche</div>
          <div className="map-pin pin-border"><span aria-hidden="true" /> Nepal–China border</div>
          <div className="observation-tag">
            <span className="tag-dot" aria-hidden="true" /> Observation area
            <br />
            <small>not confirmed flood extent</small>
          </div>
        </>
      )}

      <div className="map-tools" aria-label="Map view controls">
        <button
          aria-label="Zoom in map thumbnail"
          onClick={() => setZoom(value => Math.min(1.8, Number((value + 0.2).toFixed(1))))}
        >
          <Plus size={17} />
        </button>
        <button
          aria-label="Zoom out map thumbnail"
          onClick={() => setZoom(value => Math.max(1, Number((value - 0.2).toFixed(1))))}
        >
          <Minus size={17} />
        </button>
        <button
          aria-label="Toggle map vector overlays"
          aria-pressed={showOverlays}
          onClick={() => setShowOverlays(value => !value)}
        >
          <Layers size={17} />
        </button>
      </div>

      <div className="map-scale" aria-label="Scale note: illustrative schematic, not to scale">
        <span>N ↑</span> &nbsp;·&nbsp; Illustrative schematic · Not georeferenced / not to scale
      </div>
      <div className="map-source">PlanetScope / conceptual basemap</div>
    </div>
  )
}
