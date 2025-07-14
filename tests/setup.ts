import { afterEach, vi } from 'vitest'

// Автоматическая очистка DOM после каждого теста
afterEach(() => {
  document.body.innerHTML = ''
})

// Мокирование localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string): string | null => {
      return store[key] || null
    }),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key]
    }),
    clear: vi.fn((): void => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Мокирование env переменных
vi.mock('@/config/env', () => ({
  env: {
    API_BASE_URL: 'https://fake-api.example.com',
    APP_NAME: 'Star Wars Search Test',
    APP_VERSION: '1.0.0-test',
    BUILD_DATE: '2025-06-23',
    IS_PRODUCTION: false,
  },
  validateEnv: vi.fn(),
}))

// Глобальное подавление предупреждений
console.warn = vi.fn()

// Mock Vuetify CSS files
vi.mock('vuetify/lib/components/VCode/VCode.css', () => ({}))
