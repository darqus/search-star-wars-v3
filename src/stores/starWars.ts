import type { Item } from '@/types/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStarWarsApi } from '@/composables/useStarWarsApi'
import {
  API_ENDPOINTS,
  DEFAULT_CACHE_ENABLED,
  DEFAULT_CACHE_EXPIRY,
  DEFAULT_PAGE_SIZE,
} from '@/constants/api'

export const useStarWarsStore = defineStore('starWars', () => {
  const {
    fetchData,
    preloadImage,
    isLoading: apiIsLoading,
    error: apiError,
    setCachingEnabled,
    setCacheExpiry,
  } = useStarWarsApi()

  // Initialize cache with default settings
  setCachingEnabled(DEFAULT_CACHE_ENABLED)
  setCacheExpiry(DEFAULT_CACHE_EXPIRY)

  // State
  const items = ref<Item[]>([])
  const selectedApi = ref(API_ENDPOINTS[0].api)
  const selectedItem = ref<Item | undefined>(undefined)
  const searchInput = ref<string>('')
  const imgURL = ref('')
  const imgLoaded = ref(false)
  const result = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Computed
  const isLoading = computed(() => apiIsLoading.value)
  const error = computed(() => apiError.value)
  const filteredItems = computed(() => {
    if (!searchInput.value) {
      return items.value
    }

    const searchTerm = searchInput.value.toLowerCase()
    return items.value.filter(item => {
      return item.name.toLowerCase().includes(searchTerm)
        || item.description.toLowerCase().includes(searchTerm)
    })
  })

  // Actions
  async function fetchItems (skipCache = false) {
    try {
      const response = await fetchData(
        selectedApi.value,
        currentPage.value,
        DEFAULT_PAGE_SIZE,
        !skipCache, // useCache parameter
      )

      items.value = response.data
      totalPages.value = response.info.total

      if (items.value.length > 0) {
        await selectItem(items.value[0])
      } else {
        resetSelection()
      }

      return response
    } catch (error) {
      console.error('Failed to fetch data:', error)
      resetSelection()
      throw error
    }
  }

  async function selectItem (item: Item) {
    if (!item) {
      resetSelection()
      return
    }

    selectedItem.value = item

    if (!item.image) {
      imgURL.value = ''
      imgLoaded.value = false
      result.value = JSON.stringify(item, null, 2)
      return
    }

    try {
      imgLoaded.value = false
      await preloadImage(item.image)
      imgURL.value = item.image
      imgLoaded.value = true
      result.value = JSON.stringify(item, null, 2)
    } catch (error) {
      console.error('Failed to load image:', error)
      imgURL.value = ''
      imgLoaded.value = false
      result.value = JSON.stringify(item, null, 2)
    }
  }

  function setApiEndpoint (endpoint: string) {
    if (selectedApi.value !== endpoint) {
      selectedApi.value = endpoint
      currentPage.value = 1
      fetchItems()
    }
  }

  function setPage (page: number) {
    if (currentPage.value !== page) {
      currentPage.value = page
      fetchItems()
    }
  }

  // Cache management functions
  function invalidateCache () {
    setCacheExpiry(0) // Set expiry to 0 to force refresh
    fetchItems() // Re-fetch data
    setCacheExpiry(DEFAULT_CACHE_EXPIRY) // Restore default expiry
  }

  function toggleCaching (enabled: boolean) {
    setCachingEnabled(enabled)
  }

  function setSearchTerm (term: string) {
    searchInput.value = term
  }

  function resetSelection () {
    selectedItem.value = undefined
    imgURL.value = ''
    result.value = ''
    imgLoaded.value = false
  }

  return {
    // State
    items,
    selectedApi,
    selectedItem,
    searchInput,
    imgURL,
    imgLoaded,
    result,
    currentPage,
    totalPages,

    // Computed
    isLoading,
    error,
    filteredItems,

    // Actions
    fetchItems,
    selectItem,
    setApiEndpoint,
    setPage,
    setSearchTerm,
    resetSelection,

    // Cache management
    invalidateCache,
    toggleCaching,
  }
})
