export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/sitemap',
    '@nuxt/image',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt'
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
      theme_color: '#10b981',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/'
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    }
  },

  sitemap: {
    sources: ['/api/__sitemap__']
  },

  image: {
    provider: 'ipx',
    providers: {
      supabase: {
        provider: 'supabase',
        options: {
          baseURL: process.env.NUXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public'
        }
      }
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/admin/**': { ssr: false },
    '/delivery/**': { ssr: false }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
