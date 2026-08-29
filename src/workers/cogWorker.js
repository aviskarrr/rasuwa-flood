import { fromUrl } from 'geotiff'

self.onmessage = async (event) => {
  const { id, type, url, bbox } = event.data

  try {
    if (type === 'sentinel') {
      const tiff = await fromUrl(url)
      const image = await tiff.getImage()
      const scale = Math.min(1, 1400 / image.getWidth())
      const width = Math.max(1, Math.round(image.getWidth() * scale))
      const height = Math.max(1, Math.round(image.getHeight() * scale))
      const rasters = await image.readRasters({ samples: [0, 1, 2], width, height, interleave: false })

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
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
        const dataUrl = URL.createObjectURL(blob)
        self.postMessage({ id, success: true, url: dataUrl, bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] })
      } else {
        // Fallback: send raw pixel buffer back
        const rgba = new Uint8ClampedArray(width * height * 4)
        for (let i = 0; i < width * height; i += 1) {
          rgba[i * 4] = rasters[0][i]
          rgba[i * 4 + 1] = rasters[1][i]
          rgba[i * 4 + 2] = rasters[2][i]
          rgba[i * 4 + 3] = 255
        }
        self.postMessage({ id, success: true, raw: true, width, height, rgba, bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] }, [rgba.buffer])
      }
    } else if (type === 'vantor') {
      const tiff = await fromUrl(url)
      const imageCount = await tiff.getImageCount()
      let image = await tiff.getImage(imageCount - 1)

      for (let index = 1; index < imageCount; index += 1) {
        const candidate = await tiff.getImage(index)
        if (candidate.getWidth() <= 3072) {
          image = candidate
          break
        }
      }

      const width = image.getWidth()
      const height = image.getHeight()
      const rgb = await image.readRGB({ width, height, interleave: true })

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
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.88 })
        const dataUrl = URL.createObjectURL(blob)
        self.postMessage({ id, success: true, url: dataUrl, bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] })
      } else {
        const rgba = new Uint8ClampedArray(width * height * 4)
        for (let i = 0; i < width * height; i += 1) {
          rgba[i * 4] = rgb[i * 3]
          rgba[i * 4 + 1] = rgb[i * 3 + 1]
          rgba[i * 4 + 2] = rgb[i * 3 + 2]
          rgba[i * 4 + 3] = 255
        }
        self.postMessage({ id, success: true, raw: true, width, height, rgba, bounds: [[bbox[1], bbox[0]], [bbox[3], bbox[2]]] }, [rgba.buffer])
      }
    } else {
      throw new Error(`Unsupported COG render type: ${type}`)
    }
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message || 'Worker COG decode failed' })
  }
}
