# Bhote Koshi-Trishuli Flood Dashboard

Interactive satellite observation dashboard for the 26 August 2026 Bhote Koshi-Trishuli flood event in Nepal.

## Run

Requirements: Node.js 20.11 or newer.

```powershell
npm install
npm run dev
```

Open `http://localhost:5173/`.

Create a production build with:

```powershell
npm run build
```

## Data behavior

The scene browser loads both public STAC collections at runtime and discovers all available PlanetScope scenes. It displays public RGB thumbnail assets and scene metadata, including acquisition time, platform, and cloud cover. If the catalog cannot be reached, the interface shows a small cached fallback set and labels it as such.

The Sentinel-2 archive queries the public Earth Search STAC API for August 2026 within a fixed block around Timure and the Rasuwa-China border, including a small section of Tibet. The Leaflet map is locked to that same extent; scene markers and acquisition-date controls update the selected scene metadata. The map and selected-scene preview render the catalog's Level-2A true-color COG when available, while the catalog preview image is used as a fallback.

Casualty and response figures are credited to the [Rasuwa-Bhotekoshi Flood Bulletin](https://nirajbhusal.github.io/rasuwa-flood-bulletin/) and are presented as dated reports, not live counts.

The displayed imagery is from Planet Labs PBC / Planet Disaster Data and is distributed through Source Cooperative under CC-BY-NC-4.0. The post-event scenes have substantial cloud cover, so the dashboard does not present a confirmed flood extent or infer impact figures from imagery alone.

Dataset: https://source.coop/planet/disasterdata/nepal-flash-flood-2026-08-26

License: https://creativecommons.org/licenses/by-nc/4.0/
