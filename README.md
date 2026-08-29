# Bhote Koshi–Trishuli Flood Satellite Observation Dossier

> **FIELDNOTE NEPAL / 01**  
> An open-source, interactive satellite observation dossier and verified impact dashboard for the **26 August 2026 Bhote Koshi–Trishuli flash flood** in Rasuwa, Nepal.

---

## Overview & Concept

`FIELDNOTE NEPAL` is a numbered series of rapid open-data dossiers created to document major hydrometeorological and geohazard events in Nepal using publicly accessible satellite assets (STAC catalogs, Cloud-Optimized GeoTIFFs) alongside verified government SitReps and open bulletins.

- **Entry 01**: 26 August 2026 Bhote Koshi–Trishuli Outburst & Flood Sequence
- **Focus**: Transparent evidence gathering, plain-language satellite literacy, and preserving data caveats (cloud cover limitations, missing vs. casualty distinctions, non-georeferenced schematic clarity).

---

## Key Features

1. **Multi-Sensor STAC Integration**:
   - **PlanetScope (Planet Labs / Source Cooperative)**: Pre-event (27 May 2026) Surface Reflectance and post-event (26 August 2026) TOA Radiance scenes.
   - **Vantor / Maxar Open Data**: High-resolution WorldView-2/3 imagery with client-side COG decoding.
   - **Sentinel-2A (Copernicus / AWS Earth Search)**: August 2026 time series over the Timure–Rasuwa–Tibet corridor.

2. **Web Worker GeoTIFF Decoding**:
   - Heavy GeoTIFF decompression and RGB band rasterization are offloaded to a dedicated Web Worker (`src/workers/cogWorker.js`) with `OffscreenCanvas` rendering to maintain smooth UI performance.

3. **Data Integrity & Dynamic Statistics**:
   - Metrics strips (total scenes, pre/post counts) and cloud-cover ranges are computed dynamically from loaded STAC collections.
   - Casualty and impact figures are pinned to explicit verification timestamps ("Figures fixed as of 27 August 2026 — not auto-updated") with live source status verification against the primary bulletin.

4. **Interactive Comparison**:
   - Split-screen comparison slider wired to active scene selections in the PlanetScope browser.

5. **Accessibility & Code Splitting**:
   - Leaflet map instances and GeoTIFF decoding modules are code-split behind `React.lazy`/`Suspense`.
   - Screen-reader accessible data tables (`.sr-only`) mirror all spatial and temporal coordinates displayed visually on the maps.
   - Component-level React Error Boundaries prevent isolated map or network failures from crashing the dossier.

---

## Getting Started

### Requirements
- Node.js 20.11 or newer

### Installation & Development

```powershell
# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/).

### Running Tests

```powershell
# Execute Vitest test suite
npm test
```

### Production Build

```powershell
# Generate optimized production bundle
npm run build
```

---

## Data Behavior & Integrity Guidelines

- **STAC Catalog Resilience**: Catalogs are queried at runtime. If a remote STAC API is unreachable, the UI surfaces a clear retry control alongside cached fallback scenes.
- **Casualty & Response Data**: Transcribed from the [Rasuwa–Bhotekoshi Flood Bulletin](https://nirajbhusal.github.io/rasuwa-flood-bulletin/) (citing NDRRMA SitRep-3, Nepal Police, Nepal Army, and DHM). These figures are dated records and are not inferred from imagery alone.
- **Imagery Caveats**: Post-event monsoon scenes feature high cloud cover (62–93%). The dashboard avoids delineating a single "confirmed flood boundary" and instead presents observable ground patches as partial evidence.

---

## Datasets & Credits

- **Planet Disaster Data**: Distributed via [Source Cooperative](https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26) under [CC-BY-NC-4.0](https://creativecommons.org/licenses/by-nc/4.0/).
- **Vantor / Maxar Open Data**: Hosted on AWS S3 Open Data.
- **Copernicus Sentinel-2**: Queried via Element 84 Earth Search STAC API.
- **Casualty Reference**: Niraj Bhusal (Rasuwa–Bhotekoshi Flood Bulletin).
