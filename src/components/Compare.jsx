import React, { useState } from 'react'
import { Link2, Link2Off } from 'lucide-react'
import { useData } from '../context/DataContext'
import { postEventImage, preEventImage } from '../lib/stac'

export function Compare() {
  const [position, setPosition] = useState(52)
  const {
    planetScenes,
    planetSelected,
    compareLinkActive,
    setCompareLinkActive
  } = useData()

  const currentScene = planetScenes[planetSelected] || planetScenes[0]

  // If linked, adapt the compare before/after images based on the active scene selection
  let beforeImg = preEventImage
  let beforeDate = '27 MAY 2026'
  let beforePhase = 'PRE-EVENT'
  let beforeSub = 'PlanetScope · Surface Reflectance'

  let afterImg = postEventImage
  let afterDate = '26 AUG 2026'
  let afterPhase = 'POST-EVENT'
  let afterSub = 'PlanetScope · TOA Radiance'

  if (compareLinkActive && currentScene) {
    if (currentScene.phase === 'POST-EVENT') {
      afterImg = currentScene.thumbnail || postEventImage
      afterDate = currentScene.date || '26 AUG 2026'
      afterPhase = `POST (${currentScene.platform || 'PlanetScope'})`
      afterSub = `${currentScene.cloud}% cloud · ${currentScene.platform || 'PlanetScope'}`
    } else {
      beforeImg = currentScene.thumbnail || preEventImage
      beforeDate = currentScene.date || '27 MAY 2026'
      beforePhase = `PRE (${currentScene.platform || 'PlanetScope'})`
      beforeSub = `${currentScene.cloud}% cloud · ${currentScene.platform || 'PlanetScope'}`
    }
  }

  return (
    <div className="compare-wrap" aria-label="Satellite Imagery Comparison Slider">
      <div className="compare-top-controls">
        <button
          className={`compare-link-toggle ${compareLinkActive ? 'linked' : ''}`}
          onClick={() => setCompareLinkActive(active => !active)}
          title="Toggle linking comparison to active Scene Browser selection"
          aria-pressed={compareLinkActive}
        >
          {compareLinkActive ? <Link2 size={13} /> : <Link2Off size={13} />}
          <span>{compareLinkActive ? 'SYNCED TO SCENE BROWSER SELECTION' : 'SHOWING FIXED REFERENCE PAIR'}</span>
        </button>
      </div>

      <div className="compare-frame">
        <div className="compare-after">
          <img
            className="real-compare-image"
            src={afterImg}
            alt={`PlanetScope post-event scene: ${afterDate}`}
          />
          <span className="compare-date after-date">
            {afterDate} <b>{afterPhase}</b>
          </span>
        </div>

        <div className="compare-before" style={{ width: `${position}%` }}>
          <img
            className="real-compare-image"
            src={beforeImg}
            alt={`PlanetScope pre-event scene: ${beforeDate}`}
          />
          <span className="compare-date before-date">
            {beforeDate} <b>{beforePhase}</b>
          </span>
        </div>

        <div className="compare-divider" style={{ left: `${position}%` }}>
          <div className="drag-handle" aria-hidden="true">← →</div>
        </div>

        <input
          className="compare-input"
          type="range"
          min="8"
          max="92"
          value={position}
          onChange={e => setPosition(Number(e.target.value))}
          aria-label="Compare pre and post-event satellite imagery slider"
        />

        <div className="compare-note">
          Visual comparison preview · Drag slider to inspect corridor changes
        </div>
      </div>

      <div className="compare-meta">
        <div>
          <span>BEFORE EVENT</span>
          <strong>{beforeDate}</strong>
          <small>{beforeSub}</small>
        </div>
        <div>
          <span>AFTER EVENT</span>
          <strong>{afterDate}</strong>
          <small>{afterSub}</small>
        </div>
      </div>
    </div>
  )
}
