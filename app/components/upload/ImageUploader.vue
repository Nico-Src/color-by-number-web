<script setup lang="ts">
const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

function validateFile(file: File): boolean {
  error.value = ''
  if (!ACCEPTED_TYPES.includes(file.type)) {
    error.value = 'Please upload a PNG, JPEG, WebP, or AVIF image.'
    return false
  }
  if (file.size > MAX_SIZE) {
    error.value = 'File is too large. Max 20MB.'
    return false
  }
  return true
}

function handleFile(file: File) {
  if (validateFile(file)) {
    emit('fileSelected', file)
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
}

function openFilePicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    class="uploader"
    :class="{ dragging: isDragging }"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="openFilePicker"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/avif"
      class="hidden-input"
      @change="onFileInput"
    />
    <div class="uploader-content">
      <Icon name="mdi:cloud-upload" size="3rem" />
      <p class="uploader-title">Drop your image here</p>
      <p class="uploader-sub">or click to browse &middot; PNG, JPEG, WebP, AVIF &middot; max 20MB</p>
      <Message v-if="error" severity="error" :closable="false" class="uploader-error">
        {{ error }}
      </Message>
    </div>
  </div>
</template>

<style scoped>
.uploader {
  border: 2px dashed var(--border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  background: var(--bg-surface);
}
.uploader:hover,
.uploader.dragging {
  border-color: var(--accent);
  background: var(--accent-muted);
  box-shadow: var(--shadow-glow);
}
.uploader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-muted);
}
.uploader-content .iconify {
  color: var(--accent);
  opacity: 0.7;
}
.uploader:hover .uploader-content .iconify,
.uploader.dragging .uploader-content .iconify {
  opacity: 1;
}
.uploader-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.uploader-sub {
  font-size: 0.75rem;
  margin: 0;
  color: var(--text-muted);
}
.uploader-error {
  margin-top: 0.75rem;
}
.hidden-input {
  display: none;
}
</style>
