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
  // Return items directly since server-side filtering is used
  const filteredItems = computed(() => items.value)

  // Actions
  async function fetchItems (skipCache = false, searchTerm?: string) {
    try {
      const response = await fetchData(
        selectedApi.value,
        currentPage.value,
        DEFAULT_PAGE_SIZE,
        !skipCache, // useCache parameter
        searchTerm, // search parameter
      )

      items.value = response.data
      totalPages.value = response.info.total

      if (items.value.length === 0) {
        resetSelection()
      }

      return response
    } catch (error) {
      console.error('Failed to fetch data:', error)
      resetSelection()
      throw error
    }
  }

  // Specific method for search requests with limit of 5 items
  async function fetchSearchResults (searchTerm: string) {
    try {
      const response = await fetchData(
        selectedApi.value,
        1, // Always use page 1 for search
        5, // Limit to 5 items for dropdown
        false, // Never cache search results
        searchTerm,
      )

      items.value = response.data
      // Don't update totalPages for search results

      return response
    } catch (error) {
      console.error('Failed to fetch search results:', error)
      items.value = []
      throw error
    }
  }

  async function selectItem (nameOrItem: string | Item) {
    if (!nameOrItem) {
      resetSelection()
      return
    }

    // If we received a string (name), find the corresponding item
    const item = typeof nameOrItem === 'string'
      ? items.value.find(i => i.name === nameOrItem)
      : nameOrItem

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
      searchInput.value = '' // Clear search when API changes
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

  // Search debounce timeout
  let searchTimeout: ReturnType<typeof setTimeout>

  function setSearchTerm (term: string) {
    console.log('Searched term:', term)
    searchInput.value = term

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Only search if we have 3 or more characters
    if (term.length >= 3) {
      searchTimeout = setTimeout(() => {
        // Force skipCache=true for search requests (no caching)
        fetchItems(true, term)
      }, 300) // Reduced timeout for better UX
    } else if (term.length === 0) {
      // Reset to regular fetch when search is cleared
      fetchItems()
    }
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
    fetchSearchResults,
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
