import Aura from '@primevue/themes/aura'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  nitro: {
    preset: 'static',
  },

  modules: [
    '@primevue/nuxt-module',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@pinia/nuxt',
  ],

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          cssLayer: false,
          darkModeSelector: '[data-theme="dark"]',
        },
      },
    },
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'Fira Mono', provider: 'google' },
    ],
  },

  app: {
    pageTransition: { name: 'fade', mode: 'out-in' },
    head: {
      title: 'Color by Number',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  css: ['primeicons/primeicons.css', '@/assets/css/main.css'],
})
