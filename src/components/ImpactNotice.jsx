import React from 'react'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { useData } from '../context/DataContext'
import { casualtySourceUrl } from '../lib/stac'
import { SectionLabel } from './SectionLabel'

export function ImpactNotice() {
  const { bulletinStatus } = useData()

  return (
    <section className="impact-data-section section" id="impact" aria-labelledby="impact-heading">
      <div className="impact-head">
        <div>
          <SectionLabel number="05">CASUALTY &amp; RESPONSE REPORT</SectionLabel>
          <h2 id="impact-heading">
            IMPACT
            <br />
            <em>DETAILS</em>
          </h2>
        </div>

        <div className="awaiting notice-source">
          <span className="awaiting-dot" aria-hidden="true" />
          <span>SOURCE: RASUWA FLOOD BULLETIN</span>
        </div>
      </div>

      <div className="notice-time-bar">
        <div className="notice-time-text">
          <strong>Situation as of 11 Bhadra 2083 · 27 August 2026</strong>
          <span>Figures fixed as of 27 August 2026 — not auto-updated</span>
        </div>
        <div className="verification-badge">
          <CheckCircle2 size={13} aria-hidden="true" />
          <span>{bulletinStatus.message}</span>
        </div>
      </div>

      <div className="impact-grid">
        <div className="impact-item">
          <span>DEATHS RECORDED</span>
          <strong>270</strong>
          <small>District total reported by Nepal Police</small>
        </div>
        <div className="impact-item">
          <span>OFFICIALLY MISSING</span>
          <strong>245</strong>
          <small>NDRRMA SitRep-3 official record</small>
        </div>
        <div className="impact-item">
          <span>INJURED</span>
          <strong>75</strong>
          <small>Rasuwa 43 · Nuwakot 29 · Dhading 3</small>
        </div>
        <div className="impact-item">
          <span>AIR RESCUES</span>
          <strong>123</strong>
          <small>Army update · Timure 95 · Haku tunnel 7</small>
        </div>
        <div className="impact-item">
          <span>GROUND RESCUES</span>
          <strong>93</strong>
          <small>Rasuwa 43 · Nuwakot 47 · Dhading 3</small>
        </div>
        <div className="impact-item">
          <span>TOURISTS UNACCOUNTED FOR</span>
          <strong>484</strong>
          <small>Foreign 391 · Nepali 93 · not a death count</small>
        </div>
      </div>

      <div className="notice-summary">
        <div>
          <span>DEATHS BY DISTRICT</span>
          <strong>Chitwan 64 · Gorkha 19 · Dhading 18</strong>
          <small>Nuwakot 11 · Tanahun 9 · Rasuwa 1 · Nawalparasi East 1</small>
        </div>
        <div>
          <span>SECURITY PERSONNEL MISSING</span>
          <strong>83</strong>
          <small>Army 44 · Nepal Police 26 · APF 13</small>
        </div>
        <div>
          <span>INFRASTRUCTURE DAMAGE</span>
          <strong>80 bridges · 40 km paved road</strong>
          <small>35 motorable · 45 suspension bridges · 7 power facilities / 276 MW</small>
        </div>
      </div>

      <p className="impact-note">
        Credit and primary reference:{' '}
        <a href={casualtySourceUrl} target="_blank" rel="noreferrer">
          Rasuwa–Bhotekoshi Flood Bulletin by Niraj Bhusal <ExternalLink size={11} aria-hidden="true" />
        </a>
        . The bulletin cites NDRRMA SitRep-3, Nepal Police, the Nepal Army, district administrations, NEA, and other official sources. Its public missing-person reports are separate from the official 245 figure and must not be added to it.
      </p>
    </section>
  )
}
