import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import { characterSearchFeature } from '@/features/character-search'
import { configService } from '@/shared/config/ConfigService'
import { ConsoleLogger, ErrorHandlerService } from '@/shared/services/ErrorHandlerService'

import App from './App.vue'
import router from './router'

// Extend Window interface for development helpers
declare global {
  interface Window {
    __APP_DEBUG__?: {
      configService: any
      characterSearchFeature: any
      errorHandlerService: any
    }
  }
}

// Create error handler instance
const errorHandlerService = new ErrorHandlerService(
  new ConsoleLogger(),
  {
    error: (message: string) => console.error(message),
    warning: (message: string) => console.warn(message),
    success: (message: string) => console.log(message),
    info: (message: string) => console.info(message),
  },
)

/**
 * Setup application features
 */
function setupFeatures (): void {
  try {
    // Initialize character search feature
    characterSearchFeature.setup()

    console.info('All features initialized successfully')
  } catch (error) {
    console.error('Failed to initialize features:', error)
    errorHandlerService.handle(error as Error)
  }
}

/**
 * Create and configure Vue application
 */
function createApplication () {
  const app = createApp(App)

  // Setup Vuetify
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'light',
    },
  })

  app.use(vuetify)
  app.use(router)

  // Global error handler
  app.config.errorHandler = (error, instance, info) => {
    console.error('Vue error:', error, info)
    errorHandlerService.handle(error as Error)
  }

  return app
}

/**
 * Bootstrap application
 */
async function bootstrap () {
  try {
    // Validate configuration
    console.info('Configuration loaded:', {
      environment: configService.getEnvironment(),
      apiBaseUrl: configService.isDevelopment() ? configService.getApiConfig().baseUrl : '***',
      features: Object.keys(configService.get('features')).filter(key =>
        configService.isFeatureEnabled(key as any),
      ),
    })

    // Setup features
    setupFeatures()

    // Create and mount app
    const app = createApplication()
    app.mount('#app')

    console.info('Application started successfully')
  } catch (error) {
    console.error('Failed to start application:', error)

    // Show user-friendly error
    const errorElement = document.createElement('div')
    errorElement.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="text-align: center; max-width: 400px; padding: 2rem;">
          <h1 style="color: #d32f2f; margin-bottom: 1rem;">Ошибка загрузки</h1>
          <p style="color: #666; margin-bottom: 2rem;">
            Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background: #1976d2;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Обновить страницу
          </button>
        </div>
      </div>
    `

    document.body.append(errorElement)
  }
}

// Start application
bootstrap()

/**
 * Development helpers
 */
if (configService.isDevelopment()) {
  // Expose useful objects for debugging
  window.__APP_DEBUG__ = {
    configService,
    characterSearchFeature,
    errorHandlerService,
  }

  // Log performance metrics
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    console.info('Performance metrics:', {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
      firstContentfulPaint: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
    })
  })
}
