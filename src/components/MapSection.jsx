import React from 'react'
import { Radio } from 'lucide-react'
import { MapGraphic } from './MapGraphic'
import { SectionLabel } from './SectionLabel'

export function MapSection({ satellite, setSatellite }) {
  return (
    <section className="map-section section" id="map" aria-labelledby="map-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="01">GEOGRAPHIC CONTEXT</SectionLabel>
          <h2 id="map-heading">
            THE AFFECTED
            <br />
            <em>CORRIDOR</em>
          </h2>
        </div>
        <div className="section-intro">
          <p>
            From the high border crossing at Rasuwagadhi, the Bhote Koshi joins the Trishuli through a narrow, steep-sided corridor.
          </p>
          <span className="verified-chip">
            <i aria-hidden="true" /> GEOGRAPHIC REFERENCE
          </span>
        </div>
      </div>

      <div className="map-card">
        <div className="map-card-head">
          <span>
            <Radio size={14} aria-hidden="true" /> OBSERVATION AREA
          </span>
          <div className="toggle-group" role="group" aria-label="Map view mode toggle">
            <button
              className={!satellite ? 'active' : ''}
              onClick={() => setSatellite(false)}
              aria-pressed={!satellite}
            >
              BASE
            </button>
            <button
              className={satellite ? 'active' : ''}
              onClick={() => setSatellite(true)}
              aria-pressed={satellite}
            >
              SATELLITE
            </button>
          </div>
        </div>

        <MapGraphic satellite={satellite} />

        <div className="legend" aria-label="Map legend">
          <span>
            <i className="legend-line cyan" aria-hidden="true" /> SATELLITE IMAGERY
          </span>
          <span>
            <i className="legend-dot red" aria-hidden="true" /> EVENT LOCATION
          </span>
          <span>
            <i className="legend-line blue" aria-hidden="true" /> RIVER
          </span>
          <span>
            <i className="legend-dot white" aria-hidden="true" /> SETTLEMENT
          </span>
          <span>
            <i className="legend-line yellow" aria-hidden="true" /> ROAD / INFRASTRUCTURE
          </span>
        </div>
      </div>
    </section>
  )
}
