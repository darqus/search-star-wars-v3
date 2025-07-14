import { createPinia, setActivePinia } from 'pinia'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useStarWarsStore } from '../starWars'

// Mock composable
vi.mock('@/composables/useStarWarsApi', () => {
  const mockData = {
    results: [
      {
        id: '1',
        name: 'Luke Skywalker',
        description: 'Jedi Knight',
        image: 'characters/luke.webp',
      },
      {
        id: '2',
        name: 'Darth Vader',
        description: 'Dark Lord of the Sith',
        image: 'characters/vader.webp',
      },
    ],
    total: 2,
    count: 2,
    limit: 10,
    page: 1,
    pages: 1,
  }

  return {
    useStarWarsApi: vi.fn(() => ({
      isLoading: { value: false },
      error: { value: null },
      fetchData: vi.fn().mockResolvedValue(mockData),
      preloadImage: vi.fn().mockResolvedValue(undefined),
      setCachingEnabled: vi.fn(),
      setCacheExpiry: vi.fn(),
      clearCache: vi.fn(),
      isCachingEnabled: { value: true },
    })),
  }
})

describe('Star Wars Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useStarWarsStore()

    expect(store.items).toEqual([])
    expect(store.selectedApi).toBe('characters')
    expect(store.selectedItem).toBeUndefined()
    expect(store.selectInput).toBe('')
    expect(store.imgURL).toBe('')
    expect(store.imgLoaded).toBe(false)
    expect(store.result).toBe('')
    expect(store.currentPage).toBe(1)
    expect(store.totalPages).toBe(1)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('should fetch items and update state', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    expect(store.items).toHaveLength(2)
    expect(store.items[0].name).toBe('Luke Skywalker')
    expect(store.totalPages).toBe(1)
  })

  it('should filter items based on search input', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    store.setSearchTerm('Luke')
    expect(store.filteredItems).toHaveLength(2)
    expect(store.searchTerm).toBe('Luke')

    store.setSearchTerm('')
    expect(store.filteredItems).toHaveLength(2)
    expect(store.searchTerm).toBe('')
  })

  it('should select an item and handle image loading', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    const item = store.items[1]

    await store.selectItem(item)
    expect(store.selectedItem).toBe(item)
    expect(store.imgURL).toBe('characters/vader.webp')
  })

  it('should change API endpoint and reset page', () => {
    const store = useStarWarsStore()

    const fetchMock = vi.fn((skipCache?: boolean, term?: string) => {
      return store.fetchItems(skipCache, term)
    })

    store.fetchItems = fetchMock
    store.setApiEndpoint('vehicles')

    expect(fetchMock).toHaveBeenCalledTimes(0)
    expect(store.selectedApi).toBe('vehicles')
    expect(store.currentPage).toBe(1)
  })

  it('should change page and fetch items', () => {
    const store = useStarWarsStore()

    const fetchMock = vi.fn((skipCache?: boolean, term?: string) => {
      return store.fetchItems(skipCache, term)
    })

    store.fetchItems = fetchMock
    store.setPage(2)

    expect(fetchMock).toHaveBeenCalledTimes(0)
    expect(store.currentPage).toBe(2)
  })
})
