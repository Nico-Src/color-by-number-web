<script setup lang="ts">
import type { PuzzleData } from '../../lib/types'

const props = defineProps<{
  puzzle: PuzzleData
}>()

const emit = defineEmits<{
  click: []
  delete: []
}>()

const progressPercent = computed(() => {
  const p = props.puzzle.progress
  const filled = p.reduce((sum: number, v: number) => sum + v, 0)
  return Math.round((filled / p.length) * 100)
})

const dateStr = computed(() => {
  return new Date(props.puzzle.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const showDeleteConfirm = ref(false)

function confirmDelete() {
  showDeleteConfirm.value = true
}

function doDelete() {
  showDeleteConfirm.value = false
  emit('delete')
}
</script>

<template>
  <div class="puzzle-card" @click="emit('click')">
    <div class="card-thumb">
      <img
        v-if="puzzle.thumbnailDataUrl"
        :src="puzzle.thumbnailDataUrl"
        :alt="puzzle.name"
        loading="lazy"
      />
      <div v-if="puzzle.completed" class="completed-badge">
        <Icon name="mdi:check" size="0.85rem" />
      </div>
      <button class="delete-btn" @click.stop="confirmDelete" title="Delete puzzle">
        <Icon name="mdi:trash-can-outline" size="0.9rem" />
      </button>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <p class="card-name">{{ puzzle.name }}</p>
        <span class="card-date">{{ dateStr }}</span>
      </div>
      <div class="card-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
        <span class="progress-label">{{ progressPercent }}%</span>
      </div>
    </div>

    <Dialog
      v-model:visible="showDeleteConfirm"
      header="Delete Puzzle"
      :modal="true"
      :closable="true"
      style="width: 320px"
      @click.stop
    >
      <p>Delete "{{ puzzle.name }}"? This can't be undone.</p>
      <template #footer>
        <Button label="Cancel" text @click="showDeleteConfirm = false" />
        <Button label="Delete" severity="danger" @click="doDelete" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.puzzle-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.15s, border-color 0.2s;
  position: relative;
}
.puzzle-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--accent);
}
.card-thumb {
  position: relative;
  aspect-ratio: 16/10;
  background: var(--bg-inset);
  overflow: hidden;
}
.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.puzzle-card:hover .card-thumb img {
  transform: scale(1.03);
}
.completed-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--accent);
  color: white;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}
.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: none;
  background: rgba(0,0,0,0.5);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  backdrop-filter: blur(4px);
}
.puzzle-card:hover .delete-btn {
  opacity: 1;
}
.delete-btn:hover {
  background: #ef4444;
}
.card-body {
  padding: 0.65rem 0.75rem 0.7rem;
}
.card-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
}
.card-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}
.card-date {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.card-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.progress-track {
  flex: 1;
  height: 4px;
  background: var(--bg-inset);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}
.progress-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted);
  font-family: var(--font-mono);
  min-width: 2.2em;
  text-align: right;
}
</style>
