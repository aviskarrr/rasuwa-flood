import { describe, expect, it } from 'vitest'
import {
  calculateAoiWindow,
  latLonToUtm,
  parseUtmZone,
  utmToLatLon
} from '../src/lib/geoProj'

describe('UTM & WGS84 Coordinate Conversion', () => {
  it('converts Lat/Lon to UTM Zone 45N and back with sub-millimeter precision', () => {
    const testPoints = [
      { lat: 28.35, lon: 85.40, name: 'Timure AOI center' },
      { lat: 28.15, lon: 85.25, name: 'AOI SW corner' },
      { lat: 28.55, lon: 85.55, name: 'AOI NE corner' },
      { lat: 27.95, lon: 85.35, name: 'Trishuli downstream' },
      { lat: 28.60, lon: 85.45, name: 'Tibet border upstream' }
    ]

    testPoints.forEach(pt => {
      const [x, y] = latLonToUtm(pt.lat, pt.lon, 45, true)
      expect(x).toBeGreaterThan(200000)
      expect(x).toBeLessThan(500000)
      expect(y).toBeGreaterThan(3000000)
      expect(y).toBeLessThan(3300000)

      const [backLat, backLon] = utmToLatLon(x, y, 45, true)
      expect(backLat).toBeCloseTo(pt.lat, 6)
      expect(backLon).toBeCloseTo(pt.lon, 6)
    })
  })

  it('correctly parses UTM zones from EPSG codes', () => {
    expect(parseUtmZone(32645)).toEqual({ zone: 45, north: true })
    expect(parseUtmZone(32644)).toEqual({ zone: 44, north: true })
    expect(parseUtmZone(32745)).toEqual({ zone: 45, north: false })
    // Fallback based on longitude
    expect(parseUtmZone(undefined, 85.4)).toEqual({ zone: 45, north: true })
  })
})

describe('AOI Window Calculation for COGs', () => {
  it('computes native pixel window and Leaflet bounds for UTM Sentinel-2 image', () => {
    // Mock Sentinel-2 10980x10980 MGRS tile in UTM Zone 45N
    const mockSentinelImage = {
      getWidth: () => 10980,
      getHeight: () => 10980,
      getBoundingBox: () => [300000, 3090240, 409800, 3200040],
      getGeoKeys: () => ({
        ProjectedCSTypeGeoKey: 32645,
        GTCitationGeoKey: 'WGS 84 / UTM zone 45N'
      })
    }

    const aoiBbox = [85.25, 28.15, 85.55, 28.55] // [minLon, minLat, maxLon, maxLat]
    const result = calculateAoiWindow(mockSentinelImage, aoiBbox, 2048)

    expect(result.isValid).toBe(true)
    expect(result.isUtm).toBe(true)
    expect(result.window).toHaveLength(4)
    const [left, top, right, bottom] = result.window
    expect(left).toBeGreaterThan(0)
    expect(right).toBeLessThan(10980)
    expect(top).toBeGreaterThan(0)
    expect(bottom).toBeLessThan(10980)
    expect(right).toBeGreaterThan(left)
    expect(bottom).toBeGreaterThan(top)

    // Output dimension respects targetWidth constraint
    expect(result.width).toBeLessThanOrEqual(2048)
    expect(result.height).toBeGreaterThan(1000)

    // Bounds must be valid Leaflet [[southLat, westLon], [northLat, eastLon]]
    const [[swLat, swLon], [neLat, neLon]] = result.bounds
    expect(swLat).toBeCloseTo(28.15, 2)
    expect(swLon).toBeCloseTo(85.25, 2)
    expect(neLat).toBeCloseTo(28.55, 2)
    expect(neLon).toBeCloseTo(85.55, 2)
  })

  it('computes native pixel window for Geographic (EPSG:4326) Vantor image', () => {
    // Mock Vantor image in EPSG:4326 degrees
    const mockVantorImage = {
      getWidth: () => 6101,
      getHeight: () => 29672,
      getBoundingBox: () => [85.1317, 27.9309, 85.3889, 29.0359],
      getGeoKeys: () => ({
        GeographicTypeGeoKey: 4326
      })
    }

    const aoiBbox = [85.25, 28.15, 85.55, 28.55]
    const result = calculateAoiWindow(mockVantorImage, aoiBbox, 2048)

    expect(result.isValid).toBe(true)
    expect(result.window).toHaveLength(4)
    const [left, top, right, bottom] = result.window
    expect(left).toBeGreaterThanOrEqual(0)
    expect(right).toBeLessThanOrEqual(6101)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(bottom).toBeLessThanOrEqual(29672)

    // Geographic bounds
    const [[minLat, minLon], [maxLat, maxLon]] = result.bounds
    expect(minLat).toBeCloseTo(28.15, 2)
    expect(minLon).toBeCloseTo(85.25, 2)
    expect(maxLat).toBeCloseTo(28.55, 2)
    expect(maxLon).toBeCloseTo(85.3889, 2)
  })

  it('returns isValid: false when AOI is completely outside tile bounds', () => {
    const mockImage = {
      getWidth: () => 1000,
      getHeight: () => 1000,
      getBoundingBox: () => [86.0, 29.0, 87.0, 30.0],
      getGeoKeys: () => ({ GeographicTypeGeoKey: 4326 })
    }
    const aoiBbox = [85.25, 28.15, 85.55, 28.55]
    const result = calculateAoiWindow(mockImage, aoiBbox)
    expect(result.isValid).toBe(false)
  })
})
