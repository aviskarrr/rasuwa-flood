# Contributing to Fieldnote Nepal

Thank you for your interest in contributing to the **Fieldnote Nepal** series.

## Mission & Series Concept

`FIELDNOTE NEPAL` is an open-access disaster observation series created to document and verify extreme geohazard and flood events across Nepal using open satellite data (STAC / Cloud-Optimized GeoTIFFs) and official situational reports.

Each entry in the series represents an open, verifiable dossier:
- **`FIELDNOTE NEPAL / 01`**: 26 August 2026 Bhote Koshi–Trishuli Flood
- **Upcoming Entries**: Rapid post-event observation dossiers for major landslide, GLOF, and monsoon flash flood events in Nepal.

---

## Core Guidelines for Contributors

### 1. Data Integrity & Scientific Rigor
- **Never infer casualties or damage boundaries from raw satellite imagery alone.** Always attribute figures to dated official reports (NDRRMA, Nepal Police, DHM).
- **Preserve cloud-cover and resolution caveats.** Cloud obstruction must always be quantified and displayed with each scene.
- **Differentiate product types**: Surface Reflectance vs. TOA Radiance vs. Visual RGB thumbnails.

### 2. Code Architecture & Component Standards
- Keep components modular under `src/components/`.
- Offload heavy computation (GeoTIFF band parsing, raster decompression) to Web Workers (`src/workers/cogWorker.js`).
- Ensure all map visualizations have screen-reader accessible fallback tables (`.sr-only`).
- Wrap dynamic/interactive components in `<ErrorBoundary>`.

### 3. Testing
- Add unit tests for date conversions, coordinate centroids, and data aggregations in `tests/`.
- Ensure `npm test` passes before opening pull requests.

---

## License & Attribution

- Code is released under the MIT License.
- Satellite assets and metadata retain their respective upstream licenses (e.g. CC-BY-NC-4.0 for Planet Disaster Data).
