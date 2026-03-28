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
  <div class="gallery-page content-width">
    <div class="gallery-header">
      <div>
        <h1>My Puzzles</h1>
        <p class="gallery-subtitle">{{ puzzles.length }} puzzle{{ puzzles.length !== 1 ? 's' : '' }}</p>
      </div>
      <NuxtLink to="/">
        <button class="btn-primary">
          <Icon name="mdi:plus" size="1.1rem" />
          New Puzzle
        </button>
      </NuxtLink>
    </div>

    <div v-if="loading" class="loading-state">
      <ProgressSpinner />
    </div>

    <div v-else-if="puzzles.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon name="mdi:image-plus" size="2rem" />
      </div>
      <h2>No puzzles yet</h2>
      <p>Upload an image to create your first color-by-number puzzle.</p>
      <NuxtLink to="/">
        <button class="btn-primary">
          <Icon name="mdi:plus" size="1.1rem" />
          Create Puzzle
        </button>
      </NuxtLink>
    </div>

    <div v-else class="puzzle-grid">
      <GalleryPuzzleCard
        v-for="puzzle in puzzles"
        :key="puzzle.id"
        :puzzle="puzzle"
        @click="openPuzzle(puzzle)"
        @delete="deletePuzzle(puzzle)"
      />
    </div>
  </div>
</template>

<style scoped>
.content-width {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}
.gallery-page {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}
.gallery-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.gallery-header h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.gallery-subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}
.gallery-header a {
  text-decoration: none;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  font-family: var(--font-ui);
}
.btn-primary:hover {
  background: var(--accent-light);
}
.btn-primary:active {
  transform: scale(0.97);
}
.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem;
}
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
}
.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--accent-muted);
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.empty-state h2 {
  color: var(--text-primary);
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 600;
}
.empty-state p {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  font-size: 0.88rem;
}
.empty-state a {
  text-decoration: none;
}
.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
</style>
