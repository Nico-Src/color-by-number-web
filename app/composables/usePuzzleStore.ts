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
    },

    selectColor(index: number | null) {
      this.selectedColorIndex = index
    },

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

    resetPuzzle() {
      if (!this.currentPuzzle) return
      this.currentPuzzle.progress = new Uint8Array(this.currentPuzzle.regions.length)
      this.currentPuzzle.completed = false
    },
  },
})
