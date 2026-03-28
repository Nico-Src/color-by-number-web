/**
 * Region Detection — Connected-component labeling via union-find.
 *
 * Takes the quantized pixel grid and groups contiguous same-color pixels
 * into discrete regions using a two-pass algorithm:
 * 1. Union phase: merge adjacent pixels with the same color index (4-connectivity)
 * 2. Label phase: collect per-region metadata (bbox, centroid, pixel count)
 * 3. Merge phase: absorb tiny regions into their largest neighbor
 *
 * Small region merging reduces visual clutter and avoids impractical
 * single-pixel puzzle regions.
 */
import type { ProgressCallback } from './types'

/** Union-Find (disjoint-set) with path compression and union by rank */
class UnionFind {
  parent: Uint32Array
  rank: Uint8Array

  constructor(size: number) {
    this.parent = new Uint32Array(size)
    this.rank = new Uint8Array(size)
    for (let i = 0; i < size; i++) this.parent[i] = i
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]
      x = this.parent[x]
    }
    return x
  }

  union(a: number, b: number): void {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return
    if (this.rank[ra] < this.rank[rb]) {
      this.parent[ra] = rb
    } else if (this.rank[ra] > this.rank[rb]) {
      this.parent[rb] = ra
    } else {
      this.parent[rb] = ra
      this.rank[ra]++
    }
  }
}

export interface RegionInfo {
  id: number
  colorIndex: number
  pixelCount: number
  bbox: { x: number; y: number; w: number; h: number }
  centroidX: number
  centroidY: number
  /** Indices of pixels belonging to this region */
  pixels: number[]
}

function yieldToMain(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Connected-component labeling using union-find.
 * Returns region grid (pixel -> region id) and region info list.
 */
export async function regionize(
  indexGrid: Uint16Array,
  width: number,
  height: number,
  minRegionSize: number,
  onProgress?: ProgressCallback,
): Promise<{ regionGrid: Uint32Array; regions: RegionInfo[] }> {
  const total = width * height
  const uf = new UnionFind(total)

  onProgress?.('Detecting regions…', 0)

  // Pass 1: union connected pixels with same color (4-connectivity)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const color = indexGrid[idx]

      // Right neighbor
      if (x + 1 < width && indexGrid[idx + 1] === color) {
        uf.union(idx, idx + 1)
      }
      // Bottom neighbor
      if (y + 1 < height && indexGrid[idx + width] === color) {
        uf.union(idx, idx + width)
      }
    }
    if (y % 100 === 0) {
      onProgress?.('Detecting regions…', (y / height) * 40)
      await yieldToMain()
    }
  }

  onProgress?.('Labeling regions…', 40)

  // Pass 2: collect component info
  const rootToRegion = new Map<number, number>()
  const regions: RegionInfo[] = []

  for (let i = 0; i < total; i++) {
    const root = uf.find(i)
    if (!rootToRegion.has(root)) {
      const regionId = regions.length
      rootToRegion.set(root, regionId)
      const x = i % width
      const y = Math.floor(i / width)
      regions.push({
        id: regionId + 1,
        colorIndex: indexGrid[i],
        pixelCount: 0,
        bbox: { x, y, w: 0, h: 0 },
        centroidX: 0,
        centroidY: 0,
        pixels: [],
      })
    }
  }

  // Build region grid and compute metadata
  const regionGrid = new Uint32Array(total)
  const bboxMin = regions.map(() => ({ x: Infinity, y: Infinity }))
  const bboxMax = regions.map(() => ({ x: -Infinity, y: -Infinity }))

  for (let i = 0; i < total; i++) {
    const root = uf.find(i)
    const rIdx = rootToRegion.get(root)!
    regionGrid[i] = rIdx
    const region = regions[rIdx]
    const px = i % width
    const py = Math.floor(i / width)

    region.pixelCount++
    region.centroidX += px
    region.centroidY += py
    region.pixels.push(i)

    if (px < bboxMin[rIdx].x) bboxMin[rIdx].x = px
    if (py < bboxMin[rIdx].y) bboxMin[rIdx].y = py
    if (px > bboxMax[rIdx].x) bboxMax[rIdx].x = px
    if (py > bboxMax[rIdx].y) bboxMax[rIdx].y = py

    if (i % 100000 === 0) {
      onProgress?.('Labeling regions…', 40 + (i / total) * 20)
      await yieldToMain()
    }
  }

  // Finalize bboxes and centroids
  for (let r = 0; r < regions.length; r++) {
    const region = regions[r]
    if (region.pixelCount > 0) {
      region.centroidX = Math.round(region.centroidX / region.pixelCount)
      region.centroidY = Math.round(region.centroidY / region.pixelCount)
      region.bbox = {
        x: bboxMin[r].x,
        y: bboxMin[r].y,
        w: bboxMax[r].x - bboxMin[r].x + 1,
        h: bboxMax[r].y - bboxMin[r].y + 1,
      }
    }
  }

  onProgress?.('Merging small regions…', 60)

  // Merge small regions
  await mergeSmallRegions(regionGrid, regions, indexGrid, width, height, minRegionSize, onProgress)

  onProgress?.('Regions complete', 100)
  return { regionGrid, regions }
}

/**
 * Merge regions smaller than minSize into their neighbor with the longest
 * shared border. Repeats until no region is below the threshold (max 50 passes
 * to prevent infinite loops on degenerate inputs).
 */
async function mergeSmallRegions(
  regionGrid: Uint32Array,
  regions: RegionInfo[],
  indexGrid: Uint16Array,
  width: number,
  height: number,
  minSize: number,
  onProgress?: ProgressCallback,
): Promise<void> {
  const total = width * height
  let changed = true
  let pass = 0

  while (changed && pass < 50) {
    changed = false
    pass++

    for (let r = 0; r < regions.length; r++) {
      const region = regions[r]
      if (region.pixelCount === 0 || region.pixelCount >= minSize) continue

      // Find neighboring region with longest shared border
      const neighborBorder = new Map<number, number>()

      for (const pixIdx of region.pixels) {
        const px = pixIdx % width
        const py = Math.floor(pixIdx / width)

        const neighbors = [
          py > 0 ? (py - 1) * width + px : -1,
          py < height - 1 ? (py + 1) * width + px : -1,
          px > 0 ? py * width + (px - 1) : -1,
          px < width - 1 ? py * width + (px + 1) : -1,
        ]

        for (const ni of neighbors) {
          if (ni >= 0 && ni < total) {
            const nRegion = regionGrid[ni]
            if (nRegion !== r && regions[nRegion].pixelCount > 0) {
              neighborBorder.set(nRegion, (neighborBorder.get(nRegion) ?? 0) + 1)
            }
          }
        }
      }

      if (neighborBorder.size === 0) continue

      // Find neighbor with longest border
      let bestNeighbor = -1
      let bestBorder = 0
      for (const [nId, border] of neighborBorder) {
        if (border > bestBorder) {
          bestBorder = border
          bestNeighbor = nId
        }
      }

      if (bestNeighbor < 0) continue

      // Merge current region into bestNeighbor
      const target = regions[bestNeighbor]
      for (const pixIdx of region.pixels) {
        regionGrid[pixIdx] = bestNeighbor
        indexGrid[pixIdx] = target.colorIndex
        target.pixels.push(pixIdx)
      }
      target.pixelCount += region.pixelCount

      // Recompute target centroid and bbox
      let cx = 0, cy = 0
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (const pixIdx of target.pixels) {
        const px = pixIdx % width
        const py = Math.floor(pixIdx / width)
        cx += px
        cy += py
        if (px < minX) minX = px
        if (py < minY) minY = py
        if (px > maxX) maxX = px
        if (py > maxY) maxY = py
      }
      target.centroidX = Math.round(cx / target.pixelCount)
      target.centroidY = Math.round(cy / target.pixelCount)
      target.bbox = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }

      // Clear merged region
      region.pixelCount = 0
      region.pixels = []
      changed = true
    }

    if (pass % 5 === 0) {
      onProgress?.('Merging small regions…', 60 + Math.min(pass, 30))
      await yieldToMain()
    }
  }

  // Re-index regions sequentially (remove empty, renumber from 1)
  const alive = regions.filter(r => r.pixelCount > 0)
  const oldToNew = new Map<number, number>()
  for (let i = 0; i < alive.length; i++) {
    const oldIdx = regions.indexOf(alive[i])
    oldToNew.set(oldIdx, i)
    alive[i].id = i + 1
  }

  for (let i = 0; i < total; i++) {
    regionGrid[i] = oldToNew.get(regionGrid[i]) ?? 0
  }

  regions.length = 0
  regions.push(...alive)
}
