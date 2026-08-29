import { describe, expect, it } from 'vitest'
import {
  AOI_BBOX,
  clampToAoi,
  computeCloudStats,
  fallbackPlanetScenes,
  fallbackSentinelScenes,
  fallbackVantorScenes,
  formatNepalTime,
  formatVantorDate,
  intersectsAoi,
  sceneCenter
} from '../src/lib/stac'

describe('STAC Helpers & Date Formatting', () => {
  it('formats Nepal time correctly with NPT suffix', () => {
    const result = formatNepalTime('2026-08-26T05:44:56Z')
    expect(result).toContain('11:29:56 NPT')
  })

  it('formats Vantor date in uppercase dd MMM yyyy', () => {
    const result = formatVantorDate('2026-08-28T05:12:00Z')
    expect(result).toBe('28 AUG 2026')
  })
})

describe('Sentinel-2 AOI Clamping & Centroid Locking', () => {
  it('clamps large 110x110 km MGRS tile footprints strictly inside AOI_BBOX', () => {
    // A Sentinel-2 tile extending north into Tibet [84.9, 28.0, 86.0, 29.1]
    const largeTibetTile = { bbox: [84.9, 28.0, 86.0, 29.1] }
    const center = sceneCenter(largeTibetTile, 0)
    // AOI is [85.25, 28.15, 85.55, 28.55]
    // Clamped bbox is [85.25, 28.15, 85.55, 28.55]
    // Centroid must be [28.35, 85.40]
    expect(center[0]).toBeGreaterThanOrEqual(AOI_BBOX[1])
    expect(center[0]).toBeLessThanOrEqual(AOI_BBOX[3])
    expect(center[1]).toBeGreaterThanOrEqual(AOI_BBOX[0])
    expect(center[1]).toBeLessThanOrEqual(AOI_BBOX[2])
    expect(center[0]).toBeCloseTo(28.35)
    expect(center[1]).toBeCloseTo(85.40)
  })

  it('correctly detects intersecting and non-intersecting bboxes', () => {
    const overlapping = [85.20, 28.10, 85.30, 28.20] // overlaps bottom-left
    const nonOverlapping = [86.00, 29.00, 86.50, 29.50] // far northeast in Tibet
    expect(intersectsAoi(overlapping)).toBe(true)
    expect(intersectsAoi(nonOverlapping)).toBe(false)
  })

  it('clamps geometry polygon centroids inside AOI', () => {
    const polygonScene = {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.0, 27.5],
            [86.5, 27.5],
            [86.5, 29.5],
            [84.0, 29.5],
            [84.0, 27.5]
          ]
        ]
      }
    }
    const center = sceneCenter(polygonScene, 0)
    expect(center[0]).toBeGreaterThanOrEqual(AOI_BBOX[1])
    expect(center[0]).toBeLessThanOrEqual(AOI_BBOX[3])
    expect(center[1]).toBeGreaterThanOrEqual(AOI_BBOX[0])
    expect(center[1]).toBeLessThanOrEqual(AOI_BBOX[2])
  })

  it('ensures all fallback Sentinel scenes sit inside AOI', () => {
    fallbackSentinelScenes.forEach(scene => {
      const center = sceneCenter(scene, 0)
      expect(center[0]).toBeGreaterThanOrEqual(AOI_BBOX[1])
      expect(center[0]).toBeLessThanOrEqual(AOI_BBOX[3])
      expect(center[1]).toBeGreaterThanOrEqual(AOI_BBOX[0])
      expect(center[1]).toBeLessThanOrEqual(AOI_BBOX[2])
    })
  })
})

describe('Cloud Statistics Calculator', () => {
  it('handles empty scene arrays gracefully', () => {
    const stats = computeCloudStats([])
    expect(stats.count).toBe(0)
    expect(stats.rangeStr).toBe('n/a')
  })

  it('computes min, max, average, and range correctly', () => {
    const sampleScenes = [
      { id: 's1', cloud: 62 },
      { id: 's2', cloud: 75 },
      { id: 's3', cloud: 93 }
    ]
    const stats = computeCloudStats(sampleScenes)
    expect(stats.count).toBe(3)
    expect(stats.min).toBe(62)
    expect(stats.max).toBe(93)
    expect(stats.avg).toBe(77)
    expect(stats.rangeStr).toBe('62–93%')
  })

  it('formats single cloud cover percentage cleanly', () => {
    const sampleScenes = [{ id: 's1', cloud: 45 }]
    const stats = computeCloudStats(sampleScenes)
    expect(stats.rangeStr).toBe('45%')
  })
})

describe('Fallback Datasets Schema Integrity', () => {
  it('provides valid PlanetScope fallback items', () => {
    expect(fallbackPlanetScenes.length).toBeGreaterThan(0)
    fallbackPlanetScenes.forEach(item => {
      expect(item.id).toBeDefined()
      expect(item.phase).toMatch(/PRE-EVENT|POST-EVENT/)
      expect(item.date).toBeDefined()
      expect(item.cloud).toBeTypeOf('number')
    })
  })

  it('provides valid Sentinel-2 fallback items', () => {
    expect(fallbackSentinelScenes.length).toBeGreaterThan(0)
    fallbackSentinelScenes.forEach(item => {
      expect(item.id).toBeDefined()
      expect(item.date).toBeDefined()
      expect(item.cloud).toBeTypeOf('number')
    })
  })

  it('provides valid Vantor fallback items', () => {
    expect(fallbackVantorScenes.length).toBeGreaterThan(0)
    fallbackVantorScenes.forEach(item => {
      expect(item.id).toBeDefined()
      expect(item.date).toBeDefined()
      expect(item.bbox).toHaveLength(4)
    })
  })
})
