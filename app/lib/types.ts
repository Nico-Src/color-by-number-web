export interface RGBColor {
  r: number
  g: number
  b: number
}

export interface LabColor {
  L: number
  a: number
  b: number
}

export interface Region {
  id: number
  colorIndex: number
  contour: number[][]
  labelPos: { x: number; y: number }
  pixelCount: number
  bbox: { x: number; y: number; w: number; h: number }
}

export interface PuzzleData {
  id: string
  name: string
  createdAt: number
  width: number
  height: number
  palette: RGBColor[]
  regions: Region[]
  /** The pixel-to-region mapping grid (width * height), region id per pixel */
  regionGrid: Uint32Array
  originalImageBlob: Blob
  thumbnailDataUrl: string
  /** Per-region: 0 = uncolored, 1 = colored */
  progress: Uint8Array
  completed: boolean
}

export interface ConversionConfig {
  numColors: number
  minRegionSize: number
  maxResolution: number
  blurSigma: number
  contourSimplification: number
}

export const DEFAULT_CONFIG: ConversionConfig = {
  numColors: 12,
  minRegionSize: 80,
  maxResolution: 800,
  blurSigma: 0.8,
  contourSimplification: 1.5,
}

export type ProgressCallback = (stage: string, progress: number) => void
