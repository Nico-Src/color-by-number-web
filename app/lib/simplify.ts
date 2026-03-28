/**
 * Douglas-Peucker polyline simplification.
 */
export function simplifyPolyline(points: number[][], tolerance: number): number[][] {
  if (points.length <= 2) return points

  // Find point with max distance from line between first and last
  let maxDist = 0
  let maxIdx = 0
  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last)
    if (d > maxDist) {
      maxDist = d
      maxIdx = i
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPolyline(points.slice(0, maxIdx + 1), tolerance)
    const right = simplifyPolyline(points.slice(maxIdx), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [first, last]
}

function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
  const dx = lineEnd[0] - lineStart[0]
  const dy = lineEnd[1] - lineStart[1]
  const lenSq = dx * dx + dy * dy

  if (lenSq === 0) {
    const ex = point[0] - lineStart[0]
    const ey = point[1] - lineStart[1]
    return Math.sqrt(ex * ex + ey * ey)
  }

  const t = Math.max(0, Math.min(1,
    ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / lenSq
  ))

  const projX = lineStart[0] + t * dx
  const projY = lineStart[1] + t * dy
  const ex = point[0] - projX
  const ey = point[1] - projY
  return Math.sqrt(ex * ex + ey * ey)
}
