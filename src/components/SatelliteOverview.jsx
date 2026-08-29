import React from 'react'
import { useData } from '../context/DataContext'
import { Compare } from './Compare'
import { SectionLabel } from './SectionLabel'

export function SatelliteOverview() {
  const {
    planetTotalCount,
    planetPreCount,
    planetPostCount
  } = useData()

  return (
    <section className="satellite-section section" id="satellite" aria-labelledby="satellite-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="02">PLANET LABS / SUPPLEMENTARY CONTEXT</SectionLabel>
          <h2 id="satellite-heading">
            THE SATELLITE
            <br />
            <em>VIEW</em>
          </h2>
        </div>
        <p className="section-copy">
          Planet released imagery from before and after the event through its disaster response program. It remains useful context alongside the finer-resolution Vantor collection, but its post-event scenes are heavily cloud-obstructed.
        </p>
      </div>

      <div className="metrics" aria-label="PlanetScope collection statistics">
        <div className="metric">
          <strong>{planetTotalCount}</strong>
          <span>TOTAL SCENES</span>
          <small>PlanetScope collection</small>
        </div>
        <div className="metric">
          <strong>{planetPreCount}</strong>
          <span>PRE-EVENT SCENES</span>
          <small>Acquired 27 May 2026</small>
        </div>
        <div className="metric">
          <strong>{planetPostCount}</strong>
          <span>POST-EVENT SCENES</span>
          <small>Acquired 26 Aug 2026</small>
        </div>
        <div className="metric">
          <strong>~3.8 <sup>m</sup></strong>
          <span>IMAGERY RESOLUTION</span>
          <small>PlanetScope</small>
        </div>
      </div>

      <Compare />

      <div className="caveat">
        <span className="caveat-icon" aria-hidden="true">!</span>
        <p>
          <strong>READ WITH CARE</strong> Planet’s post-event imagery was acquired under substantial monsoon cloud cover. It should be interpreted as <em>partial observation</em> rather than a complete flood map.
        </p>
      </div>
    </section>
  )
}
