import { Character as CharacterEntity, SearchResult as SearchResultEntity } from '../domain/entities/Character'

import type { Character, SearchResult } from '../domain/entities/Character'
import type { ICacheRepository, ICharacterRepository } from '../domain/repositories/ICharacterRepository'

/**
 * Cache configuration
 */
type CacheConfig = {
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

  constructor(
    private readonly repository: ICharacterRepository,
    private readonly cache: ICacheRepository,
    config?: Partial<CacheConfig>
  ) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Get character by ID with caching
   */
  async getCharacter(id: string): Promise<Character | null> {
    if (!this.config.enabled) {
      return this.repository.getCharacter(id)
    }

    const cacheKey = this.buildCharacterCacheKey(id)

    try {
      // Try to get from cache first
      const cached = await this.cache.get<Character>(cacheKey)

      if (cached) {
        return this.reconstructCharacter(cached)
      }
    } catch (error: unknown) {
      // Cache miss or error - continue to fetch from repository
      console.warn('Cache get failed:', error)
    }

    // Fetch from repository
    const character = await this.repository.getCharacter(id)

    // Cache the result if found
    if (character) {
      try {
        await this.cache.set(cacheKey, character, this.config.characterTtl)
      } catch (error: unknown) {
        // Cache set failed - log but don't throw
        console.warn('Cache set failed:', error)
      }
    }

    return character
  }

  /**
   * Search characters with caching
   */
  async searchCharacters(filter: { search?: string; page?: number; limit?: number }): Promise<SearchResult> {
    if (!this.config.enabled) {
      return this.repository.searchCharacters(filter)
    }

    const cacheKey = this.buildSearchCacheKey(filter)

    try {
      // Try to get from cache first
      const cached = await this.cache.get<SearchResult>(cacheKey)

      if (cached) {
        return this.reconstructSearchResult(cached)
      }
    } catch (error: unknown) {
      // Cache miss or error - continue to fetch from repository
      console.warn('Cache get failed:', error)
    }

    // Fetch from repository
    const result = await this.repository.searchCharacters(filter)

    // Cache the result
    try {
      await this.cache.set(cacheKey, result, this.config.searchTtl)
    } catch (error: unknown) {
      // Cache set failed - log but don't throw
      console.warn('Cache set failed:', error)
    }

    return result
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear().catch((error: unknown) => {
      console.warn('Cache clear failed:', error)
    })
    if (typeof (this.repository as { clearCache?: () => void }).clearCache === 'function') {
      (this.repository as { clearCache?: () => void }).clearCache?.()
    }
  }

  /**
   * Enable or disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  /**
   * Update cache TTL settings
   */
  updateCacheTtl(characterTtl?: number, searchTtl?: number): void {
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
  private buildCharacterCacheKey(id: string): string {
    return `character:${id}`
  }

  /**
   * Build cache key for search results
   */
  private buildSearchCacheKey(params: { search?: string; page?: number; limit?: number }): string {
    const parts = [ 'search' ]

    if (params.search) {parts.push(`term:${params.search}`)}
    if (params.page !== undefined) {parts.push(`page:${params.page}`)}
    if (params.limit !== undefined) {parts.push(`limit:${params.limit}`)}

    return parts.join(':')
  }

  /**
   * Reconstruct Character instance from cached plain object
   */
  private reconstructCharacter(cached: unknown): Character {
    if (
      typeof cached === 'object' &&
      cached !== null &&
      'id' in cached &&
      'name' in cached
    ) {
      const c = cached as { id: string; name: string; description?: string; image?: string; endpoint?: string }

      return new CharacterEntity(
        c.id,
        c.name,
        c.description ?? '',
        c.image ?? '',
        c.endpoint ?? ''
      )
    }
    throw new Error('Invalid cached character data')
  }

  /**
   * Reconstruct SearchResult instance from cached plain object
   */
  private reconstructSearchResult(cached: unknown): SearchResult {
    if (
      typeof cached === 'object' &&
      cached !== null &&
      'characters' in cached &&
      Array.isArray((cached as { characters: unknown[] }).characters)
    ) {
      const c = cached as {
        characters: unknown[]
        totalCount?: number
        currentPage?: number
        hasNextPage?: boolean
        hasPrevPage?: boolean
      }
      const reconstructedCharacters = c.characters.map((char) => this.reconstructCharacter(char))

      return new SearchResultEntity(
        reconstructedCharacters,
        c.totalCount ?? 0,
        c.currentPage ?? 1,
        c.hasNextPage ?? false,
        c.hasPrevPage ?? false
      )
    }
    throw new Error('Invalid cached search result data')
  }
}
