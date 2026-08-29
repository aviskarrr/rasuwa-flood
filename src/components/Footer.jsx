import React from 'react'
import { ExternalLink, Satellite } from 'lucide-react'
import { datasetUrl } from '../lib/stac'

export function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <span className="brand-mark">
          <Satellite size={16} aria-hidden="true" />
        </span>
        <strong>
          FIELDNOTE <i>NEPAL / 01</i>
        </strong>
      </div>
      <div>
        <span>Satellite imagery: Planet Labs PBC / Planet Disaster Data</span>
        <span>Dataset distribution: Source Cooperative</span>
      </div>
      <a href={datasetUrl} target="_blank" rel="noreferrer">
        SOURCE.COOP <ExternalLink size={13} aria-hidden="true" />
      </a>
    </footer>
  )
}
