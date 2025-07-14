import { createPinia } from 'pinia'

// Create and export the pinia instance
export const pinia = createPinia()

// Re-export all stores
export * from './starWars'

export * from './theme'
