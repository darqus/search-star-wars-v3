import { nextTick, ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCharacterSearch } from '../composables/useCharacterSearch'
import { SearchResult } from '../domain/entities/Character'

import type { ICharacterRepository, SearchParams } from '../domain/repositories/ICharacterRepository'
import type { MockedFunction } from 'vitest'

// Mock repository
const createMockRepository = (): ICharacterRepository => {
  const mockRepository = {
    findById: vi.fn(),
    search: vi.fn(),
    findByEndpoint: vi.fn(),
    clearCache: vi.fn(),
  }

  return mockRepository as ICharacterRepository
}

describe('useCharacterSearch', () => {
  let mockRepository: ICharacterRepository
  let mockSearch: MockedFunction<(params: SearchParams) => Promise<SearchResult>>

  beforeEach(() => {
    mockRepository = createMockRepository()
    mockSearch = mockRepository.search as MockedFunction<(params: SearchParams) => Promise<SearchResult>>
  })

  it('should initialize with empty state', () => {
    const { searchQuery, isLoading, searchResults, error } = useCharacterSearch(mockRepository, 'characters')

    expect(searchQuery.value).toBe('')
    expect(isLoading.value).toBe(false)
    expect(searchResults.value).toEqual([])
    expect(error.value).toBe(null)
  })

  it('should perform search when query is long enough', async () => {
    const mockResult = SearchResult.fromApiResponse(
      {
        results: [ { id: '1', name: 'Luke Skywalker', description: 'Jedi' } ],
        total: 1,
        page: 1,
        pages: 1,
        count: 1,
        limit: 20,
      },
      'characters'
    )

    mockSearch.mockResolvedValue(mockResult)

    const { searchImmediate, searchResults, isLoading } = useCharacterSearch(mockRepository, 'characters')

    await searchImmediate('Luke')
    await nextTick()

    expect(mockSearch).toHaveBeenCalledWith({
      endpoint: 'characters',
      page: 1,
      limit: 20,
      search: 'Luke',
    })
    expect(searchResults.value).toHaveLength(1)
    expect(searchResults.value[0].name).toBe('Luke Skywalker')
    expect(isLoading.value).toBe(false)
  })

  it('should show error for short queries', async () => {
    const { searchImmediate, error } = useCharacterSearch(mockRepository, 'characters')

    await searchImmediate('Lu')
    await nextTick()

    expect(error.value).toBe('Минимум 3 символа для поиска')
    expect(mockSearch).not.toHaveBeenCalled()
  })

  it('should clear results for empty query', async () => {
    const { searchImmediate, searchResults, clearSearch } = useCharacterSearch(mockRepository, 'characters')

    // First, perform a search
    mockSearch.mockResolvedValue(
      SearchResult.fromApiResponse(
        {
          results: [ { id: '1', name: 'Luke' } ],
          total: 1,
          page: 1,
          pages: 1,
          count: 1,
          limit: 20,
        },
        'characters'
      )
    )

    await searchImmediate('Luke')
    expect(searchResults.value).toHaveLength(1)

    // Then clear
    clearSearch()
    expect(searchResults.value).toHaveLength(0)
  })

  it('should handle search errors', async () => {
    const searchError = new Error('Network error')

    mockSearch.mockRejectedValue(searchError)

    const { searchImmediate, error, searchResults } = useCharacterSearch(mockRepository, 'characters')

    await searchImmediate('Luke')
    await nextTick()

    expect(error.value).toBe('Network error')
    expect(searchResults.value).toEqual([])
  })

  it('should handle pagination', async () => {
    const mockResult = SearchResult.fromApiResponse(
      {
        results: [ { id: '1', name: 'Luke' } ],
        total: 50,
        page: 2,
        pages: 3,
        count: 1,
        limit: 20,
      },
      'characters'
    )

    mockSearch.mockResolvedValue(mockResult)

    const { searchImmediate, goToPage, currentPage, hasNextPage, hasPrevPage } = useCharacterSearch(
      mockRepository,
      'characters'
    )

    await searchImmediate('Luke')
    await goToPage(2)

    expect(mockSearch).toHaveBeenLastCalledWith({
      endpoint: 'characters',
      page: 2,
      limit: 20,
      search: 'Luke',
    })
    expect(currentPage.value).toBe(2)
    expect(hasNextPage.value).toBe(true)
    expect(hasPrevPage.value).toBe(true)
  })

  it('should work with reactive endpoint', async () => {
    const endpoint = ref('characters')

    const { searchImmediate } = useCharacterSearch(mockRepository, endpoint)

    mockSearch.mockResolvedValue(SearchResult.empty())

    await searchImmediate('Luke')
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ endpoint: 'characters' }))

    // Change endpoint
    endpoint.value = 'droids'
    await searchImmediate('R2D2')
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ endpoint: 'droids' }))
  })

  it('should debounce search input', async () => {
    vi.useFakeTimers()

    // Set up mock return value
    mockSearch.mockResolvedValue(
      SearchResult.fromApiResponse(
        {
          results: [ { id: '1', name: 'Luke Skywalker' } ],
          total: 1,
          page: 1,
          pages: 1,
          count: 1,
          limit: 20,
        },
        'characters'
      )
    )

    const { onSearchInput } = useCharacterSearch(mockRepository, 'characters', { debounceMs: 300 })

    onSearchInput('Luke')
    onSearchInput('Luke Skywalker')

    // Fast forward time
    vi.advanceTimersByTime(300)
    await nextTick() // Wait for the async search to complete

    // Only last search should be executed
    expect(mockSearch).toHaveBeenCalledTimes(1)
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ search: 'Luke Skywalker' }))

    vi.useRealTimers()
  })

  it('should retry failed search', async () => {
    const { searchImmediate, retrySearch } = useCharacterSearch(mockRepository, 'characters')

    // First search fails
    mockSearch.mockRejectedValueOnce(new Error('Network error'))
    await searchImmediate('Luke')

    // Then succeeds on retry
    mockSearch.mockResolvedValue(SearchResult.empty())
    await retrySearch()

    expect(mockSearch).toHaveBeenCalledTimes(2)
  })
})
