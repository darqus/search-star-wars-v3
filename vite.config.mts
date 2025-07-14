// Core imports
import { fileURLToPath, URL } from 'node:url'

// Plugin imports
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

import type { NormalizedOutputOptions, OutputAsset, OutputChunk } from 'rollup'

// Custom font preload optimizer
function optimizeFontPreload() {
  return {
    name: 'optimize-font-preload',
    transformIndexHtml(html: string) {
      const optimizedHtml = html
        .replace(/<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*\.(woff2?|eot|ttf)["'][^>]*>/gi, '')
        .replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*\.(woff2?|eot|ttf)["'][^>]*>/gi, '')
        .replace(/<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*materialdesignicons[^"']*["'][^>]*>/gi, '')
        .replace(/<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*roboto[^"']*["'][^>]*>/gi, '')
        .replace(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi, '')
        .replace(/^\s*\n/gm, '')

      return optimizedHtml
    }
  }
}

// Final HTML cleanup
function finalHtmlCleanup() {
  return {
    name: 'final-html-cleanup',
    transformIndexHtml(html: string) {
      return html
        .replace(/<link[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*>/gi, '')
        .replace(/<link[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*\.(woff2?|eot|ttf)["'][^>]*>/gi, '')
        .replace(/<link[^>]*rel=["']preload["'][^>]*href=["'][^"']*(materialdesignicons|roboto)[^"']*["'][^>]*>/gi, '')
        .replace(/\n\s*\n/g, '\n')
    },
    generateBundle(options: NormalizedOutputOptions, bundle: Record<string, OutputAsset | OutputChunk>) {
      Object.entries(bundle)
        .filter(([ fileName ]) => fileName.endsWith('.html'))
        .forEach(([ , asset ]) => {
          if (asset.type === 'asset' && typeof asset.source === 'string') {
            asset.source = this.transformIndexHtml(asset.source)
          }
        })
    }
  }
}

export default defineConfig({
  base: '/search-star-wars-v3/',
  plugins: [
    VueRouter({ dts: 'src/typed-router.d.ts' }),
    Vue({ template: { transformAssetUrls } }),
    Vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' }
    }),
    optimizeFontPreload(),
    finalHtmlCleanup()
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic'
    ]
  },
  define: { 'process.env': {} },
  resolve: {
    alias: { '@': fileURLToPath(new URL('src', import.meta.url)) },
    extensions: [ '.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue' ]
  },
  server: { port: 3000, open: true },
  css: { preprocessorOptions: { scss: { additionalData: '' } } },
  build: {
    rollupOptions: {
      output: { assetFileNames: 'assets/[name]-[hash][extname]' },
      external: [ /.*\.eot$/ ]
    },
    modulePreload: false,
    assetsInlineLimit: 0
  }
})
