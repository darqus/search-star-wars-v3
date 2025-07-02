import type { ICharacterRepository } from './domain/repositories/ICharacterRepository'

import { inject, TOKENS } from '@/shared/di/Container'

import { useCharacterSearch } from './composables/useCharacterSearch'
import { setupCharacterSearchDI } from './infrastructure/setup'

/**
 * Public API for the character search feature
 */
export interface CharacterSearchFeature {
  // Setup and teardown
  setup: () => void
  cleanup: () => void

  // Main composable
  useCharacterSearch: typeof useCharacterSearch

  // Direct repository access (for advanced use cases)
  getRepository: () => ICharacterRepository
}

/**
 * Character search feature implementation
 */
class CharacterSearchFeatureImpl implements CharacterSearchFeature {
  private isSetup = false

  /**
   * Get the main search composable
   */
  get useCharacterSearch () {
    this.ensureSetup()
    return useCharacterSearch
  }

  /**
   * Initialize the feature and its dependencies
   */
  setup (): void {
    if (this.isSetup) {
      console.warn('Character search feature is already setup')
      return
    }

    try {
      setupCharacterSearchDI()
      this.isSetup = true
      console.info('Character search feature initialized successfully')
    } catch (error) {
      console.error('Failed to setup character search feature:', error)
      throw error
    }
  }

  /**
   * Cleanup resources
   */
  cleanup (): void {
    if (!this.isSetup) {
      return
    }

    try {
      // Cleanup will be handled by the DI container
      this.isSetup = false
      console.info('Character search feature cleaned up successfully')
    } catch (error) {
      console.error('Failed to cleanup character search feature:', error)
    }
  }

  /**
   * Get direct access to the repository
   */
  getRepository (): ICharacterRepository {
    this.ensureSetup()
    return inject<ICharacterRepository>(TOKENS.CHARACTER_REPOSITORY)
  }

  /**
   * Ensure feature is properly setup
   */
  private ensureSetup (): void {
    if (!this.isSetup) {
      throw new Error('Character search feature is not setup. Call setup() first.')
    }
  }
}

/**
 * Singleton instance of the feature
 */
export const characterSearchFeature: CharacterSearchFeature = new CharacterSearchFeatureImpl()

/**
 * Convenience function to create search composable with repository injection
 */
export function createCharacterSearch (endpoint: string, config?: any) {
  const repository = characterSearchFeature.getRepository()
  return characterSearchFeature.useCharacterSearch(repository, endpoint, config)
}

/**
 * Re-export composable for direct use
 */
export { useCharacterSearch } from './composables/useCharacterSearch'

/**
 * Export types for external use
 */
export type { Character, SearchResult } from './domain/entities/Character'
export type { ICharacterRepository, SearchParams } from './domain/repositories/ICharacterRepository'
