/**
 * Pinia store for the active puzzle session.
 *
 * Holds the loaded puzzle data, selected color, viewport transform,
 * and processing state during image conversion. The store acts as the
 * single source of truth that the canvas, palette, and toolbar all
 * read from and write to.
 */
import { defineStore } from 'pinia'
import type { PuzzleData } from '../lib/types'

export const usePuzzleStore = defineStore('puzzle', {
  state: () => ({
    currentPuzzle: null as PuzzleData | null,
    selectedColorIndex: null as number | null,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    isProcessing: false,
    processingStage: '',
    processingProgress: 0,
    cheatMode: false,
  }),

  getters: {
    isComplete(): boolean {
      if (!this.currentPuzzle) return false
      return this.currentPuzzle.progress.every(v => v === 1)
    },

    colorRegionCounts(): Map<number, { total: number; filled: number }> {
      const counts = new Map<number, { total: number; filled: number }>()
      if (!this.currentPuzzle) return counts

      for (let i = 0; i < this.currentPuzzle.regions.length; i++) {
        const region = this.currentPuzzle.regions[i]
        const entry = counts.get(region.colorIndex) ?? { total: 0, filled: 0 }
        entry.total++
        if (this.currentPuzzle.progress[i] === 1) entry.filled++
        counts.set(region.colorIndex, entry)
      }
      return counts
    },
  },

  actions: {
    setPuzzle(puzzle: PuzzleData) {
      this.currentPuzzle = puzzle
      this.selectedColorIndex = null
      this.zoom = 1
      this.panOffset = { x: 0, y: 0 }
      this.cheatMode = false
    },

    toggleCheatMode() {
      this.cheatMode = !this.cheatMode
    },

    selectColor(index: number | null) {
      this.selectedColorIndex = index
    },

    /**
     * Attempt to fill a region with the currently selected color.
     * Returns true if the color was correct (region filled), false otherwise.
     * Creates a new Uint8Array to trigger Vue reactivity on progress change.
     */
    fillRegion(regionIndex: number): boolean {
      if (!this.currentPuzzle || this.selectedColorIndex === null) return false

      const region = this.currentPuzzle.regions[regionIndex]
      if (!region) return false

      if (region.colorIndex === this.selectedColorIndex) {
        // Replace the Uint8Array to trigger reactivity
        const newProgress = new Uint8Array(this.currentPuzzle.progress)
        newProgress[regionIndex] = 1
        this.currentPuzzle.progress = newProgress
        return true
      }
      return false
    },

    setProcessing(processing: boolean, stage: string = '', progress: number = 0) {
      this.isProcessing = processing
      this.processingStage = stage
      this.processingProgress = progress
    },

    /**
     * Fill all unfilled regions that have ANY pixel within the given radius
     * (in puzzle-pixel coordinates). Bypasses color matching — this is the cheat tool.
     * Returns the list of region indices that were filled.
     */
    cheatFillRegions(px: number, py: number, radius: number): number[] {
      if (!this.currentPuzzle) return []
      const { regions, regionGrid, width, height, progress } = this.currentPuzzle
      const filled: number[] = []
      const r2 = radius * radius
      const newProgress = new Uint8Array(progress)

      // Collect unfilled region indices for quick lookup
      const unfilledSet = new Set<number>()
      for (let i = 0; i < regions.length; i++) {
        if (newProgress[i] !== 1) unfilledSet.add(i)
      }
      if (unfilledSet.size === 0) return []

      // Scan all pixels within the bounding square of the brush circle
      const xMin = Math.max(0, Math.floor(px - radius))
      const xMax = Math.min(width - 1, Math.ceil(px + radius))
      const yMin = Math.max(0, Math.floor(py - radius))
      const yMax = Math.min(height - 1, Math.ceil(py + radius))

      const hitRegions = new Set<number>()
      for (let y = yMin; y <= yMax; y++) {
        for (let x = xMin; x <= xMax; x++) {
          const dx = x - px
          const dy = y - py
          if (dx * dx + dy * dy > r2) continue
          const rIdx = regionGrid[y * width + x]
          if (rIdx !== undefined && unfilledSet.has(rIdx) && !hitRegions.has(rIdx)) {
            hitRegions.add(rIdx)
            newProgress[rIdx] = 1
            filled.push(rIdx)
          }
        }
      }

      if (filled.length > 0) {
        this.currentPuzzle.progress = newProgress
      }
      return filled
    },

    resetPuzzle() {
      if (!this.currentPuzzle) return
      this.currentPuzzle.progress = new Uint8Array(this.currentPuzzle.regions.length)
      this.currentPuzzle.completed = false
      this.cheatMode = false
    },
  },
})
