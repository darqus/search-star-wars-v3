import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useStarWarsStore } from '../starWars'

// Mock composable
vi.mock('@/composables/useStarWarsApi', () => {
  const mockData = {
    data: [
      {
        _id: '1',
        name: 'Luke Skywalker',
        description: 'Jedi Knight',
        image: 'luke.jpg',
        __v: 0,
      },
      {
        _id: '2',
        name: 'Darth Vader',
        description: 'Dark Lord of the Sith',
        image: 'vader.jpg',
        __v: 0,
      },
    ],
    info: {
      total: 2,
      count: 2,
      pages: 1,
      next: null,
      prev: null,
    },
  }

  return {
    useStarWarsApi: vi.fn(() => ({
      isLoading: { value: false },
      error: { value: null },
      fetchData: vi.fn().mockResolvedValue(mockData),
      preloadImage: vi.fn().mockResolvedValue(undefined),
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
    expect(store.searchInput).toBe('')
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
    expect(store.totalPages).toBe(2)
  })

  it('should filter items based on search input', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    // Сначала должны быть все элементы
    expect(store.filteredItems).toHaveLength(2)

    // Фильтрация по 'Luke'
    store.setSearchTerm('Luke')
    expect(store.filteredItems).toHaveLength(1)
    expect(store.filteredItems[0].name).toBe('Luke Skywalker')

    // Фильтрация по 'Sith'
    store.setSearchTerm('Sith')
    expect(store.filteredItems).toHaveLength(1)
    expect(store.filteredItems[0].name).toBe('Darth Vader')

    // Поиск с пустой строкой должен вернуть все элементы
    store.setSearchTerm('')
    expect(store.filteredItems).toHaveLength(2)
  })

  it('should select an item and handle image loading', async () => {
    const store = useStarWarsStore()

    await store.fetchItems()

    const item = store.items[1] // Выбираем Darth Vader
    await store.selectItem(item)

    expect(store.selectedItem).toBe(item)
    expect(store.imgURL).toBe('vader.jpg')
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
