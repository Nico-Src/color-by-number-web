<template>
  <div>
    <Toast />
    <nav class="app-nav">
      <div class="app-nav-inner">
        <NuxtLink to="/" class="app-logo">
          <div class="logo-mark">
            <Icon name="mdi:palette" size="1.1rem" />
          </div>
          <span>Color by Number</span>
        </NuxtLink>
        <div class="app-nav-links">
          <NuxtLink to="/" class="nav-link">
            <Icon name="mdi:plus-circle-outline" size="1.1rem" />
            <span>New</span>
          </NuxtLink>
          <NuxtLink to="/my-puzzles" class="nav-link">
            <Icon name="mdi:view-grid-outline" size="1.1rem" />
            <span>Puzzles</span>
          </NuxtLink>
          <button class="theme-toggle" @click="toggle" :title="isDark ? 'Switch to light' : 'Switch to dark'">
            <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" size="1.1rem" />
          </button>
        </div>
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
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 52px;
  display: flex;
  align-items: center;
  transition: background 0.25s, border-color 0.25s;
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
  gap: 0.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  text-decoration: none;
  letter-spacing: -0.01em;
}
.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-nav-links {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.nav-link:hover {
  background: var(--accent-muted);
  color: var(--accent);
}
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  margin-left: 0.3rem;
}
.theme-toggle:hover {
  background: var(--accent-muted);
  color: var(--accent);
}
</style>
