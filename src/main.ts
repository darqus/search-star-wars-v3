/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Config
import { validateEnv } from '@/config/env'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'

// Validate environment variables
validateEnv()

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
