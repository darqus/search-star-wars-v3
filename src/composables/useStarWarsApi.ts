import { computed, ref } from 'vue'

import type { ApiResponse, Item } from '@/types/api'

import { apiCache } from '@/utils/apiCache'

const { VITE_APP_API_BASE_URL: API_URL, VITE_APP_IMAGE_BASE_URL: IMAGE_BASE_URL } = import.meta.env

const transformImageUrl = (image: string): string => {
  // Return absolute URLs without transformation
  if (image.startsWith('http')) {
    return image
  }

  // Clean up any leading/trailing slashes
  const cleanImage = image.replace(/^\/+|\/+$/g, '')

  // New API format: images are already in correct format (img/category/filename)
  return `${IMAGE_BASE_URL}/${cleanImage}`
}

export const useStarWarsApi = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isCachingEnabled = ref(true)

  const fetchData = async (
    endpoint: string,
    page = 1,
    limit = 20,
    useCache = true,
    search?: string
  ): Promise<ApiResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) {
        params.append('search', search)
      }

      const cacheKey = `${endpoint}?${params}`

      // const fullUrl = `${API_URL}/${endpoint}?${params}`

      // console.log('🌐 Making API request to:', fullUrl)

      // Don't use cache for search requests as specified
      const shouldUseCache = isCachingEnabled.value && useCache && !search

      // Try to get from cache first (but not for search requests)
      if (shouldUseCache) {
        const cachedData = apiCache.get<ApiResponse>(cacheKey)

        if (cachedData) {
          // console.log(`Cache hit for ${cacheKey}`)
          // We can skip the loading state for cached responses
          isLoading.value = false

          return cachedData
        }

        // console.log(`Cache miss for ${cacheKey}`)
      }

      const response = await fetch(`${API_URL}/${endpoint}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const rawData = await response.json()

      // Transform data to match our API interface
      const data: ApiResponse = {
        results: rawData.results.map((item: Item) => ({
          ...item,

          // Ensure image URL has the correct format
          image: transformImageUrl(item.image),
        })),
        total: rawData.total,
        count: rawData.count,
        limit: rawData.limit,
        page: rawData.page,
        pages: rawData.pages,
      }

      // Store in cache (but not search results)
      if (isCachingEnabled.value && !search) {
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
