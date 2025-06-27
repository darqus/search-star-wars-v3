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
// Прямой импорт шрифтов для Vuetify
// import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
// import '@fontsource/roboto/500.css'
// import '@fontsource/roboto/700.css'
import '@mdi/font/css/materialdesignicons.css'

// Validate environment variables
validateEnv()

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
