import { computed } from 'vue'

import type { Item } from '@/types/api'

import { useStarWarsStore } from '@/stores/starWars'

export function useStarWarsForm() {
  const starWarsStore = useStarWarsStore()

  // Computed properties для доступа к состоянию хранилища
  const items = computed(() => starWarsStore.filteredItems)
  const selectedApi = computed({
    get: () => starWarsStore.selectedApi,
    set: (value: string) => starWarsStore.setApiEndpoint(value),
  })
  const selectedItem = computed({
    get: () => starWarsStore.selectedItem,
    set: (value: Item | undefined) => value && starWarsStore.selectItem(value),
  })
  const selectInput = computed({
    get: () => starWarsStore.selectInput,
    set: (value: string) => starWarsStore.setSearchTerm(value || ''),
  })
  const imgURL = computed(() => starWarsStore.imgURL)
  const result = computed(() => starWarsStore.result)
  const currentPage = computed({
    get: () => starWarsStore.currentPage,
    set: (value: number) => starWarsStore.setPage(value),
  })
  const totalPages = computed(() => starWarsStore.totalPages)
  const isLoading = computed(() => starWarsStore.isLoading)
  const error = computed(() => starWarsStore.error)

  // Actions
  const onSelect = async (item: Item) => {
    if (item) {
      await starWarsStore.selectItem(item)
    }
  }

  const onPageChange = (page: number) => {
    starWarsStore.setPage(page)
  }

  const onApiSelect = () => {
    starWarsStore.setPage(1)
  }

  const onClearSelection = () => {
    starWarsStore.resetSelection()
  }

  const fetchItems = () => {
    starWarsStore.fetchItems()
  }

  return {
    // State
    items,
    selectedApi,
    selectedItem,
    selectInput,
    imgURL,
    result,
    currentPage,
    totalPages,
    isLoading,
    error,

    // Actions
    onSelect,
    onPageChange,
    onApiSelect,
    onClearSelection,
    fetchItems,
  }
}
