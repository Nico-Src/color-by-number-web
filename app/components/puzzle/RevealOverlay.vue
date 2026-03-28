<script setup lang="ts">
const props = defineProps<{
  originalBlob: Blob
  show: boolean
}>()

const imageUrl = ref('')

watchEffect(() => {
  if (props.show && props.originalBlob) {
    imageUrl.value = URL.createObjectURL(props.originalBlob)
  }
})

onUnmounted(() => {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
})
</script>

<template>
  <Transition name="reveal">
    <div v-if="show" class="reveal-overlay">
      <div class="reveal-content">
        <div class="reveal-celebration">
          <Icon name="mdi:star" size="2rem" class="star s1" />
          <Icon name="mdi:star" size="1.5rem" class="star s2" />
          <Icon name="mdi:star" size="1rem" class="star s3" />
          <h2>Puzzle Complete!</h2>
        </div>
        <img v-if="imageUrl" :src="imageUrl" class="reveal-image" alt="Original image" />
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.reveal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}
.reveal-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
}
.reveal-celebration {
  text-align: center;
  position: relative;
}
.reveal-celebration h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.01em;
}
.star {
  color: #f59e0b;
  position: absolute;
  animation: sparkle 1.5s ease-in-out infinite;
}
.s1 { top: -20px; left: -40px; animation-delay: 0s; }
.s2 { top: -25px; right: -35px; animation-delay: 0.3s; }
.s3 { top: -10px; left: 50%; animation-delay: 0.6s; }

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
}

.reveal-image {
  max-width: 100%;
  max-height: 60vh;
  border-radius: var(--radius);
  object-fit: contain;
}

.reveal-enter-active {
  transition: opacity 1.5s ease;
}
.reveal-enter-from {
  opacity: 0;
}
.reveal-leave-active {
  transition: opacity 0.3s ease;
}
.reveal-leave-to {
  opacity: 0;
}
</style>
