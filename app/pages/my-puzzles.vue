<script setup lang="ts">
import type { PuzzleData } from '../lib/types'
import { useDB } from '../composables/useDB'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const db = useDB()

const puzzles = ref<PuzzleData[]>([])
const loading = ref(true)

async function loadPuzzles() {
  try {
    puzzles.value = await db.getAllPuzzles()
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Failed to load puzzles',
      detail: err instanceof Error ? err.message : 'Unknown error',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function openPuzzle(puzzle: PuzzleData) {
  router.push(`/play/${puzzle.id}`)
}

async function deletePuzzle(puzzle: PuzzleData) {
  try {
    await db.deletePuzzle(puzzle.id)
    puzzles.value = puzzles.value.filter(p => p.id !== puzzle.id)
    toast.add({
      severity: 'success',
      summary: 'Puzzle deleted',
      life: 2000,
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Failed to delete puzzle',
      life: 3000,
    })
  }
}

onMounted(() => {
  loadPuzzles()
})
</script>

<template>
  <div class="gallery-page">
    <div class="gallery-container">
      <div class="gallery-header">
        <div>
          <h1>My Puzzles</h1>
          <div class="gallery-meta">
            <span class="puzzle-count">{{ puzzles.length }} Puzzles</span>
            <span class="meta-sep">·</span>
            <span class="meta-label">DIGITAL COLLECTION</span>
          </div>
        </div>
        <div class="header-actions">
          <NuxtLink to="/" class="btn-accent">
            <Icon name="mdi:plus" size="1rem" />
            Create New
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <ProgressSpinner />
      </div>

      <div v-else-if="puzzles.length === 0" class="empty-state">
        <div class="empty-card">
          <div class="empty-icon-wrap">
            <Icon name="mdi:plus" size="2rem" />
          </div>
          <h3>Create New Puzzle</h3>
          <p>Turn any image into your next artistic challenge.</p>
          <NuxtLink to="/" class="btn-accent btn-sm">
            <Icon name="mdi:plus" size="0.9rem" />
            Get Started
          </NuxtLink>
        </div>
      </div>

      <div v-else class="puzzle-grid">
        <GalleryPuzzleCard
          v-for="puzzle in puzzles"
          :key="puzzle.id"
          :puzzle="puzzle"
          @click="openPuzzle(puzzle)"
          @delete="deletePuzzle(puzzle)"
        />

        <!-- "Create New" card -->
        <NuxtLink to="/" class="create-card">
          <div class="create-icon">
            <Icon name="mdi:plus" size="1.5rem" />
          </div>
          <span class="create-label">Create New Puzzle</span>
          <span class="create-sub">Turn any image into your next artistic challenge.</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-page {
  padding: 1.5rem 0 3rem;
}
.gallery-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;
}
.gallery-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}
.gallery-header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}
.gallery-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.3rem;
}
.puzzle-count {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--bg-root);
  font-size: 0.68rem;
  font-weight: 700;
}
.meta-sep {
  color: var(--text-muted);
  font-size: 0.7rem;
}
.meta-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* ── Buttons ─────────── */
.btn-accent {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s, box-shadow 0.15s;
  font-family: var(--font-ui);
}
.btn-accent:hover {
  background: var(--accent-glow);
  box-shadow: var(--shadow-glow);
}
.btn-sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.75rem;
}

/* ── Grid ────────────── */
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

/* ── Create card ─────── */
.create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 2rem 1rem;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
  cursor: pointer;
  min-height: 240px;
}
.create-card:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
}
.create-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: color 0.15s, border-color 0.15s;
}
.create-card:hover .create-icon {
  color: var(--accent);
  border-color: var(--accent);
}
.create-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
}
.create-sub {
  font-size: 0.73rem;
  color: var(--text-muted);
  max-width: 180px;
}

/* ── Loading / Empty ─── */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 5rem;
}
.empty-state {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 2.5rem 2rem;
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-lg);
  max-width: 280px;
}
.empty-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg-surface-raised);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
.empty-card h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}
.empty-card p {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}
</style>
