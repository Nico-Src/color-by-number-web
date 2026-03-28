/**
 * Apply Gaussian blur to ImageData in-place.
 */
export function gaussianBlur(imageData: ImageData, sigma: number): ImageData {
  if (sigma <= 0) return imageData

  const { width, height, data } = imageData
  const radius = Math.ceil(sigma * 3)
  const kernel = makeGaussianKernel(sigma, radius)
  const temp = new Uint8ClampedArray(data.length)

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, wSum = 0
      for (let k = -radius; k <= radius; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + k))
        const off = (y * width + sx) * 4
        const w = kernel[k + radius]
        r += data[off] * w
        g += data[off + 1] * w
        b += data[off + 2] * w
        wSum += w
      }
      const off = (y * width + x) * 4
      temp[off] = r / wSum
      temp[off + 1] = g / wSum
      temp[off + 2] = b / wSum
      temp[off + 3] = data[off + 3]
    }
  }

  // Vertical pass
  const result = new Uint8ClampedArray(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, wSum = 0
      for (let k = -radius; k <= radius; k++) {
        const sy = Math.min(height - 1, Math.max(0, y + k))
        const off = (sy * width + x) * 4
        const w = kernel[k + radius]
        r += temp[off] * w
        g += temp[off + 1] * w
        b += temp[off + 2] * w
        wSum += w
      }
      const off = (y * width + x) * 4
      result[off] = r / wSum
      result[off + 1] = g / wSum
      result[off + 2] = b / wSum
      result[off + 3] = temp[off + 3]
    }
  }

  return new ImageData(result, width, height)
}

function makeGaussianKernel(sigma: number, radius: number): Float64Array {
  const size = radius * 2 + 1
  const kernel = new Float64Array(size)
  const s2 = 2 * sigma * sigma

  for (let i = 0; i < size; i++) {
    const x = i - radius
    kernel[i] = Math.exp(-(x * x) / s2)
  }

  return kernel
}

/**
 * Downscale image data to fit within maxDim while preserving aspect ratio.
 * Uses bilinear interpolation.
 */
export function downscale(imageData: ImageData, maxDim: number): ImageData {
  const { width, height } = imageData
  if (width <= maxDim && height <= maxDim) return imageData

  const scale = maxDim / Math.max(width, height)
  const newWidth = Math.round(width * scale)
  const newHeight = Math.round(height * scale)

  const canvas = new OffscreenCanvas(newWidth, newHeight)
  const ctx = canvas.getContext('2d')!

  // Create temporary canvas with source
  const srcCanvas = new OffscreenCanvas(width, height)
  const srcCtx = srcCanvas.getContext('2d')!
  srcCtx.putImageData(imageData, 0, 0)

  ctx.drawImage(srcCanvas, 0, 0, newWidth, newHeight)
  return ctx.getImageData(0, 0, newWidth, newHeight)
}

/**
 * Load an image file to ImageData via offscreen canvas.
 */
export async function loadImageToData(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

/**
 * Create a thumbnail data URL from ImageData.
 */
export async function createThumbnail(imageData: ImageData, maxDim: number = 200): Promise<string> {
  const scale = maxDim / Math.max(imageData.width, imageData.height)
  const w = Math.round(imageData.width * scale)
  const h = Math.round(imageData.height * scale)

  const srcCanvas = new OffscreenCanvas(imageData.width, imageData.height)
  srcCanvas.getContext('2d')!.putImageData(imageData, 0, 0)

  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(srcCanvas, 0, 0, w, h)

  const blob = await canvas.convertToBlob({ type: 'image/png' })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
