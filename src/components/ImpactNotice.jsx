import React from 'react'
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
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
          <a
            href={casualtySourceUrl}
            target="_blank"
            rel="noreferrer"
            className="notice-source-link"
            aria-label="Open Rasuwa Flood Bulletin source in new tab"
          >
            SOURCE: RASUWA FLOOD BULLETIN <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="notice-time-bar">
        <div className="notice-time-text">
          <strong>30 August 2026, 09:00 NPT — NDRRMA / Ministry of Home Affairs</strong>
          <span>Fixed snapshot (14 Bhadau 2083, 09:00 NPT) · Multi-agency records vary; re-verify before time-sensitive use</span>
        </div>
        <div className="verification-badge">
          <CheckCircle2 size={13} aria-hidden="true" />
          <span>{bulletinStatus.message}</span>
        </div>
      </div>

      <div className="impact-grid">
        <div className="impact-item">
          <span>DEATHS RECORDED</span>
          <strong>734</strong>
          <small>NDRRMA / Ministry of Home Affairs (14 Bhadau 09:00)</small>
        </div>
        <div className="impact-item">
          <span>UNREACHABLE / MISSING</span>
          <strong>2,498</strong>
          <small>Official recorded unreachable / missing count</small>
        </div>
        <div className="impact-item">
          <span>INJURED</span>
          <strong>242</strong>
          <small>NDRRMA verified injured tally</small>
        </div>
        <div className="impact-item">
          <span>RESCUED BY HELICOPTER</span>
          <strong>1,976</strong>
          <small>Aerial rescue missions conducted</small>
        </div>
        <div className="impact-item">
          <span>TOTAL RESCUED (NDRRMA)</span>
          <strong>8,186</strong>
          <small>Combined air and ground operations</small>
        </div>
        <div className="impact-item">
          <span>PERSONNEL DEPLOYED</span>
          <strong>19,895</strong>
          <small>Security forces & emergency responders</small>
        </div>
      </div>

      <div className="notice-summary">
        <div>
          <span>DEATHS BY DISTRICT (NDRRMA / HOME MINISTRY · 09:00, 14 BHADAU)</span>
          <strong>Chitwan 259 · Nawalparasi East 184 · Nawalparasi West 82 · Gorkha 58</strong>
          <small>Nuwakot 52 · Dhading 50 · Tanahu 36 · Rasuwa 13</small>
        </div>
        <div>
          <span>INFRASTRUCTURE DAMAGE ASSESSMENT</span>
          <strong>80 bridges · 40 km paved road</strong>
          <small>35 motorable · 45 suspension · 7 power plants (276 MW) · Unlisted stats require separate bulletin check</small>
        </div>
      </div>

      <div className="impact-snapshot-notice" role="note" aria-label="Snapshot advisory notice">
        <div className="snapshot-notice-header">
          <AlertTriangle size={15} className="snapshot-icon" aria-hidden="true" />
          <strong>ADMINISTRATIVE SNAPSHOT ADVISORY · NOT A LIVE FEED</strong>
        </div>
        <p>
          These casualty and rescue figures represent a verified point-in-time snapshot as of{' '}
          <strong>30 August 2026, 09:00 NPT (14 Bhadau 2083)</strong> published by the National Disaster Risk Reduction and
          Management Authority (NDRRMA) and the Ministry of Home Affairs. This bulletin updates multiple times daily, and figures reported across different agencies (NDRRMA, Nepal Police, Nepal Army, and district disaster management committees) do not always reconcile.
        </p>
        <p>
          These numbers will go stale again and <strong>must be re-verified against the official bulletin</strong> before being trusted for any time-sensitive decision-making or reporting. Unlisted metrics (such as detailed structural damage) are retained from baseline reports and require a separate check against the bulletin&apos;s damage-assessment section.
        </p>
        <div className="snapshot-source-row">
          <span>Primary reference:</span>
          <a
            href={casualtySourceUrl}
            target="_blank"
            rel="noreferrer"
            className="snapshot-source-link"
          >
            Rasuwa–Bhotekoshi Flood Bulletin (Niraj Bhusal) <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
