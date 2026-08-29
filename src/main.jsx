import React, { lazy, Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Satellite } from 'lucide-react'
import { DataProvider } from './context/DataContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { MapSection } from './components/MapSection'
import { SatelliteOverview } from './components/SatelliteOverview'
import { SceneBrowser } from './components/SceneBrowser'
import { ImpactNotice } from './components/ImpactNotice'
import { DataQuality } from './components/DataQuality'
import { UnderstandingData } from './components/UnderstandingData'
import { Timeline } from './components/Timeline'
import { DataMethods } from './components/DataMethods'
import { Footer } from './components/Footer'
import './styles.css'
import './imagery.css'
import 'leaflet/dist/leaflet.css'

// Code-split Leaflet & GeoTIFF map components behind Suspense (Priority 3)
const VantorImagery = lazy(() => import('./components/VantorImagery'))
const SentinelBrowser = lazy(() => import('./components/SentinelBrowser'))

function MapSectionFallback({ title }) {
  return (
    <div className="map-loading-placeholder" role="status">
      <Satellite size={24} className="spin" aria-hidden="true" />
      <span>INITIALIZING {title} MAP ENGINE...</span>
    </div>
  )
}

export function App() {
  const [satellite, setSatellite] = useState(true)

  return (
    <DataProvider>
      <div className="app">
        <Nav />

        <main>
          <Hero satellite={satellite} />

          <MapSection satellite={satellite} setSatellite={setSatellite} />

          <ErrorBoundary sectionName="Vantor High-Resolution Imagery">
            <Suspense fallback={<MapSectionFallback title="VANTOR HIGH-RES" />}>
              <VantorImagery />
            </Suspense>
          </ErrorBoundary>

          <SatelliteOverview />

          <ErrorBoundary sectionName="PlanetScope Scene Browser">
            <SceneBrowser />
          </ErrorBoundary>

          <ErrorBoundary sectionName="Sentinel-2 Border Archive">
            <Suspense fallback={<MapSectionFallback title="SENTINEL-2" />}>
              <SentinelBrowser />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary sectionName="Casualty & Response Report">
            <ImpactNotice />
          </ErrorBoundary>

          <DataQuality />

          <UnderstandingData />

          <Timeline />

          <DataMethods />
        </main>

        <Footer />
      </div>
    </DataProvider>
  )
}

export default App

createRoot(document.getElementById('root')).render(<App />)
