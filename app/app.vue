<template>
  <div>
    <Toast />
    <nav class="app-nav">
      <div class="app-nav-inner">
        <NuxtLink to="/" class="app-logo">
          <Icon name="mdi:palette-swatch-variant" size="1.25rem" class="logo-icon" />
          <span class="logo-text">Color by Number</span>
        </NuxtLink>
        <div class="app-nav-center">
          <NuxtLink to="/" class="nav-link">
            <Icon name="mdi:plus-circle-outline" size="0.95rem" />
            New
          </NuxtLink>
          <NuxtLink to="/my-puzzles" class="nav-link">
            <Icon name="mdi:view-grid-outline" size="0.95rem" />
            Puzzles
          </NuxtLink>
        </div>
        <button class="theme-toggle" @click="toggle" :title="isDark ? 'Switch to light' : 'Switch to dark'">
          <Icon :name="isDark ? 'mdi:weather-night' : 'mdi:weather-sunny'" size="1rem" />
        </button>
      </div>
    </nav>
    <main class="page-container">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isDark, toggle, init } = useTheme()
onMounted(() => init())
</script>

<style scoped>
.app-nav {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 52px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(12px);
  transition: background 0.3s, border-color 0.3s;
}
.app-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.app-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}
.logo-icon {
  color: var(--accent);
}
.logo-text {
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
}
.app-nav-center {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover {
  color: var(--text-primary);
  background: var(--accent-muted);
}
.nav-link.router-link-active {
  color: var(--accent);
  background: var(--accent-muted);
}
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-surface-raised);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
