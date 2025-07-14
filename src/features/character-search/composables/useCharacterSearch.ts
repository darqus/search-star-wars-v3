import type { Ref } from 'vue'
import { computed, readonly, ref } from 'vue'

import { Character } from '../domain/entities/Character'

import type { SearchResult } from '../domain/entities/Character'
import type { ICharacterRepository } from '../domain/repositories/ICharacterRepository'

import { InvalidSearchTermError } from '@/shared/errors/AppError'

/**
 * Search state interface
 */
type SearchState = {
  query: string
  isLoading: boolean
  results: Character[]
  error: string | null
  totalCount: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Search configuration
 */
type SearchConfig = {
  minQueryLength: number
  debounceMs: number
  pageSize: number
}

/**
 * Character search composable
 * Handles search functionality with debouncing and pagination
 */
export function useCharacterSearch(
    repository: ICharacterRepository,
    endpoint: Ref<string> | string,
    config: Partial<SearchConfig> = {}
) {
  // Configuration with defaults
  const searchConfig: SearchConfig = {
    minQueryLength: 3,
    debounceMs: 500,
    pageSize: 20,
    ...config,
  }

  // Reactive state
  const state = ref<SearchState>({
    query: '',
    isLoading: false,
    results: [],
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Computed properties
  const searchQuery = computed(() => state.value.query)
  const isLoading = computed(() => state.value.isLoading)
  const searchResults = computed(() => {
    // Ensure we return proper Character instances
    return state.value.results.map((result) => {
      // If it's already a Character instance, return it as is
      if (result instanceof Character) {
        return result
      }

      // Otherwise, reconstruct it as a Character instance
      return new Character(result.id, result.name, result.description, result.image, result.endpoint)
    })
  })
  const error = computed(() => state.value.error)
  const isEmpty = computed(() => state.value.results.length === 0 && !state.value.isLoading)
  const totalCount = computed(() => state.value.totalCount)
  const currentPage = computed(() => state.value.currentPage)
  const hasNextPage = computed(() => state.value.hasNextPage)
  const hasPrevPage = computed(() => state.value.hasPrevPage)

  /**
   * Perform search with the current query
   */
  const performSearch = async (query: string, page = 1): Promise<void> => {
    if (query.length < searchConfig.minQueryLength) {
      if (query.length > 0) {
        state.value.error = `Минимум ${searchConfig.minQueryLength} символа для поиска`
      } else {
        clearResults()
      }

      return
    }

    state.value.isLoading = true
    state.value.error = null

    try {
      const result = await repository.searchCharacters({
        search: query,
        page,
        limit: searchConfig.pageSize,
      })

      updateStateFromResult(result, query, page)
    } catch (error_) {
      handleSearchError(error_)
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Handle search input with debouncing
   */
  const onSearchInput = (query: string): void => {
    state.value.query = query

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer
    debounceTimer = setTimeout(() => {
      performSearch(query)
    }, searchConfig.debounceMs)
  }

  /**
   * Search without debouncing (immediate)
   */
  const searchImmediate = async (query: string): Promise<void> => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    state.value.query = query
    await performSearch(query)
  }

  /**
   * Go to next page
   */
  const nextPage = async (): Promise<void> => {
    if (state.value.hasNextPage && !state.value.isLoading) {
      await performSearch(state.value.query, state.value.currentPage + 1)
    }
  }

  /**
   * Go to previous page
   */
  const prevPage = async (): Promise<void> => {
    if (state.value.hasPrevPage && !state.value.isLoading) {
      await performSearch(state.value.query, state.value.currentPage - 1)
    }
  }

  /**
   * Go to specific page
   */
  const goToPage = async (page: number): Promise<void> => {
    if (page > 0 && !state.value.isLoading) {
      await performSearch(state.value.query, page)
    }
  }

  /**
   * Clear search results and query
   */
  const clearSearch = (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    state.value.query = ''
    clearResults()
  }

  /**
   * Clear only results, keep query
   */
  const clearResults = (): void => {
    state.value.results = []
    state.value.error = null
    state.value.totalCount = 0
    state.value.currentPage = 1
    state.value.hasNextPage = false
    state.value.hasPrevPage = false
  }

  /**
   * Retry last search
   */
  const retrySearch = async (): Promise<void> => {
    if (state.value.query) {
      await performSearch(state.value.query, state.value.currentPage)
    }
  }

  /**
   * Update state from search result
   */
  const updateStateFromResult = (result: SearchResult, query: string, page: number): void => {
    if (!result) {
      console.warn('updateStateFromResult called with undefined result')

      return
    }

    state.value.results = result.characters || []
    state.value.totalCount = result.totalCount || 0
    state.value.currentPage = page
    state.value.hasNextPage = result.hasNextPage || false
    state.value.hasPrevPage = result.hasPrevPage || false
    state.value.query = query
  }

  /**
   * Handle search errors
   */
  const handleSearchError = (err: unknown): void => {
    console.error('Search failed:', err)

    // Clear results but preserve the error
    state.value.results = []
    state.value.totalCount = 0
    state.value.currentPage = 1
    state.value.hasNextPage = false
    state.value.hasPrevPage = false

    // Set error message
    if (err instanceof InvalidSearchTermError) {
      state.value.error = err.userMessage
    } else if (err instanceof Error) {
      state.value.error = err.message
    } else {
      state.value.error = 'Произошла ошибка при поиске'
    }
  }

  return {
    // State
    searchQuery: readonly(searchQuery),
    isLoading: readonly(isLoading),
    searchResults, // Don't wrap with readonly to preserve Character class instances
    error: readonly(error),
    isEmpty: readonly(isEmpty),
    totalCount: readonly(totalCount),
    currentPage: readonly(currentPage),
    hasNextPage: readonly(hasNextPage),
    hasPrevPage: readonly(hasPrevPage),

    // Actions
    onSearchInput,
    searchImmediate,
    nextPage,
    prevPage,
    goToPage,
    clearSearch,
    clearResults,
    retrySearch,
  }
}
