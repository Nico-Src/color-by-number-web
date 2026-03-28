<script setup lang="ts">
import type { RGBColor } from '../../lib/types'
import { usePuzzleStore } from '../../composables/usePuzzleStore'

const store = usePuzzleStore()

const props = defineProps<{
  palette: RGBColor[]
  showOriginal?: boolean
  isComplete?: boolean
}>()

const emit = defineEmits<{
  reset: []
  zoomIn: []
  zoomOut: []
  zoomFit: []
  'update:showOriginal': [value: boolean]
}>()

const progressPercent = computed(() => {
  if (!store.currentPuzzle) return 0
  const p = store.currentPuzzle.progress
  const filled = p.reduce((sum, v) => sum + v, 0)
  return Math.round((filled / p.length) * 100)
})
</script>

<template>
  <div class="toolbar-wrapper">
    <div class="toolbar-row">
      <!-- Left: zoom controls in a pill -->
      <div class="tool-pill">
        <button class="tool-btn" @click="emit('zoomIn')" title="Zoom in">
          <Icon name="mdi:magnify-plus-outline" size="1.05rem" />
        </button>
        <button class="tool-btn" @click="emit('zoomOut')" title="Zoom out">
          <Icon name="mdi:magnify-minus-outline" size="1.05rem" />
        </button>
        <div class="pill-divider" />
        <button class="tool-btn" @click="emit('zoomFit')" title="Reset view">
          <Icon name="mdi:fit-to-screen" size="1.05rem" />
        </button>
        <button class="tool-btn" @click="emit('reset')" title="Reset puzzle">
          <Icon name="mdi:undo-variant" size="1.05rem" />
        </button>
      </div>

      <!-- Center: color swatches -->
      <PuzzleColorPalette :palette="palette" />

      <!-- Right: mastery badge + actions -->
      <div class="toolbar-right">
        <div class="mastery-badge">
          <span class="mastery-label">MASTERY</span>
          <span class="mastery-value">{{ progressPercent }}%</span>
          <div class="mastery-bar">
            <div class="mastery-fill" :style="{ width: progressPercent + '%' }" />
          </div>
        </div>

        <div class="tool-pill">
          <button
            class="tool-btn"
            :class="{ 'tool-btn--active-warn': store.cheatMode }"
            @click="store.toggleCheatMode()"
            :title="store.cheatMode ? 'Disable cheat brush' : 'Cheat brush'"
          >
            <Icon name="mdi:auto-fix" size="1.05rem" />
          </button>
          <button
            v-if="isComplete"
            class="tool-btn"
            :class="{ 'tool-btn--active': showOriginal }"
            @click="emit('update:showOriginal', !showOriginal)"
            :title="showOriginal ? 'Hide original' : 'Show original'"
          >
            <Icon :name="showOriginal ? 'mdi:eye-off' : 'mdi:eye'" size="1.05rem" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-wrapper {
  padding: 0.4rem 0.6rem;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  flex-shrink: 0;
}

/* ── Pill group ──────────────── */
.tool-pill {
  display: flex;
  align-items: center;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 2px;
  gap: 1px;
  flex-shrink: 0;
}
.pill-divider {
  width: 1px;
  height: 18px;
  background: var(--border);
  margin: 0 2px;
}

/* ── Tool button ─────────────── */
.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.tool-btn:hover {
  background: var(--accent-muted);
  color: var(--accent);
}
.tool-btn--active {
  background: var(--accent-glow);
  color: var(--accent);
}
.tool-btn--active-warn {
  background: var(--warn-muted);
  color: var(--warn);
}

/* ── Mastery badge ───────────── */
.mastery-badge {
  background: var(--bg-surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.3rem 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  min-width: 110px;
}
.mastery-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.mastery-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
}
.mastery-bar {
  width: 100%;
  height: 3px;
  background: var(--bg-inset);
  border-radius: 2px;
  overflow: hidden;
}
.mastery-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.4s ease;
  box-shadow: 0 0 6px var(--accent-glow);
}

@media (max-width: 700px) {
  .toolbar-row {
    flex-wrap: wrap;
    justify-content: center;
  }
  .toolbar-right {
    margin-left: 0;
  }
  .mastery-badge {
    min-width: 90px;
  }
}
</style>
