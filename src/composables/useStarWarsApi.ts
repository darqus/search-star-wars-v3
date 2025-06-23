import type { ApiResponse } from '@/types/api'
import { computed, ref } from 'vue'

const API_URL = import.meta.env.VITE_APP_API_BASE_URL

export const useStarWarsApi = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async (
    endpoint: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse> => {
    isLoading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      const response = await fetch(`${API_URL}/${endpoint}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
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
      img.onerror = reject
      img.src = url
    })
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchData,
    preloadImage,
  }
}
