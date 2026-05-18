import Aura from "@primevue/themes/aura";
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  alias: {
    'lodash-es': 'node_modules/lodash-es/lodash.js'
  },
  router: {
    options: {
      middleware: ['auth']
    }
  },
  nitro: {
    preset: 'node-server',
    // Trust proxy headers for correct protocol/host detection behind Nginx
    experimental: {
      openAPI: true
    },
    esbuild: {
      options: {
        format: 'esm',
        target: 'es2022',
        platform: 'node'
      }
    },
    externals: {
      inline: ['uuid', 'underscore', 'mysql2']
    }
  },
  // Configure router to work correctly behind reverse proxy
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN'
      }
    }
  },
  experimental: {
    payloadExtraction: false // Disable problematic SSG
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          "lodash-es/*": ["node_modules/lodash-es/*"]
        }
      }
    }
  },
  app: {
    head: {
      title: "Money Mind",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Money Mind: gestione finanziaria semplice e potente. Traccia spese, crea budget e ottimizza i risparmi con strumenti automatizzati.",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/icona.ico" }],
      script: [
        {
          src: '/chrome-polyfill.js',
          type: 'text/javascript'
        },
        {
          src: '/iubenda.js',
          type: 'text/javascript'
        },
        {
          src: 'https://cs.iubenda.com/autoblocking/4004886.js',
          type: 'text/javascript'
        },
        {
          src: 'https://cdn.iubenda.com/cs/iubenda_cs.js',
          type: 'text/javascript',
          async: true
        }
      ]
    },
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      PORT: process.env.PORT,
      HOST: process.env.HOST,
    },
    KEY: process.env.KEY,
    DIALECT_DATABASE: process.env.DIALECT_DATABASE,
    HOST_DATABASE: process.env.HOST_DATABASE,
    PORT_DATABASE: process.env.PORT_DATABASE,
    USERNAME_DATABASE: process.env.USERNAME_DATABASE,
    PASSWORD_DATABASE: process.env.PASSWORD_DATABASE,
    DATABASE: process.env.DATABASE,
  },
  devServer: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '443')
  },
  modules: ["@primevue/nuxt-module", "@nuxtjs/device"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
    usePrimeVue: true,
    autoImport: true,
  },
  css: [
    "./assets/css/all.css",
    "./assets/style.css",
    "./node_modules/primeflex/primeflex.css",
  ],
});
