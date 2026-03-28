/**
 * Find the pole of inaccessibility (visual centroid) for label placement.
 * Uses an iterative grid sampling approach to find the point furthest from any edge.
 */
export function findLabelPosition(
  regionGrid: Uint32Array,
  regionIdx: number,
  width: number,
  height: number,
  bbox: { x: number; y: number; w: number; h: number },
): { x: number; y: number } {
  const isInside = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    return regionGrid[y * width + x] === regionIdx
  }

  // Distance to nearest non-region pixel (approximate using sampling)
  const distToEdge = (px: number, py: number): number => {
    if (!isInside(px, py)) return -1

    let minDist = Infinity
    // Check radially outward
    for (let r = 1; r <= Math.max(bbox.w, bbox.h); r++) {
      let foundEdge = false
      for (let dx = -r; dx <= r; dx++) {
        for (const dy of [-r, r]) {
          if (!isInside(px + dx, py + dy)) {
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < minDist) minDist = d
            foundEdge = true
          }
        }
      }
      for (let dy = -r + 1; dy < r; dy++) {
        for (const dx of [-r, r]) {
          if (!isInside(px + dx, py + dy)) {
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < minDist) minDist = d
            foundEdge = true
          }
        }
      }
      if (foundEdge) break
    }

    return minDist
  }

  // Grid sample at decreasing resolution
  let bestX = bbox.x + Math.floor(bbox.w / 2)
  let bestY = bbox.y + Math.floor(bbox.h / 2)
  let bestDist = -1

  const step = Math.max(1, Math.floor(Math.min(bbox.w, bbox.h) / 8))

  for (let y = bbox.y; y < bbox.y + bbox.h; y += step) {
    for (let x = bbox.x; x < bbox.x + bbox.w; x += step) {
      const d = distToEdge(x, y)
      if (d > bestDist) {
        bestDist = d
        bestX = x
        bestY = y
      }
    }
  }

  // Refine around best point
  const refineStep = Math.max(1, Math.floor(step / 2))
  for (let y = bestY - step; y <= bestY + step; y += refineStep) {
    for (let x = bestX - step; x <= bestX + step; x += refineStep) {
      const d = distToEdge(x, y)
      if (d > bestDist) {
        bestDist = d
        bestX = x
        bestY = y
      }
    }
  }

  // Fallback: if the best point isn't inside the region, use centroid
  if (!isInside(bestX, bestY)) {
    // Find any pixel inside
    for (let y = bbox.y; y < bbox.y + bbox.h; y++) {
      for (let x = bbox.x; x < bbox.x + bbox.w; x++) {
        if (isInside(x, y)) {
          return { x, y }
        }
      }
    }
  }

  return { x: bestX, y: bestY }
}
