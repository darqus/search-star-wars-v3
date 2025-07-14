import { createPinia, setActivePinia } from 'pinia'

import {
  afterEach, beforeEach, describe, expect, it, vi 
} from 'vitest'

import { useSearch } from '../useSearch'

// Mock the store
vi.mock('@/stores/starWars', () => ({
  useStarWarsStore: () => ({
    searchResults: [],
    selectedApi: 'people',
    setSearchTerm: vi.fn(),
    fetchSearchResults: vi.fn(),
    selectFromSearch: vi.fn(),
  }),
}))

describe('useSearch', () => {
  beforeEach(() => {
    const pinia = createPinia()

    setActivePinia(pinia)
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default values', () => {
    const { searchInput, isShownDropDown } = useSearch()

    expect(searchInput.value).toBe('')
    expect(isShownDropDown.value).toBe(false)
  })

  it('should handle search input change', () => {
    const { onSearchInputChange, searchInput } = useSearch()

    const mockEvent = {
      target: { value: 'luke' },
    } as unknown as Event

    onSearchInputChange(mockEvent)

    expect(searchInput.value).toBe('luke')
  })

  it('should highlight text correctly', () => {
    const { highlightText } = useSearch()

    const result = highlightText('Luke Skywalker', 'luke')

    expect(result).toContain('<span class="text-primary">Luke</span>')
  })

  it('should clear search correctly', () => {
    const { searchInput, isShownDropDown, clearSearch } = useSearch()

    searchInput.value = 'test'
    isShownDropDown.value = true

    clearSearch()

    expect(searchInput.value).toBe('')
    expect(isShownDropDown.value).toBe(false)
  })
})
