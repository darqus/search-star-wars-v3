import type { Character, SearchResult } from '../entities/Character'

/**
 * Search parameters for character queries
 */
export interface SearchParams {
  endpoint: string
  page: number
  limit: number
  search?: string
}

/**
 * Character repository interface
 * Defines contract for character data access
 */
export interface ICharacterRepository {
  /**
   * Find character by ID
   */
  findById: (id: string, endpoint: string) => Promise<Character | null>

  /**
   * Search characters with pagination
   */
  search: (params: SearchParams) => Promise<SearchResult>

  /**
   * Get characters by endpoint with pagination
   */
  findByEndpoint: (endpoint: string, page: number, limit: number) => Promise<SearchResult>

  /**
   * Clear repository cache
   */
  clearCache: () => void
}

/**
 * Cache repository interface
 */
export interface ICacheRepository {
  /**
   * Get value from cache
   */
  get: <T>(key: string) => Promise<T | null>

  /**
   * Set value in cache with TTL
   */
  set: <T>(key: string, value: T, ttlMs?: number) => Promise<void>

  /**
   * Delete value from cache
   */
  delete: (key: string) => Promise<void>

  /**
   * Clear all cache
   */
  clear: () => Promise<void>

  /**
   * Check if key exists in cache
   */
  has: (key: string) => Promise<boolean>
}
