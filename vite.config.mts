import { fileURLToPath, URL } from 'node:url'

import Vue from '@vitejs/plugin-vue'

// Plugins
import VueRouter from 'unplugin-vue-router/vite'

// Utilities
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Кастомный плагин для оптимизации preload шрифтов
function optimizeFontPreload() {
  return {
    name: 'optimize-font-preload',
    transformIndexHtml(html: string) {
      // Удаляем все preload ссылки для шрифтов более агрессивно
      let optimizedHtml = html

      // Удаляем все ссылки с rel="preload" для файлов шрифтов
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*\.(woff2?|eot|ttf)["'][^>]*>/gi,
        ''
      )

      // Удаляем все ссылки с rel="modulepreload" для файлов шрифтов
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*\.(woff2?|eot|ttf)["'][^>]*>/gi,
        ''
      )

      // Удаляем preload для Material Design Icons по имени файла
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*materialdesignicons[^"']*["'][^>]*>/gi,
        ''
      )

      // Удаляем preload для Roboto шрифтов по имени файла
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*roboto[^"']*["'][^>]*>/gi,
        ''
      )

      // Удаляем все preload ссылки с as="font"
      optimizedHtml = optimizedHtml.replace(
        /<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi,
        ''
      )

      // Удаляем пустые строки, которые могли остаться
      optimizedHtml = optimizedHtml.replace(/^\s*\n/gm, '')

      return optimizedHtml
    },
  }
}

// Дополнительный плагин для финальной очистки HTML от preload
function finalHtmlCleanup() {
  return {
    name: 'final-html-cleanup',
    generateBundle(_options: any, bundle: any) {
      // Находим HTML файлы в бандле
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.html')) {
          const htmlAsset = bundle[fileName]

          if (
            htmlAsset.type === 'asset' &&
            typeof htmlAsset.source === 'string'
          ) {
            // Удаляем все preload ссылки из финального HTML
            let cleanHtml = htmlAsset.source

            // Удаляем все preload ссылки для шрифтов
            cleanHtml = cleanHtml.replace(
              /<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi,
              ''
            )

            // Удаляем все modulepreload ссылки для шрифтов
            cleanHtml = cleanHtml.replace(
              /<link[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*\.(?:woff2?|eot|ttf)["'][^>]*>/gi,
              ''
            )

            // Удаляем preload для конкретных шрифтов по имени
            cleanHtml = cleanHtml.replace(
              /<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*(?:materialdesignicons|roboto)[^"']*["'][^>]*>/gi,
              ''
            )

            // Очищаем лишние пробелы и переносы строк
            cleanHtml = cleanHtml.replace(/\n\s*\n/g, '\n')
            cleanHtml = cleanHtml.replace(/^\s*$/gm, '')

            htmlAsset.source = cleanHtml
          }
        }
      }
    },
    writeBundle(_options: any, bundle: any) {
      // Дополнительная очистка на этапе записи
      for (const fileName of Object.keys(bundle)) {
        if (fileName.endsWith('.html')) {
          const htmlAsset = bundle[fileName]

          if (htmlAsset.type === 'asset') {
            let cleanHtml = htmlAsset.source as string

            // Удаляем все preload ссылки
            cleanHtml = cleanHtml.replace(
              /<link[^>]*rel=["']preload["'][^>]*>/gi,
              ''
            )

            htmlAsset.source = cleanHtml
          }
        }
      }
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

    optimizeFontPreload(), // Добавляем кастомный плагин
    finalHtmlCleanup(), // Финальная очистка HTML
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
    extensions: [ '.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue' ],
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
          // Удалили fonts chunk так как больше не используем unplugin-fonts
        },
      },
      external: [
        // Исключаем неиспользуемые шрифты из сборки
        /.*\.eot$/,
      ],
    },

    // Отключить preload для шрифтов, чтобы избежать предупреждений
    modulePreload: false, // Полностью отключаем modulePreload
    // Отключаем создание preload директив для ресурсов
    assetsInlineLimit: 0,
  },
})
