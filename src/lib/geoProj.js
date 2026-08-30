/**
 * Geographic and UTM coordinate projection utilities for satellite COG rendering.
 */

// WGS84 Ellipsoid constants
const WGS84_A = 6378137.0
const WGS84_F = 1 / 298.257223563
const WGS84_E2 = 2 * WGS84_F - WGS84_F * WGS84_F
const WGS84_EP2 = WGS84_E2 / (1 - WGS84_E2)
const UTM_K0 = 0.9996

/**
 * Convert Latitude and Longitude (WGS84 degrees) to UTM coordinates (Easting/Northing in meters).
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lon - Longitude in degrees (-180 to 180)
 * @param {number} zone - UTM Zone (1 to 60, default 45 for Nepal)
 * @param {boolean} north - True for northern hemisphere, false for southern
 * @returns {[number, number]} [easting, northing] in meters
 */
export function latLonToUtm(lat, lon, zone = 45, north = true) {
  const latRad = (lat * Math.PI) / 180
  const lonRad = (lon * Math.PI) / 180
  const lon0Rad = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180)

  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * Math.sin(latRad) * Math.sin(latRad))
  const T = Math.tan(latRad) * Math.tan(latRad)
  const C = WGS84_EP2 * Math.cos(latRad) * Math.cos(latRad)
  const A = Math.cos(latRad) * (lonRad - lon0Rad)

  const M =
    WGS84_A *
    ((1 - WGS84_E2 / 4 - (3 * WGS84_E2 * WGS84_E2) / 64 - (5 * Math.pow(WGS84_E2, 3)) / 256) * latRad -
      ((3 * WGS84_E2) / 8 + (3 * WGS84_E2 * WGS84_E2) / 32 + (45 * Math.pow(WGS84_E2, 3)) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * WGS84_E2 * WGS84_E2) / 256 + (45 * Math.pow(WGS84_E2, 3)) / 1024) * Math.sin(4 * latRad) -
      ((35 * Math.pow(WGS84_E2, 3)) / 3072) * Math.sin(6 * latRad))

  const x =
    UTM_K0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * WGS84_EP2) * Math.pow(A, 5)) / 120) +
    500000

  const y =
    UTM_K0 *
      (M +
        N *
          Math.tan(latRad) *
          (Math.pow(A, 2) / 2 +
            ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
            ((61 - 58 * T + T * T + 600 * C - 330 * WGS84_EP2) * Math.pow(A, 6)) / 720)) +
    (north ? 0 : 10000000)

  return [x, y]
}

/**
 * Convert UTM Easting and Northing in meters to Latitude and Longitude (WGS84 degrees).
 * @param {number} x - Easting in meters
 * @param {number} y - Northing in meters
 * @param {number} zone - UTM Zone (1 to 60, default 45)
 * @param {boolean} north - True for northern hemisphere
 * @returns {[number, number]} [latitude, longitude] in degrees
 */
export function utmToLatLon(x, y, zone = 45, north = true) {
  const e1 = (1 - Math.sqrt(1 - WGS84_E2)) / (1 + Math.sqrt(1 - WGS84_E2))
  const xAdj = x - 500000
  const yAdj = north ? y : y - 10000000
  const M = yAdj / UTM_K0
  const mu =
    M /
    (WGS84_A * (1 - WGS84_E2 / 4 - (3 * WGS84_E2 * WGS84_E2) / 64 - (5 * Math.pow(WGS84_E2, 3)) / 256))

  const phi1Rad =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * Math.pow(e1, 2)) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu)

  const N1 = WGS84_A / Math.sqrt(1 - WGS84_E2 * Math.sin(phi1Rad) * Math.sin(phi1Rad))
  const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad)
  const C1 = WGS84_EP2 * Math.cos(phi1Rad) * Math.cos(phi1Rad)
  const R1 =
    (WGS84_A * (1 - WGS84_E2)) / Math.pow(1 - WGS84_E2 * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5)
  const D = xAdj / (N1 * UTM_K0)

  const latRad =
    phi1Rad -
    ((N1 * Math.tan(phi1Rad)) / R1) *
      (Math.pow(D, 2) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * WGS84_EP2) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * WGS84_EP2 - 3 * C1 * C1) * Math.pow(D, 6)) /
          720)

  const lon0Rad = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180)
  const lonRad =
    lon0Rad +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * WGS84_EP2 + 24 * T1 * T1) * Math.pow(D, 5)) / 120) /
      Math.cos(phi1Rad)

  return [(latRad * 180) / Math.PI, (lonRad * 180) / Math.PI]
}

/**
 * Determine UTM Zone and hemisphere from an EPSG code or default to Zone 45N (Nepal).
 * @param {number} [epsg]
 * @param {number} [lon=85.4]
 * @returns {{ zone: number, north: boolean }}
 */
export function parseUtmZone(epsg, lon = 85.4) {
  if (typeof epsg === 'number') {
    if (epsg >= 32601 && epsg <= 32660) {
      return { zone: epsg - 32600, north: true }
    }
    if (epsg >= 32701 && epsg <= 32760) {
      return { zone: epsg - 32700, north: false }
    }
  }
  const calculatedZone = Math.floor((lon + 180) / 6) + 1
  return { zone: calculatedZone, north: true }
}

/**
 * Compute the raster window and output Leaflet bounding box for a given AOI [minLon, minLat, maxLon, maxLat].
 * @param {object} image - geotiff image instance
 * @param {[number, number, number, number]} aoiBbox - [minLon, minLat, maxLon, maxLat] in WGS84
 * @param {number} [targetWidth=2048]
 * @returns {{ isValid: boolean, window?: [number, number, number, number], width?: number, height?: number, bounds?: [[number, number], [number, number]], isUtm?: boolean }}
 */
export function calculateAoiWindow(image, aoiBbox, targetWidth = 2048) {
  const [tileMinX, tileMinY, tileMaxX, tileMaxY] = image.getBoundingBox()
  const nativeWidth = image.getWidth()
  const nativeHeight = image.getHeight()

  const geoKeys = typeof image.getGeoKeys === 'function' ? image.getGeoKeys() : {}
  const epsg = geoKeys.ProjectedCSTypeGeoKey || image.fileDirectory?.ProjectedCSTypeGeoKey

  // Check if image is in UTM projected meters (coordinates > 1000 or EPSG in 326xx/327xx)
  const isUtm =
    (typeof epsg === 'number' && ((epsg >= 32601 && epsg <= 32660) || (epsg >= 32701 && epsg <= 32760))) ||
    tileMinX > 1000 ||
    tileMaxX > 1000

  let aoiMinX = aoiBbox[0]
  let aoiMinY = aoiBbox[1]
  let aoiMaxX = aoiBbox[2]
  let aoiMaxY = aoiBbox[3]

  const { zone, north } = parseUtmZone(epsg, (aoiBbox[0] + aoiBbox[2]) / 2)

  if (isUtm) {
    const [utmMinX, utmMinY] = latLonToUtm(aoiBbox[1], aoiBbox[0], zone, north)
    const [utmMaxX, utmMaxY] = latLonToUtm(aoiBbox[3], aoiBbox[2], zone, north)
    aoiMinX = utmMinX
    aoiMinY = utmMinY
    aoiMaxX = utmMaxX
    aoiMaxY = utmMaxY
  }

  // Intersect AOI with tile bounding box
  const cropMinX = Math.max(tileMinX, Math.min(aoiMinX, aoiMaxX))
  const cropMaxX = Math.min(tileMaxX, Math.max(aoiMinX, aoiMaxX))
  const cropMinY = Math.max(tileMinY, Math.min(aoiMinY, aoiMaxY))
  const cropMaxY = Math.min(tileMaxY, Math.max(aoiMinY, aoiMaxY))

  if (cropMinX >= cropMaxX || cropMinY >= cropMaxY) {
    return { isValid: false }
  }

  const xScale = nativeWidth / (tileMaxX - tileMinX)
  const yScale = nativeHeight / (tileMaxY - tileMinY)

  const left = Math.max(0, Math.floor((cropMinX - tileMinX) * xScale))
  const right = Math.min(nativeWidth, Math.ceil((cropMaxX - tileMinX) * xScale))
  const top = Math.max(0, Math.floor((tileMaxY - cropMaxY) * yScale))
  const bottom = Math.min(nativeHeight, Math.ceil((tileMaxY - cropMinY) * yScale))

  const window = [left, top, right, bottom]
  const windowWidth = right - left
  const windowHeight = bottom - top

  if (windowWidth <= 0 || windowHeight <= 0) {
    return { isValid: false }
  }

  const scale = Math.min(1, targetWidth / windowWidth)
  const width = Math.max(1, Math.round(windowWidth * scale))
  const height = Math.max(1, Math.round(windowHeight * scale))

  let bounds
  if (isUtm) {
    const [swLat, swLon] = utmToLatLon(cropMinX, cropMinY, zone, north)
    const [neLat, neLon] = utmToLatLon(cropMaxX, cropMaxY, zone, north)
    bounds = [
      [swLat, swLon],
      [neLat, neLon]
    ]
  } else {
    bounds = [
      [cropMinY, cropMinX],
      [cropMaxY, cropMaxX]
    ]
  }

  return {
    isValid: true,
    window,
    width,
    height,
    bounds,
    windowWidth,
    windowHeight,
    isUtm
  }
}
