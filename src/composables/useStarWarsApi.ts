import type { ApiResponse } from '@/types/api'
import { computed, ref } from 'vue'
import { apiCache } from '@/utils/apiCache'

const API_URL = import.meta.env.VITE_APP_API_BASE_URL

export const useStarWarsApi = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isCachingEnabled = ref(true)

  const fetchData = async (
    endpoint: string,
    page = 1,
    limit = 20,
    useCache = true,
  ): Promise<ApiResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      const cacheKey = `${endpoint}?${params}`

      // Try to get from cache first
      if (isCachingEnabled.value && useCache) {
        const cachedData = apiCache.get<ApiResponse>(cacheKey)
        if (cachedData) {
          console.log(`Cache hit for ${cacheKey}`)
          // We can skip the loading state for cached responses
          isLoading.value = false
          return cachedData
        }
        console.log(`Cache miss for ${cacheKey}`)
      }

      const response = await fetch(`${API_URL}/${endpoint}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Store in cache
      if (isCachingEnabled.value) {
        apiCache.set<ApiResponse>(cacheKey, data)
      }

      return data
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'Unknown error'
      throw error_
    } finally {
      isLoading.value = false
    }
  }

  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener('load', () => resolve())
      img.addEventListener('error', () => reject(new Error(`Failed to load image: ${url}`)))
      img.src = url
    })
  }

  /**
   * Clear all API cache
   */
  const clearCache = (): void => {
    apiCache.clear()
  }

  /**
   * Enable or disable API caching
   */
  const setCachingEnabled = (enabled: boolean): void => {
    isCachingEnabled.value = enabled
  }

  /**
   * Set the default cache expiry time
   */
  const setCacheExpiry = (expiryTime: number): void => {
    apiCache.setDefaultExpiry(expiryTime)
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isCachingEnabled: computed(() => isCachingEnabled.value),
    fetchData,
    preloadImage,
    clearCache,
    setCachingEnabled,
    setCacheExpiry,
  }
}
