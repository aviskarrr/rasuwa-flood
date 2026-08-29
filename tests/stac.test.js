import { describe, expect, it } from 'vitest'
import {
  computeCloudStats,
  fallbackPlanetScenes,
  fallbackSentinelScenes,
  fallbackVantorScenes,
  formatNepalTime,
  formatVantorDate,
  sceneCenter
} from '../src/lib/stac'

describe('STAC Helpers & Date Formatting', () => {
  it('formats Nepal time correctly with NPT suffix', () => {
    // 2026-08-26T05:44:56Z is UTC 05:44:56 -> NPT (+5:45) is 11:29:56 NPT
    const result = formatNepalTime('2026-08-26T05:44:56Z')
    expect(result).toContain('11:29:56 NPT')
  })

  it('formats Vantor date in uppercase dd MMM yyyy', () => {
    const result = formatVantorDate('2026-08-28T05:12:00Z')
    expect(result).toBe('28 AUG 2026')
  })

  it('calculates scene center from explicit center coordinate', () => {
    const scene = { center: [28.15, 85.35] }
    expect(sceneCenter(scene, 0)).toEqual([28.15, 85.35])
  })

  it('calculates scene center from bounding box [minX, minY, maxX, maxY]', () => {
    const scene = { bbox: [85.20, 28.10, 85.40, 28.30] }
    // center should be [(28.10 + 28.30) / 2, (85.20 + 85.40) / 2] = [28.20, 85.30]
    const center = sceneCenter(scene, 0)
    expect(center[0]).toBeCloseTo(28.20)
    expect(center[1]).toBeCloseTo(85.30)
  })

  it('calculates scene center from Polygon geometry coordinates', () => {
    const scene = {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.2, 28.1],
            [85.4, 28.1],
            [85.4, 28.3],
            [85.2, 28.3],
            [85.2, 28.1]
          ]
        ]
      }
    }
    const center = sceneCenter(scene, 0)
    expect(center[0]).toBeCloseTo(28.18, 1)
    expect(center[1]).toBeCloseTo(85.28, 1)
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
