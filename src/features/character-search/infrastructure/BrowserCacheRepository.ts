import type { ICacheRepository } from '../domain/repositories/ICharacterRepository'

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Cache configuration
 */
interface CacheConfig {
  enabled: boolean
  defaultTtl: number
  maxSize: number
  keyPrefix: string
}

/**
 * Browser-based cache repository using localStorage
 */
export class BrowserCacheRepository implements ICacheRepository {
  private readonly config: CacheConfig
  private readonly storage: Storage

  constructor (config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: true,
      defaultTtl: 300_000, // 5 minutes
      maxSize: 100,
      keyPrefix: 'sw-cache:',
      ...config,
    }

    // Use localStorage if available, otherwise use in-memory storage
    this.storage = this.isStorageAvailable() ? localStorage : this.createMemoryStorage()
  }

  /**
   * Get value from cache
   */
  async get<T> (key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null
    }

    try {
      const cacheKey = this.buildKey(key)
      const item = this.storage.getItem(cacheKey)

      if (!item) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(item)

      // Check if expired
      if (this.isExpired(entry)) {
        await this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Cache get failed:', error)
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set<T> (key: string, value: T, ttlMs?: number): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    try {
      const cacheKey = this.buildKey(key)
      const ttl = ttlMs || this.config.defaultTtl

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      }

      // Check cache size and cleanup if needed
      await this.ensureCacheSize()

      this.storage.setItem(cacheKey, JSON.stringify(entry))
    } catch (error) {
      console.warn('Cache set failed:', error)
    }
  }

  /**
   * Delete value from cache
   */
  async delete (key: string): Promise<void> {
    try {
      const cacheKey = this.buildKey(key)
      this.storage.removeItem(cacheKey)
    } catch (error) {
      console.warn('Cache delete failed:', error)
    }
  }

  /**
   * Clear all cache
   */
  async clear (): Promise<void> {
    try {
      const keys = this.getCacheKeys()
      for (const key of keys) {
        this.storage.removeItem(key)
      }
    } catch (error) {
      console.warn('Cache clear failed:', error)
    }
  }

  /**
   * Check if key exists in cache
   */
  async has (key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  /**
   * Get cache statistics
   */
  getStats (): { size: number, keys: string[] } {
    const keys = this.getCacheKeys()
    return {
      size: keys.length,
      keys: keys.map(key => key.replace(this.config.keyPrefix, '')),
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup (): Promise<number> {
    let cleanedCount = 0

    try {
      const keys = this.getCacheKeys()

      for (const cacheKey of keys) {
        const item = this.storage.getItem(cacheKey)
        if (!item) {
          continue
        }

        try {
          const entry: CacheEntry<any> = JSON.parse(item)
          if (this.isExpired(entry)) {
            this.storage.removeItem(cacheKey)
            cleanedCount++
          }
        } catch {
          // Invalid entry, remove it
          this.storage.removeItem(cacheKey)
          cleanedCount++
        }
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error)
    }

    return cleanedCount
  }

  /**
   * Build cache key with prefix
   */
  private buildKey (key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired (entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Get all cache keys for this repository
   */
  private getCacheKeys (): string[] {
    const keys: string[] = []

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.config.keyPrefix)) {
          keys.push(key)
        }
      }
    } catch (error) {
      console.warn('Failed to get cache keys:', error)
    }

    return keys
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  private async ensureCacheSize (): Promise<void> {
    const keys = this.getCacheKeys()

    if (keys.length >= this.config.maxSize) {
      // Remove oldest entries (simple LRU)
      const entries: Array<{ key: string, timestamp: number }> = []

      for (const key of keys) {
        try {
          const item = this.storage.getItem(key)
          if (item) {
            const entry: CacheEntry<any> = JSON.parse(item)
            entries.push({ key, timestamp: entry.timestamp })
          }
        } catch {
          // Invalid entry, add it for removal
          entries.push({ key, timestamp: 0 })
        }
      }

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp)

      // Remove oldest entries to make room
      const toRemove = Math.max(1, Math.floor(this.config.maxSize * 0.1)) // Remove 10%
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        this.storage.removeItem(entries[i].key)
      }
    }
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable (): boolean {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Create in-memory storage fallback
   */
  private createMemoryStorage (): Storage {
    const store = new Map<string, string>()

    return {
      getItem (key: string): string | null {
        return store.get(key) || null
      },
      setItem (key: string, value: string): void {
        store.set(key, value)
      },
      removeItem (key: string): void {
        store.delete(key)
      },
      clear (): void {
        store.clear()
      },
      key (index: number): string | null {
        const keys = Array.from(store.keys())
        return keys[index] || null
      },
      get length (): number {
        return store.size
      },
    }
  }
}
