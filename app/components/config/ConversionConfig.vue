<script setup lang="ts">
import type { ConversionConfig } from '../../lib/types'
import { DEFAULT_CONFIG } from '../../lib/types'

const config = defineModel<ConversionConfig>({ required: true })

function reset() {
  config.value = { ...DEFAULT_CONFIG }
}
</script>

<template>
  <div class="config-panel">
    <div class="config-header">
      <h3>Conversion Settings</h3>
      <Button label="Reset" text size="small" @click="reset">
        <template #icon><Icon name="mdi:refresh" /></template>
      </Button>
    </div>

    <div class="config-field">
      <label>Colors: {{ config.numColors }}</label>
      <Slider v-model="config.numColors" :min="4" :max="30" :step="1" />
    </div>

    <div class="config-field">
      <label>Min Region Size: {{ config.minRegionSize }}px</label>
      <Slider v-model="config.minRegionSize" :min="20" :max="500" :step="10" />
    </div>

    <div class="config-field">
      <label>Max Resolution: {{ config.maxResolution }}px</label>
      <Slider v-model="config.maxResolution" :min="400" :max="1600" :step="100" />
    </div>

    <div class="config-field">
      <label>Blur: {{ config.blurSigma.toFixed(1) }}</label>
      <Slider v-model="config.blurSigma" :min="0" :max="2" :step="0.1" />
    </div>

    <div class="config-field">
      <label>Contour Detail: {{ config.contourSimplification.toFixed(1) }}</label>
      <Slider v-model="config.contourSimplification" :min="0.5" :max="4" :step="0.1" />
    </div>
  </div>
</template>

<style scoped>
.config-panel {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  border: 1px solid var(--border);
}
.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.config-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}
.config-field {
  margin-bottom: 1rem;
}
.config-field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}
</style>
