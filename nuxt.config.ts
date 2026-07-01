export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/sitemap',
    '@nuxt/image',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-06-01',

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/stores/*', '/products/*']
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Quick Commerce',
      short_name: 'QCommerce',
      description: 'Get everything delivered in minutes',
      theme_color: '#10b981',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/demotiles\.maplibre\.org\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'map-tiles',
            expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 }
          }
        },
        {
          urlPattern: /^\/api\/.*/,
          handler: 'NetworkFirst',
          options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } }
        }
      ]
    },
    client: {
      installPrompt: true
    }
  },

  sitemap: {
    sources: ['/api/__sitemap__']
  },

  image: {
    provider: 'ipx'
  },

  routeRules: {
    '/': { prerender: true },
    '/admin/**': { ssr: false },
    '/delivery/**': { ssr: false }
  },

  icon: {
    serverBundle: {
      collections: ['lucide', 'simple-icons']
    },
    clientBundle: {
      scan: true
    },
    fetchTimeout: 0,
    fallbackToApi: false
  },

  fonts: {
    providers: {
      google: false,
      googleicons: false, // cSpell:ignore googleicons
      bunny: false,
      fontshare: false,
      fontsource: false
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    public: {
      razorpayKeyId: process.env.NUXT_PUBLIC_RAZORPAY_KEY_ID || ''
    }
  }
})
