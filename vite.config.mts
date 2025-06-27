import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
// Plugins
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
// Utilities
import { defineConfig } from 'vite'

import stylelint from 'vite-plugin-stylelint'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Кастомный плагин для оптимизации preload шрифтов
function optimizeFontPreload () {
  return {
    name: 'optimize-font-preload',
    transformIndexHtml (html: string) {
      // Удаляем все preload ссылки для шрифтов (woff, woff2, eot, ttf)
      let optimizedHtml = html

      // Удаляем modulepreload для шрифтов
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel="modulepreload"[^>]*href="[^"]*\.(woff2?|eot|ttf)"[^>]*>/g,
        '',
      )

      // Удаляем обычные preload для шрифтов
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel="preload"[^>]*href="[^"]*\.(woff2?|eot|ttf)"[^>]*>/g,
        '',
      )

      // Удаляем preload для Material Design Icons и Roboto шрифтов
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel="preload"[^>]*href="[^"]*(?:materialdesignicons|roboto)[^"]*"[^>]*>/g,
        '',
      )

      // Добавляем более оптимальную загрузку основных шрифтов с font-display: swap
      const fontOptimization = `
    <style>
      @font-face {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Roboto Regular'), local('Roboto-Regular');
      }
    </style>`

      return optimizedHtml.replace('</head>', `${fontOptimization}</head>`)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/search-star-wars-v3/',
  plugins: [
    VueRouter({
      dts: 'src/typed-router.d.ts',
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    stylelint({
      fix: true,
    }),
    Components({
      dts: 'src/components.d.ts',
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [400],
            styles: ['normal'],
            subset: 'latin', // Ограничить подмножества
          },
        ],
      },
    }),
    optimizeFontPreload(), // Добавляем кастомный плагин
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
    ],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
    open: true, // Automatically open browser on server start
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          fonts: ['unplugin-fonts/vite'],
        },
      },
      external: [
        // Исключаем неиспользуемые шрифты из сборки
        /.*\.eot$/,
      ],
    },
    // Отключить preload для шрифтов, чтобы избежать предупреждений
    modulePreload: {
      polyfill: false,
      resolveDependencies: (url, deps) => {
        // Фильтруем все зависимости, связанные со шрифтами
        return deps.filter(dep =>
          !dep.includes('font')
          && !dep.includes('.woff')
          && !dep.includes('.woff2')
          && !dep.includes('.eot')
          && !dep.includes('.ttf')
          && !dep.includes('materialdesignicons')
          && !dep.includes('roboto'),
        )
      },
    },
    // Отключаем создание preload директив для ресурсов
    assetsInlineLimit: 0,
  },
})
