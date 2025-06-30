import type { Character, SearchResult } from '../domain/entities/Character'
import type { ICacheRepository, ICharacterRepository, SearchParams } from '../domain/repositories/ICharacterRepository'

/**
 * Cache configuration
 */
interface CacheConfig {
  characterTtl: number // TTL for individual characters
  searchTtl: number // TTL for search results
  enabled: boolean
}

/**
 * Cached character repository decorator
 * Wraps another repository with caching functionality
 */
export class CachedCharacterRepository implements ICharacterRepository {
  private readonly config: CacheConfig = {
    characterTtl: 300_000, // 5 minutes
    searchTtl: 60_000, // 1 minute (shorter for search results)
    enabled: true,
  }

  constructor (
    private readonly repository: ICharacterRepository,
    private readonly cache: ICacheRepository,
    config?: Partial<CacheConfig>,
  ) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Find character by ID with caching
   */
  async findById (id: string, endpoint: string): Promise<Character | null> {
    if (!this.config.enabled) {
      return this.repository.findById(id, endpoint)
    }

    const cacheKey = this.buildCharacterCacheKey(id, endpoint)

    try {
      // Try to get from cache first
      const cached = await this.cache.get<Character>(cacheKey)
      if (cached) {
        return cached
      }
    } catch (error) {
      // Cache miss or error - continue to fetch from repository
      console.warn('Cache get failed:', error)
    }

    // Fetch from repository
    const character = await this.repository.findById(id, endpoint)

    // Cache the result if found
    if (character) {
      try {
        await this.cache.set(cacheKey, character, this.config.characterTtl)
      } catch (error) {
        // Cache set failed - log but don't throw
        console.warn('Cache set failed:', error)
      }
    }

    return character
  }

  /**
   * Search characters with caching
   */
  async search (params: SearchParams): Promise<SearchResult> {
    if (!this.config.enabled) {
      return this.repository.search(params)
    }

    const cacheKey = this.buildSearchCacheKey(params)

    try {
      // Try to get from cache first
      const cached = await this.cache.get<SearchResult>(cacheKey)
      if (cached) {
        return cached
      }
    } catch (error) {
      // Cache miss or error - continue to fetch from repository
      console.warn('Cache get failed:', error)
    }

    // Fetch from repository
    const result = await this.repository.search(params)

    // Cache the result
    try {
      await this.cache.set(cacheKey, result, this.config.searchTtl)
    } catch (error) {
      // Cache set failed - log but don't throw
      console.warn('Cache set failed:', error)
    }

    return result
  }

  /**
   * Get characters by endpoint with caching
   */
  async findByEndpoint (endpoint: string, page: number, limit: number): Promise<SearchResult> {
    return this.search({ endpoint, page, limit })
  }

  /**
   * Clear all cache
   */
  clearCache (): void {
    this.cache.clear().catch(error => {
      console.warn('Cache clear failed:', error)
    })

    // Also clear the underlying repository cache if it has one
    this.repository.clearCache()
  }

  /**
   * Enable or disable caching
   */
  setCacheEnabled (enabled: boolean): void {
    this.config.enabled = enabled
  }

  /**
   * Update cache TTL settings
   */
  updateCacheTtl (characterTtl?: number, searchTtl?: number): void {
    if (characterTtl !== undefined) {
      this.config.characterTtl = characterTtl
    }
    if (searchTtl !== undefined) {
      this.config.searchTtl = searchTtl
    }
  }

  /**
   * Build cache key for individual character
   */
  private buildCharacterCacheKey (id: string, endpoint: string): string {
    return `character:${endpoint}:${id}`
  }

  /**
   * Build cache key for search results
   */
  private buildSearchCacheKey (params: SearchParams): string {
    const parts = [
      'search',
      params.endpoint,
      `page:${params.page}`,
      `limit:${params.limit}`,
    ]

    if (params.search) {
      parts.push(`term:${params.search}`)
    }

    return parts.join(':')
  }
}
