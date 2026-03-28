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

const sortedIndices = computed(() => {
  return props.palette.map((_, i) => i)
})
</script>

<template>
  <div class="palette-strip">
    <button
      v-for="idx in sortedIndices"
      :key="idx"
      class="swatch"
      :class="{ selected: store.selectedColorIndex === idx, completed: isCompleted(idx) }"
      @click="selectColor(idx)"
    >
      <div class="swatch-fill" :style="colorStyle(palette[idx]!)">
        <span class="swatch-num" :style="{ color: textColor(palette[idx]!) }">
          {{ idx + 1 }}
        </span>
      </div>
      <span
        v-if="store.colorRegionCounts.get(idx) && !isCompleted(idx)"
        class="swatch-remaining"
      >
        {{ store.colorRegionCounts.get(idx)!.total - store.colorRegionCounts.get(idx)!.filled }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.palette-strip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 2px 0;
  scrollbar-width: none;
  flex: 1;
  min-width: 0;
}
.palette-strip::-webkit-scrollbar { display: none; }

.swatch {
  position: relative;
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  transition: transform 0.15s;
}
.swatch:hover {
  transform: scale(1.12);
}
.swatch.completed {
  opacity: 0.25;
  pointer-events: none;
}

.swatch-fill {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2.5px solid transparent;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: 0 0 0 0 transparent;
}

.swatch.selected .swatch-fill {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow-strong), 0 0 12px var(--accent-glow);
}

.swatch-num {
  font-size: 0.65rem;
  font-weight: 800;
  font-family: var(--font-mono);
  line-height: 1;
}

.swatch-remaining {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--accent);
  color: var(--bg-root);
  font-size: 0.5rem;
  font-weight: 700;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  box-shadow: 0 0 4px var(--accent-glow);
}
</style>
