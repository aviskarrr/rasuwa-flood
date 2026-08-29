import React from 'react'
import { ArrowDownRight } from 'lucide-react'
import { MapGraphic } from './MapGraphic'

export function Hero({ satellite = true }) {
  return (
    <section className="hero" id="overview" aria-labelledby="hero-heading">
      <div className="hero-map" aria-hidden="true">
        <MapGraphic satellite={satellite} />
      </div>

      <div className="hero-content">
        <div className="eyebrow">
          <span className="live-dot" aria-hidden="true" />
          DISASTER EVIDENCE DOSSIER / NEPAL
        </div>

        <h1 id="hero-heading">
          BHOTE KOSHI–
          <br />
          <em>TRISHULI</em>
          <br />
          FLOOD
        </h1>

        <div className="hero-bottom">
          <p className="hero-sub">
            Public satellite observation archive and verified impact documentation for the{' '}
            <strong>26 August 2026</strong> flash flood in northern Nepal.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#map">
              EXPLORE SATELLITE EVIDENCE <ArrowDownRight size={16} aria-hidden="true" />
            </a>
            <a className="button button-ghost" href="#impact">
              VIEW CASUALTY &amp; SITUATION REPORT <ArrowDownRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="hero-meta" aria-label="Key event metadata">
        <div>
          <span>EVENT TYPE</span>
          <strong>Outburst / flash flood</strong>
        </div>
        <div>
          <span>CORRIDOR</span>
          <strong>Bhote Koshi–Trishuli, Rasuwa</strong>
        </div>
        <div>
          <span>EVENT DATE</span>
          <strong>26 August 2026</strong>
        </div>
        <div>
          <span>PRIMARY SENSORS</span>
          <strong>PlanetScope · WV-3 · Sentinel-2</strong>
        </div>
        <div>
          <span>DATA INTEGRITY</span>
          <strong>Direct STAC / COG queries</strong>
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span>SCROLL TO EXAMINE EVIDENCE</span>
        <ArrowDownRight size={16} />
      </div>
    </section>
  )
}
