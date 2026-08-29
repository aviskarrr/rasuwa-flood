import React, { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { casualtySourceUrl } from '../lib/stac'
import { SectionLabel } from './SectionLabel'

const timelineEvents = [
  ['26 AUGUST 2026 · 08:37', 'EARTHQUAKE REPORTED IN TIBET', 'The bulletin records a magnitude 4.4 earthquake in the upper catchment before the flood sequence.', 'PRELIMINARY'],
  ['26 AUGUST 2026 · ~08:40', 'UPSTREAM BLOCKAGE / FLOOD TRIGGER', 'Initial accounts describe an ice avalanche or landslide forming and breaching a temporary blockage in Tibet. The cause was not scientifically confirmed as a GLOF.', 'UNDER ASSESSMENT'],
  ['26 AUGUST 2026 · ~09:00', 'FLOOD ENTERS NEPAL AT TIMURE', 'The sudden flood is reported entering Nepal from Tibet at Timure, then moving through the Lende Khola and Bhote Koshi.', 'REPORTED'],
  ['26 AUGUST 2026 · 09:00', 'FIRST LOCAL ALERTS', 'The first flood information reaches local authorities and communities along the corridor.', 'REPORTED'],
  ['26 AUGUST 2026 · 09:10', 'PUBLIC RISK WARNING', 'Risk information begins circulating through media and local channels.', 'WARNING'],
  ['26 AUGUST 2026 · 09:35', 'SMS ALERTS SENT', 'Provincial, district, and local authorities are alerted; Nepal Telecom and Ncell messages warn people in the threatened corridor.', 'WARNING'],
  ['26 AUGUST 2026 · 09:45+', 'AERIAL RESCUE BEGINS', 'Army and private helicopters begin search and rescue operations around Rasuwa and Nuwakot.', 'RESCUE'],
  ['26 AUGUST 2026 · 10:28', 'FLOOD REACHES GHALCHI', 'The Flood Forecasting Division reports the flood at Galchhi, Dhading, with further downstream travel expected.', 'RIVER PROGRESSION'],
  ['26 AUGUST 2026 · 11:26', 'FURKE GAUGE PASSES ALERT LEVEL', 'The Trishuli at Furke rises above the warning level and the downstream corridor is placed on high alert.', 'DHM OBSERVATION'],
  ['26 AUGUST 2026 · 11:43', 'FURKE PASSES DANGER LEVEL', 'The water level at Furke is reported above danger level and rising rapidly; riverside residents are urged to move to safety.', 'DHM OBSERVATION'],
  ['26 AUGUST 2026 · 11:50', 'FLOOD REACHES MALEKHU', 'The bulletin reports the flood reaching Malekhu. The Furke station and a suspension bridge are swept away after a reported 10.8 m reading.', 'RIVER PROGRESSION'],
  ['26 AUGUST 2026 · ~12:58', 'FLOOD APPROACHES CHITWAN', 'Chitwan officials report the flood near the district and around Fishling; coastal settlements begin moving residents.', 'EVACUATION'],
  ['26 AUGUST 2026 · 13:23', 'MAJOR HIGHWAYS CLOSED', 'Police close the Prithvi Highway and Muglin–Narayanghat road until further notice while river-side travel is discouraged.', 'RESPONSE'],
  ['26 AUGUST 2026 · 15:20', 'FLOOD REACHES DEVGHAT', 'The Flood Forecasting Division reports the flood reaching Narayani–Devghat. The day’s high level is later recorded at 6.57 m around 16:00.', 'DHM OBSERVATION'],
  ['26 AUGUST 2026 · ~15:45', 'SUSTA RESIDENTS RELOCATED', 'Around 70% of residents in Susta are reported moved to safer locations; the bulletin notes that flood arrival there was not confirmed.', 'EVACUATION'],
  ['26 AUGUST 2026 · 19:00', 'NATIONAL RESPONSE BRIEFING', 'The Prime Minister’s Office reports 484 tourists unaccounted for and coordinates search, rescue, relief, and support across six affected districts.', 'GOVERNMENT RESPONSE'],
  ['26 AUGUST 2026 · 22:00', 'NDRRMA SITREP-3 PUBLISHED', 'Situation Report 3 records 245 officially missing, 75 injured, 116 aerial rescues, 93 ground rescues, 80 bridges damaged, and 40 km of paved road destroyed.', 'OFFICIAL UPDATE'],
  ['27 AUGUST 2026 · 13:00', 'INDIAN CITIZENS RESCUED', 'The bulletin records 21 Indian citizens rescued by this update; rescue lists remain separate and are not subtracted from missing-person lists automatically.', 'RESCUE'],
  ['27 AUGUST 2026 · 13:30–13:40', 'KATHMANDU HELICOPTER TRANSFERS', 'Prabhu Air brings five people from Syabrubesi and Augusta Air brings six from Dhunche to Kathmandu.', 'RESCUE'],
  ['27 AUGUST 2026 · MORNING', 'ARMY RESCUE UPDATE', 'The Nepal Army reports 123 helicopter rescues, including 95 from Timure and seven people alive from the Haku hydropower tunnel.', 'OFFICIAL UPDATE']
]

export function Timeline() {
  const [openTimeline, setOpenTimeline] = useState(1)

  return (
    <section className="timeline-section section" id="timeline" aria-labelledby="timeline-heading">
      <div className="section-top">
        <div>
          <SectionLabel number="06">SEQUENCE OF EVENTS</SectionLabel>
          <h2 id="timeline-heading">
            EVENT
            <br />
            <em>TIMELINE</em>
          </h2>
        </div>
        <p className="section-copy">
          A reconstruction of the flood, warnings, response, and later updates. Times are Nepal Time unless marked approximate.
        </p>
      </div>

      <div className="timeline">
        <div className="timeline-line" aria-hidden="true" />
        {timelineEvents.map((item, i) => {
          const isOpen = openTimeline === i
          return (
            <button
              className={`timeline-item ${isOpen ? 'open' : ''}`}
              key={item[1]}
              onClick={() => setOpenTimeline(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-date">{item[0]}</div>
              <div className="timeline-main">
                <strong>{item[1]}</strong>
                <span className="timeline-tag">{item[3]}</span>
                {isOpen && <p>{item[2]}</p>}
              </div>
              <ChevronDown size={18} className="timeline-chevron" aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <p className="timeline-source">
        Timeline compiled from the{' '}
        <a href={casualtySourceUrl} target="_blank" rel="noreferrer">
          Rasuwa–Bhotekoshi Flood Bulletin by Niraj Bhusal <ExternalLink size={11} aria-hidden="true" />
        </a>
        , including DHM, NDRRMA, Nepal Police, Nepal Army, district administration, and government updates. Some times are approximate or represent later reporting of an earlier event.
      </p>
    </section>
  )
}
