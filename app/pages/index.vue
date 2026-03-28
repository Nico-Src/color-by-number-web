<script setup lang="ts">
import { DEFAULT_CONFIG, type ConversionConfig } from '../lib/types'
import { useImageProcessor } from '../composables/useImageProcessor'
import { useDB } from '../composables/useDB'
import { usePuzzleStore } from '../composables/usePuzzleStore'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const toast = useToast()
const store = usePuzzleStore()
const { processImage } = useImageProcessor()
const db = useDB()

const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const puzzleName = ref('')
const config = ref<ConversionConfig>({ ...DEFAULT_CONFIG })

function onFileSelected(file: File) {
  selectedFile.value = file
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
  if (!puzzleName.value) {
    puzzleName.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

async function startConversion() {
  if (!selectedFile.value) return

  store.setProcessing(true)
  try {
    const puzzle = await processImage(
      selectedFile.value,
      config.value,
      (stage, progress) => {
        store.setProcessing(true, stage, progress)
      },
    )

    puzzle.name = puzzleName.value || puzzle.name

    await db.savePuzzle(puzzle)
    store.setProcessing(false)

    toast.add({
      severity: 'success',
      summary: 'Puzzle created!',
      detail: `${puzzle.regions.length} regions with ${puzzle.palette.length} colors`,
      life: 3000,
    })

    await router.push(`/play/${puzzle.id}`)
  } catch (err) {
    store.setProcessing(false)
    toast.add({
      severity: 'error',
      summary: 'Conversion failed',
      detail: err instanceof Error ? err.message : 'Unknown error',
      life: 5000,
    })
  }
}

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="home-page content-width">
    <div class="hero">
      <h1>Create a Puzzle</h1>
      <p>Upload any image and turn it into a color-by-number puzzle</p>
    </div>

    <div class="home-grid">
      <div class="upload-section">
        <UploadImageUploader @file-selected="onFileSelected" />

        <div v-if="previewUrl" class="preview-card">
          <img :src="previewUrl" alt="Preview" class="preview-img" />
          <div class="name-field">
            <label for="puzzle-name">Puzzle name</label>
            <InputText
              id="puzzle-name"
              v-model="puzzleName"
              placeholder="Enter a name…"
              fluid
            />
          </div>
        </div>
      </div>

      <div class="config-section">
        <ConfigConversionConfig v-model="config" />

        <button
          class="btn-primary convert-btn"
          :disabled="!selectedFile || store.isProcessing"
          @click="startConversion"
        >
          <ProgressSpinner v-if="store.isProcessing" style="width: 1rem; height: 1rem;" />
          <Icon v-else name="mdi:play" size="1.1rem" />
          {{ store.isProcessing ? 'Creating…' : 'Create Puzzle' }}
        </button>

        <div v-if="store.isProcessing" class="processing-status">
          <p>{{ store.processingStage }}</p>
          <div class="processing-track">
            <div class="processing-fill" :style="{ width: Math.round(store.processingProgress) + '%' }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-width {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}
.home-page {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
.hero {
  text-align: center;
  margin-bottom: 2rem;
}
.hero h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.hero p {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.9rem;
}
.home-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 768px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.config-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.preview-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  border: 1px solid var(--border);
  text-align: center;
}
.preview-img {
  max-width: 100%;
  max-height: 260px;
  border-radius: var(--radius);
  object-fit: contain;
}
.name-field {
  margin-top: 0.75rem;
  text-align: left;
}
.name-field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.3rem;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  font-family: var(--font-ui);
}
.btn-primary:hover:not(:disabled) {
  background: var(--accent-light);
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.97);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.convert-btn {
  width: 100%;
}
.processing-status {
  background: var(--bg-surface);
  border-radius: var(--radius);
  padding: 0.8rem 1rem;
  border: 1px solid var(--border);
}
.processing-status p {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.processing-track {
  height: 4px;
  background: var(--bg-inset);
  border-radius: 2px;
  overflow: hidden;
}
.processing-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
