import React from 'react'
import { SectionLabel } from './SectionLabel'

export function UnderstandingData() {
  return (
    <section className="understanding-section section" id="understanding" aria-labelledby="guide-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="04">PLAIN-LANGUAGE GUIDE</SectionLabel>
          <h2 id="guide-heading">
            UNDERSTANDING
            <br />
            <em>THE DATA</em>
          </h2>
        </div>
        <p className="section-copy">
          These images are evidence from satellites, not a complete map of flood damage. Use the source, date, footprint, and cloud conditions together.
        </p>
      </div>

      <div className="understanding-grid">
        <article>
          <h3>Why are there several sources?</h3>
          <p>
            Different satellites pass over the same place at different times. They also see different-sized details and may face different cloud conditions, so no one image tells the whole story.
          </p>
        </article>

        <article>
          <h3>What does cloud cover mean?</h3>
          <p>
            It is the part of a scene the satellite estimates is hidden by cloud. A high value can make an image less useful, although clear patches can still show important detail.
          </p>
        </article>

        <article>
          <h3>What is a GeoTIFF / COG?</h3>
          <p>
            It is a map image file that includes its real-world location. A COG is organised so map tools can request only the part they need instead of downloading the entire file.
          </p>
        </article>

        <article>
          <h3>What are the Planet image types?</h3>
          <p>
            <b>Visual imagery</b> is made to look like a familiar colour photograph. <b>Surface reflectance</b> is adjusted to better represent light at the ground. <b>TOA radiance</b> shows light measured at the satellite, including effects from the atmosphere.
          </p>
        </article>

        <article>
          <h3>How should I use the controls?</h3>
          <p>
            Select a date to inspect one acquisition, or turn on multiple Vantor layers to compare coverage. The timeline helps place each image before or after the event; it does not confirm damage on its own.
          </p>
        </article>

        <article>
          <h3>What does “resolution” mean?</h3>
          <p>
            Resolution is the ground size represented by one pixel. A smaller number of metres means finer detail, but it does not guarantee a cloud-free or complete view.
          </p>
        </article>
      </div>
    </section>
  )
}
