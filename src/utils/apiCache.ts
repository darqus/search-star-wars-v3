// Cache implementation for API requests
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number // Cache expiry time in milliseconds
}

class ApiCache {
  private cache: Map<string, CacheItem<unknown>> = new Map()
  private defaultExpiry: number = 5 * 60 * 1000 // 5 minutes default

  /**
   * Get an item from cache
   * @param key Cache key
   * @returns The cached data or null if not found or expired
   */
  get<T> (key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if cache entry has expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * Set an item in cache
   * @param key Cache key
   * @param data Data to cache
   * @param expiry Optional custom expiry time in milliseconds
   */
  set<T> (key: string, data: T, expiry: number = this.defaultExpiry): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    })
  }

  /**
   * Remove an item from cache
   * @param key Cache key
   */
  delete (key: string): void {
    this.cache.delete(key)
  }

  /**
   * Check if an item exists in cache and is not expired
   * @param key Cache key
   * @returns True if item exists and is valid
   */
  has (key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {
      return false
    }

    if (Date.now() - item.timestamp > item.expiry) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear all cache entries
   */
  clear (): void {
    this.cache.clear()
  }

  /**
   * Set default expiry time for cache entries
   * @param expiry Expiry time in milliseconds
   */
  setDefaultExpiry (expiry: number): void {
    this.defaultExpiry = expiry
  }
}

// Export a singleton instance
export const apiCache = new ApiCache()
