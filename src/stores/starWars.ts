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

  // Separate state for search functionality
  const searchResults = ref<Item[]>([])
  const searchTerm = ref('')

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

      // Store search results separately from main items
      searchResults.value = response.data

      return response
    } catch (error) {
      console.error('Failed to fetch search results:', error)
      searchResults.value = []
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

  // Separate function for selecting from search results
  async function selectFromSearch (nameOrItem: string | Item) {
    if (!nameOrItem) {
      return
    }

    // If we received a string (name), find the corresponding item
    const item = typeof nameOrItem === 'string'
      ? searchResults.value.find(i => i.name === nameOrItem)
      : nameOrItem

    if (!item) {
      return
    }

    // Update search term
    searchTerm.value = item.name

    // Set as selected item to display image and details
    selectedItem.value = item

    // Load image and set result details
    if (item.image) {
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
    } else {
      imgURL.value = ''
      imgLoaded.value = false
      result.value = JSON.stringify(item, null, 2)
    }

    // Clear search results after selection
    searchResults.value = []
  }

  function setApiEndpoint (endpoint: string) {
    if (selectedApi.value !== endpoint) {
      selectedApi.value = endpoint
      currentPage.value = 1
      searchInput.value = '' // Clear search when API changes
      searchTerm.value = '' // Clear search term
      searchResults.value = [] // Clear search results
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
    console.log('Setting search term:', term)
    searchTerm.value = term
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

    // Search state
    searchResults,
    searchTerm,

    // Computed
    isLoading,
    error,
    filteredItems,

    // Actions
    fetchItems,
    fetchSearchResults,
    selectItem,
    selectFromSearch,
    setApiEndpoint,
    setPage,
    setSearchTerm,
    resetSelection,

    // Cache management
    invalidateCache,
    toggleCaching,
  }
})
