import React from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'
import { SectionLabel } from './SectionLabel'

export function SceneBrowser() {
  const {
    planetScenes,
    planetSelected,
    setPlanetSelected,
    planetStatus,
    planetLoading,
    planetError,
    planetIsFallback,
    retryPlanet
  } = useData()

  const scene = planetScenes[planetSelected] || planetScenes[0]

  return (
    <section className="scene-browser section" id="satellite-browser" aria-labelledby="scene-browser-heading">
      <div className="scene-browser-head">
        <div>
          <SectionLabel number="02A">SCENE INDEX</SectionLabel>
          <h2 id="scene-browser-heading">
            BROWSE THE
            <br />
            <em>COLLECTION</em>
          </h2>
        </div>

        <div className="scene-status-box">
          <div className="scene-status">
            <span className={planetLoading ? 'loader' : 'loaded'} aria-hidden="true" />
            <span>{planetStatus}</span>
            <small>Public STAC metadata · Planet Disaster Data</small>
          </div>

          {(planetError || planetIsFallback) && (
            <button
              className="catalog-retry-btn"
              onClick={retryPlanet}
              disabled={planetLoading}
              title="Retry fetching STAC catalog"
            >
              <RefreshCw size={12} className={planetLoading ? 'spin' : ''} />
              <span>RELOAD CATALOG</span>
            </button>
          )}
        </div>
      </div>

      {scene && (
        <div className="scene-browser-grid">
          <div className="scene-viewer">
            <img
              src={scene.thumbnail}
              alt={`${scene.phase} PlanetScope scene ${scene.id} acquired on ${scene.date}`}
            />
            <div className="scene-viewer-overlay">
              <span>{scene.phase}</span>
              <strong>{scene.id}</strong>
              <small>{scene.platform} · {scene.cloud}% cloud cover</small>
            </div>
            <div className="scene-counter" aria-live="polite">
              {String(planetSelected + 1).padStart(2, '0')} / {String(planetScenes.length).padStart(2, '0')}
            </div>
          </div>

          <div className="scene-info">
            <div className="scene-info-top">
              <span>SELECTED SCENE</span>
              <strong>{scene.date}</strong>
              <small>{scene.time}</small>
            </div>

            <div className="scene-facts">
              <div>
                <span>SCENE ID</span>
                <b>{scene.id}</b>
              </div>
              <div>
                <span>SATELLITE / STRIP</span>
                <b>PlanetScope · {scene.platform}</b>
              </div>
              <div>
                <span>CLOUD COVER</span>
                <b>{scene.cloud}%</b>
              </div>
              <div>
                <span>PRODUCT TYPE</span>
                <b>{scene.phase === 'PRE-EVENT' ? 'Visual · analytic_sr' : 'Visual · analytic'}</b>
              </div>
            </div>

            {scene.selfUrl && (
              <a
                className="dataset-link"
                href={scene.selfUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open raw STAC JSON for scene ${scene.id}`}
              >
                OPEN STAC ITEM <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}

      <div
        className="scene-strip"
        role="tablist"
        aria-label="PlanetScope scene thumbnail gallery"
      >
        {planetScenes.map((item, index) => (
          <button
            className={`scene-thumb ${index === planetSelected ? 'selected' : ''}`}
            key={item.id}
            role="tab"
            aria-selected={index === planetSelected}
            aria-label={`Select scene ${index + 1}: ${item.date}, ${item.phase}, ${item.cloud}% cloud`}
            onClick={() => setPlanetSelected(index)}
          >
            <img src={item.thumbnail} alt="" loading="lazy" />
            <span>{String(index + 1).padStart(2, '0')}</span>
            <small>
              {item.phase === 'PRE-EVENT' ? 'PRE' : 'POST'} · {item.platform}
            </small>
          </button>
        ))}
      </div>
    </section>
  )
}
