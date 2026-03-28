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
    <div class="toolbar-top">
      <div class="toolbar-group">
        <Button text rounded size="small" @click="emit('zoomIn')" v-tooltip.bottom="'Zoom in'">
          <template #icon><Icon name="mdi:magnify-plus-outline" size="1.2rem" /></template>
        </Button>
        <Button text rounded size="small" @click="emit('zoomOut')" v-tooltip.bottom="'Zoom out'">
          <template #icon><Icon name="mdi:magnify-minus-outline" size="1.2rem" /></template>
        </Button>
        <Button text rounded size="small" @click="emit('zoomFit')" v-tooltip.bottom="'Fit to screen'">
          <template #icon><Icon name="mdi:fit-to-screen" size="1.2rem" /></template>
        </Button>
      </div>

      <div class="toolbar-progress">
        <ProgressBar :value="progressPercent" :showValue="true" style="height: 1.5rem; min-width: 120px" />
      </div>

      <div class="toolbar-group">
        <Button
          text rounded size="small"
          :severity="store.cheatMode ? 'warn' : 'secondary'"
          :class="{ 'cheat-active': store.cheatMode }"
          @click="store.toggleCheatMode()"
          v-tooltip.bottom="store.cheatMode ? 'Disable cheat brush' : 'Cheat brush'"
        >
          <template #icon><Icon name="mdi:auto-fix" size="1.2rem" /></template>
        </Button>
        <Button
          v-if="isComplete"
          text rounded size="small"
          :severity="showOriginal ? 'primary' : 'secondary'"
          @click="emit('update:showOriginal', !showOriginal)"
          v-tooltip.bottom="showOriginal ? 'Hide original' : 'Show original'"
        >
          <template #icon><Icon :name="showOriginal ? 'mdi:eye-off' : 'mdi:eye'" size="1.2rem" /></template>
        </Button>
        <Button text rounded size="small" severity="danger" @click="emit('reset')" v-tooltip.bottom="'Reset puzzle'">
          <template #icon><Icon name="mdi:refresh" size="1.2rem" /></template>
        </Button>
      </div>
    </div>

    <PuzzleColorPalette :palette="palette" />
  </div>
</template>

<style scoped>
.toolbar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.toolbar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.toolbar-group {
  display: flex;
  gap: 0.25rem;
}
.toolbar-group :deep(.p-button) {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  justify-content: center;
}
.toolbar-progress {
  flex: 1;
  max-width: 200px;
}
.cheat-active {
  background: rgba(234, 179, 8, 0.15) !important;
  color: #eab308 !important;
}
</style>
