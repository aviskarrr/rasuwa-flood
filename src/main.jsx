import React, { lazy, Suspense, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Satellite } from 'lucide-react'
import { DataProvider } from './context/DataContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LazyMount } from './components/LazyMount'
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

// Code-split Leaflet & GeoTIFF map components behind Suspense
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
          {/* Above-the-fold priority render */}
          <Hero satellite={satellite} />
          <MapSection satellite={satellite} setSatellite={setSatellite} />

          {/* Viewport-gated below-the-fold sections */}
          <LazyMount minHeight="500px">
            <ErrorBoundary sectionName="Vantor High-Resolution Imagery">
              <Suspense fallback={<MapSectionFallback title="VANTOR HIGH-RES" />}>
                <VantorImagery />
              </Suspense>
            </ErrorBoundary>
          </LazyMount>

          <LazyMount minHeight="400px">
            <SatelliteOverview />
          </LazyMount>

          <LazyMount minHeight="450px">
            <ErrorBoundary sectionName="PlanetScope Scene Browser">
              <SceneBrowser />
            </ErrorBoundary>
          </LazyMount>

          <LazyMount minHeight="500px">
            <ErrorBoundary sectionName="Sentinel-2 Border Archive">
              <Suspense fallback={<MapSectionFallback title="SENTINEL-2" />}>
                <SentinelBrowser />
              </Suspense>
            </ErrorBoundary>
          </LazyMount>

          <LazyMount minHeight="350px">
            <ErrorBoundary sectionName="Casualty & Response Report">
              <ImpactNotice />
            </ErrorBoundary>
          </LazyMount>

          <LazyMount minHeight="300px">
            <DataQuality />
          </LazyMount>

          <LazyMount minHeight="350px">
            <UnderstandingData />
          </LazyMount>

          <LazyMount minHeight="400px">
            <Timeline />
          </LazyMount>

          <LazyMount minHeight="350px">
            <DataMethods />
          </LazyMount>
        </main>

        <Footer />
      </div>
    </DataProvider>
  )
}

export default App

createRoot(document.getElementById('root')).render(<App />)
