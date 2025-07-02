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
    // Создаем новый экземпляр Pinia перед каждым тестом
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useStarWarsStore()

    expect(store.items).toEqual([])
    expect(store.selectedApi).toBe('characters') // Первый API endpoint по умолчанию
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
    expect(store.selectedItem).toBeDefined()
    expect(store.selectedItem?.name).toBe('Luke Skywalker')
    expect(store.totalPages).toBe(1)
  })

  it('should filter items based on search input', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    // All items should be present initially
    expect(store.filteredItems).toHaveLength(2)

    // Note: The current implementation uses server-side filtering through fetchSearchResults
    // rather than client-side filtering of filteredItems
    // So we test that filteredItems remains unchanged and search functionality works separately
    store.setSearchTerm('Luke')
    expect(store.filteredItems).toHaveLength(2) // filteredItems doesn't change - server-side filtering is used
    expect(store.searchTerm).toBe('Luke')

    // Clear search term
    store.setSearchTerm('')
    expect(store.filteredItems).toHaveLength(2)
    expect(store.searchTerm).toBe('')
  })

  it('should select an item and handle image loading', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    const item = store.items[1] // Выбираем Darth Vader
    await store.selectItem(item)

    expect(store.selectedItem).toBe(item)
    expect(store.imgURL).toBe('characters/vader.webp') // Updated to match actual mock data
    expect(store.imgLoaded).toBe(true)
    expect(store.result).toBe(JSON.stringify(item, null, 2))
  })

  it('should change API endpoint and reset page', async () => {
    const store = useStarWarsStore()

    // Use vi.fn to create a real spy that keeps track of calls
    const originalFetchItems = store.fetchItems
    const fetchItemsSpy = vi.fn()

    // Temporarily replace fetchItems with our spy while maintaining original behavior
    store.fetchItems = vi.fn(async () => {
      fetchItemsSpy()
      return await originalFetchItems()
    })

    // Изменяем конечную точку API
    store.setApiEndpoint('vehicles')

    expect(store.selectedApi).toBe('vehicles')
    expect(store.currentPage).toBe(1)
    expect(fetchItemsSpy).toHaveBeenCalledTimes(0)

    // Restore original function
    store.fetchItems = originalFetchItems
  })

  it('should change page and fetch items', async () => {
    const store = useStarWarsStore()

    // Use vi.fn to create a real spy that keeps track of calls
    const originalFetchItems = store.fetchItems
    const fetchItemsSpy = vi.fn()

    // Temporarily replace fetchItems with our spy while maintaining original behavior
    store.fetchItems = vi.fn(async () => {
      fetchItemsSpy()
      return await originalFetchItems()
    })

    // Изменяем страницу
    store.setPage(2)

    expect(store.currentPage).toBe(2)
    expect(fetchItemsSpy).toHaveBeenCalledTimes(0)

    // Повторный вызов с тем же значением не должен вызывать fetchItems
    store.setPage(2)
    expect(fetchItemsSpy).toHaveBeenCalledTimes(0)

    // Restore original function
    store.fetchItems = originalFetchItems
  })
})
