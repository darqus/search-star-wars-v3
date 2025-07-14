/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

// Plugins
import router from '../router'
import vuetify from './vuetify'

import { pinia } from '@/stores'

export function registerPlugins(app: App) {
  app.use(pinia).use(vuetify).use(router)
}
