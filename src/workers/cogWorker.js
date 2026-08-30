import { fromUrl } from 'geotiff'
import { calculateAoiWindow } from '../lib/geoProj'

self.onmessage = async (event) => {
  const { id, type, url, bbox } = event.data

  try {
    if (type === 'sentinel') {
      const tiff = await fromUrl(url)
      const image = await tiff.getImage()
      const aoiBbox = bbox || [85.25, 28.15, 85.55, 28.55]
      const winResult = calculateAoiWindow(image, aoiBbox, 2048)

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
        // Fallback to whole tile downsample
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

      if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height)
        const ctx = canvas.getContext('2d')
        const pixels = ctx.createImageData(width, height)
        const total = width * height

        for (let i = 0; i < total; i += 1) {
          pixels.data[i * 4] = rasters[0][i]
          pixels.data[i * 4 + 1] = rasters[1][i]
          pixels.data[i * 4 + 2] = rasters[2][i]
          pixels.data[i * 4 + 3] = 255
        }
        ctx.putImageData(pixels, 0, 0)
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 })
        const dataUrl = URL.createObjectURL(blob)
        self.postMessage({ id, success: true, url: dataUrl, bounds })
      } else {
        // Fallback: send raw pixel buffer back
        const rgba = new Uint8ClampedArray(width * height * 4)
        for (let i = 0; i < width * height; i += 1) {
          rgba[i * 4] = rasters[0][i]
          rgba[i * 4 + 1] = rasters[1][i]
          rgba[i * 4 + 2] = rasters[2][i]
          rgba[i * 4 + 3] = 255
        }
        self.postMessage({ id, success: true, raw: true, width, height, rgba, bounds }, [
          rgba.buffer
        ])
      }
    } else if (type === 'vantor') {
      const tiff = await fromUrl(url)
      const imageCount = await tiff.getImageCount()
      const aoiBbox = bbox || [85.25, 28.15, 85.55, 28.55]

      let selectedImage = null
      let selectedWinResult = null

      for (let index = imageCount - 1; index >= 0; index -= 1) {
        const candidate = await tiff.getImage(index)
        const win = calculateAoiWindow(candidate, aoiBbox, 2048)
        if (win.isValid && (win.windowWidth >= 2048 || index === 0)) {
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

      if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height)
        const ctx = canvas.getContext('2d')
        const pixels = ctx.createImageData(width, height)
        const total = width * height

        for (let i = 0; i < total; i += 1) {
          pixels.data[i * 4] = rgb[i * 3]
          pixels.data[i * 4 + 1] = rgb[i * 3 + 1]
          pixels.data[i * 4 + 2] = rgb[i * 3 + 2]
          pixels.data[i * 4 + 3] = 255
        }
        ctx.putImageData(pixels, 0, 0)
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
        const dataUrl = URL.createObjectURL(blob)
        self.postMessage({ id, success: true, url: dataUrl, bounds })
      } else {
        const rgba = new Uint8ClampedArray(width * height * 4)
        for (let i = 0; i < width * height; i += 1) {
          rgba[i * 4] = rgb[i * 3]
          rgba[i * 4 + 1] = rgb[i * 3 + 1]
          rgba[i * 4 + 2] = rgb[i * 3 + 2]
          rgba[i * 4 + 3] = 255
        }
        self.postMessage({ id, success: true, raw: true, width, height, rgba, bounds }, [
          rgba.buffer
        ])
      }
    } else {
      throw new Error(`Unsupported COG render type: ${type}`)
    }
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message || 'Worker COG decode failed' })
  }
}
