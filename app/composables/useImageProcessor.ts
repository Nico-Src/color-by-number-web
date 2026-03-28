import { nanoid } from 'nanoid'
import type { ConversionConfig, PuzzleData, Region, ProgressCallback } from '../lib/types'
import { loadImageToData, downscale, gaussianBlur, createThumbnail } from '../lib/imageUtils'
import { quantize } from '../lib/quantize'
import { regionize } from '../lib/regionize'
import { extractOrderedContour } from '../lib/contour'
import { simplifyPolyline } from '../lib/simplify'
import { findLabelPosition } from '../lib/labelPlace'

export function useImageProcessor() {
  async function processImage(
    file: File,
    config: ConversionConfig,
    onProgress?: ProgressCallback,
  ): Promise<PuzzleData> {
    // Step 1: Load & preprocess
    onProgress?.('Loading image…', 0)
    let imageData = await loadImageToData(file)

    onProgress?.('Resizing image…', 5)
    imageData = downscale(imageData, config.maxResolution)

    if (config.blurSigma > 0) {
      onProgress?.('Applying blur…', 8)
      imageData = gaussianBlur(imageData, config.blurSigma)
    }

    const { width, height } = imageData

    // Step 2: Quantize
    const { palette, indexGrid } = await quantize(
      imageData,
      config.numColors,
      (stage, p) => onProgress?.(stage, 10 + p * 0.3),
    )

    // Step 3 & 4: Region detection + merging
    const { regionGrid, regions: regionInfos } = await regionize(
      indexGrid,
      width,
      height,
      config.minRegionSize,
      (stage, p) => onProgress?.(stage, 40 + p * 0.3),
    )

    // Step 5: Contour extraction + simplification
    onProgress?.('Extracting contours…', 70)
    const regions: Region[] = []

    for (let i = 0; i < regionInfos.length; i++) {
      const info = regionInfos[i]
      const rawContour = extractOrderedContour(regionGrid, i, width, height, info.bbox)
      const contour = simplifyPolyline(rawContour, config.contourSimplification)

      // Step 6: Label placement
      const labelPos = findLabelPosition(regionGrid, i, width, height, info.bbox)

      regions.push({
        id: info.id,
        colorIndex: info.colorIndex,
        contour,
        labelPos,
        pixelCount: info.pixelCount,
        bbox: info.bbox,
      })

      if (i % 20 === 0) {
        onProgress?.('Extracting contours…', 70 + (i / regionInfos.length) * 20)
      }
    }

    // Step 7: Build puzzle data
    onProgress?.('Building puzzle…', 95)

    // Store original image as blob for reveal
    const originalImageBlob = file.slice(0, file.size, file.type)

    // Create thumbnail
    const thumbnailDataUrl = await createThumbnail(imageData)

    const puzzle: PuzzleData = {
      id: nanoid(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      createdAt: Date.now(),
      width,
      height,
      palette,
      regions,
      regionGrid,
      originalImageBlob,
      thumbnailDataUrl,
      progress: new Uint8Array(regions.length),
      completed: false,
    }

    onProgress?.('Done!', 100)
    return puzzle
  }

  return { processImage }
}
