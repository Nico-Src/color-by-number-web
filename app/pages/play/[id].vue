<script setup lang="ts">
import { useDB } from '../../composables/useDB'
import { usePuzzleStore } from '../../composables/usePuzzleStore'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const toast = useToast()
const store = usePuzzleStore()
const db = useDB()

const puzzleCanvas = ref<InstanceType<typeof import('../../components/puzzle/PuzzleCanvas.vue').default> | null>(null)
const showReveal = ref(false)
const showOriginal = ref(false)
const loading = ref(true)

async function loadPuzzle() {
  const id = route.params.id as string
  try {
    const puzzle = await db.getPuzzle(id)
    if (!puzzle) {
      toast.add({ severity: 'error', summary: 'Puzzle not found', life: 3000 })
      await navigateTo('/my-puzzles')
      return
    }
    store.setPuzzle(puzzle)
    if (store.isComplete) {
      showOriginal.value = true
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Failed to load puzzle',
      detail: err instanceof Error ? err.message : 'Unknown error',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

function onCompleted() {
  showReveal.value = true
  showOriginal.value = true
}

async function onReset() {
  if (!store.currentPuzzle) return
  store.resetPuzzle()
  showOriginal.value = false
  await db.updateProgress(store.currentPuzzle.id, store.currentPuzzle.progress, false)
  puzzleCanvas.value?.draw()
  toast.add({ severity: 'info', summary: 'Puzzle reset', life: 2000 })
}

onMounted(() => {
  loadPuzzle()
})
</script>

<template>
  <div class="play-page">
    <div v-if="loading" class="loading-state">
      <ProgressSpinner />
      <p>Loading puzzle…</p>
    </div>

    <template v-else-if="store.currentPuzzle">
      <div class="play-layout">
        <PuzzleToolbar
          :palette="store.currentPuzzle.palette"
          :show-original="showOriginal"
          :is-complete="store.isComplete"
          @zoom-in="puzzleCanvas?.zoomIn()"
          @zoom-out="puzzleCanvas?.zoomOut()"
          @zoom-fit="puzzleCanvas?.zoomFit()"
          @reset="onReset"
          @update:show-original="showOriginal = $event"
        />
        <PuzzleCanvas
          ref="puzzleCanvas"
          :puzzle="store.currentPuzzle"
          :show-original="showOriginal"
          @completed="onCompleted"
        />
      </div>

      <PuzzleRevealOverlay
        :show="showReveal"
        :original-blob="store.currentPuzzle.originalImageBlob"
      >
        <div class="reveal-actions">
          <Button
            label="Back to My Puzzles"
            @click="navigateTo('/my-puzzles')"
          >
            <template #icon><Icon name="mdi:view-grid" /></template>
          </Button>
          <Button
            label="Close"
            text
            @click="showReveal = false"
          />
        </div>
      </PuzzleRevealOverlay>
    </template>
  </div>
</template>

<style scoped>
.play-page {
  padding: 0;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-muted);
}
.play-layout {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  height: calc(100vh - 56px);
  padding: 0.25rem;
}
.reveal-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
