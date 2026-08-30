import { fromUrl } from 'geotiff'
import { calculateAoiWindow } from './geoProj'

let workerInstance = null
let workerRequestId = 0
const pendingRequests = new Map()

function getWorker() {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(new URL('../workers/cogWorker.js', import.meta.url), {
        type: 'module'
      })
      workerInstance.onmessage = (event) => {
        const { id, success, url, raw, width, height, rgba, bounds, error } = event.data
        const resolver = pendingRequests.get(id)
        if (!resolver) return
        pendingRequests.delete(id)

        if (!success) {
          resolver.reject(new Error(error || 'Worker render failed'))
          return
        }

        if (raw && rgba) {
          // Render raw pixel buffer to a canvas on main thread if OffscreenCanvas was unavailable in worker
          try {
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            const imgData = ctx.createImageData(width, height)
            imgData.data.set(rgba)
            ctx.putImageData(imgData, 0, 0)
            resolver.resolve({ url: canvas.toDataURL('image/jpeg', 0.92), bounds })
          } catch (canvasErr) {
            resolver.reject(canvasErr)
          }
        } else {
          resolver.resolve({ url, bounds })
        }
      }

      workerInstance.onerror = (err) => {
        console.warn('GeoTIFF Worker error, will fallback:', err)
      }
    } catch (err) {
      console.warn('Failed to initialize GeoTIFF Worker:', err)
      workerInstance = null
    }
  }
  return workerInstance
}

async function renderSentinelCogMainThread(url, bbox, targetWidth = 2048) {
  const tiff = await fromUrl(url)
  const image = await tiff.getImage()
  const aoiBbox = bbox || [85.25, 28.15, 85.55, 28.55]
  const winResult = calculateAoiWindow(image, aoiBbox, targetWidth)

  let width
  let height
  let rasters
  let bounds

  if (winResult.isValid) {
    width = winResult.width
    height = winResult.height
    bounds = winResult.bounds
    rasters = await image.readRasters({
      samples: [0, 1, 2],
      window: winResult.window,
      width,
      height,
      interleave: false,
      resampleMethod: 'bilinear'
    })
  } else {
    const nativeWidth = image.getWidth()
    const scale = Math.min(1, 1400 / nativeWidth)
    width = Math.max(1, Math.round(nativeWidth * scale))
    height = Math.max(1, Math.round(image.getHeight() * scale))
    bounds = [
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]]
    ]
    rasters = await image.readRasters({ samples: [0, 1, 2], width, height, interleave: false })
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const pixels = context.createImageData(width, height)
  for (let index = 0; index < width * height; index += 1) {
    pixels.data[index * 4] = rasters[0][index]
    pixels.data[index * 4 + 1] = rasters[1][index]
    pixels.data[index * 4 + 2] = rasters[2][index]
    pixels.data[index * 4 + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  return { url: canvas.toDataURL('image/jpeg', 0.92), bounds }
}

async function renderVantorCogMainThread(url, bbox, targetWidth = 2048) {
  const tiff = await fromUrl(url)
  const imageCount = await tiff.getImageCount()
  const aoiBbox = bbox || [85.25, 28.15, 85.55, 28.55]

  let selectedImage = null
  let selectedWinResult = null

  for (let index = imageCount - 1; index >= 0; index -= 1) {
    const candidate = await tiff.getImage(index)
    const win = calculateAoiWindow(candidate, aoiBbox, targetWidth)
    if (win.isValid && (win.windowWidth >= targetWidth || index === 0)) {
      selectedImage = candidate
      selectedWinResult = win
      break
    }
  }

  let width
  let height
  let rgb
  let bounds

  if (selectedImage && selectedWinResult?.isValid) {
    width = selectedWinResult.width
    height = selectedWinResult.height
    bounds = selectedWinResult.bounds
    rgb = await selectedImage.readRGB({
      window: selectedWinResult.window,
      width,
      height,
      interleave: true
    })
  } else {
    selectedImage = await tiff.getImage(imageCount - 1)
    for (let index = 1; index < imageCount; index += 1) {
      const candidate = await tiff.getImage(index)
      if (candidate.getWidth() <= 3072) {
        selectedImage = candidate
        break
      }
    }
    width = selectedImage.getWidth()
    height = selectedImage.getHeight()
    bounds = [
      [bbox[1], bbox[0]],
      [bbox[3], bbox[2]]
    ]
    rgb = await selectedImage.readRGB({ width, height, interleave: true })
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const pixels = context.createImageData(width, height)
  for (let index = 0; index < width * height; index += 1) {
    pixels.data[index * 4] = rgb[index * 3]
    pixels.data[index * 4 + 1] = rgb[index * 3 + 1]
    pixels.data[index * 4 + 2] = rgb[index * 3 + 2]
    pixels.data[index * 4 + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  return { url: canvas.toDataURL('image/jpeg', 0.9), bounds }
}

export function renderSentinelCog(url, bbox, targetWidth = 2048) {
  const worker = getWorker()
  if (!worker) {
    return renderSentinelCogMainThread(url, bbox, targetWidth)
  }

  const id = ++workerRequestId
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject })
    worker.postMessage({ id, type: 'sentinel', url, bbox, targetWidth })
    // Timeout safeguard: 15s
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id)
        console.warn('Worker COG request timed out, falling back to main thread')
        renderSentinelCogMainThread(url, bbox, targetWidth).then(resolve).catch(reject)
      }
    }, 15000)
  })
}

export function renderVantorCog(url, bbox, targetWidth = 2048) {
  const worker = getWorker()
  if (!worker) {
    return renderVantorCogMainThread(url, bbox, targetWidth)
  }

  const id = ++workerRequestId
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject })
    worker.postMessage({ id, type: 'vantor', url, bbox, targetWidth })
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id)
        console.warn('Worker Vantor COG request timed out, falling back to main thread')
        renderVantorCogMainThread(url, bbox, targetWidth).then(resolve).catch(reject)
      }
    }, 20000)
  })
}
