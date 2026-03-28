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

const statusLabel = computed(() => {
  if (props.puzzle.completed) return 'Finished'
  if (progressPercent.value > 0) return 'In Progress'
  return 'New'
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
      <!-- Status badge -->
      <span v-if="!puzzle.completed && progressPercent > 0" class="status-badge status-progress">
        IN PROGRESS
      </span>
      <span v-if="puzzle.completed" class="status-badge status-done">
        FINISHED
      </span>
      <!-- Delete btn on hover -->
      <button class="delete-btn" @click.stop="confirmDelete" title="Delete">
        <Icon name="mdi:dots-vertical" size="0.9rem" />
      </button>
    </div>

    <div class="card-body">
      <p class="card-name">{{ puzzle.name }}</p>
      <span class="card-date">Modified: {{ dateStr }}</span>

      <div class="card-progress-row">
        <span class="progress-label-text">Progress</span>
        <span class="progress-value">{{ progressPercent }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="{ 'progress-complete': puzzle.completed }"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <button class="card-action" @click.stop="emit('click')">
        {{ puzzle.completed ? 'View' : progressPercent > 0 ? 'Resume' : 'Open Puzzle' }}
      </button>
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
  transition: border-color 0.2s, box-shadow 0.25s, transform 0.15s;
  position: relative;
}
.puzzle-card:hover {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
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
  transition: transform 0.35s ease;
}
.puzzle-card:hover .card-thumb img {
  transform: scale(1.04);
}

/* ── Status badge ──── */
.status-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-pill);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.status-progress {
  background: var(--accent);
  color: var(--bg-root);
}
.status-done {
  background: var(--accent);
  color: var(--bg-root);
}

/* ── Delete btn ────── */
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.45);
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
  background: var(--danger);
}

/* ── Body ────────── */
.card-body {
  padding: 0.7rem 0.85rem 0.85rem;
}
.card-name {
  margin: 0;
  font-weight: 700;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}
.card-date {
  display: block;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
}

/* ── Progress ────── */
.card-progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.65rem;
}
.progress-label-text {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
}
.progress-value {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--accent);
  font-family: var(--font-mono);
}
.progress-track {
  width: 100%;
  height: 3px;
  background: var(--bg-inset);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.3rem;
}
.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.4s ease;
  box-shadow: 0 0 6px var(--accent-glow);
}
.progress-fill.progress-complete {
  background: var(--accent);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.3);
}

/* ── Card action ─── */
.card-action {
  display: block;
  width: 100%;
  margin-top: 0.7rem;
  padding: 0.45rem 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--accent);
  font-size: 0.77rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: var(--font-ui);
}
.card-action:hover {
  background: var(--accent-muted);
  border-color: var(--accent);
}
</style>
