import type { RGBColor, LabColor, ProgressCallback } from './types'

// ---- Color space conversion ----

export function rgbToLab(c: RGBColor): LabColor {
  // RGB -> linear sRGB
  let r = c.r / 255
  let g = c.g / 255
  let b = c.b / 255

  r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92
  g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92
  b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92

  // linear sRGB -> XYZ (D65)
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047
  let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750)
  let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883

  const eps = 0.008856
  const kappa = 903.3

  x = x > eps ? x ** (1 / 3) : (kappa * x + 16) / 116
  y = y > eps ? y ** (1 / 3) : (kappa * y + 16) / 116
  z = z > eps ? z ** (1 / 3) : (kappa * z + 16) / 116

  return {
    L: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  }
}

export function labToRgb(lab: LabColor): RGBColor {
  const y = (lab.L + 16) / 116
  const x = lab.a / 500 + y
  const z = y - lab.b / 200

  const eps = 0.008856
  const kappa = 903.3

  const x3 = x ** 3
  const z3 = z ** 3
  const y3 = y ** 3

  const xr = x3 > eps ? x3 : (116 * x - 16) / kappa
  const yr = lab.L > kappa * eps ? y3 : lab.L / kappa
  const zr = z3 > eps ? z3 : (116 * z - 16) / kappa

  // XYZ -> linear sRGB
  const lr = xr * 0.95047
  const mg = yr * 1.0
  const nr = zr * 1.08883

  let r = lr * 3.2404542 + mg * -1.5371385 + nr * -0.4985314
  let g = lr * -0.9692660 + mg * 1.8760108 + nr * 0.0415560
  let b = lr * 0.0556434 + mg * -0.2040259 + nr * 1.0572252

  // Gamma
  r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r
  g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g
  b = b > 0.0031308 ? 1.055 * b ** (1 / 2.4) - 0.055 : 12.92 * b

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255))),
  }
}

function labDistSq(a: LabColor, b: LabColor): number {
  const dL = a.L - b.L
  const da = a.a - b.a
  const db = a.b - b.b
  return dL * dL + da * da + db * db
}

// ---- K-Means++ in Lab color space ----

function initKMeansPP(pixels: LabColor[], k: number): LabColor[] {
  const centroids: LabColor[] = []
  const n = pixels.length

  // Pick first centroid randomly
  centroids.push({ ...pixels[Math.floor(Math.random() * n)] })

  const dists = new Float64Array(n).fill(Infinity)

  for (let c = 1; c < k; c++) {
    const last = centroids[c - 1]
    let totalDist = 0
    for (let i = 0; i < n; i++) {
      const d = labDistSq(pixels[i], last)
      if (d < dists[i]) dists[i] = d
      totalDist += dists[i]
    }

    // Weighted random selection
    let target = Math.random() * totalDist
    let idx = 0
    for (let i = 0; i < n; i++) {
      target -= dists[i]
      if (target <= 0) { idx = i; break }
    }
    centroids.push({ ...pixels[idx] })
  }

  return centroids
}

/** Yields to main thread periodically */
function yieldToMain(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export async function quantize(
  imageData: ImageData,
  k: number,
  onProgress?: ProgressCallback,
): Promise<{ palette: RGBColor[]; indexGrid: Uint16Array }> {
  const { data, width, height } = imageData
  const totalPixels = width * height

  onProgress?.('Converting colors…', 0)

  // Convert all pixels to Lab
  const pixels: LabColor[] = new Array(totalPixels)
  for (let i = 0; i < totalPixels; i++) {
    const off = i * 4
    pixels[i] = rgbToLab({ r: data[off], g: data[off + 1], b: data[off + 2] })
    if (i % 50000 === 0) {
      onProgress?.('Converting colors…', (i / totalPixels) * 30)
      await yieldToMain()
    }
  }

  onProgress?.('Analyzing colors…', 30)

  // K-Means++ init
  let centroids = initKMeansPP(pixels, k)
  const assignments = new Uint16Array(totalPixels)

  const maxIter = 20
  for (let iter = 0; iter < maxIter; iter++) {
    onProgress?.('Analyzing colors…', 30 + (iter / maxIter) * 60)

    // Assignment step
    let changed = 0
    for (let i = 0; i < totalPixels; i++) {
      let bestDist = Infinity
      let bestIdx = 0
      for (let c = 0; c < k; c++) {
        const d = labDistSq(pixels[i], centroids[c])
        if (d < bestDist) { bestDist = d; bestIdx = c }
      }
      if (assignments[i] !== bestIdx) { changed++ }
      assignments[i] = bestIdx
    }

    // Check convergence
    if (changed === 0) break

    // Update step
    const sums: LabColor[] = Array.from({ length: k }, () => ({ L: 0, a: 0, b: 0 }))
    const counts = new Uint32Array(k)
    for (let i = 0; i < totalPixels; i++) {
      const c = assignments[i]
      sums[c].L += pixels[i].L
      sums[c].a += pixels[i].a
      sums[c].b += pixels[i].b
      counts[c]++
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        centroids[c] = {
          L: sums[c].L / counts[c],
          a: sums[c].a / counts[c],
          b: sums[c].b / counts[c],
        }
      }
    }

    await yieldToMain()
  }

  onProgress?.('Building palette…', 90)

  // Convert centroids back to RGB
  const palette = centroids.map(c => labToRgb(c))

  // Handle case where some clusters are empty — reassign to nearest non-empty
  const usedIndices = new Set<number>()
  for (let i = 0; i < totalPixels; i++) usedIndices.add(assignments[i])

  const finalPalette: RGBColor[] = []
  const indexRemap = new Map<number, number>()
  let newIdx = 0
  for (let c = 0; c < k; c++) {
    if (usedIndices.has(c)) {
      indexRemap.set(c, newIdx)
      finalPalette.push(palette[c])
      newIdx++
    }
  }

  const indexGrid = new Uint16Array(totalPixels)
  for (let i = 0; i < totalPixels; i++) {
    indexGrid[i] = indexRemap.get(assignments[i]) ?? 0
  }

  onProgress?.('Palette complete', 100)
  return { palette: finalPalette, indexGrid }
}
