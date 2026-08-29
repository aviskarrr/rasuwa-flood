import React from 'react'
import { useData } from '../context/DataContext'
import { SectionLabel } from './SectionLabel'

export function DataQuality() {
  const {
    planetPostCloudStats,
    planetPostCount,
    vantorPostCloudStats,
    vantorPreCloudStats,
    vantorPostScenes
  } = useData()

  // Use dynamic ranges computed from loaded scenes, falling back to verified known bounds if collection empty
  const vantorPostRange = vantorPostCloudStats.rangeStr !== 'n/a'
    ? vantorPostCloudStats.rangeStr
    : '71–79%'

  const vantorPreRange = vantorPreCloudStats.rangeStr !== 'n/a'
    ? vantorPreCloudStats.rangeStr
    : '15–46%'

  const planetPostRange = planetPostCloudStats.rangeStr !== 'n/a'
    ? planetPostCloudStats.rangeStr
    : '62–93%'

  const vantorPostCountText = vantorPostScenes.length > 0
    ? `${vantorPostScenes.length} post-event scenes`
    : 'Six post-event scenes'

  return (
    <section className="data-quality-section section" id="quality" aria-labelledby="quality-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="03">SCENE QUALITY BY SOURCE</SectionLabel>
          <h2 id="quality-heading">
            WHAT CAN
            <br />
            <em>WE SEE?</em>
          </h2>
        </div>
        <div className="section-intro">
          <p>
            Cloud-cover percentages describe how much of a satellite scene is obscured. They are a useful warning, not a substitute for inspecting the image itself.
          </p>
          <span className="quality-timestamp-note">
            Figures fixed as of 27 August 2026 — not auto-updated
          </span>
        </div>
      </div>

      <div className="quality-grid">
        <article className="quality-card">
          <span>VANTOR / MAXAR</span>
          <strong>1.25–1.97 m</strong>
          <b>POST-EVENT RESOLUTION</b>
          <p>
            {vantorPostCountText} from 27–28 August 2026. Their catalog cloud cover is{' '}
            <mark className="stat-highlight">{vantorPostRange}</mark>, so each footprint still needs visual review. Their finer resolution can reveal more local detail where ground is visible.
          </p>
          <small>
            Pre-event reference scenes: {vantorPreRange} catalog cloud cover · 1.71–2.29 m
          </small>
        </article>

        <article className="quality-card">
          <span>PLANET LABS</span>
          <strong>{planetPostRange}</strong>
          <b>POST-EVENT CLOUD COVER</b>
          <p>
            PlanetScope provides useful event-day context across the corridor ({planetPostCount} post-event scenes), but the monsoon cloud cover means it should be read as partial observation rather than a complete flood map.
          </p>
          <small>
            Approx. 2–14% clear ground per post-event scene · ~3.8 m imagery
          </small>
        </article>
      </div>
    </section>
  )
}
