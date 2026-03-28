/**
 * Marching squares contour extraction for a binary mask.
 * Returns arrays of [x, y] boundary points for a single region.
 */
export function extractContour(
  regionGrid: Uint32Array,
  regionIdx: number,
  width: number,
  height: number,
  bbox: { x: number; y: number; w: number; h: number },
): number[][] {
  const points: number[][] = []

  // Pad bbox by 1 for marching squares
  const x0 = Math.max(0, bbox.x - 1)
  const y0 = Math.max(0, bbox.y - 1)
  const x1 = Math.min(width - 1, bbox.x + bbox.w + 1)
  const y1 = Math.min(height - 1, bbox.y + bbox.h + 1)

  // Binary check: is pixel at (x, y) part of this region?
  const isInside = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    return regionGrid[y * width + x] === regionIdx
  }

  // Walk the boundary using simple border tracing
  const visited = new Set<string>()

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!isInside(x, y)) continue

      // Check if this pixel is on the boundary (has a non-region neighbor)
      const onBorder =
        !isInside(x - 1, y) || !isInside(x + 1, y) ||
        !isInside(x, y - 1) || !isInside(x, y + 1)

      if (onBorder) {
        const key = `${x},${y}`
        if (!visited.has(key)) {
          visited.add(key)
          points.push([x, y])
        }
      }
    }
  }

  return points
}

/**
 * Extract ordered contour using Moore neighborhood tracing.
 * Falls back to unordered boundary points if tracing fails.
 */
export function extractOrderedContour(
  regionGrid: Uint32Array,
  regionIdx: number,
  width: number,
  height: number,
  bbox: { x: number; y: number; w: number; h: number },
): number[][] {
  // Find a starting boundary pixel (leftmost-topmost)
  const x0 = Math.max(0, bbox.x)
  const y0 = Math.max(0, bbox.y)
  const x1 = Math.min(width - 1, bbox.x + bbox.w)
  const y1 = Math.min(height - 1, bbox.y + bbox.h)

  const isInside = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    return regionGrid[y * width + x] === regionIdx
  }

  // Find start pixel
  let startX = -1, startY = -1
  outer:
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (isInside(x, y) && !isInside(x - 1, y)) {
        startX = x
        startY = y
        break outer
      }
    }
  }

  if (startX < 0) {
    return extractContour(regionGrid, regionIdx, width, height, bbox)
  }

  // Moore neighbor tracing
  const contour: number[][] = []
  // 8-connectivity directions: right, down-right, down, down-left, left, up-left, up, up-right
  const dx = [1, 1, 0, -1, -1, -1, 0, 1]
  const dy = [0, 1, 1, 1, 0, -1, -1, -1]

  let cx = startX, cy = startY
  let dir = 7 // start looking from "up-right"
  const maxSteps = (x1 - x0 + 3) * (y1 - y0 + 3) * 2

  for (let step = 0; step < maxSteps; step++) {
    contour.push([cx, cy])

    // Find next boundary pixel
    let found = false
    const startDir = (dir + 5) % 8 // backtrack

    for (let i = 0; i < 8; i++) {
      const d = (startDir + i) % 8
      const nx = cx + dx[d]
      const ny = cy + dy[d]

      if (isInside(nx, ny)) {
        cx = nx
        cy = ny
        dir = d
        found = true
        break
      }
    }

    if (!found) break
    if (cx === startX && cy === startY && contour.length > 2) break
  }

  return contour
}
