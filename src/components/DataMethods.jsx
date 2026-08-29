import React from 'react'
import { ExternalLink } from 'lucide-react'
import { datasetUrl, vantorCollectionUrl } from '../lib/stac'
import { SectionLabel } from './SectionLabel'

export function DataMethods() {
  return (
    <section className="data-section section" id="data" aria-labelledby="data-heading">
      <div className="data-copy">
        <SectionLabel number="07">OPEN METHODS &amp; SOURCES</SectionLabel>
        <h2 id="data-heading">
          DATA &amp;
          <br />
          <em>METHODS</em>
        </h2>
        <p>
          This tracker combines public Planet disaster-response imagery with Vantor’s public STAC collection. Each source remains separately browsable so their different dates, resolution, and limitations stay visible.
        </p>
        <a className="dataset-link" href={vantorCollectionUrl} target="_blank" rel="noreferrer">
          OPEN VANTOR STAC <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a className="dataset-link secondary-link" href={datasetUrl} target="_blank" rel="noreferrer">
          OPEN PLANET DATASET <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>

      <div className="method-list">
        <div>
          <span>VANTOR COG IMAGERY</span>
          <p>
            Vantor provides georeferenced visual GeoTIFFs as Cloud-Optimized GeoTIFFs (COGs). The site reads their STAC catalog from public S3, then requests imagery only when a layer is selected.
          </p>
        </div>
        <div>
          <span>VANTOR COVERAGE</span>
          <p>
            The collection includes pre-event reference scenes and post-event WV02/WV03 scenes from 27–28 August 2026. Post-event resolution is 1.25–1.97 m; cloud metadata is retained with every scene.
          </p>
        </div>
        <div>
          <span>PLANET VISUAL IMAGERY</span>
          <p>Rendered imagery designed for visual inspection of the landscape and flood corridor.</p>
        </div>
        <div>
          <span>PLANET SURFACE REFLECTANCE</span>
          <p>Pixel values adjusted to better represent conditions at the ground; used for the pre-event product.</p>
        </div>
        <div>
          <span>PLANET TOA RADIANCE</span>
          <p>
            Light measured at the satellite, before atmospheric adjustment; used for the post-event product and not directly comparable numerically with reflectance.
          </p>
        </div>
        <div>
          <span>PLANET UDM2 MASKS</span>
          <p>Quality masks that flag clouds and other unusable pixels.</p>
        </div>
        <div>
          <span>STAC METADATA</span>
          <p>
            Structured records that describe scene dates, geographic footprints, asset links, and quality fields. Both collections use STAC metadata to populate the browsers.
          </p>
        </div>
      </div>
    </section>
  )
}
