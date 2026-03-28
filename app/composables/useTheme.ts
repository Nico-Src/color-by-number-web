const STORAGE_KEY = 'cbn-theme'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('dark')

function applyTheme(t: Theme) {
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEY, t)
  }
}

export function useTheme() {
  function init() {
    if (!import.meta.client) return
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      theme.value = stored
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark'
    }
    applyTheme(theme.value)
  }

  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme(theme.value)
  }

  const isDark = computed(() => theme.value === 'dark')

  return { theme: readonly(theme), isDark, toggle, init }
}
