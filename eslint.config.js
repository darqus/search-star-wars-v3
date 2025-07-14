import js from '@eslint/js'
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginImport from 'eslint-plugin-import'
import pluginPrettier from 'eslint-plugin-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

import { rules } from './.config/eslint-rules/index.js'

export default defineConfigWithVueTs(
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/tsconfig.json',
      '**/package.json',
      '**/yarn.lock',
      'dist',
      'node_modules',
    ],
  },

  // Apply Prettier first
  prettierSkipFormatting,

  js.configs.recommended,

  pluginVue.configs['flat/strongly-recommended'],

  {
    // Register the import and prettier plugins
    plugins: {
      import: pluginImport,
      prettier: pluginPrettier,
    },
  },

  // Apply overrides to TypeScript and Vue files
  {
    files: [ '**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs', '**/*.cjs', '**/*.vue' ],
    rules,
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // https://github.com/vuejs/eslint-config-typescript
  vueTsConfigs.recommendedTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        chrome: 'readonly',
      },
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  }
)
