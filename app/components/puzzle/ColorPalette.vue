<script setup lang="ts">
import type { RGBColor } from '../../lib/types'
import { usePuzzleStore } from '../../composables/usePuzzleStore'

const store = usePuzzleStore()

const props = defineProps<{
  palette: RGBColor[]
}>()

function colorStyle(c: RGBColor) {
  return { backgroundColor: `rgb(${c.r}, ${c.g}, ${c.b})` }
}

function textColor(c: RGBColor): string {
  const lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255
  return lum > 0.5 ? '#000' : '#fff'
}

function isCompleted(index: number): boolean {
  const counts = store.colorRegionCounts.get(index)
  if (!counts) return false
  return counts.filled >= counts.total
}

function selectColor(index: number) {
  if (isCompleted(index)) return
  store.selectColor(store.selectedColorIndex === index ? null : index)
}

// Order palette by index (number)
const sortedIndices = computed(() => {
  return props.palette.map((_, i) => i)
})
</script>

<template>
  <div class="palette-strip">
    <div
      v-for="idx in sortedIndices"
      :key="idx"
      class="swatch"
      :class="{ selected: store.selectedColorIndex === idx, completed: isCompleted(idx) }"
      :style="colorStyle(palette[idx]!)"
      @click="selectColor(idx)"
    >
      <span class="swatch-number" :style="{ color: textColor(palette[idx]!) }">
        {{ idx + 1 }}
      </span>
      <span
        v-if="store.colorRegionCounts.get(idx)"
        class="swatch-badge"
      >
        {{ store.colorRegionCounts.get(idx)!.total - store.colorRegionCounts.get(idx)!.filled }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.palette-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0.45rem;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border: 2.5px solid transparent;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
  font-family: var(--font-mono);
}
.swatch:hover {
  transform: scale(1.1);
}
.swatch.selected {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px var(--accent);
  transform: scale(1.12);
}
.swatch.completed {
  opacity: 0.3;
  cursor: default;
  pointer-events: none;
}
.swatch-number {
  font-size: 0.7rem;
  font-weight: 700;
}
.swatch-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--text-primary);
  color: var(--bg-surface);
  font-size: 0.55rem;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
}
</style>
